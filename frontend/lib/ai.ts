const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function chatWithNotes(message: string) {
  const res = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Chat failed");
  }

  return res.json();
}
