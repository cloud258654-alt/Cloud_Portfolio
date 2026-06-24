import React, { useState } from 'react';
import { Network, ShieldAlert, Sparkles, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { supplierNetwork } from '../data/mockData.js';

function SupplierGraph() {
  const [selectedNode, setSelectedNode] = useState(supplierNetwork.nodes[0]);

  const getNodeStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'var(--risk-low)';
      case 'Warning': return 'var(--risk-medium)';
      case 'Critical': return 'var(--risk-high)';
      default: return 'var(--text-muted)';
    }
  };

  const getLinkColor = (sourceId, targetId) => {
    // ASE Group to Espressif is critical path
    if (sourceId === 't2-ase' && targetId === 't1-espressif') {
      return 'var(--risk-high)';
    }
    if (sourceId === 't1-espressif' && targetId === 'factory') {
      return 'var(--risk-high)';
    }
    // ST to factory is warning path
    if (sourceId === 't1-st' && targetId === 'factory') {
      return 'var(--risk-medium)';
    }
    return 'rgba(255,255,255,0.1)';
  };

  const getLinkStrokeDasharray = (sourceId) => {
    if (sourceId === 't2-ase' || sourceId === 't1-espressif') {
      return '5, 5'; // dashed line to represent disruption/flow
    }
    return 'none';
  };

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>多層級供應商網絡拓撲</h1>
          <p className="header-subtitle">Multi-tier Supply Chain Dependency Graph & Structural Risk Analysis</p>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '-12px' }}>
        控制塔實現了對 **Tier 1 (直接供應商)、Tier 2 (核心代工/封測廠) 及 Tier 3 (關鍵原材料商)** 的穿透式拓撲監控。點擊節點可調閱詳細的供應商財務、ESG與產能備份策略。
      </p>

      <div className="dashboard-grid-2x1" style={{ height: 'calc(100vh - 240px)', gridTemplateColumns: '2.5fr 1fr' }}>
        {/* Left Side: SVG Network Canvas */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', background: 'rgba(5,6,10,0.5)', padding: 0 }}>
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              拓撲圖例 (Legend)
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-low)' }}></span>
                正常 (Active)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-medium)' }}></span>
                波動警示 (Warning)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-high)' }}></span>
                嚴重中斷 (Critical)
              </span>
            </div>
          </div>

          {/* Background SVG Canvas for Links */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            {/* Define arrows for links */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="rgba(255,255,255,0.2)" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--risk-high)" />
              </marker>
            </defs>

            {supplierNetwork.links.map((link, idx) => {
              const sourceNode = supplierNetwork.nodes.find(n => n.id === link.source);
              const targetNode = supplierNetwork.nodes.find(n => n.id === link.target);
              
              if (!sourceNode || !targetNode) return null;

              // Offset coordinate mapping to fit canvas size
              // Assuming canvas is approx 650x450, mapping coordinates:
              // Level 0: 60px, Level 1: 220px, Level 2: 400px, Level 3: 580px
              const getX = (level) => {
                if (level === 0) return 60;
                if (level === 1) return 210;
                if (level === 2) return 390;
                return 580;
              };
              const getY = (id) => {
                if (id === 'factory') return 200;
                if (id === 't1-st') return 100;
                if (id === 't1-espressif') return 300;
                if (id === 't2-tsmc') return 80;
                if (id === 't2-ase') return 280;
                return 180; // t3-wacker
              };

              const x1 = getX(sourceNode.level);
              const y1 = getY(sourceNode.id);
              const x2 = getX(targetNode.level);
              const y2 = getY(targetNode.id);

              const color = getLinkColor(sourceNode.id, targetNode.id);
              const isCritical = color === 'var(--risk-high)';

              return (
                <g key={idx}>
                  <line 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke={color} 
                    strokeWidth={isCritical ? 2.5 : 1.5}
                    strokeDasharray={getLinkStrokeDasharray(sourceNode.id)}
                    markerEnd={isCritical ? "url(#arrow-red)" : "url(#arrow)"}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {isCritical && (
                    <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="5" fill="var(--risk-high)" style={{ animation: 'pulse-red 1.5s infinite' }} />
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML Overlay Nodes */}
          {supplierNetwork.nodes.map(node => {
            const getX = (level) => {
              if (level === 0) return 60;
              if (level === 1) return 210;
              if (level === 2) return 390;
              return 580;
            };
            const getY = (id) => {
              if (id === 'factory') return 200;
              if (id === 't1-st') return 100;
              if (id === 't1-espressif') return 300;
              if (id === 't2-tsmc') return 80;
              if (id === 't2-ase') return 280;
              return 180;
            };

            const x = getX(node.level);
            const y = getY(node.id);
            const statusColor = getNodeStatusColor(node.status);
            const isSelected = selectedNode.id === node.id;

            return (
              <div 
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '130px',
                  padding: '10px 8px',
                  background: isSelected ? 'rgba(26,32,50,0.95)' : 'rgba(18,22,35,0.85)',
                  border: isSelected ? `2px solid ${statusColor}` : `1px solid var(--border-light)`,
                  borderRadius: '10px',
                  boxShadow: isSelected ? `0 0 15px ${statusColor}40` : '0 4px 10px rgba(0,0,0,0.3)',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {node.level === 0 ? '我司廠區' : `Tier ${node.level}`}
                  </span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}></span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.label.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Supplier Detail Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Network size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>節點風險詳細剖析</span>
          </div>

          {/* Node metadata */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.7rem' }}>
                {selectedNode.level === 0 ? 'Tier 0 - 集團基地' : `Tier ${selectedNode.level} 級供應商`}
              </span>
              <span className={`badge ${selectedNode.status === 'Active' ? 'success' : selectedNode.status === 'Warning' ? 'warning' : 'danger'}`}>
                {selectedNode.status === 'Active' ? '供貨正常' : selectedNode.status === 'Warning' ? '波動警告' : '嚴重中斷'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {selectedNode.label}
            </h3>
          </div>

          {/* Description */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.8rem', lineHeight: 1.5, color: '#d1d5db' }}>
            {selectedNode.details}
          </div>

          {/* Risk Mitigation Strategy (For warning/critical nodes) */}
          {(selectedNode.status === 'Warning' || selectedNode.status === 'Critical') && (
            <div style={{ border: '1px solid rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.05)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-high)' }}>
                <ShieldAlert size={14} />
                <span>AI 應變減災預案已啟動</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {selectedNode.id === 't1-espressif' || selectedNode.id === 't2-ase' ? (
                  <strong>已自主發起 STO-20260624-009 跨國倉庫調撥流程，調動蘇州廠閒置 1,000 PCS ESP32 進行空運，成功抵消 78% 的二級斷鏈風險。</strong>
                ) : (
                  <strong>檢測到 12% 關稅成本壓力。AI 工作流已自動完成數位分身評估，引導採購轉向免稅的兆易創新 GD32 替代料。</strong>
                )}
              </p>
            </div>
          )}

          {/* Sub-tier Dependencies */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              網絡依賴關係 (Network Dependencies)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {selectedNode.id === 'factory' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>直接上級供應商 (Tier 1)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>ST, Espressif</span>
                  </div>
                </>
              )}
              {selectedNode.id === 't1-st' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>下級採購工廠 (Tier 0)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>聯發科技 桃園廠</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>上級製造代工 (Tier 2)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>TSMC 台積電</span>
                  </div>
                </>
              )}
              {selectedNode.id === 't1-espressif' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>下級採購工廠 (Tier 0)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>聯發科技 桃園廠</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>上級封裝測試 (Tier 2)</span>
                    <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>ASE 日月光</span>
                  </div>
                </>
              )}
              {selectedNode.id === 't2-tsmc' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>下級晶片原廠 (Tier 1)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>STMicroelectronics</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>上級原料供應 (Tier 3)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>德國瓦克化學</span>
                  </div>
                </>
              )}
              {selectedNode.id === 't2-ase' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>下級晶片原廠 (Tier 1)</span>
                    <span style={{ color: 'var(--risk-high)', fontWeight: 700 }}>Espressif Systems</span>
                  </div>
                </>
              )}
              {selectedNode.id === 't3-wacker' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>下級製造代工 (Tier 2)</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>TSMC 台積電</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupplierGraph;
