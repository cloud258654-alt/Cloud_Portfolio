import { useState, useEffect } from 'react';
import { api } from '../utils/api';

import { useToast } from '../components/Layout';

function ReportCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, []);

  const fetchData = async () => {
    try {
      const result = await api.getReports();
      setData(result);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const result = await api.getEventLogs();
      setEvents(result);
    } catch (err) {
      showToast('載入事件紀錄失敗', 'error');
    } finally {
      setEventsLoading(false);
    }
  };

  if (dataLoading && eventsLoading) return <div className="text-center py-12 text-gray-500">載入中...</div>;
  if (!data) return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">載入失敗，請重新整理</p>
      <button
        onClick={fetchData}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        重新整理
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard title="今日營收" value={`$${data.todayRevenue}`} color="text-green-600" />
        <ReportCard title="本月營收" value={`$${data.monthRevenue}`} color="text-blue-600" />
        <ReportCard title="今日車流量" value={data.todayEntries} color="text-purple-600" />
        <ReportCard title="本月車流量" value={data.monthEntries} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard title="平均停車時間" value={`${data.avgParkingMinutes} 分鐘`} color="text-teal-600" />
        <ReportCard title="最常出現車牌" value={data.mostFrequentPlate} color="text-indigo-600" />
        <ReportCard title="付款方式數" value={`${data.paymentStats.length} 種`} color="text-gray-600" />
      </div>

      {data.paymentStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">付款方式統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.paymentStats.map((stat) => (
              <div key={stat.method} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 capitalize">
                  {stat.method === 'cash' ? '現金' :
                   stat.method === 'credit_card' ? '信用卡' :
                   stat.method === 'line_pay' ? 'LINE Pay' :
                   stat.method === 'easycard' ? '悠遊卡' : stat.method}
                </p>
                <p className="text-lg font-bold text-gray-800">{stat.count} 筆</p>
                <p className="text-sm text-green-600">${stat.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">異常事件紀錄</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">車牌</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(event.createdAt).toLocaleString('zh-TW')}
                  </td>
                  <td className="px-4 py-3 font-medium">{event.plateNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.description}</td>
                  <td className="px-4 py-3 text-sm">{event.operator || '-'}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    尚無異常事件紀錄
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
