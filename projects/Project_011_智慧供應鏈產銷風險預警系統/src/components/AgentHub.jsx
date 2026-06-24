import React, { useState } from 'react';
import { Bot, Sparkles, Check, Clock, Award, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { agentMetrics } from '../data/mockData.js';

function AgentHub() {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const toggleExpand = (agentId) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(agentId);
    }
  };

  // Calculate global summary stats
  const totalTasks = agentMetrics.reduce((sum, a) => sum + a.tasks, 0);
  const totalTokens = agentMetrics.reduce((sum, a) => sum + a.tokens, 0).toFixed(1);
  const totalCost = agentMetrics.reduce((sum, a) => sum + a.tokens * 0.005, 0).toFixed(2); // Mock token pricing
  const averageAccuracy = (agentMetrics.reduce((sum, a) => sum + a.accuracy, 0) / agentMetrics.length).toFixed(1);

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>AI 員工管理中心</h1>
          <p className="header-subtitle">AI Employee Management Center & Agent Operations Hub</p>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '-12px' }}>
        控制塔由 **7 位專業 AI Agent 協同大腦** 作為自主員工（AI Employees）驅動。本中心提供對各 Agent 決策準確率、任務負荷、運行成本及活動日誌的監控。
      </p>

      {/* Global Team Stats Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="glass-card metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span className="metric-title">自主員工團隊</span>
            <div className="metric-icon-wrapper">
              <Bot size={16} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">7 位</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--risk-low)', fontWeight: 600 }}>● 全部成員運作正常</span>
        </div>

        <div className="glass-card metric-card success" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span className="metric-title">平均決策準確率</span>
            <div className="metric-icon-wrapper">
              <Award size={16} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">{averageAccuracy}%</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>基於 1,392 次運算回饋</span>
        </div>

        <div className="glass-card metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span className="metric-title">本月已處理任務</span>
            <div className="metric-icon-wrapper">
              <Activity size={16} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">{totalTasks.toLocaleString()} 次</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>包含風險預警、合約檢索、替代比對</span>
        </div>

        <div className="glass-card metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span className="metric-title">預估本月 Token 營運費用</span>
            <div className="metric-icon-wrapper">
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">${totalCost}</span>
            <span className="metric-unit">USD</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>共消耗 {totalTokens}k Tokens</span>
        </div>
      </div>

      {/* Agents Grid Layout */}
      <div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '16px', paddingLeft: '4px' }}>
          🤖 AI 員工狀態與效能面板 (Agent Hub Roster)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {agentMetrics.map(agent => {
            const isExpanded = expandedAgent === agent.id;
            const isActive = agent.status === 'Active';

            return (
              <div 
                key={agent.id} 
                className={`glass-card ${isExpanded ? 'highlighted' : ''}`}
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => toggleExpand(agent.id)}
              >
                {/* Agent Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: isActive ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.03)', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      fontSize: '1.2rem',
                      border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-light)'
                    }}>
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{agent.name}</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{agent.role}</span>
                    </div>
                  </div>

                  <span className={`badge ${isActive ? 'danger' : 'success'}`} style={{ fontSize: '0.65rem' }}>
                    <span className={`status-dot ${isActive ? 'danger pulsing' : ''}`}></span>
                    {isActive ? '運算中' : '閒置中'}
                  </span>
                </div>

                {/* Accuracy score bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    <span>決策準確率</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{agent.accuracy}%</span>
                  </div>
                  <div className="custom-progress-bar">
                    <div className="custom-progress-fill low" style={{ width: `${agent.accuracy}%`, background: 'var(--color-primary)' }}></div>
                  </div>
                </div>

                {/* Mini Stats row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                  <span>已處理任務：<strong style={{ color: 'var(--text-secondary)' }}>{agent.tasks} 次</strong></span>
                  <span>Token 消耗：<strong style={{ color: 'var(--text-secondary)' }}>{agent.tokens}k</strong></span>
                </div>

                {/* Monospace Activity Log */}
                {isExpanded && (
                  <div 
                    style={{ 
                      background: '#020408', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.7rem', 
                      color: 'var(--color-secondary)',
                      lineHeight: 1.4,
                      border: '1px solid #1f2937',
                      animation: 'slide-down 0.2s ease',
                      whiteSpace: 'pre-wrap'
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking log
                  >
                    <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⚡ 實時運算活動日誌 (Console Output)
                    </div>
                    {agent.log}
                  </div>
                )}

                {/* Expand / collapse text indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {isExpanded ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>收合日誌 <ChevronUp size={12} /></span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>展開活動日誌 <ChevronDown size={12} /></span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default AgentHub;
