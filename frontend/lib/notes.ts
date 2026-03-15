const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getHeaders(): Record<string, string> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

export interface Note {
  id: number;
  title: string;
  content: string;
  ai_summary?: string;
  tags?: string;
  created_at: string;
  updated_at?: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_URL}/notes/`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function createNote(data: { title: string; content: string; tags?: string }): Promise<Note> {
  const res = await fetch(`${API_URL}/notes/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function updateNote(id: number, data: { title?: string; content?: string }): Promise<Note> {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete note");
}