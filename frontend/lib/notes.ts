const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchNotes() {
  const res = await fetch(`${API_URL}/notes/`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  return res.json();
}

export async function createNote(note: {
  title: string;
  content: string;
  tags: string;
}) {
  const res = await fetch(`${API_URL}/notes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(note),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Create note error:", error);
    throw new Error("Failed to create note");
  }

  return res.json();
}

export async function deleteNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
}

// ... keep fetchNotes, createNote, deleteNote ...

export async function updateNote(id: number, note: { title: string; content: string }) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(note),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Update note error:", error);
    throw new Error("Failed to update note");
  }

  return res.json();
}
