const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Backend connection failed");
  }

  return res.json();
}
