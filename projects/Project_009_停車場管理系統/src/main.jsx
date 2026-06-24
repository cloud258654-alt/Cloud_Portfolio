import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Camera,
  CarFront,
  DoorOpen,
  Download,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ParkingCircle,
  QrCode,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Users
} from 'lucide-react';
import './styles.css';

const vehicleTypes = [
  { value: 'TEMPORARY', label: '臨停' },
  { value: 'MONTHLY', label: '月租' },
  { value: 'VIP', label: 'VIP' }
];

const labels = {
  IN_PARKING: '場內',
  COMPLETED: '已出場',
  ACTIVE: '啟用',
  INACTIVE: '停用',
  OPEN: '未處理',
  RESOLVED: '已處理',
  RESERVED: '已預約',
  USED: '已使用',
  CANCELLED: '已取消',
  SUCCESS: '成功',
  FAILED: '失敗'
};

const tabs = [
  { id: 'dashboard', label: '營運總覽', icon: LayoutDashboard },
  { id: 'operations', label: '進出場工作台', icon: CarFront },
  { id: 'qr', label: 'QR 繳費', icon: QrCode },
  { id: 'reports', label: '收入報表', icon: BarChart3 },
  { id: 'monthly', label: '月租續約', icon: Users },
  { id: 'lpr', label: 'LPR 監控', icon: Camera },
  { id: 'reservations', label: '預約停車', icon: CalendarClock },
  { id: 'discounts', label: '優惠折抵', icon: Tag },
  { id: 'blacklist', label: '黑名單', icon: ShieldAlert },
  { id: 'exceptions', label: '異常中心', icon: ListChecks },
  { id: 'rates', label: '費率設定', icon: Settings }
];

const I18nContext = React.createContext(null);

const translations = {
  zh: {
    appName: '停車場收費管理系統',
    loginSubtitle: '管理後台登入',
    username: '帳號',
    password: '密碼',
    login: '登入',
    loggingIn: '登入中...',
    sidebarSubtitle: '收費管理',
    topbarEyebrow: '停車場營運後台',
    logout: '登出',
    language: '語言',
    dashboard: {
      eyebrow: 'Real-time Operations',
      title: '今日營運總覽',
      description: '即時掌握車位、收款、異常與進出場狀態。',
      availableSpaces: '可用車位',
      capacity: '總車位',
      entries: '今日進場',
      exits: '今日出場',
      revenue: '今日收入',
      exceptions: '待處理異常',
      monthlyExpiring: '7天內月租到期',
      sevenDayRevenue: '近 7 日收入',
      latestPayments: '最近付款',
      activeRecords: '場內車輛',
      recentRecords: '最近停車紀錄',
      noActiveRecords: '目前沒有車輛在場內',
      noRecords: '尚無紀錄'
    },
    table: {
      time: '時間',
      plate: '車牌',
      received: '實收',
      discount: '折抵',
      method: '方式',
      type: '類型',
      entryTime: '進場時間',
      exitTime: '出場時間',
      status: '狀態',
      fee: '費用'
    },
    vehicleTypes: {
      TEMPORARY: '臨停',
      MONTHLY: '月租',
      VIP: 'VIP'
    },
    labels: {
      IN_PARKING: '場內',
      COMPLETED: '已出場',
      ACTIVE: '啟用',
      INACTIVE: '停用',
      OPEN: '待處理',
      RESOLVED: '已處理',
      RESERVED: '已預約',
      USED: '已使用',
      CANCELLED: '已取消',
      SUCCESS: '成功',
      FAILED: '失敗'
    },
    tabs: {
      dashboard: '營運總覽',
      operations: '進出場工作台',
      qr: 'QR 繳費',
      reports: '收入報表',
      monthly: '月租續約',
      lpr: 'LPR 模擬',
      reservations: '預約管理',
      discounts: '優惠折抵',
      blacklist: '黑名單',
      exceptions: '異常中心',
      rates: '費率設定'
    },
    empty: '目前沒有資料',
    loading: '載入中...'
  },
  en: {
    appName: 'Parking Fee Management System',
    loginSubtitle: 'Admin Console',
    username: 'Username',
    password: 'Password',
    login: 'Sign In',
    loggingIn: 'Signing in...',
    sidebarSubtitle: 'Parking Management',
    topbarEyebrow: 'Parking Operations Console',
    logout: 'Sign Out',
    language: 'Language',
    dashboard: {
      eyebrow: 'Real-time Operations',
      title: 'Today at a Glance',
      description: 'Monitor spaces, payments, exceptions, entries, and exits in real time.',
      availableSpaces: 'Available Spaces',
      capacity: 'Capacity',
      entries: 'Entries Today',
      exits: 'Exits Today',
      revenue: 'Revenue Today',
      exceptions: 'Open Exceptions',
      monthlyExpiring: 'Passes Expiring in 7 Days',
      sevenDayRevenue: 'Last 7 Days Revenue',
      latestPayments: 'Latest Payments',
      activeRecords: 'Vehicles On Site',
      recentRecords: 'Recent Parking Records',
      noActiveRecords: 'No vehicles are currently parked',
      noRecords: 'No records yet'
    },
    table: {
      time: 'Time',
      plate: 'Plate',
      received: 'Received',
      discount: 'Discount',
      method: 'Method',
      type: 'Type',
      entryTime: 'Entry Time',
      exitTime: 'Exit Time',
      status: 'Status',
      fee: 'Fee'
    },
    vehicleTypes: {
      TEMPORARY: 'Temporary',
      MONTHLY: 'Monthly',
      VIP: 'VIP'
    },
    labels: {
      IN_PARKING: 'In Parking',
      COMPLETED: 'Completed',
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      OPEN: 'Open',
      RESOLVED: 'Resolved',
      RESERVED: 'Reserved',
      USED: 'Used',
      CANCELLED: 'Cancelled',
      SUCCESS: 'Success',
      FAILED: 'Failed'
    },
    tabs: {
      dashboard: 'Dashboard',
      operations: 'Entry / Exit',
      qr: 'QR Payment',
      reports: 'Revenue Reports',
      monthly: 'Monthly Passes',
      lpr: 'LPR Simulator',
      reservations: 'Reservations',
      discounts: 'Discounts',
      blacklist: 'Blacklist',
      exceptions: 'Exceptions',
      rates: 'Rate Settings'
    },
    empty: 'No data',
    loading: 'Loading...'
  }
};

