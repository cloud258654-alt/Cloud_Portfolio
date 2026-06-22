import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Entry from './pages/Entry';
import Exit from './pages/Exit';
import Records from './pages/Records';
import Monthly from './pages/Monthly';
import Blacklist from './pages/Blacklist';
import Rates from './pages/Rates';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/exit" element={<Exit />} />
          <Route path="/records" element={<Records />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/blacklist" element={<Blacklist />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
