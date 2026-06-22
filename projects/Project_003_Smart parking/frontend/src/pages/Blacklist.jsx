import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

export default function Blacklist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plateNumber: '', reason: '' });
  const showToast = useToast();

  const fetchList = async () => {
    try {
      const data = await api.getBlacklist();
      setList(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBlacklist(form);
      showToast('黑名單新增成功', 'success');
      setShowForm(false);
      setForm({ plateNumber: '', reason: '' });
      fetchList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggle = async (entry) => {
    const newStatus = entry.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateBlacklist(entry.id, { status: newStatus });
      showToast(newStatus === 'active' ? '已啟用' : '已停用', 'success');
      fetchList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此黑名單紀錄？')) return;
    try {
      await api.deleteBlacklist(id);
      showToast('黑名單已刪除', 'success');
      fetchList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">黑名單管理</h3>
          <p className="text-sm text-gray-500 mt-1">黑名單車輛進場時禁止放行，出場時顯示警告</p>
        </div>
        <button
          onClick={() => {
            setForm({ plateNumber: '', reason: '' });
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + 新增黑名單
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h4 className="font-semibold mb-4">新增黑名單車輛</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">車牌號碼 *</label>
              <input
                type="text"
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">列入原因 *</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
              >
                新增
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">車牌</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原因</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">建立時間</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-red-600">{entry.plateNumber}</td>
                  <td className="px-4 py-3 text-sm">{entry.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'active'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.status === 'active' ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString('zh-TW')}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleToggle(entry)}
                      className={`text-sm ${
                        entry.status === 'active' ? 'text-gray-600' : 'text-green-600'
                      } hover:underline`}
                    >
                      {entry.status === 'active' ? '停用' : '啟用'}
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    尚無黑名單資料
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
