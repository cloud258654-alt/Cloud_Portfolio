import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { AuthState } from '../auth/useAuth';

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldAlert,
  manager: ShieldCheck,
  viewer: Shield,
};

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
