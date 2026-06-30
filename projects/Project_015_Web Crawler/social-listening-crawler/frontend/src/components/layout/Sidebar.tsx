import { Grid, Search, MessageSquare, Upload, Settings, Clock, FileText, Bell, Sliders, AlertTriangle } from 'lucide-react';

interface SidebarProps { activeTab: string; onTabChange: (tab: string) => void; allowedTabs: string[]; }

const ALL_TABS = [
  { id: 'dashboard', label: '商譽風險戰情室', icon: Grid, roles: ['admin','manager','viewer'] },
  { id: 'incidents', label: '高風險商譽事件', icon: AlertTriangle, roles: ['admin','manager'] },
  { id: 'keywords', label: '監測品牌設定', icon: Search, roles: ['admin'] },
  { id: 'mentions', label: '風險訊號', icon: MessageSquare, roles: ['admin','manager','viewer'] },
  { id: 'import', label: 'CSV 匯入', icon: Upload, roles: ['admin'] },
  { id: 'reports', label: '每日商譽風險報告', icon: FileText, roles: ['admin','manager'] },
  { id: 'notifications', label: '通知中心', icon: Bell, roles: ['admin','manager','viewer'] },
  { id: 'scheduler', label: '排程管理', icon: Clock, roles: ['admin'] },
  { id: 'logs', label: '執行紀錄', icon: Settings, roles: ['admin','manager'] },
  { id: 'settings', label: '系統設定', icon: Sliders, roles: ['admin'] },
];

export default function Sidebar({ activeTab, onTabChange, allowedTabs }: SidebarProps) {
  const visibleTabs = ALL_TABS.filter(t => allowedTabs.includes(t.id));
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-4 px-3 space-y-1 flex-shrink-0">
      {visibleTabs.map(tab => {
        const Icon = tab.icon; const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive?'bg-brand-50 text-brand-700 shadow-sm':'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
            <Icon className={`h-5 w-5 ${isActive?'text-brand-600':'text-gray-400'}`} /><span>{tab.label}</span>
          </button>
        );
      })}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-3 text-xs">
          <span className="font-semibold text-gray-700 block mb-2">支援平台</span>
          <div className="flex flex-wrap gap-1">
            {['PTT','Dcard','Google Search','Google Maps','Facebook','TikTok','小紅書'].map(p=>(
              <span key={p} className="bg-white text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200 text-[10px]">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
