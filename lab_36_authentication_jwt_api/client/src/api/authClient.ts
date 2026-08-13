const API_BASE = "http://localhost:4000";

export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: PublicUser;
}

async function parseJsonOrThrow(res: Response): Promise<any> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function apiSignup(email: string, password: string): Promise<{ user: PublicUser }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonOrThrow(res);
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return parseJsonOrThrow(res);
}

export async function apiRefresh(): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return parseJsonOrThrow(res);
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function apiFetchDashboard(accessToken: string): Promise<{ message: string; items: { id: number; name: string }[] }> {
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseJsonOrThrow(res);
}

export async function apiFetchServerLogs(): Promise<{ events: { type: string; message: string; at: string }[] }> {
  const res = await fetch(`${API_BASE}/auth/debug/logs`);
  return parseJsonOrThrow(res);
}
