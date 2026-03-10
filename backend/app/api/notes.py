from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.services.ai_service import generate_embedding, generate_summary # Added summary
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.models.user import User

router = APIRouter(prefix="/notes", tags=["Notes"])

@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Generate AI assets
    embedding = generate_embedding(note.content)
    summary = generate_summary(note.content) # Automatically summarize

    # 2. Create note
    new_note = Note(
        title=note.title,
        content=note.content,
        tags=note.tags,
        user_id=current_user.id,
        embedding=embedding,
        ai_summary=summary,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.get("/", response_model=List[NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch newest first
    return db.query(Note).filter(Note.user_id == current_user.id).order_by(Note.created_at.desc()).all()

@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}

@router.get("/search", response_model=List[NoteResponse])
def search_notes(
    query: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Turn the search text into a vector
    query_embedding = generate_embedding(query)
    
    # 2. Use L2 Distance (<->) to find the closest notes in the vector space
    # This is the "AI Search" magic
    notes = db.query(Note).filter(
        Note.user_id == current_user.id
    ).order_by(
        Note.embedding.l2_distance(query_embedding)
    ).limit(5).all()
    
    return notes
@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # If content changed, we must re-process the AI assets
    if note_data.content and note_data.content != note.content:
        note.embedding = generate_embedding(note_data.content)
        note.ai_summary = generate_summary(note_data.content)

    for key, value in note_data.model_dump(exclude_unset=True).items():
        setattr(note, key, value)

    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note