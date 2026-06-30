import { Filter, RefreshCw, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Opt { label: string; value: string; }
interface FilterBarProps {
  platformFilter: string; sentimentFilter: string; keywordFilter: string;
  onPlatformChange: (v: string) => void; onSentimentChange: (v: string) => void; onKeywordChange: (v: string) => void;
  onRefresh: () => void; loading?: boolean; platforms: Opt[]; keywords: Opt[];
  extraAction?: ReactNode;
}

export default function FilterBar(p: FilterBarProps) {
  const sel = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm">
        <Filter className="h-4 w-4 text-gray-400" /><span className="text-gray-400 text-xs">平台</span>
        <select value={p.platformFilter} onChange={e => p.onPlatformChange(e.target.value)} className={sel}>
          <option value="all">全部</option>
          {p.platforms.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm">
        <Filter className="h-4 w-4 text-gray-400" /><span className="text-gray-400 text-xs">情緒</span>
        <select value={p.sentimentFilter} onChange={e => p.onSentimentChange(e.target.value)} className={sel}>
          <option value="all">全部</option>
          <option value="Positive">正面</option><option value="Neutral">中立</option><option value="Negative">負面</option>
        </select>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm">
        <Filter className="h-4 w-4 text-gray-400" /><span className="text-gray-400 text-xs">關鍵字</span>
        <select value={p.keywordFilter} onChange={e => p.onKeywordChange(e.target.value)} className={sel}>
          <option value="all">全部</option>
          {p.keywords.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </div>
      <button onClick={p.onRefresh} disabled={p.loading}
        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
        {p.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}重新整理
      </button>
      {p.extraAction}
    </div>
  );
}
