import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

export default function Rates() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    freeMinutes: 30,
    hourlyRate: 40,
    dailyMaxFee: 300,
    exitGraceMinutes: 15,
  });
  const showToast = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getRateSettings();
      setSettings(data);
      setForm({
        freeMinutes: data.freeMinutes,
        hourlyRate: data.hourlyRate,
        dailyMaxFee: data.dailyMaxFee,
        exitGraceMinutes: data.exitGraceMinutes,
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateRateSettings(form);
      showToast('費率設定已更新', 'success');
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">載入中...</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">費率設定</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              免費分鐘數
              <span className="text-xs text-gray-400 ml-2">停車前 N 分鐘免費</span>
            </label>
            <input
              type="number"
              value={form.freeMinutes}
              onChange={(e) => setForm({ ...form, freeMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每小時費率（元）
              <span className="text-xs text-gray-400 ml-2">未滿 1 小時以 1 小時計</span>
            </label>
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每日最高收費（元）
              <span className="text-xs text-gray-400 ml-2">單日上限</span>
            </label>
            <input
              type="number"
              value={form.dailyMaxFee}
              onChange={(e) => setForm({ ...form, dailyMaxFee: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出場寬限時間（分鐘）
              <span className="text-xs text-gray-400 ml-2">付款後的緩衝時間</span>
            </label>
            <input
              type="number"
              value={form.exitGraceMinutes}
              onChange={(e) => setForm({ ...form, exitGraceMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
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

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">計費規則範例：</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>前 {form.freeMinutes} 分鐘：免費</li>
          <li>{form.freeMinutes} 分鐘後：每小時 ${form.hourlyRate} 元</li>
          <li>每日最高：${form.dailyMaxFee} 元</li>
          <li>出場寬限：{form.exitGraceMinutes} 分鐘</li>
          <li>月租車（有效期內）：免費</li>
          <li>VIP 車輛：免費</li>
        </ul>
      </div>
    </div>
  );
}
