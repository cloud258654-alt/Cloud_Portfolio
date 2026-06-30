import { useState, useEffect } from 'react';
import { getAuthToken, getUser, setAuthToken, setUser } from '../../api/client';
import { fetchMe } from '../../api/auth';

interface AuthState { id: number; username: string; role: string; email?: string; }
export type { AuthState };

export function useAuth() {
  const [user, setU] = useState<AuthState | null>(getUser());
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (getAuthToken() && !user) {
      fetchMe().then((u: AuthState) => { setU(u); setUser(u); }).catch(() => { setAuthToken(null); setUser(null); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (u: AuthState) => { setU(u); setUser(u); };
  const logout = () => { setU(null); setAuthToken(null); setUser(null); };
  const hasRole = (role: string) => {
    const hierarchy: Record<string, number> = { admin: 3, manager: 2, viewer: 1 };
    return (hierarchy[user?.role || ''] || 0) >= (hierarchy[role] || 0);
  };

  return { user, loading, login, logout, hasRole, isAdmin: user?.role === 'admin' };
}
