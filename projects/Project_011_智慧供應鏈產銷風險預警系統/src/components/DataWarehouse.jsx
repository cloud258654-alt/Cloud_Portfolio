import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, RefreshCw, Terminal, Play, CheckCircle, 
  Table, HardDrive, Key, ArrowRight 
} from 'lucide-react';
import { databaseTables } from '../data/mockData.js';

function DataWarehouse() {
  const [activeTable, setActiveTable] = useState('inventory_current');
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'info', text: 'AI Control Tower PostgreSQL Engine Initialized.' },
    { type: 'info', text: 'Database status: ACTIVE. Ready for queries.' }
  ]);
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const runRiskEngine = () => {
    if (isRunningEngine) return;
    
    setIsRunningEngine(true);
    setTerminalLogs([]);

    const logs = [
      { delay: 100, type: 'cmd', text: 'pg_engine --run-daily-risk-calculation' },
      { delay: 400, type: 'info', text: 'Connecting to PostgreSQL database warehouse at 10.1.25.4:5432/production...' },
      { delay: 800, type: 'success', text: 'Connection established. Active sessions: 4' },
      { delay: 1100, type: 'info', text: 'Executing query: SELECT * FROM inventory_current;' },
      { delay: 1400, type: 'info', text: 'Query complete. Found 5 active material records.' },
      { delay: 1700, type: 'info', text: 'Executing query: SELECT * FROM supplier_performance;' },
      { delay: 2000, type: 'info', text: 'Query complete. Found 5 vendor performance records.' },
      { delay: 2300, type: 'info', text: '------------------------------------------------------------' },
      { delay: 2500, type: 'info', text: '🚀 Starting Shortage Early Warning Engine...' },
      { delay: 2800, type: 'warning', text: '⚠️ [ANOMALY DETECTED] Part: STM32F103C8T6 | Qty: 200 | Days Remaining: 4' },
      { delay: 3000, type: 'error', text: '❌ [ALERT] Lead Time (45d) > Inventory Days (4d). Production line stoppage risk at T-4 days!' },
      { delay: 3300, type: 'warning', text: '⚠️ [ANOMALY DETECTED] Part: ESP32-WROOM-32D | Qty: 600 | Days Remaining: 12' },
      { delay: 3500, type: 'warning', text: '⚠️ [WARNING] Lead Time (30d) > Inventory Days (12d). Shortage risk at T-12 days.' },
      { delay: 3800, type: 'info', text: 'Executing cosine similarity query on contracts_rag_embeddings using pgvector...' },
      { delay: 4100, type: 'success', text: 'Vector search match: Section 4.3 in Contract-2026-TX (STMicroelectronics) - 1.5%/day delay penalty.' },
      { delay: 4300, type: 'success', text: 'Vector search match: Section 3.2 in Contract-2026-GD (GigaDevice) - 7-day urgent capacity reserve.' },
      { delay: 4600, type: 'info', text: 'Recalculating Supplier Risk scores...' },
      { delay: 4800, type: 'success', text: 'Risk Score updated: STMicroelectronics = 74 (Risk Level B)' },
      { delay: 5100, type: 'info', text: 'Writing analysis results back to data warehouse tables...' },
      { delay: 5400, type: 'success', text: 'UPDATE inventory_current SET risk_level = \'High\', last_update = NOW() WHERE part_id = \'part-01\';' },
      { delay: 5600, type: 'success', text: 'UPDATE inventory_current SET risk_level = \'Medium\', last_update = NOW() WHERE part_id = \'part-02\';' },
      { delay: 5900, type: 'info', text: 'Synchronizing BI Control Tower state...' },
      { delay: 6200, type: 'success', text: '✨ SUCCESS: Risk calculation completed. Database commit finalized.' },
      { delay: 6400, type: 'info', text: 'Ready.' }
    ];

    logs.forEach(log => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, { type: log.type, text: log.text }]);
        if (log.text.includes('SUCCESS')) {
          setIsRunningEngine(false);
        }
      }, log.delay);
    });
  };

  const getTableData = (tableName) => {
    return databaseTables[tableName];
  };

  const selectedTableData = getTableData(activeTable);

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div className="header-title-container">
          <h1 className="glow-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>資料倉儲暨核心引擎監控</h1>
          <p className="header-subtitle">PostgreSQL Data Warehouse Tables and Risk Engine Execution Log</p>
        </div>
      </div>

      <div className="dashboard-grid-2x1">
        {/* Left Column: PostgreSQL Table Explorer */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h2 className="card-title">
              <Table size={20} style={{ color: '#06b6d4' }} />
              PostgreSQL 資料庫表格總覽
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                Schema: public
              </span>
            </div>
          </div>

          {/* Table tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
            {Object.keys(databaseTables).map(tableName => (
              <button
                key={tableName}
                onClick={() => setActiveTable(tableName)}
                style={{
                  background: activeTable === tableName ? '#F4EFE7' : '#FFFFFF',
                  border: activeTable === tableName ? '1.5px solid var(--border-focus)' : '1px solid var(--border-light)',
                  color: activeTable === tableName ? 'var(--color-primary)' : 'var(--text-secondary)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: activeTable === tableName ? 700 : 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Database size={12} style={{ marginRight: '6px', display: 'inline' }} />
                {tableName}
              </button>
            ))}
          </div>

          {/* Grid View */}
          <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="premium-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  {selectedTableData.columns.map(col => (
                    <th key={col} style={{ background: '#F6F4EF', padding: '10px 12px', color: 'var(--text-secondary)' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedTableData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((val, cIdx) => (
                      <td key={cIdx} style={{ padding: '12px', fontFamily: typeof val === 'number' ? 'monospace' : 'inherit' }}>
                        {typeof val === 'string' && val.startsWith('[') ? (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{val}</span>
                        ) : typeof val === 'boolean' ? (
                          val ? 'TRUE' : 'FALSE'
                        ) : (
                          val.toString()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Engine Terminal Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Operations Panel */}
          <div className="glass-card">
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h2 className="card-title">風險預警運算引擎</h2>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              本系統之「缺料計算引擎」與「供應商風險評級模型」每日定期排程執行，重新穿透各模組表單，檢索合約向量資料庫，並將最新預警回寫至資料庫中。
            </p>

            <button 
              className="btn" 
              onClick={runRiskEngine}
              disabled={isRunningEngine}
              style={{
                width: '100%',
                justifyContent: 'center',
                background: isRunningEngine ? 'rgba(123, 94, 69, 0.2)' : 'var(--color-primary)',
                cursor: isRunningEngine ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={16} className={isRunningEngine ? 'pulsing' : ''} style={{ animation: isRunningEngine ? 'spin 2s linear infinite' : 'none' }} />
              {isRunningEngine ? '運算引擎執行中...' : '手動觸發風險預警計算'}
            </button>
          </div>

          {/* Terminal Console */}
          <div className="terminal-window" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
              </div>
              <div className="terminal-title">risk_engine_console.sh</div>
              <Terminal size={14} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="terminal-body" style={{ flexGrow: 1, maxHeight: '250px' }}>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={`terminal-line ${log.type}`}>
                  {log.type === 'cmd' && <span>{log.text}</span>}
                  {log.type === 'info' && <span>{log.text}</span>}
                  {log.type === 'success' && <span>[SUCCESS] {log.text}</span>}
                  {log.type === 'warning' && <span>[WARNING] {log.text}</span>}
                  {log.type === 'error' && <span>[CRITICAL] {log.text}</span>}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DataWarehouse;
