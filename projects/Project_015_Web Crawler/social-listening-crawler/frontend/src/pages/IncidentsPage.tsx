import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, User, FileText, CheckCircle2, XCircle, Loader2, Calendar, ExternalLink } from 'lucide-react';
import { get, post } from '../api/client';
import { getExportMentionsCsvUrl } from '../api/imports';
import { StatusBadge, RiskBadge, SentimentBadge, LoadingState, EmptyState, ErrorState } from '../components/common/StatusBadge';

interface Incident {
  id: number; keyword_id: number; platform: string; title: string; content: string; url: string;
  author: string; published_at: string | null; sentiment: string; sentiment_score: number;
  risk_level: string; purchase_intent: boolean; ai_summary: string; ai_suggestion: string;
  status: string; assigned_to: string | null; handled_note: string | null;
  handled_at: string | null; replied_at: string | null; keyword_name?: string;
}

const ASSIGNEES = ['張經理', '李專員', '王組長', '陳分析師'];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await get<Incident[]>('/mentions?risk_level=High&limit=50');
      setIncidents(data);
    } catch { setError('無法載入高風險事件。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (inc: Incident) => {
    setEditingId(inc.id);
    setAssignTo(inc.assigned_to || '');
    setNote(inc.handled_note || '');
    setNewStatus(inc.status || 'new');
  };

  const cancelEdit = () => { setEditingId(null); setAssignTo(''); setNote(''); setNewStatus(''); };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      await post(`/mentions/${id}`, { assigned_to: assignTo || null, handled_note: note || null, status: newStatus });
      setEditingId(null);
      await load();
    } catch { setError('更新失敗。'); }
    finally { setSaving(false); }
  };

  const exportUrl = getExportMentionsCsvUrl({ risk_level: 'High' });

  if (loading) return <LoadingState text="載入高風險事件..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">高風險事件處理</h2>
          <p className="text-gray-500 text-sm mt-0.5">管理與追蹤需立即關注的負面輿情事件</p>
        </div>
        <a href={exportUrl} download className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-xl transition">
          <FileText className="h-4 w-4" />匯出 CSV
        </a>
      </div>

      {incidents.length === 0 ? <EmptyState icon={<CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto" />} text="目前沒有高風險事件，狀況良好" /> : (
        <div className="space-y-4">
          {incidents.map(inc => {
            const isEditing = editingId === inc.id;
            return (
              <div key={inc.id} className={`bg-white rounded-2xl shadow-sm border p-5 transition ${isEditing ? 'border-brand-300 ring-2 ring-brand-50' : 'border-red-100 hover:border-red-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-red-100 p-2 rounded-xl text-red-500 flex-shrink-0 mt-0.5"><AlertTriangle className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md text-xs font-semibold">{inc.platform}</span>
                        {inc.keyword_name && <span className="text-xs text-gray-400">#{inc.keyword_name}</span>}
                        <RiskBadge level={inc.risk_level} />
                        <SentimentBadge sentiment={inc.sentiment} score={inc.sentiment_score} />
                        <StatusBadge status={inc.status} />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{inc.title || '無標題'}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{inc.content}</p>

                      {inc.ai_suggestion && (
                        <div className="mt-3 bg-red-50/50 rounded-xl p-3 border border-red-100">
                          <p className="text-xs text-red-600"><strong>⚠ AI 建議：</strong>{inc.ai_suggestion}</p>
                        </div>
                      )}

                      {isEditing && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">指派負責人</label>
                              <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none">
                                <option value="">未指派</option>
                                {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">處理狀態</label>
                              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none">
                                <option value="new">新事件</option>
                                <option value="reviewing">審核中</option>
                                <option value="replied">已回覆</option>
                                <option value="resolved">已結案</option>
                                <option value="ignored">已忽略</option>
                              </select>
                            </div>
                            <div className="flex items-end gap-2">
                              <button onClick={() => saveEdit(inc.id)} disabled={saving}
                                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition disabled:bg-gray-300">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}儲存
                              </button>
                              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">處理備註</label>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="填寫處理進度或備註..."
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{inc.published_at ? new Date(inc.published_at).toLocaleDateString('zh-TW') : '-'}</span>
                          {inc.assigned_to && <span className="flex items-center gap-1"><User className="h-3 w-3" />{inc.assigned_to}</span>}
                          {inc.handled_note && <span className="text-gray-500 truncate max-w-[200px]">備註: {inc.handled_note}</span>}
                          {inc.handled_at && <span>結案: {new Date(inc.handled_at).toLocaleDateString('zh-TW')}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(inc)}
                        className="bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        處理
                      </button>
                      {inc.url && <a href={inc.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-brand-600 text-xs flex items-center gap-1"><ExternalLink className="h-3 w-3" /></a>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
