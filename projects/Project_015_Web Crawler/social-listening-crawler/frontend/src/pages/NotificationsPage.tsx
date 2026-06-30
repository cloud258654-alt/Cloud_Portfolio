import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, CheckCircle2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { get, post } from '../api/client';

interface Notification {
  id: number; mention_id: number | null; title: string; content: string;
  level: string; is_read: string; created_at: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setNotifications(await get<Notification[]>('/notifications')); }
    catch { setError('無法載入通知。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    try {
      await post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 'true' } : n));
    } catch { /* ignore */ }
  };

  const levelColors: Record<string, string> = {
    warning: 'bg-red-50 border-red-200 text-red-600',
    info: 'bg-blue-50 border-blue-200 text-blue-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入通知...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">通知中心</h2>
          <p className="text-gray-500 text-sm mt-0.5">高風險事件與系統通知</p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition"><Loader2 className="h-5 w-5" /></button>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={() => setError('')} className="ml-auto text-red-400">×</button></div>}

      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl shadow-sm border p-4 transition ${n.is_read === 'true' ? 'border-gray-100 opacity-70' : levelColors[n.level] || 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-xl mt-0.5 ${n.is_read === 'true' ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-500'}`}>
                  {n.is_read === 'true' ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.level === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{n.level}</span>
                    <span className="text-sm font-semibold text-gray-800">{n.title}</span>
                  </div>
                  {n.content && <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{n.created_at ? new Date(n.created_at).toLocaleString('zh-TW') : '-'}</span>
                    {n.mention_id && <a href="#" className="text-brand-600 flex items-center gap-1">查看貼文<ExternalLink className="h-3 w-3" /></a>}
                  </div>
                </div>
              </div>
              {n.is_read !== 'true' && (
                <button onClick={() => markRead(n.id)} className="text-gray-300 hover:text-emerald-500 p-1 rounded-lg transition flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <BellOff className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">尚無通知</p>
          </div>
        )}
      </div>
    </div>
  );
}
