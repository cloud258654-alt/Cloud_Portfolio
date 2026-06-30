import { RefreshCw, Volume2, LogOut } from 'lucide-react';
import { UserBadge } from './UserBadge';
import type { AuthState } from '../auth/useAuth';

interface HeaderProps {
  isCrawling: boolean;
  onTriggerCrawl: () => void;
  user: AuthState;
  onLogout: () => void;
}

export default function Header({ isCrawling, onTriggerCrawl, user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <Volume2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI 商譽風險偵測平台</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-500">System Online</span>
        </div>

        {user.role === 'admin' && (
          <button onClick={onTriggerCrawl} disabled={isCrawling}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
            <RefreshCw className={`h-4 w-4 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{isCrawling ? '偵測中...' : '立即掃描'}</span>
          </button>
        )}

        <UserBadge user={user} />

        <button onClick={onLogout}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="登出">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
