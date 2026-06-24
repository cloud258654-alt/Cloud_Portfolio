import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, AlertTriangle, ShieldAlert, Sparkles, 
  ArrowRight, Check, Play, FileText, DollarSign, TrendingUp 
} from 'lucide-react';
import { globalRisks } from '../data/mockData.js';

function GlobalRiskRadar() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runEventWorkflow = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setActiveStep(0);
    setLogs([]);

    const steps = [
      {
        step: 0,
        delay: 100,
        type: 'event',
        text: '【事件監聽器】偵測到全球地緣政治事件：美國宣佈加徵關鍵微控制器（MCU）進口關稅 12%。'
      },
      {
        step: 1,
        delay: 1200,
        type: 'shortage',
        text: '【Shortage Agent】分析財務衝擊：受波及晶片 STM32F103C8T6 單價將上升 USD 0.31 (+12%)。按月消耗量估算，月毛利損失達 USD 1,550，且美西長灘港口擁堵導致在途前置交期延長 7 天。風險等級：HIGH RISK。'
      },
      {
        step: 2,
        delay: 2400,
        type: 'contract',
        text: '【Contract Agent】RAG 穿透檢索意法半導體合約 Contract-2026-TX。評估結果：無任何關稅豁免或分攤條款。原廠拒絕降價，關稅將 100% 由我司承擔。合約路徑已封鎖。'
      },
      {
        step: 3,
        delay: 3600,
        type: 'alternate',
        text: '【Alternative Agent】執行數位分身模擬最優解。推薦方案：引進兆易創新（GigaDevice）替代晶片 `GD32F103C8T6`。Pin-to-Pin 100% 相容。生產地位於亞洲，免受北美關稅限制。單價 USD 2.20，比 ST 原合約價便宜 15%，到貨交期僅 7 天。'
      },
      {
        step: 4,
        delay: 4800,
        type: 'procurement',
        text: '【Procurement Agent】自主決策執行完成：系統已在 ERP 內自動生成採購單 PO-20260624-045 (2,000 PCS，金額 USD 4,400)；自動向代理商大聯大寄出急單下單郵件；建立 AI 員工主動進度追蹤任務。'
      },
      {
        step: 5,
        delay: 6000,
        type: 'success',
        text: '【Workflow Engine】事件驅動型工作流執行完畢。成功規避 12% 關稅壁壘與停線風險，集團整體庫存健康度穩定於 92/100，資金回收效益評估達 94分。狀態：RESOLVED。'
      }
    ];

    steps.forEach(s => {
      setTimeout(() => {
        setActiveStep(s.step);
        setLogs(prev => [...prev, { type: s.type, text: s.text }]);
        if (s.step === 5) {
          setIsSimulating(false);
        }
      }, s.delay);
    });
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>全球供應鏈風險雷達</h1>
          <p className="header-subtitle">Global Geopolitical, Tariff, and Commodity Risk Intelligence Radar</p>
        </div>
      </div>

      {/* Geopolitical Risk Cards Grid */}
      <div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px', paddingLeft: '4px' }}>
          🌍 全球即時風險事件監控 (Live Geopolitical Feeds)
        </div>
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {globalRisks.map(risk => (
            <div key={risk.id} className="glass-card metric-card" style={{ padding: '20px', borderTop: `3px solid ${risk.color}` }}>
              <div className="metric-header" style={{ marginBottom: '8px' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.7rem' }}>
                  {risk.type}
                </span>
                <span style={{ color: risk.color, fontSize: '0.75rem', fontWeight: 700 }}>
                  {risk.status === 'Critical' ? '緊急限制' : risk.status === 'Warning' ? '警示波動' : '常態監控'}
                </span>
              </div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px', lineHeight: 1.4 }}>
                {risk.event}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                <strong>影響：</strong>{risk.impact}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--color-secondary)' }}>AI 控制策略：</strong>{risk.advice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Driven AI Workflow Engine Simulation */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card-header" style={{ marginBottom: '0px' }}>
          <h2 className="card-title">
            <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} />
            事件驅動型 AI 工作流引擎 (Event-Driven AI Workflow Engine)
          </h2>
          <button 
            className="btn" 
            onClick={runEventWorkflow} 
            disabled={isSimulating}
            style={{ 
              background: isSimulating ? 'rgba(99,102,241,0.2)' : 'var(--color-primary)',
              padding: '8px 16px',
              fontSize: '0.8rem'
            }}
          >
            <Play size={12} />
            模擬外部地緣政治事件 (美國關稅加徵)
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '-10px' }}>
          相較於被動等待發問，**Event-Driven AI** 能夠在偵測到外部風險事件（如關稅加徵或港口擁堵）時，自動觸發跨專家的鏈式工作流。以下流程圖展示了 AI 專家群如何自主協作，完成關稅規避與緊急採購。
        </p>

        {/* Workflow Visualizer Map */}
        <div style={{ background: 'rgba(7,8,14,0.3)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', gap: '16px', paddingBottom: '10px' }}>
            
            {/* Node 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 0 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 0 ? 'var(--risk-high)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 0 ? '0 0 15px var(--risk-high-glow)' : 'none' }}>⚡</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 0 ? '#fff' : 'var(--text-muted)' }}>關稅事件觸發</span>
            </div>

            <ArrowRight size={16} style={{ color: activeStep >= 1 ? 'var(--color-primary)' : 'var(--text-muted)', opacity: activeStep >= 1 ? 1 : 0.3 }} />

            {/* Node 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 1 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 1 ? 'var(--color-primary)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 1 ? '0 0 15px var(--color-primary-glow)' : 'none' }}>🚨</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 1 ? '#fff' : 'var(--text-muted)' }}>Shortage Agent</span>
            </div>

            <ArrowRight size={16} style={{ color: activeStep >= 2 ? 'var(--color-primary)' : 'var(--text-muted)', opacity: activeStep >= 2 ? 1 : 0.3 }} />

            {/* Node 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 2 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 2 ? 'var(--color-primary)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 2 ? '0 0 15px var(--color-primary-glow)' : 'none' }}>📜</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 2 ? '#fff' : 'var(--text-muted)' }}>Contract Agent</span>
            </div>

            <ArrowRight size={16} style={{ color: activeStep >= 3 ? 'var(--color-primary)' : 'var(--text-muted)', opacity: activeStep >= 3 ? 1 : 0.3 }} />

            {/* Node 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 3 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 3 ? 'var(--color-primary)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 3 ? '0 0 15px var(--color-primary-glow)' : 'none' }}>🔄</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 3 ? '#fff' : 'var(--text-muted)' }}>Alternative Agent</span>
            </div>

            <ArrowRight size={16} style={{ color: activeStep >= 4 ? 'var(--color-primary)' : 'var(--text-muted)', opacity: activeStep >= 4 ? 1 : 0.3 }} />

            {/* Node 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 4 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 4 ? 'var(--color-primary)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 4 ? '0 0 15px var(--color-primary-glow)' : 'none' }}>💼</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 4 ? '#fff' : 'var(--text-muted)' }}>Procurement Agent</span>
            </div>

            <ArrowRight size={16} style={{ color: activeStep >= 5 ? 'var(--risk-low)' : 'var(--text-muted)', opacity: activeStep >= 5 ? 1 : 0.3 }} />

            {/* Node 6 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: activeStep >= 5 ? 1 : 0.3, transition: 'all 0.3s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= 5 ? 'var(--risk-low)' : '#202538', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: activeStep === 5 ? '0 0 15px var(--risk-low-glow)' : 'none' }}>✓</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep >= 5 ? 'var(--risk-low)' : 'var(--text-muted)' }}>自主執行結案</span>
            </div>

          </div>
        </div>

        {/* Real-time terminal log */}
        <div className="terminal-window" style={{ display: 'flex', flexDirection: 'column', height: '240px' }}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-title">ai_workflow_engine.sh</div>
          </div>
          <div className="terminal-body" style={{ flexGrow: 1, overflowY: 'auto' }}>
            {logs.length === 0 && (
              <span style={{ color: 'var(--text-muted)' }}>Waiting for event trigger... Click the button above to simulate.</span>
            )}
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                className="terminal-line" 
                style={{ 
                  marginBottom: '10px', 
                  color: log.type === 'event' ? 'var(--risk-high)' : log.type === 'success' ? 'var(--risk-low)' : '#d1d5db',
                  lineHeight: 1.5
                }}
              >
                {log.text}
              </div>
            ))}
            {isSimulating && (
              <div className="typing-indicator" style={{ padding: '4px 0' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalRiskRadar;
