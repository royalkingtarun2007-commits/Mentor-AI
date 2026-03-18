from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

from app.models.user import User
from app.models.note import Note
from app.models.message import Message
from app.models.chat import Chat

from app.api.auth import router as auth_router
from app.api.notes import router as notes_router
from app.api.ai import router as ai_router
from app.api.chats import router as chats_router

from app.core.security import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MentorAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for portfolio project
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(notes_router)
app.include_router(ai_router)
app.include_router(chats_router)


@app.get("/")
def root():
    return {"message": "MentorAI Backend Running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email
    }
