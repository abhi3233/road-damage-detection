from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import os
import shutil
from datetime import datetime

# ✅ DB imports
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

# -------------------- DB SETUP --------------------

DATABASE_URL = "sqlite:///./reports.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    damage_type = Column(String)
    confidence = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(String)

# Create DB tables
Base.metadata.create_all(bind=engine)

# -------------------- APP --------------------

app = FastAPI()

# ✅ Serve uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load YOLO model
model = YOLO("model/best.pt")

# -------------------- ROUTES --------------------

@app.get("/")
def home():
    return {"message": "Backend is running"}

# ✅ Upload + Detection + STORE
@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    # Save image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔥 YOLO inference
    results = model(file_path)

    detections = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[cls_id]

            detections.append({
                "damage_type": label,
                "confidence": round(confidence, 2)
            })

    # If no detection
    if len(detections) == 0:
        detections.append({
            "damage_type": "no_damage",
            "confidence": 0.0
        })

    # 👉 Take first detection (for DB)
    main_damage = detections[0]["damage_type"]
    main_conf = detections[0]["confidence"]

    # ✅ STORE IN DB
    db = SessionLocal()
    report = Report(
        image_path=file_path,
        damage_type=main_damage,
        confidence=main_conf,
        latitude=latitude,
        longitude=longitude,
        timestamp=str(datetime.now())
    )
    db.add(report)
    db.commit()
    db.close()

    return {
        "filename": file.filename,
        "detections": detections,
        "message": "Saved to DB"
    }

# ✅ GET REPORTS API (THIS WAS MISSING ❗)
@app.get("/reports")
def get_reports():
    db = SessionLocal()
    reports = db.query(Report).all()
    db.close()
    return reports