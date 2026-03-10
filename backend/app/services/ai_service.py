"""
ai_service.py — Groq Edition
------------------------------
WHAT CHANGED vs the Ollama version:
- Removed: requests.post() to localhost:11434
- Added: groq.Groq() client — one line to set up
- generate_summary()  → same logic, just groq instead of ollama
- chat_with_notes()   → same prompt, same RAG structure, just groq
- generate_embedding() → Groq has NO embedding API, so we keep a 
  lightweight local solution using sentence-transformers (free, fast, 
  runs on CPU fine for a portfolio project)

WHY KEEP LOCAL EMBEDDINGS?
Embeddings are small vectors — they don't need a GPU or fast model.
The sentence-transformers library runs fine on any laptop CPU in < 100ms.
Groq is saved for the actual chat/summary (the slow, heavy part).
"""

import os
from groq import Groq
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# --- Clients (initialized once, reused across all requests) ---
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Small, fast embedding model — runs locally on CPU, no GPU needed
# Downloads once (~90MB), then cached
_embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Groq model to use — llama3-70b is smart and very fast on Groq
GROQ_MODEL = "llama-3.3-70b-versatile"


def generate_summary(text: str) -> str:
    """
    Generates a concise summary of a note.
    Replaces: requests.post to ollama /api/generate
    """
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes notes concisely."
                },
                {
                    "role": "user",
                    "content": f"Provide a concise, professional summary of the following note. Use bullet points if necessary:\n\n{text}"
                }
            ],
            temperature=0.3,   # low = focused and accurate for summaries
            max_tokens=300,
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Summary Error: {e}")
        return "AI Summary unavailable. Check your GROQ_API_KEY in .env"


def chat_with_notes(context: str, message: str, history: list = None) -> str:
    """
    Core RAG chat function.
    Same logic as before — context + history + message → AI response.
    Replaces: requests.post to ollama /api/generate

    Args:
        context: Retrieved notes text (built by ai.py router via vector search)
        message: The current user question
        history: Previous chat messages [{"role": "user"/"assistant", "content": "..."}]
    """
    try:
        # --- Build message list for Groq (it uses OpenAI-style message format) ---
        messages = [
            {
                "role": "system",
                "content": (
                    "You are MentorAI, a Senior Technical Mentor. "
                    "Your goal is to help users learn from their own knowledge base.\n"
                    "GUIDELINES:\n"
                    "1. Use the provided 'USER NOTES' as your primary source of truth.\n"
                    "2. If the notes contain the answer, say 'Based on your notes...' and explain clearly.\n"
                    "3. If the notes are irrelevant, provide a helpful expert answer from general knowledge.\n"
                    "4. Use professional Markdown (bold, lists, code blocks) for readability.\n"
                    "5. Be encouraging and concise."
                )
            }
        ]

        # Inject note context as a system-level message (keeps it separate from chat history)
        if context and context.strip():
            messages.append({
                "role": "system",
                "content": f"RELEVANT USER NOTES FOR THIS QUERY:\n\n{context}"
            })

        # Add conversation history (previous back-and-forth)
        if history:
            for msg in history:
                if msg.get("role") in ("user", "assistant") and msg.get("content"):
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })

        # Add the current user message
        messages.append({"role": "user", "content": message})

        # --- Call Groq ---
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Chat Error: {e}")
        return "I'm sorry, I couldn't reach the AI mentor core. Please check your GROQ_API_KEY in .env"


def generate_embedding(text: str) -> list[float]:
    """
    Converts text to a vector for semantic search (RAG).
    
    NOTE: This stays LOCAL using sentence-transformers.
    Groq doesn't offer an embeddings API, and local embeddings are 
    fast enough (< 100ms on CPU) for this use case.
    
    IMPORTANT: This model produces 384-dimensional vectors.
    If your PostgreSQL pgvector column was set up for 768 dimensions 
    (from nomic-embed-text), you'll need to update it.
    Run this SQL once:
        ALTER TABLE notes DROP COLUMN embedding;
        ALTER TABLE notes ADD COLUMN embedding vector(384);
    """
    try:
        embedding = _embedding_model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding Error: {e}")
        return [0.0] * 384  # zero vector fallback — same dimensions