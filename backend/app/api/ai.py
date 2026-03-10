from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import time

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.note import Note
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message
from app.schemas.ai import ChatRequest
from app.services.ai_service import (
    generate_embedding,
    chat_with_notes,
    generate_summary,
    groq_client,
    GROQ_MODEL
)

router = APIRouter(prefix="/ai", tags=["AI"])


def generate_chat_title(first_message: str) -> str:
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You generate ultra-short chat titles. Respond with ONLY 2-5 words, no punctuation, no quotes, no explanation. Just the title."},
                {"role": "user", "content": f"Generate a title for: {first_message[:200]}"}
            ],
            temperature=0.3,
            max_tokens=20,
        )
        title = response.choices[0].message.content.strip().strip('"\'')
        return title[:50] if title else first_message[:40]
    except Exception as e:
        print(f"Title generation failed: {e}")
        return first_message[:40] + ("..." if len(first_message) > 40 else "")


@router.post("/chat")
def chat_with_mentor(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start_time = time.time()

    # --- 1. Get or create chat ---
    chat = None
    if request.chat_id:
        chat = db.query(Chat).filter(
            Chat.id == request.chat_id,
            Chat.user_id == current_user.id
        ).first()

    if not chat:
        chat = Chat(user_id=current_user.id, title="New Chat")
        db.add(chat)
        db.commit()
        db.refresh(chat)

    # --- 2. Check if first message ---
    is_first_message = db.query(Message).filter(
        Message.chat_id == chat.id
    ).count() == 0

    # --- 3. RAG: Vector search ---
    query_embedding = generate_embedding(request.message)
    similar_notes = (
        db.query(Note)
        .filter(Note.user_id == current_user.id, Note.embedding.isnot(None))
        .order_by(Note.embedding.l2_distance(query_embedding))
        .limit(3)
        .all()
    )

    context_text = ""
    if similar_notes:
        context_text = "USE THE FOLLOWING NOTES AS CONTEXT:\n\n"
        context_text += "\n\n".join([f"--- Note: {n.title} ---\n{n.content}" for n in similar_notes])

    # --- 4. Load history from DB ---
    db_history = db.query(Message).filter(
        Message.chat_id == chat.id
    ).order_by(Message.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in db_history]

    # --- 5. Call AI ---
    try:
        ai_response = chat_with_notes(context=context_text, message=request.message, history=history)
    except Exception as e:
        print(f"AI Error: {e}")
        return {"response": "I'm having trouble thinking right now. Please try again.", "context_used": [], "chat_id": chat.id, "chat_title": chat.title}

    # --- 6. Save messages ---
    db.add(Message(chat_id=chat.id, role="user", content=request.message))
    db.add(Message(chat_id=chat.id, role="assistant", content=ai_response))

    # --- 7. Auto-name on first message ---
    if is_first_message:
        chat.title = generate_chat_title(request.message)

    db.commit()
    db.refresh(chat)

    print(f"Response Time: {round(time.time() - start_time, 2)}s | Chat: {chat.id} | Title: {chat.title}")

    return {
        "response": ai_response,
        "context_used": [n.title for n in similar_notes],
        "chat_id": int(chat.id),
        "chat_title": str(chat.title)
    }


@router.post("/summarize")
def summarize_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate an AI summary for a specific note and save it."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    try:
        summary = generate_summary(f"{note.title}\n\n{note.content}")
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(status_code=500, detail="Summary generation failed")

    # Save summary back to the note
    note.ai_summary = summary
    db.commit()
    db.refresh(note)

    return {
        "summary": summary,
        "note_id": note_id,
        "note_title": note.title
    }


@router.get("/history/{chat_id}")
def get_chat_history(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
    return [{"role": m.role, "content": m.content} for m in messages]
