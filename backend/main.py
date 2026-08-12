from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Form,
    Depends,
    HTTPException,
    Body,
    BackgroundTasks
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import tensorflow as tf
from PIL import Image
import numpy as np

import os
import shutil
import hashlib
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from passlib.context import CryptContext
from jose import jwt

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float
)

from sqlalchemy.orm import (
    sessionmaker,
    declarative_base
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")


# ============================================================
# WELCOME EMAIL
# ============================================================

def send_welcome_email(to_email: str, username: str):

    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print(
            f"Skipping welcome email for {to_email}: "
            "EMAIL_SENDER or EMAIL_PASSWORD not set in .env"
        )
        return

    try:
        msg = MIMEMultipart()

        msg["From"] = EMAIL_SENDER
        msg["To"] = to_email
        msg["Subject"] = "Welcome to Road Damage Scanner!"

        body = (
            f"Hi {username},\n\n"
            "Welcome to Road Damage Scanner! "
            "We're excited to have you on board.\n\n"
            "Start uploading images of road damage "
            "to help keep the streets safe, and earn points "
            "while you do it!\n\n"
            "Best,\n"
            "The Road Damage Scanner Team"
        )

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"Welcome email sent successfully to {to_email}")

    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = "sqlite:///./reports.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

SessionLocal = sessionmaker(
    bind=engine
)

Base = declarative_base()


# ============================================================
# REPORT TABLE
# ============================================================

class Report(Base):

    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    image_path = Column(
        String
    )

    username = Column(
        String
    )

    damage_type = Column(
        String
    )

    confidence = Column(
        Float
    )

    points = Column(
        Integer
    )

    latitude = Column(
        Float
    )

    longitude = Column(
        Float
    )

    timestamp = Column(
        String
    )

    image_hash = Column(
        String
    )


# ============================================================
# USER TABLE
# ============================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True
    )

    password = Column(
        String
    )

    total_points = Column(
        Integer,
        default=0
    )


Base.metadata.create_all(
    bind=engine
)


# ============================================================
# AUTHENTICATION
# ============================================================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "road_damage_secret_key"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

GOOGLE_CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID",
    ""
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password):

    # Prevent bcrypt 72-byte error
    password = password[:72]

    return pwd_context.hash(
        password
    )


def verify_password(
    password,
    hashed_password
):

    password = password[:72]

    return pwd_context.verify(
        password,
        hashed_password
    )


def create_token(data):

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    data.update(
        {
            "exp": expire
        }
    )

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI()


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

