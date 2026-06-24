import React, { useMemo, useState } from "react";

const containersSeed = [
  { id: "A01", type: "20ft", zone: "A", status: "occupied", customerId: "C0001", monthlyRent: 6000, contractEnd: "2027-04-30", inspection: "正常", vacantDays: 0 },
  { id: "A02", type: "10ft", zone: "A", status: "vacant", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "可出租", vacantDays: 12 },
  { id: "A03", type: "20ft", zone: "A", status: "reserved", customerId: "C0002", monthlyRent: 6000, contractEnd: "2027-04-30", inspection: "預約保留中", vacantDays: 0 },
  { id: "A04", type: "10ft", zone: "A", status: "maintenance", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "門片需檢修", vacantDays: 0 },
  { id: "B01", type: "20ft", zone: "B", status: "occupied", customerId: "C0003", monthlyRent: 6000, contractEnd: "2027-03-31", inspection: "大量用電", vacantDays: 0 },
  { id: "B02", type: "10ft", zone: "B", status: "vacant", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "可出租", vacantDays: 5 },
  { id: "B03", type: "20ft", zone: "B", status: "occupied", customerId: "C0004", monthlyRent: 6000, contractEnd: "2027-05-10", inspection: "正常", vacantDays: 0 },
  { id: "C01", type: "20ft", zone: "C", status: "occupied", customerId: "C0005", monthlyRent: 6000, contractEnd: "2026-08-21", inspection: "60 天內到期", vacantDays: 0 }
];

const customersSeed = [
  { id: "C0001", name: "王先生", phone: "0912-345-678", lineId: "wang_line", idNumber: "A123456789", address: "台中市西屯區", email: "wang@example.com", remark: "年度付款" },
  { id: "C0002", name: "陳小姐", phone: "0922-111-222", lineId: "chen_line", idNumber: "B223456789", address: "彰化縣員林市", email: "chen@example.com", remark: "預約 A03" },
  { id: "C0003", name: "林先生", phone: "0933-222-333", lineId: "lin_line", idNumber: "C323456789", address: "南投縣草屯鎮", email: "lin@example.com", remark: "大量用電" },
  { id: "C0004", name: "李小姐", phone: "0955-666-777", lineId: "lee_line", idNumber: "D423456789", address: "台中市南區", email: "lee@example.com", remark: "續約提醒" },
  { id: "C0005", name: "張先生", phone: "0966-777-888", lineId: "chang_line", idNumber: "E523456789", address: "台中市北屯區", email: "chang@example.com", remark: "60 天內到期" }
];

const reservationsSeed = [
  { id: "R001", customer: "王先生", type: "20ft", date: "2026-06-22", status: "waiting", priority: 1, holdUntil: "", note: "等待 20 呎空櫃" },
  { id: "R002", customer: "陳小姐", type: "20ft", date: "2026-06-22", status: "reserved", priority: 2, holdUntil: "2026-06-23 18:00", note: "A03 保留中" },
  { id: "R003", customer: "黃先生", type: "10ft", date: "2026-06-21", status: "waiting", priority: 3, holdUntil: "", note: "可接受 B 區" }
];

const paymentsSeed = [
  { id: "P001", customerId: "C0001", containerId: "A01", type: "rent", amount: 72000, status: "paid", dueDate: "2026-04-10", paidAmount: 72000, method: "匯款", invoice: "INV-202604-001" },
  { id: "P002", customerId: "C0003", containerId: "B01", type: "electricity", amount: 8000, status: "paid", dueDate: "2026-06-15", paidAmount: 8000, method: "現金", invoice: "INV-202606-002" },
  { id: "P003", customerId: "C0004", containerId: "B03", type: "rent", amount: 84000, status: "unpaid", dueDate: "2026-06-10", paidAmount: 0, method: "待付款", invoice: "INV-202606-003" },
  { id: "P004", customerId: "C0005", containerId: "C01", type: "deposit", amount: 6000, status: "paid", dueDate: "2026-06-01", paidAmount: 6000, method: "匯款", invoice: "INV-202606-004" },
  { id: "P005", customerId: "C0003", containerId: "B01", type: "rent", amount: 84000, status: "partial", dueDate: "2026-06-18", paidAmount: 30000, method: "部分匯款", invoice: "INV-202606-005" }
];

const electricitySeed = [
  { containerId: "A01", lastMeter: 1200, currentMeter: 1200, usage: 0, amount: 1000 },
  { containerId: "B01", lastMeter: 800, currentMeter: 1650, usage: 850, amount: 7650 },
  { containerId: "B03", lastMeter: 430, currentMeter: 430, usage: 0, amount: 1000 }
];

const maintenanceSeed = [
  { id: "M001", containerId: "A04", type: "門片檢修", priority: "高", status: "處理中", assignee: "現場人員", date: "2026-06-22", photos: 2, note: "門片卡住，需更換滑輪" },
  { id: "M002", containerId: "B01", type: "電表檢查", priority: "中", status: "待派工", assignee: "未指派", date: "2026-06-23", photos: 0, note: "大量用電客戶，月底前複查" },
  { id: "M003", containerId: "A02", type: "出租前檢查", priority: "低", status: "完成", assignee: "阿明", date: "2026-06-20", photos: 4, note: "內部乾燥，鎖具正常" }
];

const contractsSeed = [
  { id: "CT001", customerId: "C0001", containerId: "A01", status: "signed", version: "v1.2", start: "2026-05-01", end: "2027-04-30", rent: 72000, deposit: 6000, signedAt: "2026-04-28 14:22" },
  { id: "CT002", customerId: "C0004", containerId: "B03", status: "pending", version: "v1.0", start: "2026-05-11", end: "2027-05-10", rent: 84000, deposit: 6000, signedAt: "" },
  { id: "CT003", customerId: "C0005", containerId: "C01", status: "draft", version: "v1.0", start: "2026-08-22", end: "2027-08-21", rent: 84000, deposit: 6000, signedAt: "" }
];

const notificationsSeed = [
  { id: "N001", type: "續約通知", target: "張先生", channel: "LINE", status: "已送達", sentAt: "2026-06-22 09:30" },
  { id: "N002", type: "繳費通知", target: "李小姐", channel: "LINE", status: "待追蹤", sentAt: "2026-06-22 10:20" },
  { id: "N003", type: "空櫃通知", target: "黃先生", channel: "LINE", status: "排程中", sentAt: "2026-06-22 14:00" }
];

