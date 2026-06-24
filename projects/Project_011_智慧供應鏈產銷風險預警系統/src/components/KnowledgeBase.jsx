import React, { useState } from 'react';
import { 
  FileText, Folder, FolderOpen, Search, Clock, 
  Layers, ChevronRight, BookOpen, Sparkles
} from 'lucide-react';
import { ragDocuments } from '../data/mockData.js';

function KnowledgeBase() {
  const [selectedDoc, setSelectedDoc] = useState(ragDocuments[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Folder open/closed states
  const [folders, setFolders] = useState({
    SOP: true,
    Contract: true
  });

  const toggleFolder = (folderName) => {
    setFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const filteredDocs = searchTerm.trim() === ''
    ? ragDocuments
    : ragDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Group documents by category for folder view
  const sopDocs = filteredDocs.filter(d => d.category === 'SOP');
  const contractDocs = filteredDocs.filter(d => d.category === 'Contract');

  // Highlight specific retrieved chunks in the document viewer
  const renderHighlightedContent = (doc) => {
    // For visual simulation, we wrap specific target sentences in a highlighted div
    if (doc.id === 'doc-02') {
      return (
        <div className="kb-document">
          <h1>{doc.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>更新時間：{doc.lastUpdated} | 文件類別：框架合約</p>
          
          <h2>第四條：交期與延遲交貨罰則</h2>
          <p>4.1 賣方應嚴格按照雙方確認的採購訂單（PO）所規定的交期送達買方指定倉庫。</p>
          <p>4.2 若賣方因自身原因導致交期延遲，買方應給予5個工作天之寬限期。</p>
          
          <div className="rag-highlight">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '4px', textTransform: 'uppercase' }}>
              <Sparkles size={12} /> RAG 向量检索匹配區塊 (相似度: 96%)
            </span>
            <strong>4.3 超過寬限期後，賣方應每日向買方支付相當於延遲貨物總金額 1.5% 的違約金（Penalty）。</strong><br />
            <strong>4.4 此延遲交貨違約金總額上限為該批貨物總金額的 15%。買方有權直接從未結清之應付帳款中扣除此筆罰款。</strong>
          </div>
          
          <h2>第五條：最小起訂量 (MOQ) 與付款條件</h2>
          <p>5.1 關鍵微控制器（MCU）系列之最小起訂量（MOQ）為 1,000 PCS。</p>
          <p>5.2 付款條件為出貨後 60 天電匯（T/T 60 days after invoice date）。</p>
        </div>
      );
    } else if (doc.id === 'doc-03') {
      return (
        <div className="kb-document">
          <h1>{doc.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>更新時間：{doc.lastUpdated} | 文件類別：供應商合約</p>
          
          <h2>第三條：產品供應與替代保障</h2>
          <p>3.1 賣方保證其生產之 GD32 系列微控制器在電氣特性與接腳定義上，與市場主流之 STM32 系列高度相容，並提供 Pin-to-Pin 替換技術支援。</p>
          
          <div className="rag-highlight">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '4px', textTransform: 'uppercase' }}>
              <Sparkles size={12} /> RAG 向量檢索匹配區塊 (相似度: 94%)
            </span>
            <strong>3.2 賣方承諾為買方保留每月不低於 5,000 PCS 的緊急備用產能，在買方發出訂單後 7 個工作日內安排出貨（適用於急單處理）。</strong>
          </div>
          
          <h2>付款與價格協議</h2>
          <ul>
            <li>GD32F103C8T6 特約協議單價為 USD 2.20 （未稅）。</li>
            <li>付款條件為 T/T 30 days。</li>
          </ul>
        </div>
      );
    } else if (doc.id === 'doc-04') {
      return (
        <div className="kb-document">
          <h1>{doc.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>更新時間：{doc.lastUpdated} | 文件類別：作業規範 SOP</p>
          
          <h2>1. 呆滯料定義</h2>
          <p>庫存物料符合下列條件之一者，定義為呆滯物料（Dead Stock）：</p>
          <ul>
            <li>庫齡（Inventory Aging）在 90 天至 180 天之內，且最近90天內無任何領用或出庫記錄。</li>
            <li>庫齡在 180 天以上，且最近180天內無任何異動。</li>
          </ul>
          
          <h2>2. 處置流程與層級</h2>
          <p>倉庫與物管部門每月應產出呆滯料報表，並由 AI 呆滯料 Agent 提供處置建議：</p>
          
          <div className="rag-highlight">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '4px', textTransform: 'uppercase' }}>
              <Sparkles size={12} /> RAG 向量检索匹配區塊 (相似度: 92%)
            </span>
            <strong>1. 內部轉用（Transfer）：優先比對研發部新專案，將閒置晶片或被動元件轉移至其他機種使用。</strong><br />
            <strong>2. 原廠/代理商退回（Return）：購貨在90天內且包裝完好，可與代理商協商折退。</strong><br />
            <strong>3. 折讓轉售（Sale）：超過180天之物料，可折讓 20%-50% 給同業或二級經銷商回收資金。</strong><br />
            <strong>4. 報廢處置（Scrap）：庫齡超過365天、無任何使用機會且已受潮或氧化的物料，經鑑定後作報廢提列。</strong>
          </div>
        </div>
      );
    }

    // Default markdown styling if no custom highlights
    return (
      <div className="kb-document">
        <h1>{doc.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>更新時間：{doc.lastUpdated} | 類別：{doc.category}</p>
        
        {doc.content.split('\n\n').map((paragraph, i) => {
          if (paragraph.startsWith('#')) return null; // title already rendered
          if (paragraph.startsWith('##')) {
            return <h2 key={i}>{paragraph.replace('##', '').trim()}</h2>;
          }
          if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
            return (
              <ul key={i}>
                {paragraph.split('\n').map((li, j) => (
                  <li key={j}>{li.replace(/^[\s-*]+/, '').trim()}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{paragraph}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>RAG 合約與 SOP 知識庫</h1>
          <p className="header-subtitle">Vector Embeddings and Enterprise RAG Knowledge Base</p>
        </div>
      </div>

      <div className="kb-layout">
        {/* Left Column: Explorer Tree */}
        <div className="glass-card kb-tree-card">
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="搜尋合約、SOP與法規..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                fontSize: '0.8rem',
                color: '#fff',
                outline: 'none',
                transition: 'border 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          {/* Directory tree */}
          <div className="kb-tree">
            {/* Folder 1: SOPs */}
            <div className="kb-folder-group">
              <div className="kb-folder-header" onClick={() => toggleFolder('SOP')}>
                <ChevronRight 
                  size={14} 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    transform: folders.SOP ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }} 
                />
                {folders.SOP ? <FolderOpen size={16} style={{ color: '#818cf8' }} /> : <Folder size={16} style={{ color: '#818cf8' }} />}
                <span>標準作業程序 (SOP)</span>
              </div>
              
              {folders.SOP && (
                <div className="kb-folder-content">
                  {sopDocs.map(doc => (
                    <div 
                      key={doc.id}
                      className={`kb-file-item ${selectedDoc.id === doc.id ? 'active' : ''}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <FileText size={14} style={{ opacity: 0.7 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {doc.title.split(': ')[1] || doc.title}
                      </span>
                    </div>
                  ))}
                  {sopDocs.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>無匹配檔案</span>
                  )}
                </div>
              )}
            </div>

            {/* Folder 2: Contracts */}
            <div className="kb-folder-group">
              <div className="kb-folder-header" onClick={() => toggleFolder('Contract')}>
                <ChevronRight 
                  size={14} 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    transform: folders.Contract ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }} 
                />
                {folders.Contract ? <FolderOpen size={16} style={{ color: '#818cf8' }} /> : <Folder size={16} style={{ color: '#818cf8' }} />}
                <span>供應商合約 (Contracts)</span>
              </div>
              
              {folders.Contract && (
                <div className="kb-folder-content">
                  {contractDocs.map(doc => (
                    <div 
                      key={doc.id}
                      className={`kb-file-item ${selectedDoc.id === doc.id ? 'active' : ''}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <FileText size={14} style={{ opacity: 0.7 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {doc.title.split(': ')[1] || doc.title}
                      </span>
                    </div>
                  ))}
                  {contractDocs.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>無匹配檔案</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RAG Engine Statistics */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              知識庫引擎狀態
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>文件總數</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{ragDocuments.length} 份</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>向量維度</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>1536 (OpenAI)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>平均檢索延遲</span>
              <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>45 ms</span>
            </div>
          </div>
        </div>

        {/* Right Column: Document Viewer */}
        <div className="kb-viewer">
          {/* Viewer Header */}
          <div className="kb-viewer-header">
            <div className="kb-viewer-title-area">
              <span className="kb-viewer-title">{selectedDoc.title}</span>
              <span className="kb-viewer-subtitle">文件ID：{selectedDoc.id} | 最後同步時間：{selectedDoc.lastUpdated}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                Vector Indexed
              </span>
            </div>
          </div>

          {/* Viewer Body */}
          <div className="kb-viewer-body">
            {renderHighlightedContent(selectedDoc)}
          </div>
        </div>
      </div>
    </>
  );
}

export default KnowledgeBase;
