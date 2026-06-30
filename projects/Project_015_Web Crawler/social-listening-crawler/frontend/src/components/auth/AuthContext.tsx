import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getAuthToken, getUser, setAuthToken, setUser } from '../../api/client';
import { fetchMe } from '../../api/auth';

interface AuthState { id: number; username: string; role: string; email?: string; }
export type { AuthState };

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldAlert,
  manager: ShieldCheck,
  viewer: Shield,
};

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

export function UserBadge({ user }: { user: AuthState }) {
  const Icon = roleIcons[user.role] || Shield;
  const roleLabel: Record<string, string> = { admin: '系統管理員', manager: '管理者', viewer: '檢視者' };
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-brand-600" />
      <span className="text-sm font-medium text-gray-700">{user.username}</span>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{roleLabel[user.role] || user.role}</span>
    </div>
  );
}
