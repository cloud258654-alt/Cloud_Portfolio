import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BrandHealth } from '../../types';

interface Props { data: BrandHealth | null; }

export default function BrandHealthCard({ data }: Props) {
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">品牌健康分數</h3>
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">載入中...</div>
      </div>
    );
  }

  const { brand_health_score, previous_score, score_change, summary, positive_ratio, negative_ratio } = data;

  const scoreColor =
    brand_health_score >= 80 ? 'text-emerald-600' :
    brand_health_score >= 50 ? 'text-amber-600' :
    'text-red-600';

  const bgColor =
    brand_health_score >= 80 ? 'bg-emerald-50' :
    brand_health_score >= 50 ? 'bg-amber-50' :
    'bg-red-50';

  const ringColor =
    brand_health_score >= 80 ? 'ring-emerald-500' :
    brand_health_score >= 50 ? 'ring-amber-500' :
    'ring-red-500';

  const TrendIcon = score_change > 0 ? TrendingUp : score_change < 0 ? TrendingDown : Minus;
  const trendColor = score_change > 0 ? 'text-emerald-500' : score_change < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-rose-500" />
        <h3 className="text-base font-bold text-gray-800">品牌健康分數</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className={`w-28 h-28 rounded-full ${bgColor} ring-4 ${ringColor} flex flex-col items-center justify-center flex-shrink-0`}>
          <span className={`text-4xl font-extrabold ${scoreColor}`}>{brand_health_score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">昨日 {previous_score}</span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {score_change > 0 ? '+' : ''}{score_change}
            </span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>正面 {positive_ratio}%</span>
            <span className="text-red-400">負面 {negative_ratio}%</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{summary}</p>
        </div>
      </div>
    </div>
  );
}
