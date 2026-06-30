import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, SearchX } from 'lucide-react';
import { fetchKeywords, createKeyword, updateKeyword, deleteKeyword } from '../api/keywords';
import type { Keyword } from '../types';

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState(''); const [group, setGroup] = useState(''); const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['PTT', 'Dcard', 'Google Search']);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setKeywords(await fetchKeywords()); } catch { setError('無法載入關鍵字清單。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createKeyword({ name: name.trim(), group_name: group.trim() || undefined, platforms: selectedPlatforms.join(',') });
      setName(''); setGroup('');
      await load();
    } catch { setError('新增失敗，請重試。'); }
    finally { setSubmitting(false); }
  };

  const toggle = async (kw: Keyword) => {
    try { await updateKeyword(kw.id, { name: kw.name, group_name: kw.group_name, platforms: kw.platforms, is_active: !kw.is_active }); await load(); }
    catch { setError('更新失敗。'); }
  };

  const del = async (id: number) => {
    if (!window.confirm('確定要刪除此關鍵字嗎？這將會同步刪除該關鍵字的所有監測輿情資料與執行紀錄，此動作無法復原。')) return;
    try { await deleteKeyword(id); await load(); }
    catch { setError('刪除失敗。'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入中...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">監測品牌設定</h2>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={()=>setError('')} className="ml-auto text-red-400">×</button></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
        <h3 className="text-base font-bold text-gray-800">新增監測關鍵字</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">品牌名稱 *</label>
            <input type="text" placeholder="例如: 鼎泰豐" value={name} onChange={e=>setName(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">分類群組 (選填)</label>
            <input type="text" placeholder="例如: 餐飲" value={group} onChange={e=>setGroup(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={add} disabled={submitting || !name.trim() || selectedPlatforms.length === 0}
              className="w-full flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}新增監測項目
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-xs font-bold text-gray-500 mb-2">監測平台設定 *</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['PTT', 'Dcard', 'Google Search', 'Google Maps', 'Facebook', 'Threads', 'TikTok', '小紅書'].map(platform => {
              const isChecked = selectedPlatforms.includes(platform);
              return (
                <label key={platform} className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-gray-700 select-none">
                  <input type="checkbox" checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, platform]);
                      }
                    }}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4" />
                  {platform}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
            <th className="px-6 py-3">ID</th><th className="px-6 py-3">關鍵字</th><th className="px-6 py-3">群組</th><th className="px-6 py-3">平台</th><th className="px-6 py-3">狀態</th><th className="px-6 py-3">日期</th><th className="px-6 py-3 text-right">操作</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {keywords.map(kw => (
              <tr key={kw.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3.5 font-mono text-xs text-gray-400">#{kw.id}</td>
                <td className="px-6 py-3.5 font-semibold text-gray-800">{kw.name}</td>
                <td className="px-6 py-3.5 text-xs text-gray-500">{kw.group_name||'-'}</td>
                <td className="px-6 py-3.5 text-xs text-gray-400">{kw.platforms}</td>
                <td className="px-6 py-3.5"><button onClick={()=>toggle(kw)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${kw.is_active?'bg-emerald-50 text-emerald-600 border-emerald-200':'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${kw.is_active?'bg-emerald-500':'bg-gray-400'}`} />{kw.is_active?'啟用':'停用'}
                </button></td>
                <td className="px-6 py-3.5 text-xs text-gray-400">{new Date(kw.created_at).toLocaleDateString('zh-TW')}</td>
                <td className="px-6 py-3.5 text-right"><button onClick={()=>del(kw.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {keywords.length===0&&<tr><td colSpan={7} className="px-6 py-12 text-center"><SearchX className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">尚無關鍵字，請新增監測項目</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