function useI18n() {
  return React.useContext(I18nContext) || translations.zh;
}

function vehicleTypeOptions(t) {
  return vehicleTypes.map((type) => ({
    ...type,
    label: t.vehicleTypes[type.value] || type.label
  }));
}

function localizeRecord(record, t) {
  return {
    ...record,
    vehicleTypeLabel: t.vehicleTypes[record.vehicleType] || record.vehicleTypeLabel || record.vehicleType
  };
}

function localizeRecords(records, t) {
  return (records || []).map((record) => localizeRecord(record, t));
}

function LanguageSwitch({ lang, onChange }) {
  const t = translations[lang] || translations.zh;
  return (
    <label className="language-switch">
      <span>{t.language}</span>
      <select value={lang} onChange={(event) => onChange(event.target.value)}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}

function App() {
  const search = new URLSearchParams(window.location.search);
  const payPlate = search.get('payPlate');
  const [lang, setLangState] = useState(localStorage.getItem('parking-lang') || 'zh');
  const t = translations[lang] || translations.zh;

  function setLang(value) {
    const next = value === 'en' ? 'en' : 'zh';
    localStorage.setItem('parking-lang', next);
    setLangState(next);
  }

  if (payPlate) {
    return (
      <I18nContext.Provider value={t}>
        <PublicPaymentPage plateNumber={payPlate} lang={lang} onLanguageChange={setLang} />
      </I18nContext.Provider>
    );
  }

  const [token, setToken] = useState(localStorage.getItem('parking-token') || '');
  const [admin, setAdmin] = useState(null);
  const api = useMemo(() => createApi(token), [token]);

  if (!token) return (
    <I18nContext.Provider value={t}>
      <LoginPage
        lang={lang}
        onLanguageChange={setLang}
        onLogin={(data) => {
          localStorage.setItem('parking-token', data.token);
          setToken(data.token);
          setAdmin(data.admin);
        }}
      />
    </I18nContext.Provider>
  );

  return (
    <I18nContext.Provider value={t}>
      <Dashboard
        api={api}
        admin={admin}
        lang={lang}
        onLanguageChange={setLang}
        onLogout={() => {
          localStorage.removeItem('parking-token');
          setToken('');
          setAdmin(null);
        }}
      />
    </I18nContext.Provider>
  );
}

function LoginPage({ lang, onLanguageChange, onLogin }) {
  const t = useI18n();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      onLogin(await request('/api/login', { method: 'POST', body: form }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-lockup">
          <div className="brand-mark"><ParkingCircle size={28} /></div>
          <div>
            <h1>{t.appName}</h1>
            <p>{t.loginSubtitle}</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <Field label={t.username}><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label={t.password}><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          {message && <p className="notice error">{message}</p>}
          <button disabled={loading} className="primary-button w-full mt-5">{loading ? t.loggingIn : t.login}</button>
        </form>
        <div className="login-language">
          <LanguageSwitch lang={lang} onChange={onLanguageChange} />
        </div>
      </section>
    </main>
  );
}

function Dashboard({ api, admin, lang, onLanguageChange, onLogout }) {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const [dashboardData, recordData] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/records')
      ]);
      setDashboard(dashboardData);
      setRecords(recordData);
    } catch (error) {
      showNotice('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function showNotice(type, text) {
    setNotice({ type, text });
  }

  const localizedTabs = tabs.map((item) => ({ ...item, label: t.tabs[item.id] || item.label }));
  const tab = localizedTabs.find((item) => item.id === activeTab) || localizedTabs[0];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><ParkingCircle size={24} /></div>
          <div>
            <strong>Parking OS</strong>
            <span>{t.sidebarSubtitle}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {localizedTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={activeTab === item.id ? 'active' : ''}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t.topbarEyebrow}</p>
            <h1>{tab.label}</h1>
          </div>
          <div className="topbar-actions">
            <LanguageSwitch lang={lang} onChange={onLanguageChange} />
            <span className="admin-chip">{admin?.username || 'admin'}</span>
            <button onClick={onLogout} className="ghost-button"><LogOut size={18} />{t.logout}</button>
          </div>
        </header>

        <div className="content-area">
          {notice && <p className={`notice ${notice.type}`}>{notice.text}</p>}
          {activeTab === 'dashboard' && <DashboardHome dashboard={dashboard} records={records} loading={loading} />}
          {activeTab === 'operations' && <OperationsWorkbench api={api} dashboard={dashboard} records={records} onDone={refresh} onNotice={showNotice} />}
          {activeTab === 'qr' && <QrPaymentTab />}
          {activeTab === 'reports' && <ReportsTab api={api} onNotice={showNotice} />}
          {activeTab === 'monthly' && <MonthlyCarsTab api={api} onNotice={showNotice} />}
          {activeTab === 'lpr' && <LprTab api={api} onDone={refresh} onNotice={showNotice} />}
          {activeTab === 'reservations' && <ReservationsTab api={api} onNotice={showNotice} />}
          {activeTab === 'discounts' && <DiscountsTab api={api} onNotice={showNotice} />}
          {activeTab === 'blacklist' && <BlacklistTab api={api} onNotice={showNotice} />}
          {activeTab === 'exceptions' && <ExceptionsTab api={api} onNotice={showNotice} />}
          {activeTab === 'rates' && <RatesTab api={api} onNotice={showNotice} />}
        </div>
      </section>
    </main>
  );
}

