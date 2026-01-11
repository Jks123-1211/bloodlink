# 🩸 BloodLink – Smart Blood Donation & Request Platform

BloodLink is a full-stack web application designed to connect blood donors, patients, hospitals, and administrators on a single platform to manage blood donations and emergency blood requests efficiently.

---

## 🚀 Features

### 👤 User Roles
- **Patient** – Create blood requests (normal & emergency)
- **Donor** – Register as donor, donate blood, earn reward points
- **Admin** – Manage blood banks, inventory, requests, and analytics

---

### 🧠 Core Functionalities
- 🔐 Secure JWT Authentication
- 🩸 Blood Inventory Management
- 🚨 Emergency Donor Live Matching (based on city & blood group)
- 📊 Admin Dashboard with Charts & Insights
- 🎯 Donor Reward & Gamification System
- ⏳ Donation Eligibility Tracking (cool-down period)

---

## 🛠 Tech Stack

### Frontend
- React
- Recharts (Charts & Analytics)
- CSS

### Backend
- Flask (Python)
- MySQL Database
- JWT Authentication

---

## 📂 Project Structure

bloodlink/
├── backend/
│   ├── app.py
│   ├── db.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── README.md

---

## ⚙️ Local Setup Instructions

### 1️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py

### 1️⃣ Frontend Setup

cd frontend
npm install
npm start

📊 Admin Dashboard Highlights

Blood availability pie chart

Critical blood stock alerts

Emergency request handling

Inventory summary

Donor-request live matching


🏆 Donor Rewards System

Points awarded per donation

Donation history tracking

Badge unlock system:

First Drop

Lifesaver

Elite Donor
