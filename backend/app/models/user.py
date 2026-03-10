from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Track when the user joined
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 1. Notes Relationship
    # Must match the 'user' attribute in Note model
    notes = relationship(
        "Note",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # 2. Chats Relationship (FIXES YOUR ERROR)
    # Must match the 'user' attribute in Chat model
    chats = relationship(
        "Chat",
        back_populates="user",
        cascade="all, delete-orphan"
    )