function DashboardHome({ dashboard, records, loading }) {
  const t = useI18n();
  const stats = dashboard?.stats || {};
  return (
    <section className="space-y-6">
      <div className="hero-dashboard">
        <div>
          <p className="eyebrow">{t.dashboard.eyebrow}</p>
          <h2>{t.dashboard.title}</h2>
          <p>{t.dashboard.description}</p>
        </div>
        <div className="occupancy-ring">
          <strong>{stats.available ?? 0}</strong>
          <span>{t.dashboard.availableSpaces}</span>
        </div>
      </div>
      <section className="stat-grid">
        <StatCard icon={<ParkingCircle />} label={t.dashboard.capacity} value={stats.capacity || 0} />
        <StatCard icon={<CarFront />} label={t.dashboard.entries} value={stats.todayEntries || 0} />
        <StatCard icon={<DoorOpen />} label={t.dashboard.exits} value={stats.todayExits || 0} />
        <StatCard icon={<ReceiptText />} label={t.dashboard.revenue} value={money(stats.todayRevenue || 0)} />
        <StatCard icon={<AlertTriangle />} label={t.dashboard.exceptions} value={stats.openExceptions || 0} tone="danger" />
        <StatCard icon={<Users />} label={t.dashboard.monthlyExpiring} value={stats.monthlyExpiring || 0} tone="warn" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title={t.dashboard.sevenDayRevenue} data={dashboard?.revenueTrend || []} />
        <SimpleTable
          title={t.dashboard.latestPayments}
          headers={[t.table.time, t.table.plate, t.table.received, t.table.discount, t.table.method]}
          rows={(dashboard?.latestPayments || []).map((item) => [
            formatTime(item.paidAt), item.plateNumber, money(item.amount), money(item.discountAmount || 0), item.paymentMethod
          ])}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RecordTable title={t.dashboard.activeRecords} loading={loading} records={localizeRecords(dashboard?.activeRecords, t)} emptyText={t.dashboard.noActiveRecords} />
        <RecordTable title={t.dashboard.recentRecords} loading={loading} records={localizeRecords(records.slice(0, 8), t)} emptyText={t.dashboard.noRecords} />
      </section>
    </section>
  );
}

function OperationsWorkbench({ api, dashboard, records, onDone, onNotice }) {
  return (
    <section className="space-y-6">
      <section className="workbench-grid">
        <EntryPanel api={api} onDone={onDone} onNotice={onNotice} />
        <ExitPanel api={api} onDone={onDone} onNotice={onNotice} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RecordTable title="目前場內車輛" records={dashboard?.activeRecords || []} emptyText="目前沒有車輛在場內" />
        <RecordTable title="最近停車紀錄" records={records} emptyText="尚無停車紀錄" />
      </section>
    </section>
  );
}

