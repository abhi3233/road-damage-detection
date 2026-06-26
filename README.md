# 🚧 Road Damage Detection and Monitoring System

## 📌 Project Overview

The **Road Damage Detection and Monitoring System** is designed to detect road damages such as **potholes and cracks** using computer vision techniques. The system enables users to upload road images through a web interface, which are then processed by an AI model to identify and classify damages.

---

## 🎯 Objectives

* Detect road damages using AI (YOLOv8)
* Provide an easy-to-use web interface
* Enable image upload with optional GPS location
* Build an end-to-end system (Frontend + Backend + AI Model)

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** FastAPI
* **Model:** YOLOv8 (Ultralytics)
* **Language:** Python
* **Tools:** VS Code, GitHub

---

## 📅 Progress Overview

### ✅ Week 1: Project Setup and Initialization

* Setup project structure
* Initialized frontend (React) and backend (FastAPI)
* Created basic UI with image upload option

---

### ✅ Week 2: Frontend–Backend Integration

* Developed POST API (`/upload`) in FastAPI
* Connected frontend to backend using Fetch/Axios
* Implemented image preview before upload
* Added GPS location capture using browser API
* Stored uploaded images in backend

**Outcome:**
✔️ Fully working image upload system with backend communication

---

### ✅ Week 3: AI Model Integration

* Installed and configured YOLOv8
* Performed inference on uploaded images
* Implemented detection of potholes and cracks
* Extracted detection results (labels + confidence)
* Integrated model with backend
* Completed end-to-end testing

---

## 📊 Dataset and Training

* Initially used **RDD2022 dataset (~25,000 images)** but faced long training times (~7 hours).
* Switched to a smaller dataset (~400 images) for faster experimentation.
* Successfully trained and integrated YOLOv8 model.

---

## ⚠️ Challenges

* Low accuracy due to small dataset
* Difficulty distinguishing potholes vs cracks
* Inconsistent predictions

---

## 💡 Improvements (Mentor Suggestions)

* Focus on **dataset quality**
* Apply **data augmentation** (flip, rotate, brightness, scaling)
* Verify annotations manually (20–30 images)
* Correct bounding boxes if needed

---

## 🚀 Current Features

* Image upload from frontend
* Image preview
* GPS location capture
* Backend storage
* AI-based detection
* End-to-end pipeline

---

## 📂 Project Structure

```
project/
│
├── frontend/
├── backend/
├── model/
├── images/
└── README.md
```

---

## ▶️ How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 👨‍💻 Team

* **Chunduri Abhiram** (Team Lead) — MC240041011
* **Enakollu Mahidhar Reddy** — CSE240001030
* **Chunchu Santhosh Rushendra** — CE240004013
* **Katammagari Manas Joel** — CE240004025

---

## 🙏 Acknowledgment

Special thanks to our mentor for guidance on improving dataset quality and model performance.

---

## 📌 Note

This project is under development. Current outputs are for demonstration purposes and may not reflect final accuracy.

---
