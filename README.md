# 🚧 Road Damage Detection and Monitoring System

## 📌 Project Overview

The **Road Damage Detection and Monitoring System** is an AI-powered web application designed to automatically detect road damages such as **potholes and cracks** using computer vision.

Users can upload road images through a simple web interface, and the system processes them using a trained deep learning model to identify and classify damages. The goal is to assist authorities and individuals in **efficient road monitoring and maintenance**.

---

## 🎯 Objectives

* Detect road damages using deep learning (**YOLOv8**)
* Provide an intuitive and responsive web interface
* Enable image upload with optional **GPS location tagging**
* Build a complete **end-to-end pipeline (Frontend + Backend + AI Model)**
* Store and display detection reports in a dashboard

---

## 🛠️ Tech Stack

| Component | Technology Used      |
| --------- | -------------------- |
| Frontend  | React.js             |
| Backend   | FastAPI              |
| AI Model  | YOLOv8 (Ultralytics) |
| Language  | Python, JavaScript   |
| Tools     | VS Code, Git, GitHub |

---

## 📅 Development Progress

### ✅ Week 1: Project Setup

* Initialized project structure
* Set up **React frontend** and **FastAPI backend**
* Built basic UI for image upload

**Outcome:**
✔️ Working project skeleton with frontend-backend separation

---

### ✅ Week 2: Frontend–Backend Integration

* Developed API endpoint: `/upload`
* Connected frontend using Fetch API
* Implemented:

  * Image preview before upload
  * GPS location capture (Browser API)
  * Backend image storage

**Outcome:**
✔️ Fully functional image upload system with backend communication

---

### ✅ Week 3: AI Model Integration

* Installed and configured **YOLOv8**
* Performed inference on uploaded images
* Detected:

  * Potholes
  * Cracks
* Extracted:

  * Labels
  * Confidence scores
* Integrated model with backend APIs

**Outcome:**
✔️ End-to-end AI pipeline completed

---

### ✅ Week 4: Dashboard & Reports (Latest)

* Stored detection results in backend (database/files)
* Created **dashboard in React**
* Displayed:

  * Uploaded images
  * Detection results
  * Reports list

**Outcome:**
✔️ Complete system with visualization of results

---

## 📊 Dataset and Training

* Initially used **RDD2022 dataset (~25,000 images)**

  * Faced long training times (~7 hours)
* Switched to a smaller dataset (~400 images) for faster iteration
* Successfully trained and integrated YOLOv8 model

---

## ⚠️ Challenges Faced

* Limited dataset size → reduced accuracy
* Difficulty distinguishing **potholes vs cracks**
* Inconsistent model predictions
* Training time constraints

---

## 💡 Improvements & Future Work

* Increase dataset size and quality
* Apply **data augmentation techniques**:

  * Flipping
  * Rotation
  * Brightness adjustment
  * Scaling
* Manually verify annotations (20–30 samples)
* Improve bounding box accuracy
* Add:

  * Filtering (damage type)
  * Analytics dashboard (charts)
  * Real-time detection
  * Map-based visualization (using GPS)

---

## 🚀 Current Features

* 📤 Image upload from frontend
* 🖼️ Image preview before submission
* 📍 Optional GPS location capture
* 💾 Backend storage of images
* 🤖 AI-based damage detection
* 📊 Dashboard to view reports
* 🔄 End-to-end working pipeline

---

## 📂 Project Structure

```
road-damage-detection/
│
├── frontend/        # React application
├── backend/         # FastAPI server
├── model/           # YOLOv8 model files
├── uploads/         # Stored images
├── reports/         # Detection results
└── README.md
```

---

## ▶️ How to Run

### 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📸 System Workflow

1. User uploads an image
2. Image is sent to backend API
3. YOLOv8 model processes the image
4. Damage detection is performed
5. Results are stored
6. Dashboard displays reports

---

## 👨‍💻 Team

* **Chunduri Abhiram (Team Lead)**
* Enakollu Mahidhar Reddy
* Chunchu Santhosh Rushendra
* Katammagari Manas Joel

---

## 🙏 Acknowledgment

We sincerely thank our mentor **Sourav Rai** for valuable guidance, especially in improving dataset quality and model performance.

---

## 📌 Disclaimer

This project is currently under development.
The model predictions are for **demonstration purposes** and may not reflect real-world accuracy.

---

## ⭐ Future Scope

* Deployment on cloud (AWS / Render)
* Mobile app integration
* Government/municipality integration
* Automated reporting system

---
