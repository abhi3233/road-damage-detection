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
| Database  | SQLite               |
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

### ✅ Week 4: Dashboard & Reports

* Stored detection results in backend database
* Created **dashboard in React**
* Displayed:

  * Uploaded images
  * Detection results
  * Reports list
  * GPS information

**Outcome:**

✔️ Complete system with visualization of results

---

# 🔐 User Authentication System (Latest Update)

A complete authentication system has been integrated into the application.

## 👤 Registration and Login

Implemented features:

* User registration
* Secure password hashing
* User login authentication
* JWT-based authentication
* User-specific dashboard access
* Personalized report management

### Authentication Workflow:

1. User creates an account
2. Password is securely stored after hashing
3. User logs into the application
4. Authentication token is generated
5. User gets access to dashboard features

**Outcome:**

✔️ Secure user management system implemented

---

# 🏆 User Scoring System

A contribution-based scoring system has been added to encourage users to report road damages.

The system automatically awards points after successful damage detection.

## Features:

* Points are assigned based on detected damage category
* Points are stored with every report
* User total score is calculated automatically
* Scores contribute to leaderboard ranking

## Benefits:

* Encourages users to actively report road damages
* Creates a community-driven monitoring system
* Rewards users for contributing useful road information

**Outcome:**

✔️ Gamified road reporting system implemented

---

# 🥇 Leaderboard System

A leaderboard system has been developed to rank users based on their contribution.

## Features:

* Calculates total points earned by users
* Displays top contributors
* Updates automatically after new reports
* Shows user rankings

The leaderboard motivates users to contribute more road damage reports and improves community participation.

**Outcome:**

✔️ Dynamic leaderboard system integrated

---

# 🛡️ Duplicate Upload Prevention

A duplicate image prevention mechanism has been implemented to avoid repeated submissions.

## Features:

* Generates unique image hash values
* Checks uploaded images against existing reports
* Prevents duplicate image submissions
* Avoids repeated points generation

## Benefits:

* Maintains clean database records
* Prevents spam uploads
* Improves reliability of collected road damage data

**Outcome:**

✔️ Duplicate report prevention system implemented

---

# 📍 Enhanced Detection Reports

Each uploaded report stores complete detection information:

* Username
* Uploaded image
* Damage type
* YOLOv8 confidence score
* Latitude
* Longitude
* Timestamp
* Points earned

The dashboard provides two views:

### My Uploads

Displays reports uploaded by the logged-in user.

### Public Uploads

Displays reports submitted by all users in the system.

---

# 📊 Database Management

The backend maintains structured storage for:

* User accounts
* Password information
* Detection reports
* Image paths
* GPS coordinates
* Damage categories
* Confidence values
* User scores
* Timestamps

This allows future expansion into:

* Analytics dashboard
* Road damage statistics
* Map-based visualization

---

# 📊 Dataset and Training

* Initially used **RDD2022 dataset (~25,000 images)**

  * Faced long training times (~7 hours)

* Switched to a smaller dataset (~400 images) for faster iteration

* Successfully trained and integrated YOLOv8 model

---

# ⚠️ Challenges Faced

* Limited dataset size → reduced accuracy
* Difficulty distinguishing **potholes vs cracks**
* Inconsistent model predictions
* Training time constraints
* Maintaining image storage and duplicate detection

---

# 💡 Improvements & Future Work

* Increase dataset size and quality
* Apply **data augmentation techniques**:

  * Flipping
  * Rotation
  * Brightness adjustment
  * Scaling

* Manually verify annotations (20–30 samples)
* Improve bounding box accuracy
* Add:

  * Filtering by damage type
  * Analytics dashboard
  * Real-time detection
  * Map-based visualization
  * Cloud deployment

---

# 🚀 Current Features

* 📤 Image upload from frontend
* 🖼️ Image preview before submission
* 📍 Optional GPS location capture
* 💾 Backend image storage
* 🤖 AI-based damage detection
* 📊 Dashboard to view reports
* 🔐 User registration and login
* 🔑 JWT authentication
* 🏆 User scoring system
* 🥇 Leaderboard ranking
* 🛡️ Duplicate image prevention
* 🌍 Public community reports
* 🔄 End-to-end working pipeline

---

# 📂 Project Structure
