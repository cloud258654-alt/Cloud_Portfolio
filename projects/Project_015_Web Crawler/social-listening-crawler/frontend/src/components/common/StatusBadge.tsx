import { Loader2 } from 'lucide-react';

export function LoadingState({ text = '載入中...' }: { text?: string }) {
  return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />{text}</div>;
}

export function EmptyState({ icon, text = '尚無資料' }: { icon?: React.ReactNode; text?: string }) {
  return <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">{icon}<p className="text-gray-400 text-sm mt-3">{text}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-3 text-red-500">!</div>
      <p className="text-gray-600 text-sm mb-3">{message}</p>
      {onRetry && <button onClick={onRetry} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-700 transition">重試</button>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600 border-blue-200',
  reviewing: 'bg-amber-50 text-amber-600 border-amber-200',
  replied: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  resolved: 'bg-green-50 text-green-600 border-green-200',
  ignored: 'bg-gray-100 text-gray-500 border-gray-200',
  Success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Failed: 'bg-red-50 text-red-500 border-red-200',
  Running: 'bg-blue-50 text-blue-600 border-blue-200',
};

const STATUS_LABELS: Record<string, string> = {
  new: '新事件', reviewing: '審核中', replied: '已回覆', resolved: '已結案', ignored: '已忽略',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500 border-gray-200';
  const label = STATUS_LABELS[status] || status;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${style}`}>{label}</span>;
}

const RISK_COLORS: Record<string, string> = {
  High: 'bg-red-50 text-red-500 border-red-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low: 'bg-gray-100 text-gray-400 border-gray-200',
};

export function RiskBadge({ level }: { level: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${RISK_COLORS[level] || RISK_COLORS.Low}`}>風險: {level}</span>;
}

const SENT_STYLES: Record<string, string> = {
  Positive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Neutral: 'bg-gray-100 text-gray-500 border-gray-200',
  Negative: 'bg-red-50 text-red-500 border-red-200',
};

export function SentimentBadge({ sentiment, score }: { sentiment: string; score?: number }) {
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${SENT_STYLES[sentiment] || SENT_STYLES.Neutral}`}>{sentiment}{score != null ? ` (${score > 0 ? '+' : ''}${score})` : ''}</span>;
}
