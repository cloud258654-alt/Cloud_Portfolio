export const API_BASE = 'http://localhost:8000/api/v1';

let token: string | null = localStorage.getItem('auth_token');

export function setAuthToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('auth_token', t);
  else localStorage.removeItem('auth_token');
}

export function getAuthToken(): string | null {
  return token || localStorage.getItem('auth_token');
}

export function getUser(): { id: number; username: string; role: string; email?: string } | null {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

export function setUser(u: { id: number; username: string; role: string; email?: string } | null) {
  if (u) localStorage.setItem('auth_user', JSON.stringify(u));
  else localStorage.removeItem('auth_user');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string> || {}) };
  const t = getAuthToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  if (!headers['Content-Type'] && !(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setAuthToken(null);
    setUser(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || `API error: ${res.status}`);
  }
  return res.json();
}

export function get<T>(path: string): Promise<T> { return request<T>(path); }

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export function del(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' });
}
