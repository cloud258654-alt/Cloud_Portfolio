import { AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import type { Mention } from '../../types';

interface HighRiskEventsProps {
  events: Mention[];
}

export default function HighRiskEvents({ events }: HighRiskEventsProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">高風險商譽事件</h3>
          <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">無風險事件</span>
        </div>
        <div className="py-8 text-center text-gray-400 text-sm">目前沒有高風險商譽事件</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">高風險商譽事件</h3>
        <span className="bg-red-50 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100">
          需立即處置
        </span>
      </div>
      <div className="space-y-3">
        {events.map((m) => (
          <div key={m.id} className="border border-red-100 bg-red-50/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg text-red-500 flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.recommended_priority === 'P0' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>{m.recommended_priority}</span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">風險分數 {m.risk_score}</span>
                    <span className="font-semibold text-gray-800 text-sm truncate max-w-[160px]">{m.title || '無標題'}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {m.published_at ? new Date(m.published_at).toLocaleDateString('zh-TW') : '-'}
                  </span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{m.content}</p>
                {m.url && <p className="text-[9px] text-brand-600 truncate mt-1 max-w-[300px]">{m.url}</p>}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{m.platform}</span>
                    {m.keyword_name && <span>標的: {m.keyword_name}</span>}
                    {m.author && <span>作者: {m.author}</span>}
                  </div>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 text-xs font-medium flex items-center gap-1">
                      查看原文
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
