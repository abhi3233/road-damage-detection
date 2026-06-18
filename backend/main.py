from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import os
import shutil

# ✅ Create FastAPI app
app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ STEP 3: Load YOLO model (ONLY ONCE HERE)
model = YOLO("model/best.pt")

# ✅ Home route
@app.get("/")
def home():
    return {"message": "Backend is running"}

# ✅ STEP 4: Upload + Detection API
@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    # Save uploaded image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔥 Run YOLO inference (STEP 4 happens HERE)
    results = model(file_path, save=True)

    # 🔥 Extract detections
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

    # If nothing detected
    if len(detections) == 0:
        detections.append({
            "damage_type": "no_damage",
            "confidence": 0.0
        })

    # ✅ Final response
    return {
        "filename": file.filename,
        "detections": detections,
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "message": "Detection completed"
    }