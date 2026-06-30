import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Filter, Loader2, AlertCircle, SearchX } from 'lucide-react';
import { fetchCrawlLogs } from '../api/logs';
import type { CrawlLog } from '../types';

export default function LogsPage() {
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchCrawlLogs(100);
      let f = data;
      if (statusFilter) f = f.filter(l=>l.status===statusFilter);
      if (platformFilter) f = f.filter(l=>l.platform===platformFilter);
      setLogs(f);
    } catch { setError('無法載入執行紀錄。'); setLogs([]); }
    finally { setLoading(false); }
  }, [statusFilter, platformFilter]);

  useEffect(() => { load(); }, [load]);

  const sel = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">執行紀錄</h2>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={()=>setError('')} className="ml-auto text-red-400">×</button></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={sel}>
          <option value="">全部狀態</option><option value="Success">成功</option><option value="Failed">失敗</option><option value="Running">執行中</option>
        </select>
        <select value={platformFilter} onChange={e=>setPlatformFilter(e.target.value)} className={sel}>
          <option value="">全部平台</option>
          <option value="PTT">PTT</option>
          <option value="Dcard">Dcard</option>
          <option value="Google Search">Google Search</option>
          <option value="Google Maps">Google Maps</option>
          <option value="Facebook Import">Facebook Import</option>
          <option value="Threads Import">Threads Import</option>
          <option value="小紅書 Import">小紅書 Import</option>
          <option value="TikTok Import">TikTok Import</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">共 {logs.length} 筆</span>
      </div>

      {loading && <div className="flex items-center justify-center h-32 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入中...</div>}

      {!loading && logs.length===0 && !error && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><SearchX className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">尚無執行紀錄</p></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
            <th className="px-6 py-3">ID</th><th className="px-6 py-3">平台</th><th className="px-6 py-3">狀態</th><th className="px-6 py-3">筆數</th><th className="px-6 py-3">開始時間</th><th className="px-6 py-3">結束時間</th><th className="px-6 py-3">錯誤訊息</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {logs.map(log=>(
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3 font-mono text-xs text-gray-400">#{log.id}</td>
                <td className="px-6 py-3 text-xs text-gray-500">{log.platform}</td>
                <td className="px-6 py-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${log.status==='Success'?'bg-emerald-50 text-emerald-600 border-emerald-200':log.status==='Failed'?'bg-red-50 text-red-500 border-red-200':'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {log.status==='Success' ? <CheckCircle className="h-3 w-3"/> : log.status==='Failed' ? <XCircle className="h-3 w-3"/> : null} {log.status}
                </span></td>
                <td className="px-6 py-3 font-semibold text-gray-700">{log.items_count??'-'}</td>
                <td className="px-6 py-3 text-xs text-gray-400">{log.started_at?new Date(log.started_at).toLocaleString('zh-TW'):'-'}</td>
                <td className="px-6 py-3 text-xs text-gray-400">{log.finished_at?new Date(log.finished_at).toLocaleString('zh-TW'):'-'}</td>
                <td className="px-6 py-3 text-xs text-red-400 max-w-[200px] truncate">{log.error_message||'-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
