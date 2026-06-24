import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Play, RotateCcw, Copy, Check, FileText, 
  Send, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { agentScenarios, ragDocuments } from '../data/mockData.js';

function AgentRoom({ preselectedScenarioId, clearPreselected }) {
  const [selectedScenario, setSelectedScenario] = useState(agentScenarios[0]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [activeAgentName, setActiveAgentName] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  
  // Digital Twin Stress Test Modal state (Ver 1.2)
  const [showStressTestModal, setShowStressTestModal] = useState(false);
  const [selectedStressScenario, setSelectedStressScenario] = useState('B'); // B: ST Lead Time Shock

  // RAG document preview modal state
  const [selectedDoc, setSelectedDoc] = useState(null);

  const chatEndRef = useRef(null);

  // Handle preselected scenario from Dashboard
  useEffect(() => {
    if (preselectedScenarioId) {
      const scenario = agentScenarios.find(s => s.id === preselectedScenarioId);
      if (scenario) {
        setSelectedScenario(scenario);
        startSimulation(scenario);
      }
      clearPreselected(); // Reset parent state
    }
  }, [preselectedScenarioId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSimulating]);

  // Simulation step-by-step logic
  useEffect(() => {
    if (isSimulating && currentStepIndex < selectedScenario.steps.length) {
      const timer = setTimeout(() => {
        const nextStep = selectedScenario.steps[currentStepIndex];
        setChatMessages(prev => [...prev, nextStep]);
        setActiveAgentName(nextStep.agent);
        setCurrentStepIndex(prev => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
    } else if (isSimulating && currentStepIndex >= selectedScenario.steps.length) {
      setIsSimulating(false);
      setActiveAgentName(null);
      setShowReport(true);
    }
  }, [isSimulating, currentStepIndex, selectedScenario]);

  const startSimulation = (scenario = selectedScenario) => {
    setChatMessages([]);
    setIsSimulating(true);
    setCurrentStepIndex(0);
    setShowReport(false);
    setDispatchSuccess(false);
    setCopied(false);
  };

  const resetSimulation = () => {
    setChatMessages([]);
    setIsSimulating(false);
    setCurrentStepIndex(-1);
    setActiveAgentName(null);
    setShowReport(false);
    setDispatchSuccess(false);
  };

  const handleScenarioChange = (scenario) => {
    setSelectedScenario(scenario);
    resetSimulation();
  };

  const handleCopyEmail = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatchAction = () => {
    setDispatchSuccess(true);
  };

  const getAgentColorClass = (agentName) => {
    switch(agentName) {
      case 'Inventory Agent': return 'agent-inventory';
      case 'Shortage Agent': return 'agent-shortage';
      case 'Supplier Agent': return 'agent-supplier';
      case 'Contract Agent': return 'agent-contract';
      case 'Alternate Part Agent': return 'agent-alternate';
      case 'Dead Stock Agent': return 'agent-deadstock';
      case 'Procurement Agent': return 'agent-procurement';
      default: return '';
    }
  };

  const allAgents = [
    { name: 'Inventory Agent', icon: '📊' },
    { name: 'Shortage Agent', icon: '🚨' },
    { name: 'Supplier Agent', icon: '⚖️' },
    { name: 'Contract Agent', icon: '📜' },
    { name: 'Alternate Part Agent', icon: '🔄' },
    { name: 'Dead Stock Agent', icon: '📉' },
    { name: 'Procurement Agent', icon: '💼' }
  ];

  const openRagDoc = (docId) => {
    const doc = ragDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDoc(doc);
    }
  };

  // Render message content with custom elements like RAG links or Digital Twin comparison tables
  const renderMessageContent = (content) => {
    // If the message contains Digital Twin Simulation (New Feature 06), we render a comparative table
    if (content.includes('數位分身模擬（Digital Twin Simulation）')) {
      return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {content.split('數位分身模擬（Digital Twin Simulation）')[0]}
          <strong>數位分身模擬 (Digital Twin Simulation) 對比分析表：</strong>
          
          <div className="table-container" style={{ margin: '12px 0' }}>
            <table className="premium-table" style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <thead>
                <tr>
                  <th>評估方案</th>
                  <th>成本變動</th>
                  <th>到貨交期</th>
                  <th>停線風險</th>
                  <th>技術相容性</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(244, 63, 94, 0.04)' }}>
                  <td style={{ fontWeight: 700 }}>方案 A (ST 緊急空運)</td>
                  <td>+5% (航空運費)</td>
                  <td>15 天</td>
                  <td style={{ color: 'var(--risk-high)', fontWeight: 700 }}>HIGH</td>
                  <td>100% (原廠)</td>
                </tr>
                <tr style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--risk-low)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--risk-low)' }}>方案 B (GD32 替代) ★最優</td>
                  <td style={{ color: 'var(--risk-low)', fontWeight: 700 }}>-15% (低成本)</td>
                  <td style={{ fontWeight: 700 }}>7 天</td>
                  <td style={{ color: 'var(--risk-low)', fontWeight: 700 }}>ZERO</td>
                  <td>98% (Pin-to-Pin)</td>
                </tr>
                <tr style={{ background: 'rgba(251, 191, 36, 0.04)' }}>
                  <td style={{ fontWeight: 700 }}>方案 C (現貨商調貨)</td>
                  <td style={{ color: 'var(--risk-high)' }}>+300% (現貨溢價)</td>
                  <td>3 天</td>
                  <td style={{ color: 'var(--risk-low)', fontWeight: 700 }}>ZERO</td>
                  <td>95% (無 CoC 認證)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* New Feature 07: Historical Memory Recall (Ver 1.2) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'rgba(99,102,241,0.08)', 
            border: '1px solid rgba(99,102,241,0.3)', 
            borderRadius: '10px', 
            padding: '10px 14px', 
            margin: '12px 0', 
            fontSize: '0.8rem', 
            color: '#a5b4fc', 
            fontWeight: 500,
            lineHeight: 1.4
          }}>
            <Sparkles size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
            <div>
              <strong>🔍 歷史案例記憶檢索 (Historical Memory Recall)：</strong>我司於 2025 年 11 月曾因缺料成功引進過 `GD32F103C8T6` 作為替代料，當時量產測試成功率高達 <strong>95%</strong>。歷史實踐極力推薦直接引用此最優方案。
            </div>
          </div>

          {content.split('技術相容性：\n1. ')[1] ? `技術相容性：\n1. ${content.split('技術相容性：\n1. ')[1]}` : ''}
        </div>
      );
    }

    const linkRegex = /\[([^\]]+)\]\((doc-\d+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const linkText = match[1];
      const docId = match[2];
      
      parts.push(
        <span 
          key={docId} 
          className="rag-ref-badge" 
          onClick={() => openRagDoc(docId)}
        >
          <FileText size={12} style={{ marginRight: '4px' }} />
          {linkText}
        </span>
      );
      
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {parts.map((part, i) => part)}
      </div>
    ) : (
      <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
    );
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>AI Agent 自主決策室</h1>
          <p className="header-subtitle">Multi-Agent Autonomous Decision Room & Digital Twin Simulator</p>
        </div>
      </div>

      <div className="agent-room-container" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Left Side: Scenario List + Stress Test Simulator */}
        <div className="scenario-list" style={{ gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', uppercase: true, letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, padding: '0 4px 8px 4px' }}>
              請選擇自主決策情境
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {agentScenarios.map(sc => (
                <div 
                  key={sc.id}
                  className={`scenario-card ${selectedScenario.id === sc.id ? 'active' : ''}`}
                  onClick={() => handleScenarioChange(sc)}
                  style={{ pointerEvents: isSimulating ? 'none' : 'auto', opacity: isSimulating && selectedScenario.id !== sc.id ? 0.5 : 1, padding: '12px 14px' }}
                >
                  <div className="scenario-header">
                    <span className="scenario-title" style={{ fontSize: '0.85rem' }}>{sc.name}</span>
                  </div>
                  <p className="scenario-desc" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{sc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Feature 06: Digital Twin Stress Testing Box (Ver 1.2) */}
          <div className="glass-card" style={{ padding: '16px', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.15)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} />
              <span>庫存數位分身壓力測試</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
              利用 **Digital Twin** 模擬特定極端情境（如需求暴增或斷鏈），動態預測缺料爆發時間點。
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowStressTestModal(true)}
              style={{ width: '100%', justifyContent: 'center', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              開啟壓力測試模擬器
            </button>
          </div>
        </div>

        {/* Right Side: Agent Chat Window */}
        <div className="chat-window">
          {/* Agent Node Flow Visualizer */}
          <div className="agents-flow-container">
            <div className="agents-flow-line"></div>
            {allAgents.map(agent => {
              const isActive = activeAgentName === agent.name;
              return (
                <div key={agent.name} className={`agent-node ${isActive ? 'active' : ''}`}>
                  <div className="agent-node-avatar">
                    <span style={{ fontSize: '1.2rem' }}>{agent.icon}</span>
                  </div>
                  <span className="agent-node-name">{agent.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {chatMessages.length === 0 && !isSimulating && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '16px' }}>
                <Bot size={48} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ color: '#fff', marginBottom: '4px' }}>自主引擎準備就緒</h3>
                  <p style={{ fontSize: '0.85rem' }}>點擊下方按鈕，AI Agents 將自動進行需求預測、合約檢索與數位分身模擬。</p>
                </div>
              </div>
            )}

            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`message-wrapper agent ${getAgentColorClass(msg.agent)}`}
              >
                <div className="message-avatar">
                  {msg.avatar}
                </div>
                <div className="message-bubble-container">
                  <span className="message-sender-name">{msg.agent}</span>
                  <div className="message-bubble">
                    {renderMessageContent(msg.message)}
                  </div>
                </div>
              </div>
            ))}

            {isSimulating && (
              <div className="message-wrapper agent">
                <div className="message-avatar" style={{ background: '#202538', animation: 'pulse-icon 1.5s infinite' }}>
                  ⏳
                </div>
                <div className="message-bubble-container">
                  <span className="message-sender-name">{selectedScenario.steps[currentStepIndex]?.agent || 'AI Agents'} 執行運算中...</span>
                  <div className="message-bubble" style={{ padding: '8px 16px' }}>
                    <div className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Controls Footer */}
          <div className="chat-footer">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isSimulating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-dot danger pulsing"></span>
                  AI Employee 正在自動執行合約向量匹配與數位分身分析...
                </span>
              ) : chatMessages.length > 0 ? (
                <span>自主分析完成。採購建議與郵件已自動產生。</span>
              ) : (
                <span>等待決策啟動。</span>
              )}
            </div>
            
            <div className="simulation-controls">
              {chatMessages.length > 0 && !isSimulating && (
                <button className="btn btn-secondary" onClick={resetSimulation}>
                  <RotateCcw size={16} />
                  重設
                </button>
              )}
              <button 
                className="btn" 
                onClick={() => startSimulation()} 
                disabled={isSimulating}
                style={{ background: isSimulating ? '#4f46e5' : 'var(--color-primary)', opacity: isSimulating ? 0.7 : 1 }}
              >
                <Play size={16} />
                {chatMessages.length > 0 ? '重新分析' : '啟動 AI 自主決策分析'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RAG Document Preview Modal */}
      {selectedDoc && (
        <div 
          className="action-report-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setSelectedDoc(null)}
        >
          <div 
            className="glass-card action-report-card" 
            style={{ width: '600px', border: '1px solid var(--color-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title" style={{ gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                RAG 知識庫檢索文件
              </h2>
              <button 
                onClick={() => setSelectedDoc(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <div style={{ padding: '4px 10px', background: 'rgba(99,102,241,0.1)', borderLeft: '3px solid var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', marginBottom: '16px' }}>
                💡 向量匹配度得分: 0.94 (依據 Agent 提問進行pgvector檢索)
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: '#d1d5db' }}>{selectedDoc.content}</div>
            </div>
          </div>
        </div>
      )}

      {/* Final Action Report Modal Overlay */}
      {showReport && (
        <div 
          className="action-report-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="glass-card action-report-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <h2 className="card-title" style={{ fontSize: '1.25rem', color: '#fff' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--risk-low)' }} />
                【決策與自主執行報告】{selectedScenario.actionReport.title}
              </h2>
              <button 
                onClick={() => setShowReport(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
              {/* Financial Saving Highlight */}
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--risk-low)', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  💰 數位分身模擬財務效益 (最優解: 方案 B)
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>
                  {selectedScenario.actionReport.savings}
                </div>
              </div>

              {/* Action Recommendations */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>具體執行指示 (Actionable Recommendations)</h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedScenario.actionReport.recommendations.map((rec, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>
                      <strong style={{ color: '#fff' }}>{rec.split('：')[0]}：</strong>
                      {rec.split('：')[1]}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Autonomous Procurement Timeline */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                  <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} />
                  <span>AI Employee 訂單進度主動追蹤 (Active Tracking Timeline)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', left: '10px', right: '10px', height: '2px', background: dispatchSuccess ? 'var(--risk-low)' : 'rgba(255,255,255,0.1)', zIndex: 1, transition: 'background 0.5s ease' }}></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--risk-low)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>PO 已自動產生</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--risk-low)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>急單郵件已送出</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: dispatchSuccess ? 'var(--risk-low)' : '#202538', border: dispatchSuccess ? 'none' : '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                      {dispatchSuccess ? '✓' : '3'}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: dispatchSuccess ? '#fff' : 'var(--text-muted)' }}>廠商訂單確認</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                    <div className={dispatchSuccess ? 'status-dot pulsing' : ''} style={{ width: '30px', height: '30px', borderRadius: '50%', background: dispatchSuccess ? 'var(--color-secondary)' : '#202538', border: dispatchSuccess ? 'none' : '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                      {dispatchSuccess ? '✈' : '4'}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: dispatchSuccess ? 'var(--color-secondary)' : 'var(--text-muted)' }}>
                      {dispatchSuccess ? '快遞空運中' : '等待派送'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#202538', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>5</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>倉庫入庫收迄</span>
                  </div>
                </div>
              </div>

              {/* Email Draft box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>已寄發之電子郵件備份 (PO Email Backup)</h3>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleCopyEmail(selectedScenario.actionReport.emailBody)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    {copied ? <Check size={12} style={{ color: 'var(--risk-low)' }} /> : <Copy size={12} />}
                    {copied ? '已複製' : '複製備份'}
                  </button>
                </div>
                
                <div className="email-draft-box">
                  <div style={{ fontWeight: 700, color: 'var(--color-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '10px' }}>
                    主旨：{selectedScenario.actionReport.emailSubject}
                  </div>
                  {selectedScenario.actionReport.emailBody}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowReport(false)}>
                關閉視窗
              </button>
              <button 
                className="btn" 
                onClick={handleDispatchAction}
                disabled={dispatchSuccess}
                style={{ background: dispatchSuccess ? 'var(--risk-low)' : 'var(--color-primary)' }}
              >
                {dispatchSuccess ? <Check size={16} /> : <Sparkles size={16} />}
                {dispatchSuccess ? '主動追蹤任務執行中' : '簽准決策並啟動主動追蹤'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Feature 06: Inventory Digital Twin Stress Test Modal (Ver 1.2) */}
      {showStressTestModal && (
        <div 
          className="action-report-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setShowStressTestModal(false)}
        >
          <div 
            className="glass-card action-report-card" 
            style={{ width: '680px', border: '1px solid var(--color-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h2 className="card-title" style={{ gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} />
                庫存數位分身壓力測試模擬器 (Digital Twin Stress Test)
              </h2>
              <button 
                onClick={() => setShowStressTestModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                請選擇想要對目前全球供應網絡施加的**極端壓力情境**。數位分身將立即計算對我司產能與庫存的衝擊：
              </p>

              {/* Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div 
                  onClick={() => setSelectedStressScenario('A')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: selectedStressScenario === 'A' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedStressScenario === 'A' ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>情境 A (需求暴增)</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>終端需求暴增 +20%</span>
                </div>
                <div 
                  onClick={() => setSelectedStressScenario('B')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: selectedStressScenario === 'B' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedStressScenario === 'B' ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>情境 B (交期震盪)</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ST 交期 14d 延長至 45d</span>
                </div>
                <div 
                  onClick={() => setSelectedStressScenario('C')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: selectedStressScenario === 'C' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedStressScenario === 'C' ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>情境 C (二級廠中斷)</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>日月光封裝廠火災停工 20d</span>
                </div>
              </div>

              {/* Stress Test Output */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  <span>指標 (Metric)</span>
                  <span>壓力測試前 (Normal)</span>
                  <span style={{ color: 'var(--risk-high)' }}>壓力測試後 (Stressed)</span>
                </div>

                {selectedStressScenario === 'A' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>STM32 晶片日均消耗</span>
                      <span>50 PCS / 天</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>60 PCS / 天 (+20%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>庫存安全天數用罄時間點</span>
                      <span>17 天後</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>14 天後 (提早 3 天用罄)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>AI 自動因應對策</span>
                      <span colSpan="2" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>將動態安全水位自動調高 20%，提前 5 天觸發採購下單。</span>
                    </div>
                  </>
                )}

                {selectedStressScenario === 'B' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>ST 採購前置交期</span>
                      <span>14 天</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>45 天 (+31 天)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>產線斷料停工風險</span>
                      <span>Low Risk (0%)</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>Critical (96% 停線可能)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>AI 自動因應對策</span>
                      <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>自動關聯向量合約並鎖定 WPG 大聯大 7 天到貨之 GD32 替代料產能。</span>
                    </div>
                  </>
                )}

                {selectedStressScenario === 'C' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>ASE 二級封測廠出貨能力</span>
                      <span>100% 正常</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>0% (中斷 20 天)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>ESP32 缺料斷貨時間</span>
                      <span>30 天以上安全</span>
                      <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>12 天後斷貨</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>AI 自動因應對策</span>
                      <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>穿透全球倉庫，自動觸發蘇州廠閒置 1,500 PCS 庫存進行 STO 跨國空運調撥。</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowStressTestModal(false)}>
                關閉模擬器
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AgentRoom;
