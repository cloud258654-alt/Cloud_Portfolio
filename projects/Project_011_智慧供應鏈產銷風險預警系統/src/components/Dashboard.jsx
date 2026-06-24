import React, { useState } from 'react';
import { 
  Flame, ArrowDownRight, ArrowUpRight, AlertOctagon, 
  DollarSign, Clock, ShieldAlert, BadgePercent, Play, Filter,
  Sparkles, FileText, CheckCircle2, TrendingUp, HelpCircle
} from 'lucide-react';
import { inventoryCurrent, supplierPerformance, categoryHealth, weeklyAiReport } from '../data/mockData.js';

function Dashboard({ onTriggerScenario }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const filteredInventory = filterCategory === 'ALL' 
    ? inventoryCurrent 
    : inventoryCurrent.filter(item => item.category === filterCategory);

  const categories = ['ALL', 'IC', 'Passive', 'PCB'];

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>智慧自主產銷與供應風險控制塔</h1>
          <p className="header-subtitle">AI Autonomous Inventory Control Tower & Supply Risk Early Warning Platform</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowWeeklyReport(true)}
            style={{ 
              background: '#F4EFE7',
              border: '1px solid var(--border-focus)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            <span>查看本週 AI 智慧分析週報</span>
          </button>
          <span className="badge success" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
            <span className="status-dot pulsing"></span>
            閉環自主監控中
          </span>
        </div>
      </div>

      {/* Emergency Shortage Alert Banner (Module 3) */}
      <div className="alert-banner">
        <div className="alert-banner-left">
          <div className="alert-banner-icon">
            <Flame size={28} />
          </div>
          <div>
            <div className="alert-banner-title">【高風險缺料預警】MCU 晶片 STM32F103C8T6 庫存水位面臨臨界狀態！</div>
            <div className="alert-banner-desc">
              現有可用天數僅剩 <strong>4 天</strong>，低於 45 天採購交期。產線即將中斷，建議啟動 AI Multi-Agent 協同決策與數位分身模擬。
            </div>
          </div>
        </div>
        <button className="alert-banner-btn" onClick={() => onTriggerScenario('scenario-1')}>
          <Play size={14} />
          啟動 AI 協同決策
        </button>
      </div>

      {/* KPI Metrics Row (Module 1, 2, 3, 4) - Upgraded to Ver 2.0 Business Value Targets */}
      <div className="metrics-grid">
        {/* Metric 1 */}
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">庫存總金額</span>
            <div className="metric-icon-wrapper">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">$995,800</span>
            <span className="metric-unit">USD</span>
          </div>
          <div className="metric-footer">
            <span className="metric-trend down" style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowDownRight size={14} /> -12.5%
            </span>
            <span>較上月優化 (降低資金積壓)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card metric-card success">
          <div className="metric-header">
            <span className="metric-title">庫存週轉天數 (DOH)</span>
            <div className="metric-icon-wrapper">
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">75</span> {/* Ver 2.0 Value: 75 days */}
            <span className="metric-unit">天</span>
          </div>
          <div className="metric-footer">
            <span className="metric-trend down" style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
              <ArrowDownRight size={14} /> -45天
            </span>
            <span>已由 120 天降低至 75 天卓越水平</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card metric-card warning">
          <div className="metric-header">
            <span className="metric-title">呆滯料總金額</span>
            <div className="metric-icon-wrapper">
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value">$12,000</span> {/* Ver 2.0 Value: $12,000 USD */}
            <span className="metric-unit">USD</span>
          </div>
          <div className="metric-footer">
            <span className="metric-trend down" style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowDownRight size={14} /> -60.0%
            </span>
            <span>已處置去化大宗呆滯料</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card metric-card success">
          <div className="metric-header">
            <span className="metric-title">預期節省採購成本</span>
            <div className="metric-icon-wrapper">
              <TrendingUp size={18} style={{ color: 'var(--risk-low)' }} />
            </div>
          </div>
          <div className="metric-value-container">
            <span className="metric-value" style={{ color: 'var(--risk-low)' }}>$18,400</span> {/* Ver 2.0 Value: $18,400 USD */}
            <span className="metric-unit">USD</span>
          </div>
          <div className="metric-footer">
            <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>● AI 閉環自主調優完成</span>
          </div>
        </div>
      </div>

      {/* New Feature 03: Inventory Health Scores */}
      <div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px', paddingLeft: '4px' }}>
          📦 庫存健康度與防護看板 (Health Score Matrix)
        </div>
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {categoryHealth.map(item => (
            <div key={item.category} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.category}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>狀態：<span style={{ color: item.color, fontWeight: 700 }}>{item.status}</span></div>
              </div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" r="16" fill="none" stroke={item.color} strokeWidth="3" 
                    strokeDasharray={`${item.score} 100`} strokeDashoffset="0" transform="rotate(-90 18 18)" style={{ strokeLinecap: 'round' }}></circle>
                </svg>
                <span style={{ position: 'absolute', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{item.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="dashboard-grid-2x1">
        {/* Module 1: Inventory Control Tower Panel */}
        <div className="glass-card">
          <div className="card-header">
            <h2 className="card-title">
              <ShieldAlert size={20} style={{ color: '#6366f1' }} />
              即時庫存與動態安全水位監控
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={14} style={{ color: '#9ca3af' }} />
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      background: filterCategory === cat ? 'var(--color-primary)' : 'transparent',
                      border: 'none',
                      color: filterCategory === cat ? '#fff' : 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>物料料號 / 描述</th>
                  <th>分類</th>
                  <th>在庫庫存</th>
                  <th>安全庫存</th>
                  <th>動態安全庫存</th>
                  <th>前置交期</th>
                  <th>可用天數</th>
                  <th>風險等級</th>
                  <th>決策建議</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{item.partNumber}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{item.description}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-card-hover)', borderRadius: '4px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.quantity.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.safetyStock.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {item.dynamicSafetyStock.toLocaleString()} 
                      <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({item.dynamicSafetyStock > item.safetyStock ? `+${(item.dynamicSafetyStock - item.safetyStock)}` : `-${(item.safetyStock - item.dynamicSafetyStock)}`})
                      </span>
                    </td>
                    <td>{item.leadTime} 天</td>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{ color: item.inventoryDays <= 7 ? 'var(--risk-high)' : item.inventoryDays <= 15 ? 'var(--risk-medium)' : 'var(--text-primary)' }}>
                        {item.inventoryDays} 天
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.riskLevel === 'High' ? 'danger' : item.riskLevel === 'Medium' ? 'warning' : 'success'}`}>
                        {item.riskLevel === 'High' ? '高風險' : item.riskLevel === 'Medium' ? '中風險' : '安全'}
                      </span>
                    </td>
                    <td>
                      {item.riskLevel === 'High' && (
                        <button 
                          onClick={() => onTriggerScenario('scenario-1')}
                          style={{
                            background: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: 'var(--risk-high)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          替代料調度
                        </button>
                      )}
                      {item.riskLevel === 'Medium' && (
                        <button 
                          onClick={() => onTriggerScenario('scenario-2')}
                          style={{
                            background: 'rgba(251, 191, 36, 0.15)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: 'var(--risk-medium)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          跨庫存調撥
                        </button>
                      )}
                      {item.riskLevel === 'Low' && item.inventoryDays > 300 && (
                        <button 
                          onClick={() => onTriggerScenario('scenario-3')}
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#a5b4fc',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          呆滯料處置
                        </button>
                      )}
                      {item.riskLevel === 'Low' && item.inventoryDays <= 300 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>水位正常</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Value & Aging Distribution (Module 1, 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category Value Share Card */}
          <div className="glass-card" style={{ flexGrow: 1 }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h2 className="card-title">庫存類別金額佔比</h2>
            </div>
            
            {/* Custom SVG Donut Chart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div className="chart-container" style={{ width: '120px', height: '120px' }}>
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut-chart">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(0,0,0,0.04)" strokeWidth="4.5"></circle>
                  
                  {/* ICs: 75% (Indigo) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-primary)" strokeWidth="4.5" 
                    strokeDasharray="75 25" strokeDashoffset="25" className="donut-segment"></circle>
                  
                  {/* PCB: 15% (Cyan) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-secondary)" strokeWidth="4.5" 
                    strokeDasharray="15 85" strokeDashoffset="50" className="donut-segment"></circle>
                    
                  {/* Passives: 10% (Amber) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--risk-medium)" strokeWidth="4.5" 
                    strokeDasharray="10 90" strokeDashoffset="35" className="donut-segment"></circle>
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>$995K</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>總價值</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                    主控晶片 (IC)
                  </span>
                  <span style={{ fontWeight: 700 }}>75.2% ($748K)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)' }}></span>
                    電路板 (PCB)
                  </span>
                  <span style={{ fontWeight: 700 }}>15.0% ($149K)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-medium)' }}></span>
                    被動元件 (Passive)
                  </span>
                  <span style={{ fontWeight: 700 }}>9.8% ($98K)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Dead Stock Aging Analysis Card */}
          <div className="glass-card" style={{ flexGrow: 1 }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h2 className="card-title">呆滯物料庫齡結構比 (Dead Stock)</h2>
              <span className="badge warning" style={{ fontSize: '0.7rem' }}>優化中</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Progress 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  <span>90 ~ 180 天 (低度風險)</span>
                  <span style={{ fontWeight: 600 }}>0 PCS / $0 USD (已清空)</span>
                </div>
                <div className="custom-progress-bar">
                  <div className="custom-progress-fill low" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Progress 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  <span>180 ~ 365 天 (中度風險)</span>
                  <span style={{ fontWeight: 600, color: 'var(--risk-medium)' }}>150,000 PCS / $7,500 USD</span>
                </div>
                <div className="custom-progress-bar">
                  <div className="custom-progress-fill medium" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Progress 3 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  <span>365 天以上 (高度風險 - 氧化變質)</span>
                  <span style={{ fontWeight: 600, color: 'var(--risk-high)' }}>100,000 PCS / $5,000 USD</span>
                </div>
                <div className="custom-progress-bar">
                  <div className="custom-progress-fill high" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 4: Supplier Risk Dashboard */}
      <div className="glass-card">
        <div className="card-header">
          <h2 className="card-title">
            <BadgePercent size={20} style={{ color: '#06b6d4' }} />
            供應商交期與風險雷達 scoreboard
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>以 5 項關鍵維度 (OTD、交期、成本、ESG、財務) 計算綜合得分</span>
        </div>

        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>供應商名稱</th>
                <th>準時交貨率 (OTD %)</th>
                <th>平均前置交期 (Lead Time)</th>
                <th>價格成本指數</th>
                <th>ESG 評級</th>
                <th>綜合風險評分 (Risk Score)</th>
                <th>風險級別</th>
                <th>合約狀態</th>
              </tr>
            </thead>
            <tbody>
              {supplierPerformance.map(sup => (
                <tr key={sup.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sup.name}</td>
                  <td>
                    <span style={{ color: sup.otd < 80 ? 'var(--risk-high)' : sup.otd < 90 ? 'var(--risk-medium)' : 'var(--risk-low)' }}>
                      {sup.otd}%
                    </span>
                  </td>
                  <td>{sup.leadTime} 天</td>
                  <td>
                    <span style={{ color: sup.costIndex > 100 ? 'var(--risk-high)' : 'var(--text-primary)' }}>
                      {sup.costIndex}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{sup.esgScore} (良好)</td>
                  <td style={{ fontWeight: 700 }}>
                    <span style={{ color: sup.riskScore > 70 ? 'var(--risk-high)' : sup.riskScore > 40 ? 'var(--risk-medium)' : 'var(--risk-low)' }}>
                      {sup.riskScore} / 100
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sup.riskLevel === 'C' ? 'danger' : sup.riskLevel === 'B' ? 'warning' : 'success'}`}>
                      {sup.riskLevel} 級
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {sup.activeContracts} 個生效合約
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Feature 08: Weekly AI Report Modal */}
      {showWeeklyReport && (
        <div 
          className="action-report-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setShowWeeklyReport(false)}
        >
          <div 
            className="glass-card action-report-card" 
            style={{ width: '800px', border: '1.5px solid var(--border-focus)', background: '#FFFFFF', boxShadow: '0 12px 48px rgba(0,0,0,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <h2 className="card-title" style={{ gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} />
                AI 智慧自主分析週報 (Weekly AI Operational Report)
              </h2>
              <button 
                onClick={() => setShowWeeklyReport(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>報告產出日期：{weeklyAiReport.date}</span>
                <span className="badge success">自主閉環決策模式</span>
              </div>

              {/* Summary Section */}
              <div style={{ padding: '16px', background: 'rgba(123, 94, 69, 0.04)', border: '1px solid rgba(123, 94, 69, 0.15)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--risk-low)' }} />
                  本週產銷大綱
                </h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{weeklyAiReport.summary}</p>
              </div>

              {/* Anomalies Section */}
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px' }}>⚠️ 庫存異常根因分析 (Root Cause Analysis)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {weeklyAiReport.anomalies.map((anom, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '14px', 
                        background: '#FDFBF7', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '10px',
                        borderLeft: `4px solid ${anom.type === 'spikes' ? 'var(--risk-medium)' : 'var(--risk-high)'}` 
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{anom.title}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{anom.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Section */}
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '10px' }}>🎯 建議執行決策 (Proactive Recommendations)</h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {weeklyAiReport.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>方案 {idx + 1}：</strong>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowWeeklyReport(false)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
