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