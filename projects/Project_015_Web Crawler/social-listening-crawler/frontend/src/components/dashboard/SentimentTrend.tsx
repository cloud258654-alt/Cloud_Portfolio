import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface TrendItem {
  date: string;
  count: number;
}

interface SentimentTrendProps {
  data: TrendItem[];
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export default function SentimentTrend({ data }: SentimentTrendProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">7 日聲量趨勢</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">尚無數據</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">7 日聲量趨勢</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={formatDate} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value) => { const v = value as number; return [`${v} 筆`, '聲量']; }}
          />
          <Line type="monotone" dataKey="count" stroke="#4c65ff" strokeWidth={2.5} dot={{ fill: '#4c65ff', r: 4 }} activeDot={{ r: 6, fill: '#4c65ff' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
