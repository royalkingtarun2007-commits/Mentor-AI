const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await res.json();

  // Save token to localStorage for cross-domain auth
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }

  return data;
}

export async function getMe() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/me`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export function logout() {
  localStorage.removeItem("access_token");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("access_token");
}