from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.chat import Chat
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/chats", tags=["Chats"])

# Schema for JSON body updates (Optional, but good practice)
class RenameChatRequest(BaseModel):
    title: str

@router.get("/")
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all chats for the logged-in user, newest first."""
    return (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )

@router.post("/")
def create_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize a new chat session."""
    chat = Chat(
        user_id=current_user.id,
        title="New Chat"
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.put("/{chat_id}")
def rename_chat(
    chat_id: int,
    # We allow BOTH JSON body and Query Parameter to prevent 422 errors
    request: Optional[RenameChatRequest] = None,
    title: Optional[str] = Query(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the title of a specific chat."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Determine which title to use (Query Param has priority for auto-renaming)
    new_title = title or (request.title if request else None)
    
    if not new_title:
        raise HTTPException(status_code=400, detail="Title is required")

    chat.title = new_title
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete a chat and all its messages."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    try:
        db.delete(chat)
        db.commit()
    except Exception as e:
        db.rollback()
        # This catch is a safety net if CASCADE isn't set in DB yet
        raise HTTPException(
            status_code=500, 
            detail="Delete failed. Please ensure ON DELETE CASCADE is set on Messages."
        )

    return {"message": "Chat deleted"}