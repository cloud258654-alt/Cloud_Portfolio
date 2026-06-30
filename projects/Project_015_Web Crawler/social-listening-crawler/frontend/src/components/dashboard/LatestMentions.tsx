import { ExternalLink, Calendar } from 'lucide-react';
import type { Mention } from '../../types';

interface LatestMentionsProps {
  mentions: Mention[];
}

const platformBadge = (p: string) => {
  const colors: Record<string, string> = {
    PTT: 'bg-blue-50 text-blue-600',
    Dcard: 'bg-purple-50 text-purple-600',
    'Google Search': 'bg-emerald-50 text-emerald-600',
    'Google Map Reviews': 'bg-pink-50 text-pink-600',
    Facebook: 'bg-sky-50 text-sky-600',
  };
  return colors[p] || 'bg-gray-100 text-gray-600';
};

const sentimentBadge = (s: string) => {
  const colors: Record<string, string> = {
    Positive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Neutral: 'bg-gray-100 text-gray-500 border-gray-200',
    Negative: 'bg-red-50 text-red-500 border-red-200',
  };
  return colors[s] || colors.Neutral;
};

export default function LatestMentions({ mentions }: LatestMentionsProps) {
  if (mentions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">最新提及</h3>
        <div className="py-8 text-center text-gray-400 text-sm">尚無提及資料</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">最新提及</h3>
      <div className="space-y-3">
        {mentions.map((m) => (
          <div key={m.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${platformBadge(m.platform)}`}>
                    {m.platform}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sentimentBadge(m.sentiment)}`}>
                    {m.sentiment}
                  </span>
                  {m.keyword_name && (
                    <span className="text-xs text-gray-400">#{m.keyword_name}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1 truncate">{m.title || '無標題'}</p>
                <p className="text-gray-500 text-xs line-clamp-2">{m.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {m.published_at ? new Date(m.published_at).toLocaleDateString('zh-TW') : '-'}
                  </span>
                  {m.author && <span>作者: {m.author}</span>}
                </div>
              </div>
              {m.url && (
                <a href={m.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-brand-600 transition flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
