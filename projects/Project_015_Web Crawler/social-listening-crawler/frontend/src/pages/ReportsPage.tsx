import { useState, useEffect, useCallback } from 'react';
import { FileText, Copy, Download, Loader2, AlertCircle } from 'lucide-react';
import { get } from '../api/client';

function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let tableHeaders: string[] | null = null;
  let tableRows: string[][] = [];

  const closeListIfOpen = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  const closeTableIfOpen = () => {
    if (inTable) {
      html += '<div class="overflow-x-auto my-4 border border-gray-100 rounded-xl shadow-sm"><table class="min-w-full divide-y divide-gray-200">';
      if (tableHeaders) {
        html += '<thead class="bg-gray-50"><tr>';
        tableHeaders.forEach(cell => {
          html += `<th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${cell}</th>`;
        });
        html += '</tr></thead>';
      }
      html += '<tbody class="bg-white divide-y divide-gray-100">';
      tableRows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td class="px-4 py-2.5 text-sm text-gray-700 font-medium">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      
      inTable = false;
      tableHeaders = null;
      tableRows = [];
    }
  };

  const formatInline = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      closeListIfOpen();
      closeTableIfOpen();
      continue;
    }

    if (line.startsWith('# ')) {
      closeListIfOpen();
      closeTableIfOpen();
      html += `<h1 class="text-xl font-bold mt-6 mb-4 text-gray-900">${formatInline(line.substring(2))}</h1>`;
      continue;
    }

    if (line.startsWith('## ')) {
      closeListIfOpen();
      closeTableIfOpen();
      html += `<h2 class="text-lg font-bold mt-5 mb-3 text-gray-800">${formatInline(line.substring(3))}</h2>`;
      continue;
    }

    if (line.startsWith('### ')) {
      closeListIfOpen();
      closeTableIfOpen();
      html += `<h3 class="text-base font-bold mt-4 mb-2 text-rose-600">${formatInline(line.substring(4))}</h3>`;
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      closeTableIfOpen();
      if (!inList) {
        html += '<ul class="list-disc list-inside ml-4 space-y-1 my-3">';
        inList = true;
      }
      html += `<li class="text-sm text-gray-600">${formatInline(line.substring(2))}</li>`;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      closeListIfOpen();
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      const isSeparator = cells.every(c => c.startsWith('-') || c === '');
      if (isSeparator) {
        inTable = true;
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeaders = cells.map(c => formatInline(c));
      } else {
        tableRows.push(cells.map(c => formatInline(c)));
      }
      continue;
    }

    // Default paragraph
    closeListIfOpen();
    closeTableIfOpen();
    html += `<p class="text-sm text-gray-600 my-2 leading-relaxed">${formatInline(line)}</p>`;
  }

  closeListIfOpen();
  closeTableIfOpen();
  return html;
}

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
          <h2 className="text-2xl font-bold text-gray-900">每日商譽智慧報告</h2>
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
            __html: parseMarkdownToHtml(report.markdown)
          }} />
        </div>
      )}
    </div>
  );
}
