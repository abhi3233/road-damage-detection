from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO

import os
import shutil
import hashlib
from datetime import datetime, timedelta

from passlib.context import CryptContext
from jose import jwt, JWTError

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



# ================= DATABASE =================

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



# ================= TABLES =================


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




class User(Base):

    __tablename__ = "users"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    username = Column(
        String
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



# ================= AUTH =================


SECRET_KEY = "road_damage_secret_key"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60



pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)



def hash_password(password):

    # prevents bcrypt 72 byte error
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

    expire = datetime.utcnow() + timedelta(
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



# ================= APP =================


app = FastAPI()



app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads"
)



app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)



# ================= YOLO =================


model = YOLO("../model/best.pt")




# ================= DATABASE SESSION =================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()
        # ================= HOME =================


@app.get("/")
def home():

    return {
        "message": "Backend is running"
    }




# ================= REGISTER =================


@app.post("/register")
def register(

    username: str = Form(...),

    email: str = Form(...),

    password: str = Form(...),

    db = Depends(get_db)

):


    existing_user = db.query(User).filter(
        User.email == email
    ).first()



    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )



    new_user = User(

        username=username,

        email=email,

        password=hash_password(password),

        total_points=0

    )



    db.add(new_user)

    db.commit()



    return {

        "message": "User created successfully"

    }




# ================= LOGIN =================


@app.post("/login")
def login(

    email: str = Form(...),

    password: str = Form(...),

    db = Depends(get_db)

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




# ================= UPLOAD =================


@app.post("/upload")
async def upload_image(

    file: UploadFile = File(...),

    username: str = Form(...),

    latitude: float = Form(None),

    longitude: float = Form(None),

    db = Depends(get_db)

):


    upload_dir = "uploads"


    os.makedirs(
        upload_dir,
        exist_ok=True
    )



    file_path = os.path.join(
        upload_dir,
        file.filename
    )



    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    with open(file_path, "rb") as f:
        image_hash = hashlib.sha256(f.read()).hexdigest()

    existing = db.query(Report).filter(
        Report.username == username,
        Report.image_hash == image_hash
    ).first()

    if existing:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="You have already uploaded this image.")


    results = model(
        file_path
    )



    detections = []



    points = 0



    for r in results:


        for box in r.boxes:


            cls_id = int(
                box.cls[0]
            )


            confidence = float(
                box.conf[0]
            )


            label = model.names[
                cls_id
            ]



            # Points system
            if "pothole" in label.lower():

                points = max(points, 100)


            elif "crack" in label.lower():

                  points = max(points, 50)



            detections.append(

                {

                    "damage_type": label,

                    "confidence": round(
                        confidence,
                        2
                    )

                }

            )



    if len(detections) == 0:


        detections.append(

            {

                "damage_type": "no_damage",

                "confidence": 0.0

            }

        )


        points = 0




    report = Report(

        image_path=file_path,

        username=username,

        damage_type=detections[0]["damage_type"],

        confidence=detections[0]["confidence"],

        points=points,

        latitude=latitude,

        longitude=longitude,

        timestamp=str(
            datetime.now()
        ),

        image_hash=image_hash

    )



    db.add(report)



    # update user score

    user = db.query(User).filter(
        User.username == username
    ).first()



    if user:

        user.total_points += points



    db.commit()



    return {

        "filename": file.filename,

        "detections": detections,

        "points": points,

        "message": "Upload saved successfully"

    }
# ================= MY UPLOADS =================


@app.get("/myreports/{username}")
def get_my_reports(

    username: str,

    db = Depends(get_db)

):


    reports = db.query(Report).filter(
        Report.username == username
    ).all()


    return reports




# ================= PUBLIC UPLOADS =================


@app.get("/publicreports")
def get_public_reports(

    db = Depends(get_db)

):


    reports = db.query(Report).all()


    return reports




# ================= LEADERBOARD =================


@app.get("/leaderboard")
def leaderboard(

    db = Depends(get_db)

):


    users = db.query(User).order_by(
        User.total_points.desc()
    ).limit(3).all()



    result = []


    for user in users:


        result.append(

            {

                "username": user.username,

                "score": user.total_points

            }

        )



    return result




# ================= ALL REPORTS =================


@app.get("/reports")
def get_reports(

    db = Depends(get_db)

):


    reports = db.query(Report).all()


    return reports 