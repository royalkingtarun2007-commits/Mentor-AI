from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base

# 🔹 Import models so SQLAlchemy knows about them
from app.models.user import User
from app.models.note import Note
from app.models.message import Message
from app.models.chat import Chat

# 🔹 Import routers
from app.api.auth import router as auth_router
from app.api.notes import router as notes_router
from app.api.ai import router as ai_router
from app.api.chats import router as chats_router


from app.core.security import get_current_user


# 🔹 Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="MentorAI Backend")


# 🔹 CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔹 Register routers
app.include_router(auth_router)
app.include_router(notes_router)
app.include_router(ai_router)
app.include_router(chats_router)


# 🔹 Root endpoint
@app.get("/")
def root():
    return {"message": "MentorAI Backend Running"}


# 🔹 Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}


# 🔹 Current logged-in user
@app.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email
    }