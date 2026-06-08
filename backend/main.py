from fastapi import FastAPI, File, UploadFile

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "File received successfully"
    }

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Add CORS here (after app creation)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "File received successfully"
    }