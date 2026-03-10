from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    chat_id: Optional[int] = None