const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`);

  if (!res.ok) {
    throw new Error("Backend connection failed");
  }

  return res.json();
}