import { useState } from 'react';
import { CwaDashboardPage } from './pages/CwaDashboardPage';
import { WindyForecastPage } from './pages/WindyForecastPage';
import { CloudSun, Wind } from 'lucide-react';

type ViewMode = 'cwa' | 'windy';

function App() {
  const [activeView, setActiveView] = useState<ViewMode>('cwa');

  return (
    <div className="app-container">
      {/* Shared Sidebar View Selector */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⛈️</span>
            <h1>Weather Radar</h1>
          </div>
          <p className="subtitle">Taiwan Weather Data Hub</p>
        </header>

        {/* Navigation Router Triggers */}
        <nav className="nav-group">
          <h3 className="nav-title">Weather Views</h3>
          <ul className="nav-list">
            <li 
              className={`nav-item ${activeView === 'cwa' ? 'active' : ''}`}
              onClick={() => setActiveView('cwa')}
            >
              <CloudSun size={16} />
              <span>Official Weather (CWA)</span>
            </li>
            
            <li 
              className={`nav-item ${activeView === 'windy' ? 'active' : ''}`}
              onClick={() => setActiveView('windy')}
            >
              <Wind size={16} />
              <span>Windy Forecast</span>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer details */}
        <footer className="sidebar-footer" style={{ borderTop: 'none', marginTop: '0' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', padding: '0 8px' }}>
            Toggle views to switch between historical observations (CWA) and visual projection models (Windy).
          </p>
        </footer>
      </aside>

      {/* Main View Container */}
      <main style={{ flexGrow: 1, position: 'relative', height: '100vh', display: 'flex' }}>
        {activeView === 'cwa' ? (
          <CwaDashboardPage />
        ) : (
          <WindyForecastPage />
        )}
      </main>
    </div>
  );
}

export default App;
