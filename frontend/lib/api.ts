const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (url: string) => apiRequest(url),
  post: (url: string, body: unknown) =>
    apiRequest(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url: string, body: unknown) =>
    apiRequest(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url: string) =>
    apiRequest(url, { method: "DELETE" }),
};