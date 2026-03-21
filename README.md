# MentorAI

**A full-stack RAG-based knowledge assistant built with Next.js, FastAPI, and LLaMA 3.3 70B.**

MentorAI lets you build a personal knowledge base from your own notes, then query it using natural language. Answers are grounded in what you've written — not the open internet. Think of it as a lightweight, self-hosted Google NotebookLM.

Live: [mentor-ai-ivory-five.vercel.app](https://mentor-ai-ivory-five.vercel.app/login)

---

## Overview

Most AI assistants give generic answers. MentorAI answers from *your* knowledge — the notes you've saved, the content you've written. It vectorizes every entry using HuggingFace embeddings, stores them in PostgreSQL with pgvector, and uses semantic similarity to retrieve the most relevant context before generating a response via Groq.

The result is an AI that gets smarter the more you use it, and never hallucinates facts you haven't taught it.

---

## Features

**RAG Chat**
Ask questions in natural language. The system performs vector similarity search across your notes, injects the top matches as context, and generates a response using LLaMA 3.3 70B via Groq. Every response cites which notes were used.

**Smart Notes**
Create, edit, and delete notes. Each note is automatically embedded on save using `all-MiniLM-L6-v2` (384-dimensional vectors). Notes are also summarized by the AI on creation.

**AI Summaries**
Generate or regenerate structured summaries for any note on demand. Summaries are stored alongside the note and displayed in the UI.

**Chat History**
Conversations are persisted per session. Chat titles are auto-generated from the first message. Full history is retrievable and searchable from the sidebar.

**Authentication**
JWT-based authentication with Bearer token flow. Signup and login return a signed token stored in localStorage. All protected routes verify the token on the backend.

---

## Architecture

```
Browser (Next.js)
      │
      │  HTTPS + Bearer Token
      ▼
FastAPI Backend (Render)
      │
      ├── /auth       → JWT signup / login
      ├── /notes      → CRUD + auto-embed + auto-summarize
      ├── /ai/chat    → RAG pipeline (embed query → vector search → LLM)
      ├── /ai/summarize → On-demand note summarization
      └── /chats      → Chat session management
      │
      ├── PostgreSQL + pgvector (Neon)
      │     └── notes table: content, embedding (384-dim), ai_summary
      │
      ├── HuggingFace Inference API
      │     └── all-MiniLM-L6-v2 → 384-dim embeddings
      │
      └── Groq API
            └── llama-3.3-70b-versatile → chat + summarization
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Framer Motion, Zustand |
| Backend | FastAPI, Python, SQLAlchemy, Pydantic |
| AI Inference | Groq API — LLaMA 3.3 70B Versatile |
| Embeddings | HuggingFace Inference API — all-MiniLM-L6-v2 |
| Database | PostgreSQL + pgvector extension (Neon) |
| Auth | JWT Bearer tokens, passlib + bcrypt |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

---

## Project Structure

```
Mentor-AI/
├── frontend/
│   ├── app/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── chat/           # Chat interface + sidebar
│   │   ├── notes/          # Notes grid + side drawer
│   │   ├── summary/        # AI summary page
│   │   ├── login/          # Auth pages
│   │   └── signup/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ChatSidebar.tsx
│   ├── lib/
│   │   ├── api.ts          # Central fetch wrapper with Bearer auth
│   │   ├── auth.ts         # Login / signup / token management
│   │   └── notes.ts        # Notes API calls
│   └── store/
│       └── auth.ts         # Zustand auth store
│
├── backend/
│   └── app/
│       ├── api/
│       │   ├── auth.py     # Signup + login endpoints
│       │   ├── notes.py    # Notes CRUD + vector operations
│       │   ├── ai.py       # RAG chat + summarization
│       │   └── chats.py    # Chat session management
│       ├── core/
│       │   ├── security.py # JWT + HTTPBearer
│       │   └── database.py # SQLAlchemy + Neon SSL
│       ├── models/         # SQLAlchemy ORM models
│       ├── schemas/        # Pydantic request/response schemas
│       ├── services/
│       │   └── ai_service.py # Groq + HuggingFace logic
│       └── main.py
│
└── requirements.txt
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL with pgvector extension (or a Neon account)
- Groq API key — [console.groq.com](https://console.groq.com)
- HuggingFace account (free tier is sufficient)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mentorai
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY=gsk_...
HF_TOKEN=hf_...               # Optional — increases HuggingFace rate limits
```

Run the pgvector migration once to create the vector column:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(384);
```

Start the server:

```bash
uvicorn app.main:app --reload
# Runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
# Runs at http://localhost:3000
```

---

## Deployment

The production stack uses three free-tier services:

| Service | Provider | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main` |
| Backend | Render | Free tier — 30-60s cold start on first request |
| Database | Neon | Serverless PostgreSQL with pgvector support |

**Environment variables on Render:**

```
DATABASE_URL      → Neon connection string (with ?sslmode=require)
SECRET_KEY        → Any long random string
GROQ_API_KEY      → From console.groq.com
ALGORITHM         → HS256
ACCESS_TOKEN_EXPIRE_MINUTES → 60
```

**Environment variables on Vercel:**

```
NEXT_PUBLIC_API_URL → https://your-backend.onrender.com
```

---

## Key Engineering Decisions

**Why HuggingFace Inference API instead of local sentence-transformers?**
Render's free tier has strict memory limits. PyTorch + sentence-transformers exceeds those limits. The HuggingFace Inference API provides the same `all-MiniLM-L6-v2` model as a hosted endpoint with no memory overhead.

**Why Bearer tokens over cookies?**
Vercel and Render are on different domains, making cookie-based sessions require `SameSite=None; Secure` with specific CORS configuration. Bearer tokens in `localStorage` + `Authorization` headers are simpler and work reliably across any two domains.

**Why Groq over OpenAI?**
Groq's inference speed on LLaMA 3.3 70B is significantly faster than OpenAI's GPT-4 at a fraction of the cost. For a portfolio project with RAG latency already in the pipeline, inference speed matters.

**Why pgvector over a dedicated vector database?**
Keeping vectors in PostgreSQL avoids introducing another managed service. pgvector supports L2 distance and cosine similarity natively. For the scale of a personal knowledge base (hundreds to low thousands of notes), it performs well without any tuning.

---

## Author

**Tarun Nani**
Full Stack & AI Developer · Hyderabad, India

- GitHub: [github.com/royalkingtarun2007-commits](https://github.com/royalkingtarun2007-commits)
- LinkedIn: [linkedin.com/in/tarun-nani](https://www.linkedin.com/in/tarun-nani/)
- Email: royalkingtarun.2007@gmail.com
