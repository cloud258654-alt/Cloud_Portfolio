import { post, get, setAuthToken, setUser } from './client';

export interface AuthUser { id: number; username: string; role: string; email?: string; }

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await post<{ access_token: string; user: AuthUser }>('/auth/login', { username, password });
  setAuthToken(res.access_token);
  setUser(res.user);
  return res.user;
}

export async function register(username: string, password: string): Promise<AuthUser> {
  const res = await post<{ access_token: string; user: AuthUser }>('/auth/register', { username, password });
  setAuthToken(res.access_token);
  setUser(res.user);
  return res.user;
}

export async function fetchMe(): Promise<AuthUser> {
  return get<AuthUser>('/auth/me');
}

export function logout() {
  setAuthToken(null);
  setUser(null);
}
