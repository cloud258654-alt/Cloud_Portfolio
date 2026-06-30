import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertTriangle, Loader2, AlertCircle, Zap, RefreshCw, Lightbulb } from 'lucide-react';
import StatCard from './StatCard';
import PlatformChart from './PlatformChart';
import KeywordRanking from './KeywordRanking';
import SentimentTrend from './SentimentTrend';
import LatestMentions from './LatestMentions';
import HighRiskEvents from './HighRiskEvents';
import BrandHealthCard from './BrandHealthCard';
import RootCauseChart from './RootCauseChart';
import PriorityBadge from './PriorityBadge';
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

  const bh = data?.brand_health;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 商譽風險戰情室</h2>
          <p className="text-gray-500 text-sm mt-0.5">文章牛肉湯 · 全台分店商譽即時監控</p>
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

      {/* Row 1: Brand Health Score */}
      <BrandHealthCard data={bh ?? null} />

      {/* Row 2: KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="商譽風險指數"
          value={data ? (data.reputation_risk_index ?? 0).toFixed(1) : "0.0"}
          sub="平均危機分數 (0-100)"
          icon={<Zap className="h-6 w-6" />}
          accent={data && (data.reputation_risk_index ?? 0) >= 70 ? "red" : (data && (data.reputation_risk_index ?? 0) >= 30 ? "amber" : "emerald")}
        />
        <StatCard label="P0/P1 高風險" value={(data?.priority_distribution?.P0 ?? 0) + (data?.priority_distribution?.P1 ?? 0)} sub={`P0: ${data?.priority_distribution?.P0 ?? 0} | P1: ${data?.priority_distribution?.P1 ?? 0}`} icon={<AlertTriangle className="h-6 w-6" />} accent="red" />
        <StatCard label="負面信號比例" value={data ? `${data.negative_ratio ?? 0}%` : "0%"} sub={`總信號: ${data?.total_mentions ?? 0} 筆`} icon={<MessageSquare className="h-6 w-6" />} accent="amber" />
        <StatCard label="昨晚處理事件" value={data?.unresolved_count ?? 0} sub={`P2: ${data?.priority_distribution?.P2 ?? 0} | P3: ${data?.priority_distribution?.P3 ?? 0}`} icon={<AlertTriangle className="h-6 w-6" />} accent="brand" />
      </div>

      {/* Row 3: Root Cause Ranking + Risk Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RootCauseChart data={data?.root_cause_ranking || {}} />
        <SentimentTrend data={data?.trend || []} />
      </div>

      {/* Row 4: Platform + Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformChart data={data?.platform_breakdown || {}} />
        <KeywordRanking data={data?.keyword_breakdown || {}} />
      </div>

      {/* Row 5: AI Suggested Actions */}
      {data?.suggested_actions && data.suggested_actions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />AI 今日建議行動
          </h3>
          <div className="space-y-2">
            {data.suggested_actions.map((a, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-3 border border-amber-100">
                <PriorityBadge priority={a.priority} compact />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 6: High Risk Events + Latest Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestMentions mentions={data?.latest_mentions || []} />
        <HighRiskEvents events={data?.high_risk_events || []} />
      </div>
    </div>
  );
}
