import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Props { data: Record<string, number>; }

const COLORS: Record<string, string> = {
  "排隊等待": "#f59e0b",
  "停車便利": "#8b5cf6",
  "服務態度": "#ef4444",
  "餐點品質": "#10b981",
  "價格": "#06b6d4",
  "環境整潔": "#ec4899",
  "衛生疑慮": "#dc2626",
  "份量": "#6366f1",
};

export default function RootCauseChart({ data }: Props) {
  const chartData = Object.entries(data)
    .map(([name, count]) => ({ name, count, fill: COLORS[name] || '#94a3b8' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">負評根因排行</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">尚無數據</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">負評根因排行</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            formatter={(value) => { const v = value as number; return [`${v} 筆`, '發生次數']; }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