function EntryPanel({ api, onDone, onNotice }) {
  const t = useI18n();
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('TEMPORARY');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await api.post('/api/entry', { plateNumber, vehicleType });
      setResult({ type: 'success', title: data.message, text: `${data.record.plateNumber} 已進場，剩餘 ${data.available} 格` });
      setPlateNumber('');
      await onDone();
    } catch (error) {
      setResult({ type: 'error', title: '無法進場', text: error.message });
      onNotice('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="work-card">
      <PanelTitle icon={<CarFront />} title="入口操作" />
      <form onSubmit={submit}>
        <Field label="車牌號碼"><input className="plate-input" placeholder="ABC-1234" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} /></Field>
        <Field label="車輛類型"><select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>{vehicleTypeOptions(t).map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
        <button disabled={loading} className="primary-button mt-5 w-full">{loading ? '處理中...' : '確認進場'}</button>
      </form>
      {result && <ResultPanel {...result} />}
    </section>
  );
}

function ExitPanel({ api, onDone, onNotice }) {
  const [plateNumber, setPlateNumber] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  async function quoteFee(event) {
    event.preventDefault();
    setLoading(true);
    setQuote(null);
    setReceipt(null);
    try {
      setQuote(await api.post('/api/exit/quote', { plateNumber, discountCode }));
    } catch (error) {
      onNotice('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function pay() {
    setLoading(true);
    try {
      const result = await api.post('/api/exit/pay', { plateNumber, discountCode, paymentMethod: 'SIMULATED' });
      setReceipt(result);
      setQuote(null);
      setPlateNumber('');
      setDiscountCode('');
      await onDone();
    } catch (error) {
      onNotice('error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="work-card">
      <PanelTitle icon={<ReceiptText />} title="出口收費" />
      <form onSubmit={quoteFee}>
        <Field label="車牌號碼"><input className="plate-input" placeholder="ABC-1234" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} /></Field>
        <Field label="優惠碼"><input placeholder="可留空" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} /></Field>
        <button disabled={loading} className="secondary-button mt-5 w-full">{loading ? '查詢中...' : '查詢並試算'}</button>
      </form>
      {quote && <QuoteCard quote={quote} onPay={pay} loading={loading} />}
      {receipt && <ReceiptCard result={receipt} />}
    </section>
  );
}

function QuoteCard({ quote, onPay, loading }) {
  return (
    <div className="quote-card">
      <div>
        <span className="status-badge success">可結帳</span>
        <h3>{money(quote.quote.fee)}</h3>
        <p>{quote.record.plateNumber} · {quote.record.vehicleTypeLabel}</p>
      </div>
      <div className="quote-grid">
        <span>停車分鐘 <b>{quote.quote.minutes}</b></span>
        <span>原始金額 <b>{money(quote.quote.originalFee ?? quote.quote.fee)}</b></span>
        <span>優惠折抵 <b>{money(quote.quote.discountAmount || 0)}</b></span>
        <span>優惠碼 <b>{quote.quote.discountCode || '-'}</b></span>
      </div>
      {onPay && <button disabled={loading} onClick={onPay} className="primary-button w-full">付款並開啟出口柵欄</button>}
    </div>
  );
}

function ReceiptCard({ result }) {
  return (
    <div className="receipt-card">
      <ShieldCheck size={22} />
      <div>
        <strong>{result.message}</strong>
        <p>收據 #{result.payment.id} · {result.record.plateNumber} · 實收 {money(result.payment.amount)}</p>
      </div>
    </div>
  );
}

function PublicPaymentPage({ plateNumber }) {
  const [discountCode, setDiscountCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const plate = plateNumber.trim().toUpperCase();

  async function load(event) {
    event?.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const query = discountCode ? `?discountCode=${encodeURIComponent(discountCode)}` : '';
      setQuote(await request(`/api/public/pay/${encodeURIComponent(plate)}/quote${query}`));
    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function pay() {
    setLoading(true);
    try {
      const result = await request('/api/public/pay', { method: 'POST', body: { plateNumber: plate, discountCode } });
      setMessageType('success');
      setMessage(`${result.record.plateNumber} ${result.message}，請於 10 分鐘內離場。收據 #${result.payment.id}`);
      setQuote(null);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [plate]);

  return (
    <main className="mobile-pay-shell">
      <section className="mobile-pay-card">
        <div className="mobile-plate">{plate}</div>
        <p className="eyebrow">停車費線上繳費</p>
        {message && <p className={`notice ${messageType}`}>{message}</p>}
        <form onSubmit={load} className="discount-row">
          <input placeholder="優惠碼" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} />
          <button className="secondary-button">套用</button>
        </form>
        {loading && <p className="empty-state">查詢中...</p>}
        {quote && <QuoteCard quote={quote} onPay={pay} loading={loading} />}
      </section>
    </main>
  );
}

function ReportsTab({ api, onNotice }) {
  const [filters, setFilters] = useState({ from: today(), to: today(), plateNumber: '' });
  const [payments, setPayments] = useState([]);
  const [report, setReport] = useState(null);

  async function load(event) {
    event?.preventDefault();
    try {
      const query = toQuery(filters);
      const [paymentData, reportData] = await Promise.all([
        api.get(`/api/payments?${query}`),
        api.get(`/api/reports/revenue?${query}`)
      ]);
      setPayments(paymentData);
      setReport(reportData);
    } catch (error) {
      onNotice('error', error.message);
    }
  }

  useEffect(() => { load(); }, []);

  function exportCsv() {
    const rows = [
      ['付款時間', '車牌', '原金額', '折抵', '實收', '優惠碼', '付款方式', '狀態'],
      ...payments.map((item) => [
        item.paidAt,
        item.plateNumber,
        item.originalAmount || item.amount,
        item.discountAmount || 0,
        item.amount,
        item.discountCode || '',
        item.paymentMethod,
        item.status
      ])
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payments.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <FilterBar filters={filters} setFilters={setFilters} onSubmit={load} action={<button type="button" onClick={exportCsv} className="ghost-button"><Download size={16} />匯出 CSV</button>} />
      <section className="stat-grid compact">
        <StatCard icon={<ReceiptText />} label="收入合計" value={money(report?.total || 0)} />
        <StatCard icon={<ListChecks />} label="付款筆數" value={report?.count || 0} />
        <StatCard icon={<BarChart3 />} label="平均金額" value={money(report?.average || 0)} />
      </section>
      <ChartCard title="區間收入圖" data={Object.entries(report?.byDate || {}).map(([date, amount]) => ({ date, amount }))} />
      <SimpleTable
        title="付款紀錄"
        headers={['付款時間', '車牌', '原金額', '折抵', '實收', '優惠碼', '付款方式']}
        rows={payments.map((item) => [
          formatTime(item.paidAt), item.plateNumber, money(item.originalAmount || item.amount), money(item.discountAmount || 0), money(item.amount), item.discountCode || '-', item.paymentMethod
        ])}
      />
    </section>
  );
}

function MonthlyCarsTab({ api, onNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', ownerName: '', phone: '', startDate: today(), endDate: today() });

  async function load() { setItems(await api.get('/api/monthly-cars')); }
  useEffect(() => { load().catch((error) => onNotice('error', error.message)); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/api/monthly-cars', form);
      setForm({ plateNumber: '', ownerName: '', phone: '', startDate: today(), endDate: today() });
      onNotice('success', '月租車資料已儲存');
      await load();
    } catch (error) { onNotice('error', error.message); }
  }

  async function toggle(item) {
    await api.patch(`/api/monthly-cars/${item.id}`, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    await load();
  }

  async function renew(item) {
    await api.post(`/api/monthly-cars/${item.id}/renew`, { months: 1 });
    onNotice('success', `${item.plateNumber} 已續約 1 個月`);
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <FormCard title="新增月租車" icon={<Users />}>
        <form onSubmit={submit}>
          <Field label="車牌號碼"><input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} /></Field>
          <Field label="車主姓名"><input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></Field>
          <Field label="電話"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="開始日期"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="結束日期"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <button className="primary-button mt-5 w-full">儲存月租車</button>
        </form>
      </FormCard>
      <SimpleTable
        title="月租車清單"
        headers={['車牌', '車主', '電話', '有效期間', '提醒', '狀態', '操作']}
        rows={items.map((item) => [
          item.plateNumber,
          item.ownerName,
          item.phone,
          `${item.startDate} ~ ${item.endDate}`,
          <ExpiryBadge date={item.endDate} />,
          <Badge value={item.status} />,
          <div className="row-actions"><button className="ghost-button" onClick={() => renew(item)}>續約1月</button><button className="ghost-button" onClick={() => toggle(item)}>{item.status === 'ACTIVE' ? '停用' : '啟用'}</button></div>
        ])}
      />
    </section>
  );
}

function LprTab({ api, onDone, onNotice }) {
  const t = useI18n();
  const [form, setForm] = useState({ plateNumber: '', direction: 'ENTRY', vehicleType: 'TEMPORARY', confidence: 96 });
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);

  async function load() { setScans(await api.get('/api/lpr/scans')); }
  useEffect(() => { load().catch((error) => onNotice('error', error.message)); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      const data = await api.post('/api/lpr/scan', form);
      setResult(data);
      onNotice('success', form.direction === 'ENTRY' ? '入口辨識完成' : '出口辨識完成');
      await Promise.all([load(), onDone()]);
    } catch (error) {
      onNotice('error', error.message);
      await load();
    }
  }

  return (
    <section className="space-y-6">
      <section className="camera-grid">
        <CameraPanel title="入口攝影機" active={form.direction === 'ENTRY'} />
        <CameraPanel title="出口攝影機" active={form.direction === 'EXIT'} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <FormCard title="模擬辨識" icon={<Camera />}>
          <form onSubmit={submit}>
            <Field label="辨識車牌"><input className="plate-input" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} /></Field>
            <Field label="方向"><select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}><option value="ENTRY">入口</option><option value="EXIT">出口</option></select></Field>
            <Field label="車輛類型"><select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>{vehicleTypeOptions(t).map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
            <Field label={`辨識信心 ${form.confidence}%`}><input type="range" min="70" max="99" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} /></Field>
            <button className="primary-button mt-5 w-full">送出辨識</button>
          </form>
        </FormCard>
        <div className="space-y-6">
          {result && <ResultPanel type="success" title={`${result.recognizedPlate} · ${result.confidence}%`} text={result.message || `應收 ${money(result.quote?.fee || 0)}`} />}
          <SimpleTable
            title="最近 50 筆辨識"
            headers={['時間', '車牌', '方向', '信心', '結果', '訊息']}
            rows={scans.map((item) => [formatTime(item.createdAt), item.plateNumber, item.direction, `${item.confidence}%`, <Badge value={item.resultStatus} />, item.message])}
          />
        </div>
      </section>
    </section>
  );
}

function ReservationsTab({ api, onNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', driverName: '', phone: '', startTime: localDateTime(), endTime: localDateTime(2), note: '' });

  async function load() { setItems(await api.get('/api/reservations')); }
  useEffect(() => { load().catch((error) => onNotice('error', error.message)); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/api/reservations', form);
      setForm({ plateNumber: '', driverName: '', phone: '', startTime: localDateTime(), endTime: localDateTime(2), note: '' });
      onNotice('success', '預約已建立');
      await load();
    } catch (error) { onNotice('error', error.message); }
  }

  async function setStatus(item, status) {
    await api.patch(`/api/reservations/${item.id}`, { status });
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <FormCard title="新增預約" icon={<CalendarClock />}>
        <form onSubmit={submit}>
          <Field label="車牌"><input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} /></Field>
          <Field label="駕駛姓名"><input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} /></Field>
          <Field label="電話"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="開始時間"><input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
          <Field label="結束時間"><input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
          <Field label="備註"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
          <button className="primary-button mt-5 w-full">建立預約</button>
        </form>
      </FormCard>
      <SimpleTable
        title="預約清單"
        headers={['車牌', '駕駛', '電話', '時段', '狀態', '操作']}
        rows={items.map((item) => [
          item.plateNumber, item.driverName, item.phone, `${formatTime(item.startTime)} ~ ${formatTime(item.endTime)}`, <Badge value={item.status} />,
          <div className="row-actions"><button className="ghost-button" onClick={() => setStatus(item, 'USED')}>使用</button><button className="ghost-button danger" onClick={() => setStatus(item, 'CANCELLED')}>取消</button></div>
        ])}
      />
    </section>
  );
}

function DiscountsTab({ api, onNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', discountType: 'AMOUNT', discountValue: 40, startDate: today(), endDate: today() });

  async function load() { setItems(await api.get('/api/discount-codes')); }
  useEffect(() => { load().catch((error) => onNotice('error', error.message)); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/api/discount-codes', form);
      setForm({ code: '', name: '', discountType: 'AMOUNT', discountValue: 40, startDate: today(), endDate: today() });
      onNotice('success', '優惠碼已儲存');
      await load();
    } catch (error) { onNotice('error', error.message); }
  }

  async function toggle(item) {
    await api.patch(`/api/discount-codes/${item.id}`, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <FormCard title="新增優惠碼" icon={<Tag />}>
        <form onSubmit={submit}>
          <Field label="優惠碼"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="名稱"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="折抵方式"><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="AMOUNT">固定金額</option><option value="PERCENT">百分比</option></select></Field>
          <Field label="折抵值"><input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></Field>
          <Field label="開始日期"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="結束日期"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <button className="primary-button mt-5 w-full">儲存優惠碼</button>
        </form>
      </FormCard>
      <SimpleTable
        title="優惠碼清單"
        headers={['代碼', '名稱', '折抵', '有效期間', '狀態', '操作']}
        rows={items.map((item) => [
          item.code, item.name, item.discountType === 'PERCENT' ? `${item.discountValue}%` : money(item.discountValue), `${item.startDate} ~ ${item.endDate}`, <Badge value={item.status} />,
          <button className="ghost-button" onClick={() => toggle(item)}>{item.status === 'ACTIVE' ? '停用' : '啟用'}</button>
        ])}
      />
    </section>
  );
}

function BlacklistTab({ api, onNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', reason: '' });
  async function load() { setItems(await api.get('/api/blacklist')); }
  useEffect(() => { load().catch((error) => onNotice('error', error.message)); }, []);
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/api/blacklist', form);
      setForm({ plateNumber: '', reason: '' });
      onNotice('success', '黑名單已儲存');
      await load();
    } catch (error) { onNotice('error', error.message); }
  }
  async function toggle(item) {
    await api.patch(`/api/blacklist/${item.id}`, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    await load();
  }
  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <FormCard title="新增黑名單" icon={<ShieldAlert />}><form onSubmit={submit}><Field label="車牌號碼"><input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} /></Field><Field label="原因"><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field><button className="primary-button mt-5 w-full">儲存黑名單</button></form></FormCard>
      <SimpleTable title="黑名單清單" headers={['車牌', '原因', '狀態', '建立時間', '操作']} rows={items.map((item) => [item.plateNumber, item.reason, <Badge value={item.status} />, formatTime(item.createdAt), <button className="ghost-button" onClick={() => toggle(item)}>{item.status === 'ACTIVE' ? '停用' : '啟用'}</button>])} />
    </section>
  );
}

function ExceptionsTab({ api, onNotice }) {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', plateNumber: '' });
  async function load(event) {
    event?.preventDefault();
    try { setEvents(await api.get(`/api/exceptions?${toQuery(filters)}`)); } catch (error) { onNotice('error', error.message); }
  }
  useEffect(() => { load(); }, []);
  async function resolveEvent(item) {
    await api.patch(`/api/exceptions/${item.id}`, { status: item.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED', note: '後台處理' });
    await load();
  }
  return (
    <section className="space-y-6">
      <form onSubmit={load} className="filter-card"><div className="filter-grid"><Field label="車牌"><input value={filters.plateNumber} onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })} /></Field><Field label="狀態"><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">全部</option><option value="OPEN">未處理</option><option value="RESOLVED">已處理</option></select></Field><button className="secondary-button self-end">查詢</button></div></form>
      <SimpleTable title="異常事件中心" headers={['時間', '車牌', '類型', '描述', '狀態', '操作']} rows={events.map((item) => [formatTime(item.occurredAt), item.plateNumber || '-', item.eventTypeLabel, item.description, <Badge value={item.status} />, <div className="row-actions"><button className="ghost-button" onClick={() => setSelected(item)}>詳情</button><button className="ghost-button" onClick={() => resolveEvent(item)}>{item.status === 'RESOLVED' ? '重開' : '已處理'}</button></div>])} />
      {selected && <aside className="drawer"><button className="drawer-close" onClick={() => setSelected(null)}>×</button><h2>異常詳情</h2><p><b>車牌：</b>{selected.plateNumber || '-'}</p><p><b>類型：</b>{selected.eventTypeLabel}</p><p><b>操作者：</b>{selected.operator}</p><p><b>IP：</b>{selected.ipAddress}</p><p><b>描述：</b>{selected.description}</p><p><b>處理備註：</b>{selected.note || '-'}</p></aside>}
    </section>
  );
}

function RatesTab({ api, onNotice }) {
  const [form, setForm] = useState({ freeMinutes: 30, hourlyRate: 40, dailyMaxFee: 300, exitGraceMinutes: 10 });
  useEffect(() => { api.get('/api/rate-settings').then(setForm).catch((error) => onNotice('error', error.message)); }, []);
  async function submit(event) {
    event.preventDefault();
    try { setForm(await api.put('/api/rate-settings', form)); onNotice('success', '費率設定已更新'); } catch (error) { onNotice('error', error.message); }
  }
  return (
    <section className="max-w-2xl"><FormCard title="費率設定" icon={<Settings />}><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">{[['freeMinutes', '免費分鐘'], ['hourlyRate', '每小時費率'], ['dailyMaxFee', '每日最高收費'], ['exitGraceMinutes', '出場寬限分鐘']].map(([key, label]) => <Field key={key} label={label}><input type="number" min="0" value={form[key] ?? 0} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Field>)}<div className="sm:col-span-2"><button className="primary-button mt-3">更新費率</button></div></form></FormCard></section>
  );
}

function StatCard({ icon, label, value, tone = 'brand' }) {
  return <div className={`stat-card ${tone}`}><div>{icon}</div><p>{label}</p><strong>{value}</strong></div>;
}

function ChartCard({ title, data }) {
  const max = Math.max(1, ...data.map((item) => item.amount || 0));
  return (
    <section className="panel-card">
      <h2>{title}</h2>
      <div className="bar-chart">
        {data.length === 0 && <p className="empty-state">尚無收入資料</p>}
        {data.map((item) => <div key={item.date} className="bar-item"><div className="bar-track"><span style={{ height: `${Math.max(6, (item.amount / max) * 100)}%` }} /></div><small>{item.date.slice(5)}</small><b>{item.amount}</b></div>)}
      </div>
    </section>
  );
}

function CameraPanel({ title, active }) {
  return <div className={`camera-panel ${active ? 'active' : ''}`}><div className="camera-lens"><Camera size={28} /></div><div><strong>{title}</strong><p>{active ? '目前模擬中' : '待命監控'}</p></div><Gauge className="camera-gauge" size={24} /></div>;
}

function ResultPanel({ type, title, text }) {
  return <div className={`result-panel ${type}`}><strong>{title}</strong><p>{text}</p></div>;
}

function Badge({ value }) {
  const t = useI18n();
  return <span className={`status-badge ${badgeTone(value)}`}>{t.labels[value] || labels[value] || value}</span>;
}

function ExpiryBadge({ date }) {
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  if (diff < 0) return <span className="status-badge danger">已過期</span>;
  if (diff <= 7) return <span className="status-badge warn">{diff} 天到期</span>;
  return <span className="status-badge success">有效</span>;
}

function QrPaymentTab() {
  const [plateNumber, setPlateNumber] = useState('');
  const link = plateNumber ? `${window.location.origin}/?payPlate=${encodeURIComponent(plateNumber.trim().toUpperCase())}` : '';
  const qrUrl = link ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}` : '';
  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <FormCard title="產生繳費 QR Code" icon={<QrCode />}><Field label="車牌號碼"><input className="plate-input" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="ABC-1234" /></Field></FormCard>
      <section className="panel-card">{!link && <p className="empty-state">輸入車牌後產生車主端繳費 QR Code。</p>}{link && <div className="qr-layout"><img src={qrUrl} alt="付款 QR Code" /><div><h2>車主掃碼繳費</h2><p className="break-all">{link}</p><p>支援優惠碼、試算金額、模擬付款與收據提示。</p></div></div>}</section>
    </section>
  );
}

function RecordTable({ title, loading, records, emptyText }) {
  const t = useI18n();
  return (
    <SimpleTable
      title={title}
      headers={[t.table.plate, t.table.type, t.table.entryTime, t.table.exitTime, t.table.status, t.table.fee]}
      rows={(records || []).map((record) => [
        record.plateNumber,
        record.vehicleTypeLabel,
        formatTime(record.entryTime),
        record.exitTime ? formatTime(record.exitTime) : '-',
        <Badge value={record.status} />,
        record.fee == null ? '-' : money(record.fee)
      ])}
      emptyText={loading ? t.loading : emptyText}
    />
  );
}

function SimpleTable({ title, headers, rows, emptyText }) {
  const t = useI18n();
  return (
    <section className="panel-card">
      <h2>{title}</h2>
      <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="empty-state">{emptyText || t.empty}</p>}</div>
    </section>
  );
}

function FilterBar({ filters, setFilters, onSubmit, action }) {
  return <form onSubmit={onSubmit} className="filter-card"><div className="filter-grid"><Field label="起日"><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field><Field label="迄日"><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field><Field label="車牌"><input value={filters.plateNumber} onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })} /></Field><div className="filter-actions"><button className="secondary-button">查詢</button>{action}</div></div></form>;
}

function FormCard({ title, icon, children }) {
  return <section className="panel-card form-card"><PanelTitle icon={icon} title={title} />{children}</section>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function PanelTitle({ icon, title }) {
  return <div className="panel-title"><span>{icon}</span><h2>{title}</h2></div>;
}

function createApi(token) {
  return {
    get: (path) => request(path, { token }),
    post: (path, body) => request(path, { method: 'POST', body, token }),
    put: (path, body) => request(path, { method: 'PUT', body, token }),
    patch: (path, body) => request(path, { method: 'PATCH', body, token })
  };
}

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const isCsv = response.headers.get('content-type')?.includes('text/csv');
  const data = isCsv ? await response.text() : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || '請求失敗');
  return data;
}

function formatTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function money(value) { return `$${Number(value || 0).toLocaleString()}`; }
function today() { return new Date().toISOString().slice(0, 10); }
function localDateTime(addHours = 0) { const date = new Date(); date.setHours(date.getHours() + addHours); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
function toQuery(values) { const params = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); }); return params.toString(); }
function badgeTone(value) {
  if (['ACTIVE', 'COMPLETED', 'RESOLVED', 'SUCCESS', 'USED'].includes(value)) return 'success';
  if (['OPEN', 'RESERVED'].includes(value)) return 'warn';
  if (['INACTIVE', 'FAILED', 'CANCELLED'].includes(value)) return 'danger';
  return 'neutral';
}

createRoot(document.getElementById('root')).render(<App />);
