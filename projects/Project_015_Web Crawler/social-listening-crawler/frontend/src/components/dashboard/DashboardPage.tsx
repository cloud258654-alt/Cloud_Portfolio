import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertTriangle, Loader2, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import StatCard from './StatCard';
import PlatformChart from './PlatformChart';
import KeywordRanking from './KeywordRanking';
import SentimentTrend from './SentimentTrend';
import LatestMentions from './LatestMentions';
import HighRiskEvents from './HighRiskEvents';
import { get } from '../../api/client';
import { postCrawlRun } from '../../api/keywords';
import type { DashboardSummary } from '../../types';

const DATE_RANGES = [
  { label: '7 天', days: 7 },
  { label: '14 天', days: 14 },
  { label: '30 天', days: 30 },
  { label: '全部', days: 0 },
];

function daysAgo(days: number): string {
  const d = new Date(); d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const url = rangeDays > 0 ? `/dashboard/summary?start_date=${daysAgo(rangeDays)}` : '/dashboard/summary';
      const summary = await get<DashboardSummary>(url);
      setData(summary);
    } catch { setError('無法載入儀表板資料。'); setData(null); }
    finally { setLoading(false); }
  }, [rangeDays]);

  useEffect(() => { loadData(); }, [loadData]);

  const triggerDemoCrawl = async () => {
    setActionLoading(true);
    try { await postCrawlRun(); await loadData(); } catch {}
    finally { setTimeout(() => setActionLoading(false), 1500); }
  };

  if (loading && !data) return <div className="flex items-center justify-center h-96 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入儀表板中...</div>;
  if (error && !data) return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mb-3" /><p className="text-red-500 font-medium mb-2">{error}</p>
      <button onClick={loadData} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-xl">重新載入</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">商譽風險戰情室</h2>
          <p className="text-gray-500 text-sm mt-0.5">企業商譽風險即時監控與危機處置</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            {DATE_RANGES.map(r => (
              <button key={r.days} onClick={() => setRangeDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${rangeDays === r.days ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}更新
          </button>
          <button onClick={triggerDemoCrawl} disabled={actionLoading}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white text-sm font-semibold px-3 py-2 rounded-xl shadow-sm transition">
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}立即分析
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="商譽風險指數"
          value={data ? (data.reputation_risk_index ?? 0).toFixed(1) : "0.0"}
          sub="平均危機分數 (0-100)"
          icon={<Zap className="h-6 w-6" />}
          accent={data && (data.reputation_risk_index ?? 0) >= 70 ? "red" : (data && (data.reputation_risk_index ?? 0) >= 30 ? "amber" : "emerald")}
        />
        <StatCard label="高風險事件數" value={data?.high_risk_count ?? 0} sub="待優先處置 P0/P1" icon={<AlertTriangle className="h-6 w-6" />} accent="red" />
        <StatCard label="負面信號比例" value={data ? `${data.negative_ratio ?? 0}%` : "0%"} sub={`總信號: ${data?.total_mentions ?? 0} 筆`} icon={<MessageSquare className="h-6 w-6" />} accent="amber" />
        <StatCard label="危機字詞命中數" value={data?.crisis_keywords_hit_count ?? 0} sub={`未處理事件: ${data?.unresolved_count ?? 0} 筆`} icon={<AlertTriangle className="h-6 w-6" />} accent="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformChart data={data?.platform_breakdown || {}} />
        <KeywordRanking data={data?.keyword_breakdown || {}} />
      </div>

      <SentimentTrend data={data?.trend || []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestMentions mentions={data?.latest_mentions || []} />
        <HighRiskEvents events={data?.high_risk_events || []} />
      </div>
    </div>
  );
}
