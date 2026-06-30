import { useState, useCallback, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import KeywordsPage from './pages/KeywordsPage';
import MentionsPage from './pages/MentionsPage';
import ImportPage from './pages/ImportPage';
import IncidentsPage from './pages/IncidentsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SchedulerPage from './pages/SchedulerPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './components/auth/useAuth';
import { postCrawlRun } from './api/keywords';
import { logout as apiLogout } from './api/auth';

const ROLE_TABS: Record<string, string[]> = {
  admin: ['dashboard', 'keywords', 'mentions', 'incidents', 'import', 'reports', 'notifications', 'scheduler', 'logs', 'settings'],
  manager: ['dashboard', 'mentions', 'incidents', 'reports', 'notifications', 'logs'],
  viewer: ['dashboard', 'mentions'],
};

export default function App() {
  const { user, loading, login, logout, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlMsg, setCrawlMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerCrawl = useCallback(async () => {
    setIsCrawling(true); setCrawlMsg('風險掃描中...');
    try { await postCrawlRun(); setCrawlMsg('風險掃描已啟動！'); setTimeout(() => { setCrawlMsg(''); setRefreshKey(k => k + 1); }, 3000); }
    catch { setCrawlMsg('掃描失敗，請確認後端服務是否運行中。'); }
    finally { setTimeout(() => setIsCrawling(false), 1500); }
  }, []);

  const handleLogout = useCallback(() => { apiLogout(); logout(); }, [logout]);

  const allowedTabs = useMemo(() => user ? (ROLE_TABS[user.role] || ROLE_TABS.viewer) : [], [user]);

  useEffect(() => {
    if (user && allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [user, activeTab, allowedTabs]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  if (!user) return <LoginPage onLogin={login} />;

  const render = () => {
    const k = `${activeTab}-${refreshKey}`;
    switch (activeTab) {
      case 'dashboard': return <DashboardPage key={k} />;
      case 'keywords': return hasRole('admin') ? <KeywordsPage key={k} /> : <Unauthorized />;
      case 'mentions': return <MentionsPage key={k} />;
      case 'incidents': return <IncidentsPage key={k} />;
      case 'import': return hasRole('admin') ? <ImportPage key={k} /> : <Unauthorized />;
      case 'reports': return hasRole('manager') ? <ReportsPage key={k} /> : <Unauthorized />;
      case 'notifications': return <NotificationsPage key={k} />;
      case 'scheduler': return hasRole('admin') ? <SchedulerPage key={k} /> : <Unauthorized />;
      case 'logs': return <LogsPage key={k} />;
      case 'settings': return hasRole('admin') ? <SettingsPage key={k} /> : <Unauthorized />;
      default: return <DashboardPage key={k} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Header isCrawling={isCrawling} onTriggerCrawl={triggerCrawl} user={user} onLogout={handleLogout} />
      {crawlMsg && (
        <div className={`px-6 py-2 text-sm text-center font-medium ${crawlMsg.includes('失敗')?'bg-red-50 text-red-600 border-b border-red-200':'bg-brand-50 text-brand-700 border-b border-brand-100'}`}>
          {crawlMsg}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} allowedTabs={allowedTabs} />
        <main className="flex-1 overflow-y-auto p-6">{render()}</main>
      </div>
    </div>
  );
}

function Unauthorized() { return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">您沒有權限存取此頁面</div>; }
