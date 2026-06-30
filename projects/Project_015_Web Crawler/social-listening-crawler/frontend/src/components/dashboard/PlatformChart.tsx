import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#4c65ff', '#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

interface PlatformChartProps {
  data: Record<string, number>;
}

export default function PlatformChart({ data }: PlatformChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">平台聲量分布</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">尚無數據</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">平台聲量分布</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
            formatter={(value, name) => [`${value} 筆`, name]}
          />
          <Legend
            iconType="circle"
            formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
