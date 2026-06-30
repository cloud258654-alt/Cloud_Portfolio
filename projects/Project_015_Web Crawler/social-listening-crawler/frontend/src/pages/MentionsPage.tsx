import { useState, useEffect, useCallback } from 'react';
import { Filter, ExternalLink, Calendar, Volume2, Download, Loader2, RefreshCw, SearchX, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMentions } from '../api/mentions';
import { fetchKeywords } from '../api/keywords';
import { getExportMentionsCsvUrl, reanalyzeMention } from '../api/imports';
import type { Mention, Keyword } from '../types';

const PAGE_SIZE = 20;

export default function MentionsPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [reanalyzeId, setReanalyzeId] = useState<number | null>(null);

  const [platform, setPlatform] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [keywordId, setKeywordId] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, skip: page * PAGE_SIZE };
      if (platform) params.platform = platform;
      if (sentiment) params.sentiment = sentiment;
      if (riskLevel) params.risk_level = riskLevel;
      if (keywordId) params.keyword_id = Number(keywordId);
      if (search) params.search = search;
      const data = await fetchMentions(params as Parameters<typeof fetchMentions>[0]);
      setMentions(data);
      setTotal(data.length >= PAGE_SIZE ? (page + 2) * PAGE_SIZE : (page * PAGE_SIZE + data.length));
    } catch { setError('無法載入聲量資料。'); setMentions([]); }
    finally { setLoading(false); }
  }, [platform, sentiment, riskLevel, keywordId, search, page]);

  useEffect(() => { fetchKeywords().then(setKeywords).catch(() => {}); load(); }, [load]);

  const doReanalyze = async (id: number) => {
    setReanalyzeId(id);
    try { await reanalyzeMention(id); await load(); } catch { setError('重新分析失敗。'); }
    finally { setReanalyzeId(null); }
  };

  const exportUrl = getExportMentionsCsvUrl(Object.fromEntries(Object.entries({ platform, sentiment, risk_level: riskLevel, keyword_id: keywordId, search }).filter(([,v]) => v)));

  const sentColors: Record<string, string> = { Positive: 'bg-emerald-50 text-emerald-600 border-emerald-200', Neutral: 'bg-gray-100 text-gray-500 border-gray-200', Negative: 'bg-red-50 text-red-500 border-red-200' };
  const sel = "bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">聲量資料</h2>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={()=>setError('')} className="ml-auto text-red-400">×</button></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <input type="text" placeholder="搜尋標題或內容..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none w-48" />
          <select value={platform} onChange={e=>{setPlatform(e.target.value);setPage(0);}} className={sel}>
            <option value="">全部平台</option><option value="PTT">PTT</option><option value="Dcard">Dcard</option>
            <option value="Google Search">Google Search</option><option value="Google Maps">Google Maps</option>
            <option value="Facebook Import">Facebook</option><option value="TikTok Import">TikTok</option>
            <option value="小紅書 Import">小紅書</option><option value="Threads Import">Threads</option>
          </select>
          <select value={sentiment} onChange={e=>{setSentiment(e.target.value);setPage(0);}} className={sel}>
            <option value="">全部情緒</option><option value="Positive">正面</option><option value="Neutral">中立</option><option value="Negative">負面</option>
          </select>
          <select value={riskLevel} onChange={e=>{setRiskLevel(e.target.value);setPage(0);}} className={sel}>
            <option value="">全部風險</option><option value="Low">低</option><option value="Medium">中</option><option value="High">高</option>
          </select>
          <select value={keywordId} onChange={e=>{setKeywordId(e.target.value);setPage(0);}} className={sel}>
            <option value="">全部關鍵字</option>
            {keywords.map(k=><option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
          <a href={exportUrl} download className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-xl transition ml-auto">
            <Download className="h-4 w-4" />匯出 CSV
          </a>
        </div>
      </div>

      <div className="text-sm text-gray-400">共 {total} 筆</div>

      {loading && <div className="flex items-center justify-center h-32 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />載入中...</div>}

      {!loading && mentions.length===0 && !error && <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><SearchX className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">沒有符合條件的資料</p></div>}

      <div className="space-y-4">
        {mentions.map(m => (
          <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md text-xs font-semibold">{m.platform}</span>
                  {m.keyword_name && <span className="text-gray-400 text-xs">#{m.keyword_name}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${m.risk_level==='High'?'bg-red-50 text-red-500 border-red-200':m.risk_level==='Medium'?'bg-amber-50 text-amber-600 border-amber-200':'bg-gray-100 text-gray-400 border-gray-200'}`}>風險: {m.risk_level}</span>
                  {m.purchase_intent && <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">購買意圖</span>}
                </div>
                <h4 className="text-base font-bold text-gray-800">{m.title || '無標題'}</h4>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex-shrink-0 ${sentColors[m.sentiment]||sentColors.Neutral}`}>{m.sentiment} ({(m.sentiment_score??0)>0?'+':''}{m.sentiment_score??0})</span>
            </div>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-3">{m.content}</p>
            {m.ai_summary && (
              <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
                <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-brand-600 text-xs font-bold"><Volume2 className="h-3.5 w-3.5" />AI 洞察</span>
                  <button onClick={()=>doReanalyze(m.id)} disabled={reanalyzeId===m.id} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    {reanalyzeId===m.id?<Loader2 className="h-3 w-3 animate-spin"/>:<RefreshCw className="h-3 w-3"/>}重新分析
                  </button>
                </div>
                <p className="text-xs text-gray-600"><strong>摘要：</strong>{m.ai_summary}</p>
                {m.ai_suggestion && <p className="text-xs text-gray-600"><strong>建議：</strong>{m.ai_suggestion}</p>}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 mt-3 pt-3 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                {m.author && <span>作者: {m.author}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{m.published_at?new Date(m.published_at).toLocaleDateString('zh-TW'):'-'}</span>
              </div>
              {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-brand-600 font-semibold flex items-center gap-1">原始文章 <ExternalLink className="h-3 w-3" /></a>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />上一頁</button>
        <span className="text-sm text-gray-400">第 {page+1} 頁</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={mentions.length<PAGE_SIZE} className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">下一頁<ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
