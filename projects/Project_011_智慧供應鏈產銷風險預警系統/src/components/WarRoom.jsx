import React, { useState } from 'react';
import { 
  ShieldAlert, Sparkles, Check, Send, AlertTriangle, 
  ArrowRight, DollarSign, Layers, Users, TrendingUp, HelpCircle 
} from 'lucide-react';
import { warRoomScenarios } from '../data/mockData.js';

function WarRoom() {
  const [selectedScenario, setSelectedScenario] = useState(warRoomScenarios[0]);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      setApproved(true);
      setLoading(false);
    }, 1200);
  };

  const handleScenarioChange = (scenario) => {
    setSelectedScenario(scenario);
    setApproved(false);
  };

  const getNodeColor = (status) => {
    switch(status) {
      case 'Critical': return 'var(--risk-high)';
      case 'Warning': return 'var(--risk-medium)';
      default: return 'var(--risk-low)';
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>AI 風險戰情室</h1>
          <p className="header-subtitle">AI Risk War Room & Closed-loop Enterprise Decision Platform</p>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '-12px' }}>
        風險戰情室提供對外部重大供應鏈中斷事件的**損害控制評估與閉環人機決策**。透過知識圖譜與數位分身模擬，AI 自主建立應變預案，並經由內控審核機制執行。
      </p>

      {/* Selector and Main Grid */}
      <div className="dashboard-grid-1x2" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Left Side Selector */}
        <div className="scenario-list">
          <div style={{ fontSize: '0.8rem', uppercase: true, letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, padding: '0 4px 8px 4px' }}>
            請選擇重大突發事件
          </div>
          {warRoomScenarios.map(sc => (
            <div 
              key={sc.id}
              className={`scenario-card ${selectedScenario.id === sc.id ? 'active' : ''}`}
              onClick={() => handleScenarioChange(sc)}
              style={{ padding: '14px' }}
            >
              <div className="scenario-header">
                <span className="scenario-title" style={{ fontSize: '0.85rem' }}>{sc.title.split(' (')[0]}</span>
              </div>
              <span className={`badge ${sc.severity === 'Critical' ? 'danger' : 'warning'}`} style={{ marginTop: '8px', fontSize: '0.65rem' }}>
                {sc.severity === 'Critical' ? '極度緊急 (Critical)' : '警示波動 (Warning)'}
              </span>
            </div>
          ))}
        </div>

        {/* Right Side: War Room Analysis Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Impact Stats */}
          <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="glass-card metric-card critical" style={{ padding: '16px 20px' }}>
              <div className="metric-header">
                <span className="metric-title">營收曝險總額</span>
                <div className="metric-icon-wrapper">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="metric-value-container">
                <span className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--risk-high)' }}>
                  {selectedScenario.revenueAtRisk}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>預估阻斷損失金額</span>
            </div>

            <div className="glass-card metric-card" style={{ padding: '16px 20px' }}>
              <div className="metric-header">
                <span className="metric-title">波及核心產品</span>
                <div className="metric-icon-wrapper">
                  <Layers size={16} />
                </div>
              </div>
              <div className="metric-value-container">
                <span className="metric-value" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedScenario.affectedProducts}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>生產計畫受阻產品</span>
            </div>

            <div className="glass-card metric-card" style={{ padding: '16px 20px' }}>
              <div className="metric-header">
                <span className="metric-title">受影響合約客戶</span>
                <div className="metric-icon-wrapper">
                  <Users size={16} />
                </div>
              </div>
              <div className="metric-value-container">
                <span className="metric-value" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedScenario.affectedCustomers}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>面臨交期延誤賠償客戶</span>
            </div>
          </div>

          {/* New Feature 09: Knowledge Graph Dependency Chain Visualizer (Ver 2.0) */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h2 className="card-title">
                <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} />
                多維度企業知識圖譜關聯依賴鏈 (Enterprise Knowledge Graph)
              </h2>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '20px' }}>
              知識圖譜串聯了我司 **供應商、零件、倉庫、調撥採購、受波及產品、以及合約客戶** 的多維關係鏈，能精準追蹤一個點的斷裂如何向上波及營收與客戶。
            </p>

            <div style={{ background: '#F6F4EF', borderRadius: '12px', padding: '20px 12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', gap: '8px' }}>
                {selectedScenario.graphNodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '6px',
                      background: '#FFFFFF',
                      border: `1.5px solid ${getNodeColor(node.status)}`,
                      borderRadius: '8px',
                      padding: '8px 10px',
                      width: '120px',
                      textAlign: 'center',
                      boxShadow: node.status === 'Critical' ? '0 0 10px rgba(214,107,93,0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>{node.type}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{node.label}</span>
                    </div>
                    {idx < selectedScenario.graphNodes.length - 1 && (
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* New Feature 12: Explainable AI Decision Panel (XAI) (Ver 2.0) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h2 className="card-title">
                <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} />
                AI 自主應變決策與客觀證據鏈 (Explainable AI - Evidence Dashboard)
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rec Plan */}
              <div style={{ padding: '16px', background: 'rgba(123, 94, 69, 0.04)', border: '1px solid rgba(123, 94, 69, 0.15)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                  💡 數位分身評估最優減災應變預案
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>
                  {selectedScenario.optimalPlan}
                </div>
              </div>

              {/* Evidence Chains */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  📊 決策客觀證據鏈 (Factual Evidence Chains - 拒絕黑盒決策)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {selectedScenario.evidence.map((ev, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '12px 14px', 
                        background: '#FDFBF7', 
                        border: '1.5px solid var(--border-light)', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        lineHeight: 1.5,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '4px' }}>
                        證據 {idx + 1}：{ev.split('：')[0]}
                      </strong>
                      {ev.split('：')[1]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* New Feature 11: Human Approval Workflow (Listed Internal Control) */}
          <div className="glass-card" style={{ border: approved ? '1px solid var(--risk-low)' : '1px solid rgba(251,191,36,0.3)', background: approved ? 'rgba(16,185,129,0.02)' : 'rgba(251,191,36,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: approved ? 'rgba(16,185,129,0.1)' : 'rgba(251,191,36,0.1)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: approved ? 'var(--risk-low)' : 'var(--risk-medium)' 
                }}>
                  {approved ? <Check size={18} /> : <AlertTriangle size={18} className="pulsing" />}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {approved ? '✓ 內控審核已核准 (ERP 指令已下達)' : '⚠️ 上市公司內控 - 待主管簽核核准 (Pending Approval)'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {approved ? 
                      'AI Autonomous Employee 正在執行閉環採購與催料追蹤工作流。' : 
                      'AI 已自主建立緊急處置採購單/調撥單與郵件草稿，等待主管簽核授權以執行閉環對接。'
                    }
                  </p>
                </div>
              </div>

              <div>
                <button 
                  className="btn" 
                  onClick={handleApprove}
                  disabled={approved || loading}
                  style={{ 
                    background: approved ? 'var(--risk-low)' : 'var(--color-primary)',
                    opacity: loading ? 0.7 : 1,
                    fontSize: '0.8rem',
                    padding: '8px 16px'
                  }}
                >
                  {loading ? '執行中...' : approved ? '已自主執行中' : '核准決策並自主執行'}
                </button>
              </div>
            </div>

            {/* Approved status tracking timeline */}
            {approved && (
              <div style={{ marginTop: '20px', background: '#F4EFE7', borderRadius: '8px', padding: '16px', animation: 'slide-down 0.3s ease', border: '1px solid var(--border-focus)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} />
                  <span>AI Employee 閉環執行中 - 進度追蹤 (Closed-loop Tracking)：</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--risk-low)', fontWeight: 700 }}>✓ PO 自動建立 (Complete)</span>
                  <span style={{ color: 'var(--risk-low)', fontWeight: 700 }}>✓ 急單 Email 自動寄發 (Complete)</span>
                  <span className="pulsing" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>● 物流軌跡主動追蹤中 (Active Tracking)</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default WarRoom;
