# 🚧 Road Damage Reporting and Monitoring System

A full-stack intelligent system for detecting, reporting, and monitoring road damages using YOLOv8, integrated with a React dashboard, backend APIs, and a community-driven reporting mechanism.

## 📌 Project Overview

This project aims to improve road maintenance systems by enabling users to:
- Upload images of road damage
- Automatically detect damage using AI (YOLOv8)
- Store reports with location metadata
- Prevent duplicate uploads
- Reward users via a leaderboard system
- Visualize reports on maps

## 🚀 Features

### 🔍 AI-Based Road Damage Detection
- Uses YOLOv8 object detection model
- Detects:
  - **D00** – Longitudinal Cracks
  - **D10** – Transverse Cracks
  - **D20** – Alligator Cracks
  - **D40** – Potholes
  - **D43** – Severe Potholes

### 🏆 Leaderboard System
- Ranks users based on contributions
- Encourages community participation
- Automatically updates rankings

### 🛡️ Duplicate Upload Prevention
- Uses image hashing
- Prevents:
  - Duplicate reports
  - Spam submissions
  - Fake point generation

### 📍 Geo-Tagged Reports
Each report includes:
- Username
- Image
- Damage Type
- Confidence Score
- Latitude & Longitude
- Timestamp
- Points Earned

### 🖥️ Dashboard Views
- **My Uploads** → User-specific reports
- **Public Uploads** → All user reports
- Google Maps Integration for location visualization

## 🧠 Model Training (YOLOv8)

### ⚙️ Platform Used
- Google Colab (GPU: NVIDIA T4)

### 📦 Install Dependencies
```bash
pip install ultralytics kagglehub roboflow
```

### 📥 Dataset Download
```python
import kagglehub

path = kagglehub.dataset_download("aliabdelmenam/rdd-2022")
```

### ⚙️ Training Script
```python
from ultralytics import YOLO

model = YOLO('yolov8m.pt')

model.train(
    data='rdd_colab.yaml',
    epochs=25,
    imgsz=640,
    batch=16,
    device='0',
    project='/content/drive/MyDrive/YOLOv8_RDD2022',
    name='rdd2022_best'
)
```

### 📤 Output
- Best model: `best.pt`
- Stored in Google Drive

## 💻 Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js / Express.js
- **Database**: MongoDB
- **AI/ML**: YOLOv8 (Ultralytics), PyTorch
- **Cloud**: Google Colab, Google Drive

## ⚙️ Installation Guide

### 1️⃣ Clone Repository
```bash
git clone https://github.com/abhi3233/road-damage-detection.git
cd road-damage-detection
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Model Setup
Place `best.pt` in:
```
backend/models/
```

### 5️⃣ Run Detection API
```bash
python detect.py
```

## ▶️ How to Use
1. Register/Login
2. Upload road image
3. Model detects damage
4. Report stored with location
5. Points awarded
6. Leaderboard updated

## 📊 Project Workflow
```text
User Upload → Backend API → YOLOv8 Model → Detection Output
     ↓
Database Storage → Dashboard → Leaderboard Update
```

## 📁 Project Structure
```text
├── frontend/
├── backend/
├── model/
├── dataset/
├── README.md
```

## ⚠️ Challenges Faced

### ❌ Initial Issue
- Trained with 1000 images
- Result: Low accuracy

### ✅ Solution
- Switched to:
  - Full dataset (RDD2022)
  - Google Colab GPU training

### 💡 Outcome
- Significant improvement in accuracy and detection quality

## 👨‍💻 Team Members

| Name | Role | Roll Number | GitHub |
|------|------|-------------|--------|
| Chunduri Abhiram | Team Leader | 240041011 | [@abhi3233](https://github.com/abhi3233) |
| Enakollu Mahidhar Reddy | Developer | 240001030 | [@enakollu-mahi](https://github.com/enakollu-mahi) |
| Chunchu Santhosh Rushendra | Developer | 240004013 | [@chunchusanthoshrushendra](https://github.com/chunchusanthoshrushendra) |
| Katammagari Manas Joel | Developer | 240004025 | [@ce240004025-art](https://github.com/ce240004025-art) |



## 🙏 Acknowledgements

We sincerely thank:

### 🎓 Institution
- Science & Technology Council (SnT), IIT Indore
- IITISoC 2026 Program

### 🧑‍🏫 Mentor
- **Sourav Rai** [@Souravrai2005](https://github.com/Souravrai2005)
  - Guidance
  - Feedback
  - Technical direction

### 🤝 Special Contributions
We deeply appreciate:
- **Hanumanthu Yerukula Yeshwanth Kumar** [@KIRITO-899](https://github.com/KIRITO-899) 
- **Dodda Rishik**

👉 For providing GPU-enabled laptops (NVIDIA)  
👉 Critical for model training  

Without their support, the model training would not have been possible.

## 📂 Resources
- **Dataset + Model + Results**: [Google Drive Folder](https://drive.google.com/drive/folders/12qhJLzhmj5FXK2-kaB9yXxkO-FqEp_Ig)

## 📈 Future Improvements
- [ ] Real-time detection (mobile app)
- [ ] Government dashboard integration
- [ ] Road severity prediction
- [ ] Automated repair alerts

## 📜 License
This project is developed under IITISoC 2026 and is intended for academic and research purposes.

---

### ⭐ Final Note
This project demonstrates the integration of **AI + Web Development + Cloud Computing** to solve real-world infrastructure problems.
