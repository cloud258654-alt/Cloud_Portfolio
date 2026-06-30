import { useState } from 'react';
import { Volume2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { login } from '../api/auth';
import type { AuthState } from '../components/auth/useAuth';

interface LoginPageProps {
  onLogin: (user: AuthState) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('請輸入帳號與密碼'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(username.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2 mb-6">
          <div className="bg-brand-600 p-3 rounded-2xl text-white inline-flex shadow-lg shadow-brand-200">
            <Volume2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AI 商譽風險偵測平台</h1>
          <p className="text-sm text-gray-400">AI Reputation Risk Detection Platform</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">帳號</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin / manager / viewer"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition" />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">密碼</label>
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl shadow-sm transition text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            登入系統
          </button>
        </form>

        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
          <p className="font-semibold mb-1">Demo 帳號</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-1.5 border border-gray-200"><span className="font-medium text-gray-700">admin</span><br />admin123</div>
            <div className="bg-white rounded-lg p-1.5 border border-gray-200"><span className="font-medium text-gray-700">manager</span><br />manager123</div>
            <div className="bg-white rounded-lg p-1.5 border border-gray-200"><span className="font-medium text-gray-700">viewer</span><br />viewer123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
