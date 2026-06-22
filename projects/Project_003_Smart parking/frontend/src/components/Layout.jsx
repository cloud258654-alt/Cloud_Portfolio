import { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { api, setToken, getToken } from '../utils/api';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

const menuItems = [
  { path: '/dashboard', label: '即時看板', icon: '📊' },
  { path: '/entry', label: '車輛進場', icon: '🚗' },
  { path: '/exit', label: '車輛出場', icon: '🚙' },
  { path: '/records', label: '停車紀錄', icon: '📋' },
  { path: '/monthly', label: '月租車管理', icon: '📅' },
  { path: '/blacklist', label: '黑名單管理', icon: '🚫' },
  { path: '/rates', label: '費率設定', icon: '💰' },
  { path: '/reports', label: '報表分析', icon: '📈' },
  { path: '/settings', label: '系統設定', icon: '⚙️' },
];

export default function Layout() {
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    api.getMe().then(setUser).catch(() => {
      setToken(null);
      navigate('/login');
    });
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <ToastContext.Provider value={showToast}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-primary-900 text-white transition-all duration-300 flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 border-b border-primary-700">
            {sidebarOpen && (
              <h1 className="text-lg font-bold whitespace-nowrap">停車場管理系統</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:text-gray-300 p-1"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-primary-700">
            {sidebarOpen && (
              <div className="text-sm text-gray-300 mb-2">
                {user?.username}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white w-full"
            >
              <span className="text-xl">🚪</span>
              {sidebarOpen && <span className="ml-2">登出</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find((m) => m.path === location.pathname)?.label || '停車場管理'}
            </h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </div>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