os.makedirs(
    "uploads",
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CNN MODEL
# ============================================================

MODEL_PATH = "../road_damage_cnn.keras"

model = tf.keras.models.load_model(
    MODEL_PATH
)

CLASS_NAMES = [
    "crack",
    "no_damage",
    "pothole"
]

print("CNN model loaded successfully.")
print("Classes:", CLASS_NAMES)


# ============================================================
# DATABASE SESSION
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Backend is running"
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/register")
def register(
    background_tasks: BackgroundTasks,
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db)
):

    # Check email
    existing_email = db.query(User).filter(
        User.email == email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check username
    existing_username = db.query(User).filter(
        User.username == username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    new_user = User(
        username=username,
        email=email,
        password=hash_password(password),
        total_points=0
    )

    db.add(new_user)

    db.commit()

    background_tasks.add_task(
        send_welcome_email,
        email,
        username
    )

    return {
        "message": "User created successfully"
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db)
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(
        {
            "sub": user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username
    }


# ============================================================
# GOOGLE AUTH
# ============================================================

@app.post("/auth/google")
def google_auth(
    background_tasks: BackgroundTasks,
    token: str = Body(..., embed=True),
    db=Depends(get_db)
):

    try:

        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )

    except ValueError as e:

        print(
            f"Token validation error: {e}"
        )

        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}"
        )

    email = idinfo["email"]

    name = idinfo.get(
        "name",
        email.split("@")[0]
    )

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:

        # Make Google username unique
        username = name

        existing_username = db.query(User).filter(
            User.username == username
        ).first()

        if existing_username:
            username = (
                email.split("@")[0]
                + "_google"
            )

        user = User(
            username=username,
            email=email,
            password="",
            total_points=0
        )

        db.add(user)

        db.commit()

        db.refresh(user)

        background_tasks.add_task(
            send_welcome_email,
            email,
            user.username
        )

    access_token = create_token(
        {
            "sub": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }


# ============================================================
# UPLOAD + CNN PREDICTION
# ============================================================

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    username: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    db=Depends(get_db)
):

    # --------------------------------------------------------
    # Save uploaded image
    # --------------------------------------------------------

    upload_dir = "uploads"

    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_dir,
        file.filename
    ).replace("\\", "/")

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # --------------------------------------------------------
    # Create image hash
    # --------------------------------------------------------

    with open(
        file_path,
        "rb"
    ) as f:

        image_hash = hashlib.sha256(
            f.read()
        ).hexdigest()


    # --------------------------------------------------------
    # Prevent duplicate upload
    # --------------------------------------------------------

    existing = db.query(Report).filter(
        Report.username == username,
        Report.image_hash == image_hash
    ).first()

    if existing:

        os.remove(file_path)

        raise HTTPException(
            status_code=400,
            detail="You have already uploaded this image."
        )


    # --------------------------------------------------------
    # Prepare image for CNN
    #
    # IMPORTANT:
    # This is intentionally the SAME preprocessing
    # as your working predict.py
    #
    # NO /255.0 here.
    # --------------------------------------------------------

    try:

        image = Image.open(
            file_path
        ).convert("RGB")

        image = image.resize(
            (128, 128)
        )

        image_array = np.array(
            image,
            dtype=np.float32
        )

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid image: {str(e)}"
        )


    # --------------------------------------------------------
    # CNN prediction
    # --------------------------------------------------------

    predictions = model.predict(
        image_array,
        verbose=0
    )

    print(
        "CNN raw predictions:",
        predictions[0]
    )

    class_index = int(
        np.argmax(
            predictions[0]
        )
    )

    confidence = float(
        predictions[0][class_index]
    )

    predicted_class = CLASS_NAMES[
        class_index
    ]

    print(
        "Predicted class:",
        predicted_class
    )

    print(
        "Confidence:",
        confidence
    )


    # --------------------------------------------------------
    # Points system
    # --------------------------------------------------------

    if predicted_class == "pothole":

        points = 100

    elif predicted_class == "crack":

        points = 50

    else:

        points = 0


    # --------------------------------------------------------
    # Detection result
    # --------------------------------------------------------

    detections = [
        {
            "damage_type": predicted_class,
            "confidence": round(
                confidence,
                4
            )
        }
    ]

    primary_detection = detections[0]


    # --------------------------------------------------------
    # Save report
    # --------------------------------------------------------

    report = Report(

        image_path=file_path,

        username=username,

        damage_type=primary_detection[
            "damage_type"
        ],

        confidence=primary_detection[
            "confidence"
        ],

        points=points,

        latitude=latitude,

        longitude=longitude,

        timestamp=str(
            datetime.now()
        ),

        image_hash=image_hash
    )

    db.add(report)


    # --------------------------------------------------------
    # Update user score
    # --------------------------------------------------------

    user = db.query(User).filter(
        User.username == username
    ).first()

    if user:

        user.total_points += points


    # --------------------------------------------------------
    # Commit database
    # --------------------------------------------------------

    db.commit()


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "filename": file.filename,

        "detections": detections,

        "points": points,

        "message": "Upload saved successfully"
    }


# ============================================================
# MY UPLOADS
# ============================================================

@app.get("/myreports/{username}")
def get_my_reports(
    username: str,
    db=Depends(get_db)
):

    reports = db.query(
        Report
    ).filter(
        Report.username == username
    ).all()

    return reports


# ============================================================
# PUBLIC UPLOADS
# ============================================================

@app.get("/publicreports")
def get_public_reports(
    db=Depends(get_db)
):

    reports = db.query(
        Report
    ).all()

    return reports


# ============================================================
# LEADERBOARD
# ============================================================

@app.get("/leaderboard")
def leaderboard(
    db=Depends(get_db)
):

    users = db.query(
        User
    ).order_by(
        User.total_points.desc()
    ).limit(5).all()

    result = []

    for user in users:

        result.append(
            {
                "username": user.username,
                "score": user.total_points
            }
        )

    return result


# ============================================================
# ALL REPORTS
# ============================================================

@app.get("/reports")
def get_reports(
    db=Depends(get_db)
):

    reports = db.query(
        Report
    ).all()

    return reports


# ============================================================
# DELETE REPORT
# ============================================================

@app.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    db=Depends(get_db)
):

    report = db.query(
        Report
    ).filter(
        Report.id == report_id
    ).first()

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )


    # --------------------------------------------------------
    # Delete image file
    # --------------------------------------------------------

    if (
        report.image_path
        and os.path.exists(
            report.image_path
        )
    ):

        try:

            os.remove(
                report.image_path
            )

        except Exception as e:

            print(
                f"Failed to delete image: {e}"
            )


    # --------------------------------------------------------
    # Delete database record
    # --------------------------------------------------------

    db.delete(report)

    db.commit()

    return {
        "message": "Report deleted successfully"
    }