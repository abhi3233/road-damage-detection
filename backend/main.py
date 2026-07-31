import gc
import hashlib
import os
import threading
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Keep CPU inference lightweight on small hosting instances.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import jwt
from passlib.context import CryptContext
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ultralytics import YOLO

try:
    import torch

    torch.set_num_threads(1)
    try:
        torch.set_num_interop_threads(1)
    except RuntimeError:
        # This can only be configured before some Torch work starts.
        pass
except Exception:
    torch = None


# ================= PATHS / CONFIG =================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATABASE_PATH = BASE_DIR / "reports.db"
MODEL_PATH = Path(
    os.getenv("MODEL_PATH", str(PROJECT_DIR / "model" / "best.pt"))
).resolve()

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
INFERENCE_IMAGE_SIZE = int(os.getenv("INFERENCE_IMAGE_SIZE", "320"))
MAX_DETECTIONS = int(os.getenv("MAX_DETECTIONS", "50"))
MODEL_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.25"))

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


# ================= DATABASE =================

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


# ================= TABLES =================


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    username = Column(String, index=True)
    damage_type = Column(String)
    confidence = Column(Float)
    points = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(String)
    image_hash = Column(String, index=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    total_points = Column(Integer, default=0)


Base.metadata.create_all(bind=engine)


# ================= AUTH =================

SECRET_KEY = os.getenv("SECRET_KEY", "road_damage_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password[:72], hashed_password)


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ================= APP =================

app = FastAPI(title="Road Damage Detection API")

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)

# Local React plus all Vercel preview/production domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= YOLO =================

_model = None
_model_load_lock = threading.Lock()
_inference_lock = threading.Lock()


def get_model():
    """Load the model only once and reuse it for later requests."""
    global _model

    if _model is None:
        with _model_load_lock:
            if _model is None:
                if not MODEL_PATH.exists():
                    raise RuntimeError(f"Model file not found: {MODEL_PATH}")
                _model = YOLO(str(MODEL_PATH), task="detect")

    return _model


# ================= DATABASE SESSION =================


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= HELPERS =================


def report_to_dict(report: Report) -> dict:
    return {
        "id": report.id,
        "image_path": report.image_path,
        "username": report.username,
        "damage_type": report.damage_type,
        "confidence": report.confidence,
        "points": report.points,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "timestamp": report.timestamp,
        "image_hash": report.image_hash,
    }


def save_uploaded_image(file: UploadFile) -> tuple[Path, str, str]:
    """Save an upload in chunks, enforce a size limit, and hash it."""
    content_type = (file.content_type or "").lower()

    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG, and WebP images are supported.",
        )

    suffix = ALLOWED_IMAGE_TYPES[content_type]
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    absolute_path = UPLOAD_DIR / stored_name
    relative_path = f"uploads/{stored_name}"

    hasher = hashlib.sha256()
    total_bytes = 0

    try:
        with absolute_path.open("wb") as output:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break

                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="Image is too large. Maximum size is 10 MB.",
                    )

                hasher.update(chunk)
                output.write(chunk)
    except Exception:
        absolute_path.unlink(missing_ok=True)
        raise
    finally:
        file.file.close()

    if total_bytes == 0:
        absolute_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    return absolute_path, relative_path, hasher.hexdigest()


def create_small_inference_copy(source_path: Path) -> Path:
    """Create a small temporary image so YOLO never decodes a huge upload."""
    inference_path = UPLOAD_DIR / f".inference-{uuid.uuid4().hex}.jpg"

    try:
        with Image.open(source_path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail(
                (INFERENCE_IMAGE_SIZE, INFERENCE_IMAGE_SIZE),
                Image.Resampling.LANCZOS,
            )
            image.save(
                inference_path,
                format="JPEG",
                quality=82,
                optimize=True,
            )
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        inference_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        ) from exc

    return inference_path


