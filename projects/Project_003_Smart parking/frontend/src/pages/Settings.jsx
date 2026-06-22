import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ lotName: '', totalSpaces: 100 });
  const showToast = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setForm({ lotName: data.lotName, totalSpaces: data.totalSpaces });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(form);
      showToast('系統設定已更新', 'success');
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">載入中...</div>;
  if (!settings) return <div className="text-center py-12 text-gray-500">載入失敗，請重新整理</div>;

  const availableSpaces = settings.totalSpaces - settings.usedSpaces;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">系統設定</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">停車場名稱</label>
            <input
              type="text"
              value={form.lotName}
              onChange={(e) => setForm({ ...form, lotName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">總車位數</label>
            <input
              type="number"
              value={form.totalSpaces}
              onChange={(e) => setForm({ ...form, totalSpaces: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              min={settings.usedSpaces}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition"
          >
            儲存設定
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">目前車位狀態</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">總車位</p>
            <p className="text-xl font-bold text-blue-600">{settings.totalSpaces}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">已使用</p>
            <p className="text-xl font-bold text-orange-600">{settings.usedSpaces}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">剩餘</p>
            <p className="text-xl font-bold text-green-600">{availableSpaces}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
