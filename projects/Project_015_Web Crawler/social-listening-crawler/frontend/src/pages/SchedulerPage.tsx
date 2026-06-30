import { useState, useEffect, useCallback } from 'react';
import { Play, Square, Zap, RefreshCw, Clock, Loader2, AlertCircle } from 'lucide-react';
import { fetchSchedulerStatus, startScheduler, stopScheduler, runSchedulerNow } from '../api/scheduler';
import { fetchCrawlLogs } from '../api/logs';
import type { CrawlLog } from '../types';

export default function SchedulerPage() {
  const [status, setStatus] = useState<{ running: boolean; mock_mode: boolean; interval_hours: number; next_run_time: string | null } | null>(null);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, l] = await Promise.all([fetchSchedulerStatus(), fetchCrawlLogs(20)]);
      setStatus(s); setLogs(l);
    } catch { setError('無法載入排程狀態。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, label: string) => {
    setActionLoading(label);
    try { await fn(); await load(); }
    catch { setError(`${label} 操作失敗。`); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入排程資訊...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">排程管理</h2>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={()=>setError('')} className="ml-auto text-red-400">×</button></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`h-4 w-4 rounded-full ${status?.running ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <div>
              <span className={`text-lg font-bold ${status?.running?'text-emerald-600':'text-gray-500'}`}>{status?.running?'執行中':'已停止'}</span>
              <p className="text-xs text-gray-400 mt-0.5">Mock Mode | 間隔: {status?.interval_hours??6}h{status?.next_run_time?` | 下次: ${new Date(status.next_run_time).toLocaleString('zh-TW')}`:''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>act(runSchedulerNow,'run')} disabled={!!actionLoading}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
              {actionLoading==='run'?<Loader2 className="h-4 w-4 animate-spin"/>:<Zap className="h-4 w-4"/>}立即執行
            </button>
            {status?.running ? (
              <button onClick={()=>act(stopScheduler,'stop')} disabled={!!actionLoading}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
                {actionLoading==='stop'?<Loader2 className="h-4 w-4 animate-spin"/>:<Square className="h-4 w-4"/>}停止排程
              </button>
            ) : (
              <button onClick={()=>act(()=>startScheduler(6),'start')} disabled={!!actionLoading}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
                {actionLoading==='start'?<Loader2 className="h-4 w-4 animate-spin"/>:<Play className="h-4 w-4"/>}啟動排程
              </button>
            )}
            <button onClick={load} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition"><RefreshCw className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50"><h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock className="h-4 w-4" />最近執行紀錄</h3></div>
        <table className="w-full text-left">
          <thead><tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
            <th className="px-6 py-3">ID</th><th className="px-6 py-3">平台</th><th className="px-6 py-3">狀態</th><th className="px-6 py-3">筆數</th><th className="px-6 py-3">開始時間</th><th className="px-6 py-3">結束時間</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {logs.map(log=>(
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3 font-mono text-xs text-gray-400">#{log.id}</td>
                <td className="px-6 py-3 text-xs text-gray-500">{log.platform}</td>
                <td className="px-6 py-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${log.status==='Success'?'bg-emerald-50 text-emerald-600 border-emerald-200':log.status==='Failed'?'bg-red-50 text-red-500 border-red-200':'bg-blue-50 text-blue-600 border-blue-200'}`}>{log.status}</span></td>
                <td className="px-6 py-3 font-semibold text-gray-700">{log.items_count??'-'}</td>
                <td className="px-6 py-3 text-xs text-gray-400">{log.started_at?new Date(log.started_at).toLocaleString('zh-TW'):'-'}</td>
                <td className="px-6 py-3 text-xs text-gray-400">{log.finished_at?new Date(log.finished_at).toLocaleString('zh-TW'):'-'}</td>
              </tr>
            ))}
            {logs.length===0&&<tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">尚無執行紀錄</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
