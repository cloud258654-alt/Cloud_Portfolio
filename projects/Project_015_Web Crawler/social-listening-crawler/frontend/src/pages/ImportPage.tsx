import { useState, useRef, type DragEvent } from 'react';
import { Upload, FileText, Loader2, Download, AlertCircle, CheckCircle2, Paperclip, X } from 'lucide-react';
import { triggerImportMentions, triggerImportGoogleReviews } from '../api/imports';

type Mode = 'upload' | 'path';

export default function ImportPage() {
  const [mode, setMode] = useState<Mode>('upload');
  const [filePath, setFilePath] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'mentions' | 'google-reviews'>('mentions');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith('.csv')) setSelectedFile(f);
    else setError('請上傳 .csv 檔案');
  };

  const handleImport = async () => {
    if (mode === 'upload' && !selectedFile) { setError('請選擇 CSV 檔案。'); return; }
    if (mode === 'path' && !filePath.trim()) { setError('請輸入 CSV 檔案路徑。'); return; }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const fn = importType === 'google-reviews' ? triggerImportGoogleReviews : triggerImportMentions;
      const data = mode === 'upload' && selectedFile ? selectedFile : filePath.trim();
      const res = await fn(data) as Record<string, unknown>;
      setResult(res);
    } catch (e) {
      setError(`匯入失敗: ${String(e)}`);
    } finally { setLoading(false); }
  };

  const sampleCsv = importType === 'mentions'
    ? 'platform,keyword,title,content,url,author,published_at,sentiment\n小紅書 Import,品牌,推薦！,超好用！,https://...,user123,2026-06-01,Positive'
    : 'store_name,rating,review_text,author,published_at\n鼎泰豐,5,服務超好！,張小明,2026-06-01';

  const handleDownloadSample = () => {
    const blob = new Blob(['\uFEFF' + sampleCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `sample_${importType}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">CSV 匯入</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        <strong>合規提醒：</strong> Facebook、TikTok、小紅書、Threads、Google Maps 等平台僅透過 CSV 合規匯入，不進行直接平台掃描。
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setImportType('mentions')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${importType === 'mentions' ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            風險訊號 CSV
          </button>
          <button onClick={() => setImportType('google-reviews')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${importType === 'google-reviews' ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Google Maps 評論 CSV
          </button>
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 ml-auto">
            <button onClick={() => setMode('upload')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'upload' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              上傳檔案
            </button>
            <button onClick={() => setMode('path')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'path' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              伺服器路徑
            </button>
          </div>
        </div>

        {mode === 'upload' ? (
          <div className="space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                dragOver ? 'border-brand-400 bg-brand-50' : selectedFile ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 hover:border-brand-300 bg-gray-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              {selectedFile ? (
                <div className="space-y-2">
                  <Paperclip className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <button onClick={e => { e.stopPropagation(); clearFile(); }} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                    <X className="h-3 w-3" /> 移除
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-500">拖曳 CSV 檔案至此，或點擊選取</p>
                  <p className="text-xs text-gray-400">支援 .csv 格式，編碼 UTF-8</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">伺服器檔案路徑</label>
            <input type="text" value={filePath} onChange={e => setFilePath(e.target.value)}
              placeholder="sample_data/mentions_sample.csv"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none" />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleImport} disabled={loading || (mode === 'upload' ? !selectedFile : !filePath.trim())}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            執行匯入
          </button>
          <button onClick={handleDownloadSample}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl transition">
            <Download className="h-4 w-4" />下載 CSV 範例
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <FileText className="h-4 w-4" />格式範例 ({importType === 'mentions' ? 'mentions' : 'google-reviews'}.csv)
          </h4>
          <pre className="text-xs text-gray-500 bg-white rounded-lg p-3 overflow-x-auto border border-gray-200 font-mono">{sampleCsv}</pre>
        </div>

        {result && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-5 w-5" />匯入完成
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-800">{result.total_rows as number ?? 0}</div>
                <div className="text-xs text-gray-400">總筆數</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{result.imported as number ?? 0}</div>
                <div className="text-xs text-gray-400">匯入成功</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{result.skipped as number ?? 0}</div>
                <div className="text-xs text-gray-400">略過重複</div>
              </div>
            </div>
            {Array.isArray(result.errors) && (result.errors as unknown[]).length > 0 && (
              <div className="mt-2 bg-red-50 rounded-xl p-3 text-xs text-red-600 max-h-40 overflow-y-auto">
                <div className="font-semibold mb-1">錯誤明細：</div>
                {(result.errors as Array<Record<string, unknown>>).map((e, i) => (
                  <div key={i} className="py-0.5">Row {String(e.row)}: {String(e.reason)}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