def detect_damage(inference_path: Path) -> tuple[list[dict], int]:
    """Run one memory-conscious inference at a time."""
    model = get_model()
    detections: list[dict] = []
    points = 0

    damage_mapping = {
        "D00": "Longitudinal Crack",
        "D10": "Transverse Crack",
        "D20": "Alligator Crack",
        "D40": "Pothole",
    }

    results_stream = None

    try:
        # Prevent simultaneous inference requests from doubling memory usage.
        with _inference_lock:
            results_stream = model.predict(
                source=str(inference_path),
                imgsz=INFERENCE_IMAGE_SIZE,
                device="cpu",
                conf=MODEL_CONFIDENCE,
                max_det=MAX_DETECTIONS,
                augment=False,
                verbose=False,
                save=False,
                stream=True,
            )

            for result in results_stream:
                if result.boxes is None:
                    continue

                for box in result.boxes:
                    cls_id = int(box.cls.item())
                    confidence = float(box.conf.item())

                    if isinstance(model.names, dict):
                        raw_label = str(model.names.get(cls_id, cls_id))
                    else:
                        raw_label = str(model.names[cls_id])

                    label_code = raw_label.upper()
                    readable_label = damage_mapping.get(label_code, raw_label)

                    if label_code == "D40":
                        points = max(points, 100)
                    elif label_code in {"D00", "D10", "D20"}:
                        points = max(points, 50)

                    detections.append(
                        {
                            "damage_type": readable_label,
                            "confidence": round(confidence, 2),
                        }
                    )
    finally:
        if results_stream is not None:
            del results_stream
        gc.collect()

    if not detections:
        detections.append(
            {
                "damage_type": "no_damage",
                "confidence": 0.0,
            }
        )

    return detections, points


# ================= HOME / HEALTH =================


@app.api_route("/", methods=["GET", "HEAD"])
def home():
    return {"message": "Backend is running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_file_exists": MODEL_PATH.exists(),
    }


# ================= REGISTER =================


@app.post("/register")
def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db),
):
    username = username.strip()
    email = email.strip().lower()

    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required.")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=username,
        email=email,
        password=hash_password(password),
        total_points=0,
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created successfully"}


# ================= LOGIN =================


@app.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db),
):
    email = email.strip().lower()

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
    }


# ================= UPLOAD =================


@app.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    username: str = Form(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    db=Depends(get_db),
):
    username = username.strip()
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stored_path: Path | None = None
    inference_path: Path | None = None

    try:
        stored_path, relative_path, image_hash = save_uploaded_image(file)

        existing = (
            db.query(Report)
            .filter(
                Report.username == username,
                Report.image_hash == image_hash,
            )
            .first()
        )

        if existing:
            stored_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail="You have already uploaded this image.",
            )

        inference_path = create_small_inference_copy(stored_path)
        detections, points = detect_damage(inference_path)

        report = Report(
            image_path=relative_path,
            username=username,
            damage_type=detections[0]["damage_type"],
            confidence=detections[0]["confidence"],
            points=points,
            latitude=latitude,
            longitude=longitude,
            timestamp=datetime.now(timezone.utc).isoformat(),
            image_hash=image_hash,
        )

        db.add(report)
        user.total_points = (user.total_points or 0) + points
        db.commit()
        db.refresh(report)

        return {
            "filename": stored_path.name,
            "image_path": relative_path,
            "detections": detections,
            "points": points,
            "message": "Upload saved successfully",
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        if stored_path is not None:
            stored_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Image processing failed: {exc}",
        ) from exc
    finally:
        if inference_path is not None:
            inference_path.unlink(missing_ok=True)
        gc.collect()


# ================= REPORT ENDPOINTS =================


@app.get("/myreports/{username}")
def get_my_reports(username: str, db=Depends(get_db)):
    reports = (
        db.query(Report)
        .filter(Report.username == username)
        .order_by(Report.id.desc())
        .all()
    )
    return [report_to_dict(report) for report in reports]


@app.get("/publicreports")
def get_public_reports(db=Depends(get_db)):
    reports = db.query(Report).order_by(Report.id.desc()).all()
    return [report_to_dict(report) for report in reports]


@app.get("/leaderboard")
def leaderboard(db=Depends(get_db)):
    users = db.query(User).order_by(User.total_points.desc()).limit(3).all()
    return [
        {
            "username": user.username,
            "score": user.total_points or 0,
        }
        for user in users
    ]


@app.get("/reports")
def get_reports(db=Depends(get_db)):
    reports = db.query(Report).order_by(Report.id.desc()).all()
    return [report_to_dict(report) for report in reports]


@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db=Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    image_absolute_path = BASE_DIR / report.image_path
    image_absolute_path.unlink(missing_ok=True)

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}
