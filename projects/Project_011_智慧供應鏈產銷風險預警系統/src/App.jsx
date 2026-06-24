import React, { useState } from 'react';
import { 
  LayoutDashboard, Bot, FileText, Database, ShieldAlert, 
  Sparkles, Globe, Network, Flame, Cpu 
} from 'lucide-react';
import Dashboard from './components/Dashboard.jsx';
import AgentRoom from './components/AgentRoom.jsx';
import KnowledgeBase from './components/KnowledgeBase.jsx';
import DataWarehouse from './components/DataWarehouse.jsx';
import Copilot from './components/Copilot.jsx';
import GlobalRiskRadar from './components/GlobalRiskRadar.jsx';
import SupplierGraph from './components/SupplierGraph.jsx';
import WarRoom from './components/WarRoom.jsx';
import AgentHub from './components/AgentHub.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preselectedScenario, setPreselectedScenario] = useState(null);

  const navigateToAgentWithScenario = (scenarioId) => {
    setPreselectedScenario(scenarioId);
    setActiveTab('agents');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldAlert size={28} style={{ color: 'var(--color-primary)' }} />
          <span className="sidebar-logo-text">AI BRAIN TOWER</span>
        </div>
        
        <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingBottom: '20px' }}>
          <div 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>BI 戰情室</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Globe size={18} />
            <span>全球風險雷達</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <Network size={18} />
            <span>供應網拓撲</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'warroom' ? 'active' : ''}`}
            onClick={() => setActiveTab('warroom')}
          >
            <Flame size={18} />
            <span>AI 風險戰情室</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('agents');
            }}
          >
            <Bot size={18} />
            <span>AI 決策室</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'agenthub' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenthub')}
          >
            <Cpu size={18} />
            <span>AI 員工中心</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <Sparkles size={18} />
            <span>AI Copilot 助理</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            <FileText size={18} />
            <span>RAG 知識庫</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={18} />
            <span>資料倉儲監控</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-title">企業決策大腦狀態</span>
          <div className="sidebar-footer-status">
            <span className="status-dot pulsing"></span>
            <span>決策模式: AUTONOMOUS (閉環)</span>
          </div>
          <div className="sidebar-footer-status">
            <span className="status-dot pulsing"></span>
            <span>AI 員工數量: 7位 (正常)</span>
          </div>
          {/* Ver 2.1 Calm Tech Wood Shelf Decor */}
          <div className="japanese-wood-shelf-decor"></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard onTriggerScenario={navigateToAgentWithScenario} />
        )}
        {activeTab === 'radar' && (
          <GlobalRiskRadar />
        )}
        {activeTab === 'graph' && (
          <SupplierGraph />
        )}
        {activeTab === 'warroom' && (
          <WarRoom />
        )}
        {activeTab === 'agents' && (
          <AgentRoom 
            preselectedScenarioId={preselectedScenario} 
            clearPreselected={() => setPreselectedScenario(null)} 
          />
        )}
        {activeTab === 'agenthub' && (
          <AgentHub />
        )}
        {activeTab === 'copilot' && (
          <Copilot />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgeBase />
        )}
        {activeTab === 'database' && (
          <DataWarehouse />
        )}
      </main>
      {/* Ver 2.1 Calm Tech Pampas Grass Decor */}
      <div className="japanese-pampas-decor"></div>
    </div>
  );
}

export default App;
