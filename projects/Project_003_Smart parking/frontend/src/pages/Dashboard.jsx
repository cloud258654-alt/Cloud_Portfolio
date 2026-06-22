import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">載入中...</div>;
  }

  if (!data) return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">載入失敗，請重新整理</p>
      <button
        onClick={() => { setLoading(true); fetchData(); }}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        重新整理
      </button>
    </div>
  );

  const occupancyPercent = Math.round((data.usedSpaces / data.totalSpaces) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="總車位數" value={data.totalSpaces} color="text-blue-600" icon="🅿️" />
        <StatCard title="已使用車位" value={data.usedSpaces} color="text-orange-600" icon="🚗" />
        <StatCard title="剩餘車位" value={data.availableSpaces} color="text-green-600" icon="✅" />
        <StatCard title="今日營收" value={`$${data.todayRevenue}`} color="text-purple-600" icon="💰" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="今日進場" value={data.todayEntries} color="text-blue-600" icon="⬇️" />
        <StatCard title="今日出場" value={data.todayExits} color="text-teal-600" icon="⬆️" />
        <StatCard
          title="使用率"
          value={`${occupancyPercent}%`}
          color={occupancyPercent > 80 ? 'text-red-600' : 'text-green-600'}
          icon="📊"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">目前場內車輛 ({data.parkedVehicles.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">車牌</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">進場時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">當前費用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.parkedVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{v.plateNumber}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.vehicleType === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                      v.vehicleType === 'monthly' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {v.vehicleType === 'vip' ? 'VIP' :
                       v.vehicleType === 'monthly' ? '月租' : '臨停'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(v.entryTime).toLocaleString('zh-TW')}
                  </td>
                  <td className="px-6 py-3">${v.feeAmount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      v.paymentStatus === 'free' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {v.paymentStatus === 'paid' ? '已付款' :
                       v.paymentStatus === 'free' ? '免費' : '未付款'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.parkedVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    目前無場內車輛
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
