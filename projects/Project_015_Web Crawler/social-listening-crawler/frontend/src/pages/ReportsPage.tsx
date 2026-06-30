import { useState, useEffect, useCallback } from 'react';
import { FileText, Copy, Download, Loader2, AlertCircle } from 'lucide-react';
import { get } from '../api/client';

export default function ReportsPage() {
  const [report, setReport] = useState<{ date: string; markdown: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await get<{ date: string; total_mentions: number; negative_count: number; high_risk_count: number; markdown: string }>('/reports/daily');
      setReport(data);
    } catch { setError('無法產生報告。'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `daily_report_${report.date}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" />產生報告中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">每日輿情報告</h2>
          <p className="text-gray-500 text-sm mt-0.5">{report?.date ? `${report.date} 自動生成報告` : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={copyReport} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-xl transition">
            <Copy className="h-4 w-4" />{copied ? '已複製' : '複製報告'}
          </button>
          <button onClick={downloadReport} className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">
            <Download className="h-4 w-4" />匯出 .md
          </button>
          <button onClick={load} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition">
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200"><AlertCircle className="h-4 w-4" />{error}<button onClick={() => setError('')} className="ml-auto text-red-400">×</button></div>}

      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-800 prose-table:border-collapse" dangerouslySetInnerHTML={{
            __html: report.markdown
              .replace(/^# /gm, '<h1 class="text-xl font-bold mb-4">')
              .replace(/^## /gm, '<h2 class="text-lg font-bold mt-6 mb-3">')
              .replace(/^### /gm, '<h3 class="text-base font-bold mt-4 mb-2 text-red-600">')
              .replace(/^\|(.+)\|$/gm, (match) => {
                if (match.includes('---')) return '';
                const cells = match.split('|').filter(c => c.trim());
                const tag = match.includes('---') ? '' : 'td';
                return '<tr>' + cells.map(c => `<${tag} class="border border-gray-200 px-3 py-2 text-sm">${c.trim()}</${tag}>`).join('') + '</tr>';
              })
              .replace(/^- /gm, '<li class="text-sm text-gray-600 ml-4">• ')
              .replace(/^\*\*(.+)\*\*/gm, '<strong>$1</strong>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br/>')
          }} />
        </div>
      )}
    </div>
  );
}
