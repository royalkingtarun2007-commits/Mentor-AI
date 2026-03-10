# MentorAI 🧠

### AI-Powered Learning & Productivity Assistant

MentorAI is a full-stack AI learning assistant designed to help developers learn faster, organize knowledge, and interact with a personal AI mentor.

It combines a modern web interface with a backend AI service to provide structured explanations, intelligent responses, and productivity-focused learning workflows.

---

## ✨ Features

### 🤖 AI Mentor Chat

* Ask programming and technical questions
* Receive structured explanations from an AI mentor
* Supports local LLM inference for private usage

### 📝 Smart Notes System

* Save important insights from AI conversations
* Organize technical learning notes
* Designed for developer productivity

### 🔐 Authentication

* Secure user login and account management
* Protected user-specific data

### ⚡ Modern UI

* Clean and responsive developer-focused interface
* Built with modern frontend frameworks

---

## 🏗 Architecture

MentorAI follows a **full-stack architecture**:

Frontend (Next.js + React)
⬇
Backend API (FastAPI)
⬇
AI Model Layer (Local LLM via Ollama)

This structure allows scalable AI interaction while keeping the system modular.

---

## 🛠 Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* Python
* REST API
* JWT Authentication

### AI Layer

* Local LLM Integration
* Ollama Runtime

### Database

* MongoDB

---

## 📂 Project Structure

```text
Mentor-AI
│
├── backend
│   ├── app
│   ├── api
│   ├── models
│   └── main.py
│
├── frontend
│   ├── components
│   ├── pages
│   └── styles
│
├── docs
│   └── screenshots
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/royalkingtarun2007-commits/Mentor-AI.git
cd Mentor-AI
```

---

### Backend Setup

Create virtual environment

```bash
python -m venv venv
```

Activate environment

Windows:

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r backend/requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

---

### Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend runs at

```
http://localhost:3000
```

---

## 📸 Screenshots

Screenshots of the interface will be added in:

```
docs/screenshots
```

Examples:

* AI Chat Interface
* Notes Management Dashboard
* User Profile Panel

---

## 🚀 Future Improvements

* Persistent AI memory
* Multi-agent AI mentoring
* Prompt-to-Website generator
* Learning progress analytics
* Advanced AI coding assistant

---

## 👨‍💻 Author

**Tarun Nani**

Full Stack Developer | AI Systems Builder

GitHub
https://github.com/royalkingtarun2007-commits

---

## ⭐ If you find this project useful

Consider giving the repository a **star** ⭐