const statusMeta = {
  vacant: { label: "空櫃", tone: "green" },
  occupied: { label: "出租", tone: "blue" },
  reserved: { label: "預約", tone: "yellow" },
  maintenance: { label: "維修", tone: "red" }
};

const reservationStatus = {
  waiting: { label: "等待中", tone: "yellow" },
  reserved: { label: "保留中", tone: "blue" },
  expired: { label: "已失效", tone: "red" },
  converted: { label: "已轉租", tone: "green" }
};

const paymentTypes = {
  rent: "租金",
  deposit: "押金",
  electricity: "電費"
};

const tabs = ["Dashboard", "貨櫃管理", "QR掃描", "維修檢查", "客戶管理", "客戶入口", "預約管理", "電子合約", "收費管理", "電費管理", "續約提醒", "退租管理", "通知中心", "報表", "AI助理"];

function formatMoney(value) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(value);
}

function daysUntil(dateText) {
  if (!dateText) return null;
  const today = new Date("2026-06-22T00:00:00");
  const date = new Date(`${dateText}T00:00:00`);
  return Math.ceil((date - today) / 86400000);
}

function overdueDays(dateText) {
  const days = daysUntil(dateText);
  return days < 0 ? Math.abs(days) : 0;
}

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [containers, setContainers] = useState(containersSeed);
  const [customers, setCustomers] = useState(customersSeed);
  const [reservations, setReservations] = useState(reservationsSeed);
  const [payments, setPayments] = useState(paymentsSeed);
  const [electricity] = useState(electricitySeed);
  const [notifications, setNotifications] = useState(notificationsSeed);
  const [maintenance, setMaintenance] = useState(maintenanceSeed);
  const [contracts, setContracts] = useState(contractsSeed);

  const customersById = useMemo(() => Object.fromEntries(customers.map((customer) => [customer.id, customer])), [customers]);

  const metrics = useMemo(() => {
    const occupied = containers.filter((item) => item.status === "occupied").length;
    const vacant = containers.filter((item) => item.status === "vacant").length;
    const reserved = containers.filter((item) => item.status === "reserved").length;
    const rent = payments.filter((item) => item.status === "paid" && item.type === "rent").reduce((sum, item) => sum + item.amount, 0);
    const electric = payments.filter((item) => item.status === "paid" && item.type === "electricity").reduce((sum, item) => sum + item.amount, 0);
    const dueRenewals = containers.filter((item) => item.status === "occupied" && daysUntil(item.contractEnd) <= 60).length;
    const unpaid = payments.filter((item) => item.status !== "paid").length;
    const receivable = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);

    return {
      total: containers.length,
      occupied,
      vacant,
      reserved,
      utilization: containers.length ? Math.round((occupied / containers.length) * 1000) / 10 : 0,
      rent,
      electric,
      totalIncome: rent + electric,
      yearlyIncome: payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0),
      dueRenewals,
      unpaid,
      receivable,
      waitlist: reservations.filter((item) => item.status === "waiting").length
    };
  }, [containers, payments, reservations]);

  function addContainer(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get("id")).trim().toUpperCase();
    if (!id || containers.some((item) => item.id === id)) return;
    setContainers((items) => [
      ...items,
      { id, type: data.get("type"), zone: data.get("zone"), status: data.get("status"), customerId: "", monthlyRent: data.get("type") === "20ft" ? 6000 : 4000, contractEnd: "", inspection: "新建檔", vacantDays: 0 }
    ]);
    event.currentTarget.reset();
  }

  function addCustomer(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextNumber = String(customers.length + 1).padStart(4, "0");
    setCustomers((items) => [...items, { id: `C${nextNumber}`, name: data.get("name"), phone: data.get("phone"), lineId: data.get("lineId"), idNumber: "", address: data.get("address"), email: data.get("email"), remark: data.get("remark") }]);
    event.currentTarget.reset();
  }

  function markPaymentPaid(paymentId) {
    setPayments((items) => items.map((item) => (item.id === paymentId ? { ...item, status: "paid", paidAmount: item.amount, method: item.method === "待付款" ? "匯款" : item.method } : item)));
  }

  function reserveNextWaiting(reservationId) {
    setReservations((items) => items.map((item) => (item.id === reservationId ? { ...item, status: "reserved", holdUntil: "2026-06-23 18:00", note: "已通知，24 小時內確認" } : item)));
    setNotifications((items) => [{ id: `N${String(items.length + 1).padStart(3, "0")}`, type: "空櫃通知", target: reservations.find((item) => item.id === reservationId)?.customer || "等待客戶", channel: "LINE", status: "已送達", sentAt: "2026-06-22 15:00" }, ...items]);
  }

  function addMaintenance(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = `M${String(maintenance.length + 1).padStart(3, "0")}`;
    setMaintenance((items) => [
      { id, containerId: data.get("containerId"), type: data.get("type"), priority: data.get("priority"), status: "待派工", assignee: data.get("assignee") || "未指派", date: "2026-06-22", photos: 0, note: data.get("note") },
      ...items
    ]);
    event.currentTarget.reset();
  }

  function completeMaintenance(ticketId) {
    setMaintenance((items) => items.map((item) => (item.id === ticketId ? { ...item, status: "完成" } : item)));
  }

  function generateMonthlyBills() {
    const nextBills = containers
      .filter((item) => item.status === "occupied")
      .map((item, index) => ({
        id: `P${String(payments.length + index + 1).padStart(3, "0")}`,
        customerId: item.customerId,
        containerId: item.id,
        type: "rent",
        amount: item.type === "20ft" ? 84000 : 72000,
        status: "unpaid",
        dueDate: "2026-09-01",
        paidAmount: 0,
        method: "待付款",
        invoice: `INV-202609-${String(index + 1).padStart(3, "0")}`
      }));
    setPayments((items) => [...nextBills, ...items]);
  }

  function sendCollectionNotice(paymentId) {
    const payment = payments.find((item) => item.id === paymentId);
    const customer = payment ? customersById[payment.customerId] : null;
    if (!payment || !customer) return;
    setNotifications((items) => [
      { id: `N${String(items.length + 1).padStart(3, "0")}`, type: "催收通知", target: customer.name, channel: "LINE", status: "已送達", sentAt: "2026-06-22 16:00" },
      ...items
    ]);
  }

  function signContract(contractId) {
    setContracts((items) => items.map((item) => (item.id === contractId ? { ...item, status: "signed", signedAt: "2026-06-22 16:30" } : item)));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">福</span>
          <div>
            <strong>福田貨櫃</strong>
            <small>倉儲智慧管理系統</small>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">2026/06/22 營運概況</p>
            <h1>{activeTab}</h1>
            <span className="page-hint">快速掌握空櫃、租約、收款與通知狀態</span>
          </div>
          <div className="operator">
            <span>管理員</span>
            <strong>FT</strong>
          </div>
        </header>

        {activeTab === "Dashboard" && <Dashboard metrics={metrics} containers={containers} customersById={customersById} payments={payments} reservations={reservations} maintenance={maintenance} setActiveTab={setActiveTab} />}
        {activeTab === "貨櫃管理" && <ContainerManagement containers={containers} payments={payments} customersById={customersById} addContainer={addContainer} />}
        {activeTab === "QR掃描" && <QrScanner containers={containers} customersById={customersById} payments={payments} maintenance={maintenance} />}
        {activeTab === "維修檢查" && <MaintenanceManagement maintenance={maintenance} containers={containers} addMaintenance={addMaintenance} completeMaintenance={completeMaintenance} />}
        {activeTab === "客戶管理" && <CustomerManagement customers={customers} containers={containers} payments={payments} addCustomer={addCustomer} />}
        {activeTab === "客戶入口" && <CustomerPortal customers={customers} containers={containers} payments={payments} customersById={customersById} contracts={contracts} />}
        {activeTab === "預約管理" && <ReservationManagement reservations={reservations} metrics={metrics} reserveNextWaiting={reserveNextWaiting} />}
        {activeTab === "電子合約" && <ContractManagement contracts={contracts} customersById={customersById} signContract={signContract} />}
        {activeTab === "收費管理" && <PaymentManagement payments={payments} customersById={customersById} markPaymentPaid={markPaymentPaid} generateMonthlyBills={generateMonthlyBills} sendCollectionNotice={sendCollectionNotice} />}
        {activeTab === "電費管理" && <ElectricityManagement electricity={electricity} />}
        {activeTab === "續約提醒" && <RenewalManagement containers={containers} customersById={customersById} />}
        {activeTab === "退租管理" && <CheckoutManagement />}
        {activeTab === "通知中心" && <NotificationCenter notifications={notifications} />}
        {activeTab === "報表" && <Reports metrics={metrics} containers={containers} payments={payments} />}
        {activeTab === "AI助理" && <AiAssistant metrics={metrics} containers={containers} customersById={customersById} payments={payments} reservations={reservations} maintenance={maintenance} />}
        <FloatingAssistant metrics={metrics} containers={containers} customersById={customersById} payments={payments} maintenance={maintenance} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

function Dashboard({ metrics, containers, customersById, payments, reservations, maintenance, setActiveTab }) {
  const upcoming = containers.filter((item) => item.contractEnd).map((item) => ({ ...item, days: daysUntil(item.contractEnd) })).sort((a, b) => a.days - b.days).slice(0, 4);
  const openMaintenance = maintenance.filter((item) => item.status !== "完成").length;
  const tasks = [
    { title: "今日待催收", text: `${metrics.unpaid} 筆待收，金額 ${formatMoney(metrics.receivable)}`, tab: "收費管理", tone: "red", action: "發送 LINE 催收" },
    { title: "今日待續約", text: `${metrics.dueRenewals} 件租約 60 天內到期`, tab: "續約提醒", tone: "yellow", action: "查看續約看板" },
    { title: "今日待檢查", text: `${openMaintenance} 件維修/檢查未完成`, tab: "維修檢查", tone: "blue", action: "派工或結案" },
    { title: "候補可通知", text: `${metrics.waitlist} 位客戶等待，${metrics.vacant} 個空櫃可安排`, tab: "預約管理", tone: "green", action: "通知候補客戶" },
    { title: "待簽約追蹤", text: "2 份合約需簽名或補件", tab: "電子合約", tone: "yellow", action: "開啟合約模組" }
  ];

  return (
    <>
      <section className="command-center">
        <div>
          <p className="eyebrow">今日重點</p>
          <h2>今日有 {metrics.unpaid + metrics.dueRenewals + openMaintenance} 件營運事項需要處理</h2>
          <p>優先順序：收款催繳、續約通知、現場檢查、候補轉租。出租率 {metrics.utilization}% ，目前空櫃 {metrics.vacant} 個。</p>
        </div>
        <div className="quick-actions">
          <button className="primary" onClick={() => setActiveTab("預約管理")}>新增預約</button>
          <button className="secondary" onClick={() => setActiveTab("電子合約")}>產生合約</button>
          <button className="secondary" onClick={() => setActiveTab("AI助理")}>詢問 AI</button>
        </div>
      </section>

      <section className="daily-task-board">
        {tasks.map((task) => (
          <button className={`task-card ${task.tone}`} key={task.title} onClick={() => setActiveTab(task.tab)}>
            <strong>{task.title}</strong>
            <span>{task.text}</span>
            <em>{task.action}</em>
          </button>
        ))}
      </section>

      <section className="kpi-grid">
        <Kpi label="總貨櫃" value={metrics.total} detail="目前建檔數" />
        <Kpi label="出租率" value={`${metrics.utilization}%`} detail="出租中 / 總數" tone="blue" />
        <Kpi label="空櫃數" value={metrics.vacant} detail="可立即安排" tone="green" />
        <Kpi label="候補數" value={metrics.waitlist} detail="等待通知" tone="yellow" />
        <Kpi label="本月租金" value={formatMoney(metrics.rent)} detail="已入帳" />
        <Kpi label="本月電費" value={formatMoney(metrics.electric)} detail="含基本電費" />
        <Kpi label="待續約數" value={metrics.dueRenewals} detail="60 天內到期" tone="red" />
        <Kpi label="待收款" value={formatMoney(metrics.receivable)} detail="未收餘額" tone="red" />
      </section>

      <section className="dashboard-grid refined">
        <Panel title="貨櫃地圖">
          <ContainerMap containers={containers} />
        </Panel>
        <Panel title="即將到期">
          <div className="list">
            {upcoming.map((item) => (
              <div className={item.days <= 60 ? "list-row urgent" : "list-row"} key={item.id}>
                <strong>{item.id}</strong>
                <span>{item.contractEnd}</span>
                <span>{customersById[item.customerId]?.name || "未指定"}</span>
                <em>{item.days} 天</em>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="本月收入">
          <div className="income-card">
            <span>租金 {formatMoney(metrics.rent)}</span>
            <span>電費 {formatMoney(metrics.electric)}</span>
            <strong>{formatMoney(metrics.totalIncome)}</strong>
          </div>
        </Panel>
        <Panel title="待收款">
          <div className="list">
            {payments.filter((item) => item.status !== "paid").map((item) => (
              <div className="list-row urgent" key={item.id}>
                <strong>{item.containerId}</strong>
                <span>{paymentTypes[item.type]}</span>
                <span>{formatMoney(item.amount - item.paidAmount)}</span>
                <em>逾期 {overdueDays(item.dueDate)} 天</em>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}

function ContainerManagement({ containers, payments, customersById, addContainer }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(containers[0]?.id || "");
  const zones = [...new Set(containers.map((item) => item.zone))];
  const filtered = containers.filter((item) => (typeFilter === "all" || item.type === typeFilter) && (statusFilter === "all" || item.status === statusFilter) && (zoneFilter === "all" || item.zone === zoneFilter));
  const selected = containers.find((item) => item.id === selectedId) || filtered[0] || containers[0];
  const selectedPayments = payments.filter((item) => item.containerId === selected?.id);

  return (
    <section className="content-grid">
      <Panel title="貨櫃總覽">
        <div className="filter-bar">
          <SelectPill label="規格" value={typeFilter} onChange={setTypeFilter} options={[["all", "全部"], ["10ft", "10ft"], ["20ft", "20ft"]]} />
          <SelectPill label="狀態" value={statusFilter} onChange={setStatusFilter} options={[["all", "全部"], ["vacant", "空櫃"], ["occupied", "出租"], ["reserved", "預約"], ["maintenance", "維修"]]} />
          <SelectPill label="區域" value={zoneFilter} onChange={setZoneFilter} options={[["all", "全部"], ...zones.map((zone) => [zone, `${zone} 區`])]} />
        </div>
        <ContainerMap containers={filtered} selectedId={selected?.id} onSelect={setSelectedId} />
        <Table
          headers={["編號", "規格", "區域", "狀態", "月租", "檢查"]}
          rows={filtered.map((item) => [item.id, item.type, `${item.zone} 區`, <Badge key={item.id} tone={statusMeta[item.status].tone}>{statusMeta[item.status].label}</Badge>, formatMoney(item.monthlyRent), item.inspection])}
        />
      </Panel>
      <Panel title="貨櫃詳情">
        {selected && <ContainerDetail container={selected} customer={customersById[selected.customerId]} payments={selectedPayments} />}
      </Panel>
      <Panel title="新增貨櫃">
        <form className="form" onSubmit={addContainer}>
          <label>貨櫃編號<input name="id" placeholder="例如 C02" required /></label>
          <label>規格<select name="type"><option>20ft</option><option>10ft</option></select></label>
          <label>區域<input name="zone" placeholder="A" required /></label>
          <label>狀態<select name="status"><option value="vacant">空櫃</option><option value="occupied">出租</option><option value="reserved">預約</option><option value="maintenance">維修</option></select></label>
          <button className="primary">新增貨櫃</button>
        </form>
      </Panel>
    </section>
  );
}

function ContainerDetail({ container, customer, payments }) {
  const unpaid = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
  return (
    <div className="detail-card">
      <div className={`detail-hero ${statusMeta[container.status].tone}`}>
        <strong>{container.id}</strong>
        <span>{container.type} / {container.zone} 區 / {statusMeta[container.status].label}</span>
      </div>
      <dl className="detail-list">
        <div><dt>承租客戶</dt><dd>{customer?.name || "尚未出租"}</dd></div>
        <div><dt>電話</dt><dd>{customer?.phone || "-"}</dd></div>
        <div><dt>租約到期</dt><dd>{container.contractEnd || "-"}</dd></div>
        <div><dt>月租</dt><dd>{formatMoney(container.monthlyRent)}</dd></div>
        <div><dt>未收金額</dt><dd>{formatMoney(unpaid)}</dd></div>
        <div><dt>現場檢查</dt><dd>{container.inspection}</dd></div>
      </dl>
      <div className="quick-actions stacked">
        <button className="primary">建立合約</button>
        <button className="secondary">記錄檢查</button>
        <button className="secondary">發送通知</button>
      </div>
    </div>
  );
}

function QrScanner({ containers, customersById, payments, maintenance }) {
  const [scanId, setScanId] = useState("A01");
  const container = containers.find((item) => item.id === scanId) || containers[0];
  const customer = customersById[container.customerId];
  const unpaid = payments.filter((item) => item.containerId === container.id && item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
  const openTickets = maintenance.filter((item) => item.containerId === container.id && item.status !== "完成");

  return (
    <section className="content-grid">
      <Panel title="QR 現場掃描">
        <div className="scanner-layout">
          <div className="qr-card">
            <span>QR</span>
            <strong>{container.id}</strong>
            <small>貼於貨櫃門片內側</small>
          </div>
          <div className="scan-panel">
            <label>模擬掃描貨櫃<select value={scanId} onChange={(event) => setScanId(event.target.value)}>{containers.map((item) => <option key={item.id} value={item.id}>{item.id} - {statusMeta[item.status].label}</option>)}</select></label>
            <div className="quick-actions">
              <button className="primary">開啟現場檢查</button>
              <button className="secondary">拍照上傳</button>
              <button className="secondary">查看合約</button>
            </div>
          </div>
        </div>
        <ContainerDetail container={container} customer={customer} payments={payments.filter((item) => item.containerId === container.id)} />
      </Panel>
      <Panel title="掃描後提醒">
        <div className="workflow vertical">
          <span>未收金額：{formatMoney(unpaid)}</span>
          <span>未完成工單：{openTickets.length} 件</span>
          <span>租約到期：{container.contractEnd || "未出租"}</span>
          <span>現場狀態：{container.inspection}</span>
        </div>
      </Panel>
    </section>
  );
}

function MaintenanceManagement({ maintenance, containers, addMaintenance, completeMaintenance }) {
  const openCount = maintenance.filter((item) => item.status !== "完成").length;
  const highPriority = maintenance.filter((item) => item.priority === "高" && item.status !== "完成").length;
  const kanbanItems = maintenance.map((item) => ({
    id: item.id,
    title: `${item.containerId} ${item.type}`,
    status: item.status,
    meta: `${item.priority}優先 / ${item.assignee}`,
    detail: item.note
  }));

  return (
    <section className="content-grid">
      <Panel title="維修與檢查工單">
        <div className="summary-strip">
          <Kpi label="未完成工單" value={openCount} detail="需追蹤" tone="yellow" />
          <Kpi label="高優先" value={highPriority} detail="請優先派工" tone="red" />
          <Kpi label="已拍照片" value={`${maintenance.reduce((sum, item) => sum + item.photos, 0)} 張`} detail="現場留存" tone="blue" />
        </div>
        <KanbanBoard columns={["待派工", "處理中", "完成"]} items={kanbanItems} />
        <Table
          headers={["工單", "貨櫃", "類型", "優先", "狀態", "負責人", "照片", "備註", "操作"]}
          rows={maintenance.map((item) => [
            item.id,
            item.containerId,
            item.type,
            item.priority,
            <Badge key={`${item.id}-status`} tone={item.status === "完成" ? "green" : item.priority === "高" ? "red" : "yellow"}>{item.status}</Badge>,
            item.assignee,
            `${item.photos} 張`,
            item.note,
            item.status !== "完成" ? <button className="small-button" key={item.id} onClick={() => completeMaintenance(item.id)}>完成</button> : "已結案"
          ])}
        />
      </Panel>
      <Panel title="新增現場檢查">
        <form className="form" onSubmit={addMaintenance}>
          <label>貨櫃<select name="containerId">{containers.map((item) => <option key={item.id}>{item.id}</option>)}</select></label>
          <label>檢查類型<input name="type" placeholder="例如 門片檢修" required /></label>
          <label>優先順序<select name="priority"><option>中</option><option>高</option><option>低</option></select></label>
          <label>負責人<input name="assignee" placeholder="現場人員" /></label>
          <label>備註<textarea name="note" rows="4" placeholder="記錄損壞、照片、處理方式" /></label>
          <button className="primary">建立工單</button>
        </form>
      </Panel>
    </section>
  );
}

function CustomerManagement({ customers, containers, payments, addCustomer }) {
  return (
    <section className="content-grid">
      <Panel title="客戶清單">
        <Table headers={["客戶編號", "姓名", "電話", "Line", "Email", "備註"]} rows={customers.map((item) => [item.id, item.name, item.phone, item.lineId, item.email, item.remark])} />
      </Panel>
      <Panel title="新增客戶">
        <form className="form" onSubmit={addCustomer}>
          <label>姓名<input name="name" required /></label>
          <label>電話<input name="phone" required /></label>
          <label>Line ID<input name="lineId" /></label>
          <label>地址<input name="address" /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>備註<textarea name="remark" rows="3" /></label>
          <button className="primary">新增客戶</button>
        </form>
      </Panel>
      <Panel title="租賃與收款摘要">
        <Table
          headers={["客戶", "貨櫃", "租期", "未收金額"]}
          rows={containers.filter((item) => item.customerId).map((item) => {
            const unpaid = payments.filter((payment) => payment.containerId === item.id && payment.status !== "paid").reduce((sum, payment) => sum + payment.amount - payment.paidAmount, 0);
            return [item.customerId, item.id, `2026/05/01 ~ ${item.contractEnd}`, formatMoney(unpaid)];
          })}
        />
      </Panel>
    </section>
  );
}

function CustomerPortal({ customers, containers, payments, customersById, contracts }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const activeCustomer = customersById[customerId] || customers[0];
  const activeContainer = containers.find((item) => item.customerId === activeCustomer.id) || containers.find((item) => item.customerId) || containers[0];
  const customerPayments = payments.filter((item) => item.customerId === activeCustomer.id);
  const customerContracts = contracts.filter((item) => item.customerId === activeCustomer.id);
  const unpaid = customerPayments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
  return (
    <section className="content-grid customer-portal-page">
      <Panel title="客戶自助入口">
        <div className="portal-preview">
          <label>模擬登入客戶<select value={activeCustomer.id} onChange={(event) => setCustomerId(event.target.value)}>{customers.map((item) => <option key={item.id} value={item.id}>{item.name} / {item.phone}</option>)}</select></label>
          <p className="eyebrow">客戶登入後看到的首頁</p>
          <h2>{activeCustomer.name}，您的貨櫃 {activeContainer.id}</h2>
          <div className="portal-grid">
            <Kpi label="租約到期" value={activeContainer.contractEnd} detail="可線上申請續約" />
            <Kpi label="待繳金額" value={formatMoney(unpaid)} detail="支援線上付款" tone={unpaid > 0 ? "red" : "green"} />
            <Kpi label="合約文件" value={`${customerContracts.length || 1} 份`} detail="可下載 PDF" tone="blue" />
          </div>
          <div className="quick-actions">
            <button className="primary">線上付款</button>
            <button className="secondary">下載合約</button>
            <button className="secondary">申請續約</button>
            <button className="secondary">申請退租</button>
          </div>
        </div>
        <Table
          headers={["帳單", "類型", "金額", "已繳", "餘額", "狀態"]}
          rows={customerPayments.map((item) => [item.invoice, paymentTypes[item.type], formatMoney(item.amount), formatMoney(item.paidAmount), formatMoney(item.amount - item.paidAmount), item.status === "paid" ? "已繳" : item.status === "partial" ? "部分付款" : "待繳"])}
        />
        <Table
          headers={["合約", "貨櫃", "租期", "狀態", "簽署時間"]}
          rows={(customerContracts.length ? customerContracts : contracts.slice(0, 1)).map((item) => [item.id, item.containerId, `${item.start} ~ ${item.end}`, item.status === "signed" ? "已簽署" : item.status === "pending" ? "待簽署" : "草稿", item.signedAt || "-"])}
        />
      </Panel>
      <Panel title="入口功能清單">
        <div className="workflow vertical">
          {["查看租約與貨櫃資訊", "下載合約 PDF", "線上付款與收據", "申請續約", "申請退租", "更新聯絡資料"].map((item) => <span key={item}>{item}</span>)}
        </div>
      </Panel>
    </section>
  );
}

function ReservationManagement({ reservations, metrics, reserveNextWaiting }) {
  const kanbanItems = reservations.map((item) => ({
    id: item.id,
    title: `${item.customer} / ${item.type}`,
    status: reservationStatus[item.status].label,
    meta: `順位 ${item.priority}`,
    detail: item.holdUntil || item.note
  }));

  return (
    <section className="content-grid">
      <Panel title="預約與等待名單">
        <KanbanBoard columns={["等待中", "保留中", "已轉租", "已失效"]} items={kanbanItems} />
        <Table
          headers={["順位", "預約編號", "客戶", "規格", "日期", "狀態", "保留期限", "操作"]}
          rows={reservations.sort((a, b) => a.priority - b.priority).map((item) => [
            item.priority,
            item.id,
            item.customer,
            item.type,
            item.date,
            <Badge key={`${item.id}-status`} tone={reservationStatus[item.status].tone}>{reservationStatus[item.status].label}</Badge>,
            item.holdUntil || "-",
            item.status === "waiting" ? <button className="small-button" key={item.id} onClick={() => reserveNextWaiting(item.id)}>通知保留</button> : item.note
          ])}
        />
      </Panel>
      <Panel title="自動化規則">
        <div className="notice-preview">
          <strong>{metrics.vacant === 0 ? "目前滿租，預約將依順位進入等待名單。" : `目前有 ${metrics.vacant} 個空櫃，可通知等待客戶。`}</strong>
          <p>空櫃釋出後，系統依候補順位發送 LINE，保留 24 小時；逾時未確認則自動通知下一位。</p>
        </div>
        <div className="workflow vertical">
          {["候補排序", "空櫃釋出", "LINE 通知", "24 小時保留", "逾時自動失效", "下一位補上"].map((step) => <span key={step}>{step}</span>)}
        </div>
      </Panel>
    </section>
  );
}

function PaymentManagement({ payments, customersById, markPaymentPaid, generateMonthlyBills, sendCollectionNotice }) {
  const totalReceivable = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
  return (
    <Panel title="收費管理">
      <div className="summary-strip">
        <Kpi label="未收總額" value={formatMoney(totalReceivable)} detail="含部分付款餘額" tone="red" />
        <Kpi label="逾期筆數" value={payments.filter((item) => item.status !== "paid" && overdueDays(item.dueDate) > 0).length} detail="需催繳" tone="yellow" />
        <Kpi label="已開帳單" value={payments.length} detail="可下載收據" tone="blue" />
      </div>
      <div className="automation-panel">
        <div>
          <strong>自動帳單與催收流程</strong>
          <span>產生帳單後，可依逾期天數發送 LINE 催收，並同步留下通知紀錄。</span>
        </div>
        <button className="primary" onClick={generateMonthlyBills}>產生下一期帳單</button>
      </div>
      <div className="pricing">
        <span>10 呎首年 {formatMoney(48000)}</span>
        <span>10 呎續約 {formatMoney(72000)}</span>
        <span>20 呎首年 {formatMoney(72000)}</span>
        <span>20 呎續約 {formatMoney(84000)}</span>
        <span>押金：1 個月租金</span>
      </div>
      <Table
        headers={["帳單", "客戶", "貨櫃", "類型", "金額", "已繳", "餘額", "狀態", "逾期", "操作", "催收"]}
        rows={payments.map((item) => [
          item.invoice,
          customersById[item.customerId]?.name || item.customerId,
          item.containerId,
          paymentTypes[item.type],
          formatMoney(item.amount),
          formatMoney(item.paidAmount),
          formatMoney(item.amount - item.paidAmount),
          <Badge key={`${item.id}-badge`} tone={item.status === "paid" ? "green" : item.status === "partial" ? "yellow" : "red"}>{item.status === "paid" ? "已繳" : item.status === "partial" ? "部分付款" : "未繳"}</Badge>,
          `${overdueDays(item.dueDate)} 天`,
          item.status !== "paid" ? <button className="small-button" key={`${item.id}-paid`} onClick={() => markPaymentPaid(item.id)}>標記已繳</button> : "收據",
          item.status !== "paid" ? <button className="small-button" key={`${item.id}-notice`} onClick={() => sendCollectionNotice(item.id)}>LINE 催收</button> : "-"
        ])}
      />
    </Panel>
  );
}

function ContractManagement({ contracts, customersById, signContract }) {
  const contractStatus = {
    draft: { label: "草稿", tone: "yellow" },
    pending: { label: "待簽署", tone: "red" },
    signed: { label: "已簽署", tone: "green" }
  };
  const kanbanItems = contracts.map((item) => ({
    id: item.id,
    title: `${item.containerId} ${customersById[item.customerId]?.name || item.customerId}`,
    status: contractStatus[item.status].label,
    meta: `${item.version} / ${item.start} ~ ${item.end}`,
    detail: `租金 ${formatMoney(item.rent)} / 押金 ${formatMoney(item.deposit)}`
  }));

  return (
    <section className="content-grid">
      <Panel title="電子合約">
        <KanbanBoard columns={["草稿", "待簽署", "已簽署"]} items={kanbanItems} />
        <Table
          headers={["合約", "客戶", "貨櫃", "版本", "租期", "租金", "押金", "狀態", "簽署時間", "操作"]}
          rows={contracts.map((item) => [
            item.id,
            customersById[item.customerId]?.name || item.customerId,
            item.containerId,
            item.version,
            `${item.start} ~ ${item.end}`,
            formatMoney(item.rent),
            formatMoney(item.deposit),
            <Badge key={`${item.id}-status`} tone={contractStatus[item.status].tone}>{contractStatus[item.status].label}</Badge>,
            item.signedAt || "-",
            item.status !== "signed" ? <button className="small-button" key={item.id} onClick={() => signContract(item.id)}>模擬簽署</button> : "下載 PDF"
          ])}
        />
      </Panel>
      <Panel title="合約模板檢查">
        <div className="contract-preview">
          <strong>福田貨櫃倉儲租賃合約</strong>
          <span>姓名、電話、身分證、地址</span>
          <span>貨櫃編號、規格、租期、租金、押金、電費</span>
          <span>雙方簽名、簽署時間、版本紀錄</span>
          <button className="primary">產生 PDF 預覽</button>
        </div>
      </Panel>
    </section>
  );
}

function ElectricityManagement({ electricity }) {
  return (
    <Panel title="電費管理">
      <div className="pricing">
        <span>基本電費 {formatMoney(1000)} / 年</span>
        <span>大量用電：獨立電表，每度 9 元</span>
      </div>
      <Table headers={["貨櫃", "上期度數", "本期度數", "用量", "金額"]} rows={electricity.map((item) => [item.containerId, item.lastMeter, item.currentMeter, `${item.usage} 度`, formatMoney(item.amount)])} />
    </Panel>
  );
}

function RenewalManagement({ containers, customersById }) {
  const renewalRows = containers.filter((item) => item.status === "occupied" && item.contractEnd).map((item) => ({ ...item, days: daysUntil(item.contractEnd) })).sort((a, b) => a.days - b.days);
  const kanbanItems = renewalRows.map((item) => ({
    id: item.id,
    title: `${item.id} ${customersById[item.customerId]?.name || item.customerId}`,
    status: item.days <= 60 ? "待通知" : "追蹤中",
    meta: `${item.days} 天後到期`,
    detail: `續約價 ${formatMoney(item.type === "20ft" ? 84000 : 72000)}`
  }));
  return (
    <Panel title="續約提醒">
      <KanbanBoard columns={["待通知", "已通知", "客戶確認", "已簽約", "已收款", "完成", "追蹤中"]} items={kanbanItems} />
      <Table
        headers={["貨櫃", "客戶", "到期日", "剩餘天數", "提醒狀態", "續約價"]}
        rows={renewalRows.map((item) => [item.id, customersById[item.customerId]?.name || item.customerId, item.contractEnd, `${item.days} 天`, <Badge key={item.id} tone={item.days <= 60 ? "red" : "blue"}>{item.days <= 60 ? "需提醒" : "追蹤中"}</Badge>, formatMoney(item.type === "20ft" ? 84000 : 72000)])}
      />
    </Panel>
  );
}

function CheckoutManagement() {
  const checkoutItems = [
    { id: "CO001", title: "A01 範例客戶", status: "申請", meta: "2026-07-31", detail: "待檢查" },
    { id: "CO002", title: "B03 李小姐", status: "提前通知", meta: "30 天通知", detail: "等待客戶確認" },
    { id: "CO003", title: "A02 空櫃上架", status: "完成", meta: "已恢復空櫃", detail: "可出租" }
  ];
  return (
    <Panel title="退租流程">
      <KanbanBoard columns={["申請", "提前通知", "現場檢查", "計算退款", "退押金", "空櫃上架", "完成"]} items={checkoutItems} />
      <Table headers={["退租編號", "客戶", "貨櫃", "退租日", "退款", "押金退還", "備註"]} rows={[["CO001", "範例客戶", "A01", "2026-07-31", formatMoney(6000), formatMoney(6000), "待檢查"]]} />
    </Panel>
  );
}

function NotificationCenter({ notifications }) {
  const templates = [
    ["預約成功", "您好，已收到您的預約。貨櫃類型：20 呎，我們將盡快與您聯絡。"],
    ["有空櫃通知", "您好，您預約的 20 呎貨櫃已有空位，請於 24 小時內確認。"],
    ["續約通知", "提醒：您的貨櫃租約將於 2027/04/30 到期，請辦理續約。"],
    ["繳費通知", "提醒：您的租金尚未繳納，請於期限前完成付款。"]
  ];
  return (
    <section className="content-grid">
      <Panel title="通知模板">
        <section className="template-grid compact">
          {templates.map(([title, body]) => (
            <div className="template-card" key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
              <button className="secondary">預覽</button>
            </div>
          ))}
        </section>
      </Panel>
      <Panel title="發送紀錄">
        <Table headers={["編號", "類型", "對象", "通道", "狀態", "時間"]} rows={notifications.map((item) => [item.id, item.type, item.target, item.channel, item.status, item.sentAt])} />
      </Panel>
    </section>
  );
}

function Reports({ metrics, containers, payments }) {
  const typeStats = ["10ft", "20ft"].map((type) => {
    const typed = containers.filter((item) => item.type === type);
    const occupied = typed.filter((item) => item.status === "occupied").length;
    return { type, total: typed.length, occupied, rate: typed.length ? Math.round((occupied / typed.length) * 100) : 0 };
  });
  const paid = payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const unpaid = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
  return (
    <Panel title="經營分析">
      <section className="report-grid">
        <Kpi label="年度收入" value={formatMoney(metrics.yearlyIncome)} detail="已收款" />
        <Kpi label="未收金額" value={formatMoney(unpaid)} detail="需追蹤" tone="red" />
        <Kpi label="出租率" value={`${metrics.utilization}%`} detail="整體貨櫃" tone="blue" />
        <Kpi label="空櫃天數" value={`${containers.filter((item) => item.status === "vacant").reduce((sum, item) => sum + item.vacantDays, 0)} 天`} detail="累計可出租空窗" tone="yellow" />
      </section>
      <div className="analysis-grid">
        <div>
          <h3>規格出租率</h3>
          {typeStats.map((item) => <ProgressBar key={item.type} label={`${item.type} ${item.occupied}/${item.total}`} value={item.rate} />)}
        </div>
        <div>
          <h3>收款結構</h3>
          <ProgressBar label={`已收 ${formatMoney(paid)}`} value={paid + unpaid ? Math.round((paid / (paid + unpaid)) * 100) : 0} />
          <ProgressBar label={`未收 ${formatMoney(unpaid)}`} value={paid + unpaid ? Math.round((unpaid / (paid + unpaid)) * 100) : 0} tone="red" />
        </div>
      </div>
    </Panel>
  );
}

function AiAssistant({ metrics, containers, customersById, payments, reservations, maintenance }) {
  const suggestions = ["哪些貨櫃快到期？", "哪些客戶未繳費？", "空櫃還有幾個？", "本月收入多少？", "有哪些維修未完成？"];
  const [question, setQuestion] = useState(suggestions[0]);

  function answerQuestion(text) {
    if (text.includes("到期")) {
      const rows = containers
        .filter((item) => item.contractEnd && daysUntil(item.contractEnd) <= 90)
        .map((item) => `${item.id} ${customersById[item.customerId]?.name || "未指定"}，${item.contractEnd} 到期，剩 ${daysUntil(item.contractEnd)} 天`);
      return rows.length ? rows.join("；") : "90 天內沒有租約到期。";
    }
    if (text.includes("未繳") || text.includes("欠款") || text.includes("收款")) {
      const rows = payments
        .filter((item) => item.status !== "paid")
        .map((item) => `${customersById[item.customerId]?.name || item.customerId} / ${item.containerId} / 餘額 ${formatMoney(item.amount - item.paidAmount)} / 逾期 ${overdueDays(item.dueDate)} 天`);
      return rows.length ? rows.join("；") : "目前沒有未繳款。";
    }
    if (text.includes("空櫃")) {
      const vacant = containers.filter((item) => item.status === "vacant");
      return `目前有 ${vacant.length} 個空櫃：${vacant.map((item) => `${item.id}(${item.type})`).join("、")}。等待名單有 ${reservations.filter((item) => item.status === "waiting").length} 位。`;
    }
    if (text.includes("收入")) {
      return `本月已收租金 ${formatMoney(metrics.rent)}、電費 ${formatMoney(metrics.electric)}，合計 ${formatMoney(metrics.totalIncome)}。未收餘額 ${formatMoney(metrics.receivable)}。`;
    }
    if (text.includes("維修") || text.includes("檢查")) {
      const open = maintenance.filter((item) => item.status !== "完成");
      return open.length ? open.map((item) => `${item.containerId} ${item.type}，${item.priority}優先，${item.status}`).join("；") : "目前沒有未完成維修。";
    }
    return "我可以回答到期、未繳款、空櫃、本月收入、維修檢查等營運問題。";
  }

  return (
    <section className="content-grid">
      <Panel title="AI 營運助理">
        <div className="ai-box">
          <label>輸入問題<input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例如：哪些客戶未繳費？" /></label>
          <div className="ai-answer">
            <strong>AI 回答</strong>
            <p>{answerQuestion(question)}</p>
          </div>
          <div className="quick-actions">
            {suggestions.map((item) => <button className="secondary" key={item} onClick={() => setQuestion(item)}>{item}</button>)}
          </div>
        </div>
      </Panel>
      <Panel title="每日摘要">
        <div className="workflow vertical">
          <span>今日待收 {metrics.unpaid} 筆，未收 {formatMoney(metrics.receivable)}</span>
          <span>空櫃 {metrics.vacant} 個，候補 {metrics.waitlist} 位</span>
          <span>60 天內續約 {metrics.dueRenewals} 件</span>
          <span>未完成維修 {maintenance.filter((item) => item.status !== "完成").length} 件</span>
        </div>
      </Panel>
    </section>
  );
}

function ContainerMap({ containers, selectedId, onSelect }) {
  const zones = containers.reduce((grouped, item) => {
    grouped[item.zone] = grouped[item.zone] || [];
    grouped[item.zone].push(item);
    return grouped;
  }, {});

  return (
    <div className="container-map floorplan-map">
      <div className="status-legend">
        {Object.entries(statusMeta).map(([key, item]) => <span key={key}><i className={item.tone} />{item.label}</span>)}
      </div>
      <div className="yard-gate">入口 / 車道</div>
      {Object.entries(zones).map(([zone, items]) => (
        <div className="zone yard-zone" key={zone}>
          <strong>{zone} 區貨櫃列</strong>
          <div className="yard-row">
            <span className="aisle-label">通道</span>
            {items.map((item) => (
              <button className={`slot ${statusMeta[item.status].tone} ${selectedId === item.id ? "selected" : ""}`} key={item.id} onClick={() => onSelect?.(item.id)}>
                <b>{item.id}</b>
                <span>{item.type} / {statusMeta[item.status].label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectPill({ label, value, onChange, options }) {
  return (
    <label className="select-pill">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>
  );
}

function ProgressBar({ label, value, tone = "blue" }) {
  return (
    <div className="progress-row">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <i><b className={tone} style={{ width: `${value}%` }} /></i>
    </div>
  );
}

function KanbanBoard({ columns, items }) {
  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.status === column);
        return (
          <section className="kanban-column" key={column}>
            <h3>{column}<span>{columnItems.length}</span></h3>
            <div className="kanban-items">
              {columnItems.length ? columnItems.map((item) => (
                <article className="kanban-card" key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                  <p>{item.detail}</p>
                </article>
              )) : <em>目前無項目</em>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FloatingAssistant({ metrics, containers, customersById, payments, maintenance, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const urgentPayment = payments.find((item) => item.status !== "paid");
  const dueContainer = containers.find((item) => item.contractEnd && daysUntil(item.contractEnd) <= 90);
  const openMaintenance = maintenance.filter((item) => item.status !== "完成").length;

  return (
    <div className={`floating-ai ${open ? "open" : ""}`}>
      {open && (
        <div className="floating-ai-panel">
          <strong>AI 營運助理</strong>
          <p>今日待收 {formatMoney(metrics.receivable)}，未完成維修 {openMaintenance} 件，空櫃 {metrics.vacant} 個。</p>
          <button onClick={() => setActiveTab("收費管理")}>查看未收款：{urgentPayment ? customersById[urgentPayment.customerId]?.name : "無"}</button>
          <button onClick={() => setActiveTab("續約提醒")}>查看快到期：{dueContainer?.id || "無"}</button>
          <button onClick={() => setActiveTab("AI助理")}>開啟完整助理</button>
        </div>
      )}
      <button className="floating-ai-button" onClick={() => setOpen((value) => !value)}>AI</button>
    </div>
  );
}

function Kpi({ label, value, detail, tone = "" }) {
  return (
    <div className={`kpi ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <em>{detail}</em>}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Badge({ tone, children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Table({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default App;
