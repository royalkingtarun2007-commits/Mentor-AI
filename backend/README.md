# MentorAI Backend

This directory contains the **FastAPI backend** powering the MentorAI platform.

The backend is responsible for handling:

* API endpoints
* AI interaction
* user authentication
* data management

---

## 🧠 Backend Responsibilities

The backend acts as the **core intelligence layer** of MentorAI.

Responsibilities include:

* Processing AI chat requests
* Managing user accounts
* Storing user notes
* Handling API communication with the frontend
* Connecting with local AI models

---

## 🛠 Tech Stack

* Python
* FastAPI
* Uvicorn
* MongoDB
* JWT Authentication
* Local LLM Integration

---

## 📂 Backend Structure

```text
backend
│
├── app
│   ├── api
│   ├── models
│   ├── services
│   └── utils
│
├── main.py
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup

### Create Virtual Environment

```bash
python -m venv venv
```

Activate environment

Windows:

```bash
venv\Scripts\activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Run Backend Server

```bash
uvicorn app.main:app --reload
```

Server will start at:

```
http://localhost:8000
```

---

## 📡 Example API Endpoint

Health check:

```
GET /health
```

Response:

```
{
  "status": "running"
}
```

---

## 🧪 Development Notes

* Backend follows modular FastAPI architecture
* AI requests are processed through service layers
* Designed to integrate with local LLM runtimes
* Optimized for future AI feature expansion
