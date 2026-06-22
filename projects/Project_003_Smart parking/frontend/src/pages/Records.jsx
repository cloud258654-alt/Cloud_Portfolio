import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    plateNumber: '',
    dateFrom: '',
    dateTo: '',
    paymentStatus: '',
    status: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.plateNumber) params.plateNumber = filters.plateNumber;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.status) params.status = filters.status;

      const data = await api.getRecords(params);
      setRecords(data.records);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      showToast('載入紀錄失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="車牌查詢..."
            value={filters.plateNumber}
            onChange={(e) => handleFilterChange('plateNumber', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">付款狀態</option>
            <option value="unpaid">未付款</option>
            <option value="paid">已付款</option>
            <option value="free">免費</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">出場狀態</option>
            <option value="parked">場內</option>
            <option value="exited">已出場</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">車牌</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">進場時間</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">出場時間</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分鐘</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">費用</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">付款</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.plateNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    {r.vehicleType === 'vip' ? 'VIP' : r.vehicleType === 'monthly' ? '月租' : '臨停'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(r.entryTime).toLocaleString('zh-TW')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.exitTime ? new Date(r.exitTime).toLocaleString('zh-TW') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{r.parkingMinutes || '-'}</td>
                  <td className="px-4 py-3">${r.feeAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      r.paymentStatus === 'free' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.paymentStatus === 'paid' ? '已付' : r.paymentStatus === 'free' ? '免費' : '未付'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.status === 'exited' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {r.status === 'exited' ? '已出場' : '場內'}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    尚無停車紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {total} 筆紀錄</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              上一頁
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
