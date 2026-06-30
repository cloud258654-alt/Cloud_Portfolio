import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { get, post } from '../api/client';

const FIELD_META: Record<string, { label: string; hint: string }> = {
  company_name: { label: '公司名稱', hint: '顯示在報告與 Dashboard 頁首' },
  brand_name: { label: '品牌名稱', hint: '主要監測品牌' },
  competitors: { label: '主要競品', hint: '以逗號分隔多個競品' },
  high_risk_keywords: { label: '高風險關鍵字', hint: '觸發這些字詞時自動標記高風險' },
  notification_email: { label: '通知 Email', hint: '高風險事件通知信箱（目前為 Mock）' },
  demo_mode: { label: 'Demo 模式', hint: 'true = 測試模擬模式 / false = 正式模式' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setSettings(await get<Record<string, string>>('/settings')); }
    catch { setError('無法載入設定。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try { await post<{ message: string }>('/settings', { settings }); setSaved(true); }
    catch { setError('儲存失敗。'); }
    finally { setSaving(false); }
  };

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入設定...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系統設定</h2>
          <p className="text-gray-500 text-sm mt-0.5">品牌資料、監測參數與模式設定</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}儲存設定
        </button>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={() => setError('')} className="ml-auto text-red-400">×</button></div>}
      {saved && <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl p-3 border border-emerald-200">設定已儲存</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {Object.entries(FIELD_META).map(([key, meta]) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{meta.label}</label>
            <p className="text-xs text-gray-400 mb-2">{meta.hint}</p>
            {key === 'demo_mode' ? (
              <select value={settings[key] || 'true'} onChange={e => set(key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none">
                <option value="true">Demo 模式</option>
                <option value="false">正式模式</option>
              </select>
            ) : (
              <input type="text" value={settings[key] || ''} onChange={e => set(key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
