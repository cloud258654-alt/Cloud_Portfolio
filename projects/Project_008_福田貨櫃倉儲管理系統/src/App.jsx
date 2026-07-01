import React, { useMemo, useState, useEffect } from "react";

const RATE = {
  FIRST_YEAR: { "10ft": 48000, "20ft": 72000 },
  RENEWAL: { "10ft": 72000, "20ft": 84000 },
  ELECTRICITY_BASE: 1000,
  ELECTRICITY_RATE: 9,
};

function calcAnnualRent(type, contractType) {
  return getAnnualRent(type, contractType);
}

function calcMonthlyDeposit(type, contractType = "firstYear") {
  return getDeposit(type, contractType);
}

function getAnnualRent(type, contractType = "firstYear") {
  const table = contractType === "renewal" ? RATE.RENEWAL : RATE.FIRST_YEAR;
  return table[type] || RATE.FIRST_YEAR["20ft"];
}

function getMonthlyRent(type, contractType = "firstYear") {
  return Math.round(getAnnualRent(type, contractType) / 12);
}

function getDeposit(type, contractType = "firstYear") {
  return getMonthlyRent(type, contractType);
}

function formatContractType(contractType) {
  return contractType === "renewal" ? "續約" : "首年";
}

const containersSeed = [
  { id: "A01", type: "20ft", zone: "A", status: "occupied", customerId: "C0001", monthlyRent: 6000, contractEnd: "2027-04-30", inspection: "正常", vacantDays: 0 },
  { id: "A02", type: "10ft", zone: "A", status: "vacant", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "可出租", vacantDays: 12 },
  { id: "A03", type: "20ft", zone: "A", status: "reserved", customerId: "C0002", monthlyRent: 6000, contractEnd: "2027-04-30", inspection: "預約保留中", vacantDays: 0 },
  { id: "A04", type: "10ft", zone: "A", status: "maintenance", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "門片需檢修", vacantDays: 0 },
  { id: "B01", type: "20ft", zone: "B", status: "occupied", customerId: "C0003", monthlyRent: 6000, contractEnd: "2027-03-31", inspection: "大量用電", vacantDays: 0 },
  { id: "B02", type: "10ft", zone: "B", status: "vacant", customerId: "", monthlyRent: 4000, contractEnd: "", inspection: "可出租", vacantDays: 5 },
  { id: "B03", type: "20ft", zone: "B", status: "occupied", customerId: "C0004", monthlyRent: 7000, contractEnd: "2027-05-10", inspection: "正常", vacantDays: 0 },
  { id: "C01", type: "20ft", zone: "C", status: "occupied", customerId: "C0005", monthlyRent: 6000, contractEnd: "2026-08-21", inspection: "60 天內到期", vacantDays: 0 }
];

const customersSeed = [
  { id: "C0001", name: "王先生", phone: "0912-345-678", lineId: "wang_line", idNumber: "A123456789", address: "台中市西屯區", email: "wang@example.com", remark: "年度付款", status: "active", invoiceTitle: "王大明", companyName: "", contactPerson: "王大明", paymentPreference: "匯款", noticePreference: "LINE", riskNote: "" },
  { id: "C0002", name: "陳小姐", phone: "0922-111-222", lineId: "chen_line", idNumber: "B223456789", address: "彰化縣員林市", email: "chen@example.com", remark: "預約 A03", status: "reserved", invoiceTitle: "陳美美", companyName: "", contactPerson: "陳美美", paymentPreference: "現金", noticePreference: "LINE", riskNote: "" },
  { id: "C0003", name: "林先生", phone: "0933-222-333", lineId: "lin_line", idNumber: "C323456789", address: "南投縣草屯鎮", email: "lin@example.com", remark: "大量用電", status: "active", invoiceTitle: "林建材行", companyName: "林建材行", contactPerson: "林先生", paymentPreference: "匯款", noticePreference: "LINE", riskNote: "高用電，需定期檢查" },
  { id: "C0004", name: "李小姐", phone: "0955-666-777", lineId: "lee_line", idNumber: "D423456789", address: "台中市南區", email: "lee@example.com", remark: "續約提醒", status: "active", invoiceTitle: "李美玲", companyName: "", contactPerson: "李美玲", paymentPreference: "匯款", noticePreference: "LINE", riskNote: "" },
  { id: "C0005", name: "張先生", phone: "0966-777-888", lineId: "chang_line", idNumber: "E523456789", address: "台中市北屯區", email: "chang@example.com", remark: "60 天內到期", status: "overdue", invoiceTitle: "張大維", companyName: "大維物流", contactPerson: "張大維", paymentPreference: "支票", noticePreference: "電話", riskNote: "租約將到期，需確認續約意向" },
  { id: "C0006", name: "黃先生", phone: "0977-888-999", lineId: "huang_line", idNumber: "F623456789", address: "台中市大里區", email: "huang@example.com", remark: "排隊等待中", status: "prospect", invoiceTitle: "黃建國", companyName: "", contactPerson: "黃建國", paymentPreference: "", noticePreference: "LINE", riskNote: "" }
];

const reservationsSeed = [
  { id: "R001", customerId: "C0006", type: "20ft", date: "2026-06-22", status: "waiting", priority: 1, holdUntil: "", containerId: "", note: "等待 20 呎空櫃", preferredZone: "B", reservedContainerId: "", depositRequired: false, depositPaid: false, reservationDepositAmount: 0, reservationDepositPaidAt: "" },
  { id: "R002", customerId: "C0002", type: "20ft", date: "2026-06-22", status: "reserved", priority: 2, holdUntil: "2026-06-23 18:00", containerId: "A03", note: "A03 保留中", preferredZone: "A", reservedContainerId: "A03", depositRequired: true, depositPaid: true, reservationDepositAmount: 6000, reservationDepositPaidAt: "2026-06-22" },
  { id: "R003", customerId: "C0006", type: "10ft", date: "2026-06-21", status: "waiting", priority: 3, holdUntil: "", containerId: "", note: "可接受 B 區", preferredZone: "B", reservedContainerId: "", depositRequired: true, depositPaid: false, reservationDepositAmount: 4000, reservationDepositPaidAt: "" }
];

const paymentsSeed = [
  { id: "P001", customerId: "C0001", containerId: "A01", contractId: "CT001", type: "rent", amount: 72000, status: "paid", dueDate: "2026-04-10", paidAmount: 72000, method: "銀行轉帳", invoice: "INV-202604-001", paidDate: "2026-04-10", paidAt: "2026-04-10", collectedBy: "管理員", paymentNote: "客戶匯款，後五碼已核對", bankLastFiveDigits: "67890", receiptStatus: "issued", invoiceStatus: "issued", partialPayments: [] },
  { id: "P002", customerId: "C0003", containerId: "B01", contractId: "", type: "electricity", amount: 8650, status: "paid", dueDate: "2026-06-15", paidAmount: 8650, method: "現金", invoice: "INV-202606-002", paidDate: "2026-06-15", paidAt: "2026-06-15", collectedBy: "現場人員", paymentNote: "電表抄表後現場收取", bankLastFiveDigits: "", receiptStatus: "issued", invoiceStatus: "notRequired", partialPayments: [] },
  { id: "P003", customerId: "C0004", containerId: "B03", contractId: "CT002", type: "rent", amount: 84000, status: "unpaid", dueDate: "2026-06-10", paidAmount: 0, method: "待付款", invoice: "INV-202606-003", paidDate: "", paidAt: "", collectedBy: "", paymentNote: "續約租金，待客戶匯款", bankLastFiveDigits: "", receiptStatus: "pending", invoiceStatus: "pending", partialPayments: [] },
  { id: "P004", customerId: "C0005", containerId: "C01", contractId: "CT003", type: "deposit", amount: 6000, status: "paid", dueDate: "2026-06-01", paidAmount: 6000, method: "銀行轉帳", invoice: "INV-202606-004", paidDate: "2026-06-01", paidAt: "2026-06-01", collectedBy: "徐先生", paymentNote: "首次承租押金，後五碼已核對", bankLastFiveDigits: "0958", receiptStatus: "issued", invoiceStatus: "issued", partialPayments: [] },
  { id: "P005", customerId: "C0003", containerId: "B01", contractId: "", type: "rent", amount: 84000, status: "partial", dueDate: "2026-06-18", paidAmount: 30000, method: "部分付款", invoice: "INV-202606-005", paidDate: "", paidAt: "", collectedBy: "", paymentNote: "客戶分兩次付款", bankLastFiveDigits: "", receiptStatus: "pending", invoiceStatus: "pending", partialPayments: [{ amount: 10000, paidAt: "2026-06-10", method: "匯款", bankLastFiveDigits: "12345", collectedBy: "管理員", note: "第一筆部分付款" }, { amount: 20000, paidAt: "2026-06-18", method: "現金", bankLastFiveDigits: "", collectedBy: "現場人員", note: "第二筆部分付款" }] }
];

const electricitySeed = [
  { containerId: "A01", lastMeter: 1200, currentMeter: 1200, usage: 0, amount: 1000 },
  { containerId: "B01", lastMeter: 800, currentMeter: 1650, usage: 850, amount: 8650 },
  { containerId: "B03", lastMeter: 430, currentMeter: 430, usage: 0, amount: 1000 }
];

const maintenanceSeed = [
  { id: "M001", containerId: "A04", type: "門片檢修", priority: "高", status: "處理中", assignee: "現場人員", date: "2026-06-22", photos: 2, note: "門片卡住，需更換滑輪" },
  { id: "M002", containerId: "B01", type: "電表檢查", priority: "中", status: "待派工", assignee: "未指派", date: "2026-06-23", photos: 0, note: "大量用電客戶，月底前複查" },
  { id: "M003", containerId: "A02", type: "出租前檢查", priority: "低", status: "完成", assignee: "阿明", date: "2026-06-20", photos: 4, note: "內部乾燥，鎖具正常" }
];

const contractsSeed = [
  { id: "CT001", customerId: "C0001", containerId: "A01", status: "signed", contractType: "firstYear", version: "v1.2", contractVersion: "v1.2", start: "2026-05-01", end: "2027-04-30", rent: 72000, deposit: 6000, signedAt: "2026-04-28 14:22", paymentStatus: "paid", terminationNoticeDays: 30, earlyTerminationRule: "中途退租需提前通知，依實際使用期間與合約條款計算退款或補款。", damagePolicy: "退租時若貨櫃、門鎖、內裝或設備損壞，將依修繕實際費用自押金扣除。", refundPolicy: "押金於退租點交完成並扣除未繳費用、電費、損壞費後退還。", electricityPolicy: "基本電費每年 1,000 元；大量用電每度 9 元，可獨立裝設電錶計算。" },
  { id: "CT002", customerId: "C0004", containerId: "B03", status: "pending", contractType: "renewal", version: "v1.0", contractVersion: "v1.0", start: "2026-05-11", end: "2027-05-10", rent: 84000, deposit: 7000, signedAt: "", paymentStatus: "unpaid", terminationNoticeDays: 30, earlyTerminationRule: "中途退租需提前通知，依實際使用期間與合約條款計算退款或補款。", damagePolicy: "退租時若貨櫃、門鎖、內裝或設備損壞，將依修繕實際費用自押金扣除。", refundPolicy: "押金於退租點交完成並扣除未繳費用、電費、損壞費後退還。", electricityPolicy: "基本電費每年 1,000 元；大量用電每度 9 元，可獨立裝設電錶計算。" },
  { id: "CT003", customerId: "C0005", containerId: "C01", status: "draft", contractType: "firstYear", version: "v1.0", contractVersion: "v1.0", start: "2026-08-22", end: "2027-08-21", rent: 72000, deposit: 6000, signedAt: "", paymentStatus: "unpaid", terminationNoticeDays: 30, earlyTerminationRule: "中途退租需提前通知，依實際使用期間與合約條款計算退款或補款。", damagePolicy: "退租時若貨櫃、門鎖、內裝或設備損壞，將依修繕實際費用自押金扣除。", refundPolicy: "押金於退租點交完成並扣除未繳費用、電費、損壞費後退還。", electricityPolicy: "基本電費每年 1,000 元；大量用電每度 9 元，可獨立裝設電錶計算。" }
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
  confirmed: { label: "已確認", tone: "green" },
  converted: { label: "已轉租", tone: "green" },
  expired: { label: "已失效", tone: "red" },
  cancelled: { label: "已取消", tone: "red" }
};

const paymentTypes = {
  rent: "租金",
  deposit: "押金",
  electricity: "電費",
  terminationFee: "解約費",
  damageFee: "損壞扣款",
  refund: "退款"
};

const withdrawalStages = ["requested", "inspection", "settlement", "completed", "cancelled"];
const withdrawalStageLabels = { requested: { label: "已申請", tone: "blue" }, inspection: { label: "點交檢查", tone: "yellow" }, settlement: { label: "費用結算", tone: "yellow" }, completed: { label: "已完成", tone: "green" }, cancelled: { label: "已取消", tone: "red" } };

/* ========== Storage Helpers ========== */
const STORAGE_KEY = "futian_storage_v1";
const SYSTEM_VERSION = "MVP v0.5";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data._meta) return null;
    return data;
  } catch { return null; }
}

function saveToStorage(state) {
  try {
    const rCount = (state.customers?.length || 0) + (state.containers?.length || 0) + (state.reservations?.length || 0) + (state.contracts?.length || 0) + (state.payments?.length || 0) + (state.electricity?.length || 0) + (state.maintenance?.length || 0);
    const data = { ...state, _meta: { savedAt: new Date().toISOString(), version: SYSTEM_VERSION, recordCount: rCount } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

function resetStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function getStorageMeta() {
  const data = loadFromStorage();
  return data?._meta || null;
}

function getStorageTotalRecords() {
  const data = loadFromStorage();
  if (!data) return 0;
  return (data.customers?.length || 0) + (data.containers?.length || 0) + (data.reservations?.length || 0) + (data.contracts?.length || 0) + (data.payments?.length || 0) + (data.electricity?.length || 0) + (data.maintenance?.length || 0);
}

const tabs = ["Dashboard", "貨櫃管理", "QR掃描", "維修檢查", "客戶管理", "客戶入口", "預約管理", "電子合約", "收費管理", "電費管理", "續約提醒", "退租管理", "通知中心", "報表", "AI助理"];

function formatMoney(value) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(value);
}

function getPaidAmount(item) {
  if (item.partialPayments && item.partialPayments.length > 0) {
    return item.partialPayments.reduce((sum, p) => sum + p.amount, 0);
  }
  return item.paidAmount || 0;
}

function getPaymentStatus(item) {
  const paid = getPaidAmount(item);
  const balance = item.amount - paid;
  if (balance <= 0) return "paid";
  if (paid > 0 && balance > 0) return "partial";
  return "unpaid";
}

const receiptBadge = { pending: { tone: "yellow", label: "待開立" }, issued: { tone: "green", label: "已開立" }, notRequired: { tone: "blue", label: "免開立" } };
const invoiceBadge = { pending: { tone: "yellow", label: "待開立" }, issued: { tone: "green", label: "已開立" }, notRequired: { tone: "blue", label: "免開立" } };

function daysUntil(dateText) {
  if (!dateText) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateText}T00:00:00`);
  return Math.ceil((date - today) / 86400000);
}

function overdueDays(dateText) {
  const days = daysUntil(dateText);
  return days < 0 ? Math.abs(days) : 0;
}

function monthsBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (e < s) return 0;
  const rawMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const countsCurrentMonth = e.getDate() >= s.getDate() - 1 ? 1 : 0;
  return Math.max(1, rawMonths + countsCurrentMonth);
}

function App() {
  const saved = loadFromStorage();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [containers, setContainers] = useState(saved?.containers || containersSeed);
  const [customers, setCustomers] = useState(saved?.customers || customersSeed);
  const [reservations, setReservations] = useState(saved?.reservations || reservationsSeed);
  const [payments, setPayments] = useState(saved?.payments || paymentsSeed);
  const [electricity, setElectricity] = useState(saved?.electricity || electricitySeed);
  const [notifications, setNotifications] = useState(saved?.notifications || notificationsSeed);
  const [maintenance, setMaintenance] = useState(saved?.maintenance || maintenanceSeed);
  const [contracts, setContracts] = useState(saved?.contracts || contractsSeed);

  useEffect(() => {
    saveToStorage({ customers, containers, reservations, contracts, payments, electricity, maintenance, notifications });
  }, [customers, containers, reservations, contracts, payments, electricity, maintenance, notifications]);

  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  const metrics = useMemo(() => {
    const occupied = containers.filter((item) => item.status === "occupied").length;
    const vacant = containers.filter((item) => item.status === "vacant").length;
    const reserved = containers.filter((item) => item.status === "reserved").length;
    const rent = payments.filter((item) => item.status === "paid" && item.type === "rent").reduce((sum, item) => sum + item.amount, 0);
    const electric = payments.filter((item) => item.status === "paid" && item.type === "electricity").reduce((sum, item) => sum + item.amount, 0);
    const depositPaid = payments.filter((item) => item.status === "paid" && item.type === "deposit").reduce((sum, item) => sum + item.amount, 0);
    const dueRenewals = containers.filter((item) => item.status === "occupied" && daysUntil(item.contractEnd) <= 60).length;
    const unpaid = payments.filter((item) => item.status !== "paid").length;
    const receivable = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);

    const maintenanceCount = containers.filter((item) => item.status === "maintenance").length;
    const reservationDepositTotal = reservations.filter((r) => r.depositPaid).reduce((sum, r) => sum + (r.reservationDepositAmount || 0), 0);
    const pendingDepositReservations = reservations.filter((r) => r.depositRequired && !r.depositPaid).length;
    const nearExpiring30 = containers.filter((item) => item.status === "occupied" && daysUntil(item.contractEnd) !== null && daysUntil(item.contractEnd) <= 30).length;
    const overdueAmount = payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).reduce((sum, item) => sum + (item.amount - getPaidAmount(item)), 0);
    const totalRentReceivable = payments.filter((item) => item.type === "rent").reduce((sum, item) => sum + item.amount, 0);
    const totalRentCollected = payments.filter((item) => item.type === "rent").reduce((sum, item) => sum + getPaidAmount(item), 0);
    const overdueCustomerIds = new Set(payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).map((item) => item.customerId));
    const checkoutCases = 0;

    return {
      total: containers.length,
      occupied,
      vacant,
      reserved,
      maintenanceCount,
      utilization: containers.length ? Math.round((occupied / containers.length) * 1000) / 10 : 0,
      rent,
      electric,
      depositPaid,
      totalIncome: rent + electric + depositPaid,
      yearlyIncome: payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0),
      dueRenewals,
      unpaid,
      receivable,
      overdueAmount,
      overdueCustomerCount: overdueCustomerIds.size,
      waitlist: reservations.filter((item) => item.status === "waiting").length,
      reservationDepositTotal,
      pendingDepositReservations,
      nearExpiring30,
      totalRentReceivable,
      totalRentCollected,
      checkoutCases
    };
  }, [containers, payments, reservations]);

  function addContainer(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get("id")).trim().toUpperCase();
    if (!id || containers.some((item) => item.id === id)) return;
    setContainers((items) => [
      ...items,
      { id, type: data.get("type"), zone: data.get("zone"), status: data.get("status"), customerId: "", monthlyRent: getMonthlyRent(data.get("type"), "firstYear"), contractEnd: "", inspection: "新建檔", vacantDays: 0 }
    ]);
    event.currentTarget.reset();
  }

  function addCustomer(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextNumber = String(customers.length + 1).padStart(4, "0");
    setCustomers((items) => [
      ...items,
      {
        id: `C${nextNumber}`,
        name: data.get("name"),
        phone: data.get("phone"),
        lineId: data.get("lineId") || "",
        idNumber: data.get("idNumber") || "",
        address: data.get("address") || "",
        email: data.get("email") || "",
        remark: data.get("remark") || "",
        status: "prospect",
        invoiceTitle: data.get("invoiceTitle") || data.get("name"),
        companyName: data.get("companyName") || "",
        contactPerson: data.get("contactPerson") || data.get("name"),
        paymentPreference: data.get("paymentPreference") || "",
        noticePreference: data.get("noticePreference") || "LINE",
        riskNote: data.get("riskNote") || ""
      }
    ]);
    event.currentTarget.reset();
  }

  function markPaymentPaid(paymentId, payMethod, collectedBy) {
    const method = payMethod || "匯款";
    const today = "2026-06-22";
    setPayments((items) => items.map((item) =>
      item.id === paymentId ? { ...item, status: "paid", paidAmount: item.amount, method, paidDate: today, paidAt: today, collectedBy: collectedBy || "管理員", receiptStatus: "issued", invoiceStatus: "issued" } : item
    ));
  }

  function reserveNextWaiting(reservationId, containerId) {
    const targetContainerId = containerId || "";
    const holdDate = "2026-06-23 18:00";
    const note = targetContainerId ? `已保留 ${targetContainerId}，${holdDate} 前確認` : "已通知，24 小時內確認";

    const reservation = reservations.find((r) => r.id === reservationId);
    const customerId = reservation?.customerId || "";

    setReservations((items) => items.map((item) =>
      item.id === reservationId ? { ...item, status: "reserved", holdUntil: holdDate, containerId: targetContainerId, reservedContainerId: targetContainerId, note } : item
    ));

    if (targetContainerId) {
      setContainers((items) => items.map((item) =>
        item.id === targetContainerId && item.status === "vacant"
          ? { ...item, status: "reserved", customerId }
          : item
      ));
    }

    const customer = reservation ? customersById[reservation.customerId] : null;
    setNotifications((items) => [
      {
        id: `N${String(items.length + 1).padStart(3, "0")}`,
        type: "空櫃通知",
        target: customer?.name || "等待客戶",
        channel: customer?.noticePreference || "LINE",
        status: "已送達",
        sentAt: "2026-06-22 15:00"
      },
      ...items
    ]);
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

  function generateAnnualBills() {
    setPayments((prev) => {
      const occupied = containers.filter((c) => c.status === "occupied");
      const nextBills = occupied.map((container, idx) => {
        const contract = contracts.find((c) => c.containerId === container.id);
        const contractType = contract?.contractType || "firstYear";
        const annualRent = calcAnnualRent(container.type, contractType);
        return {
          id: `P${String(prev.length + idx + 1).padStart(3, "0")}`,
          customerId: container.customerId,
          containerId: container.id,
          contractId: contract?.id || "",
          type: "rent",
          amount: annualRent,
          status: "unpaid",
          dueDate: "2026-09-01",
          paidAmount: 0,
          method: "待付款",
          invoice: `INV-202609-${String(idx + 1).padStart(3, "0")}`,
          paidDate: "",
          paidAt: "",
          collectedBy: "",
          paymentNote: "",
          bankLastFiveDigits: "",
          receiptStatus: "pending",
          invoiceStatus: "pending",
          partialPayments: []
        };
      });
      return [...nextBills, ...prev];
    });
  }

  function sendCollectionNotice(paymentId) {
    const payment = payments.find((item) => item.id === paymentId);
    const customer = payment ? customersById[payment.customerId] : null;
    if (!payment || !customer) return;
    setNotifications((items) => [
      { id: `N${String(items.length + 1).padStart(3, "0")}`, type: "催收通知", target: customer.name, channel: customer.noticePreference || "LINE", status: "已送達", sentAt: "2026-06-22 16:00" },
      ...items
    ]);
  }

  function signContract(contractId) {
    setContracts((items) => items.map((item) =>
      item.id === contractId ? { ...item, status: "signed", signedAt: "2026-06-22 16:30" } : item
    ));
  }

  function handleResetData() {
    if (!window.confirm("是否確定恢復初始資料？此操作將刪除所有已儲存的資料。")) return;
    resetStorage();
    setContainers(containersSeed);
    setCustomers(customersSeed);
    setReservations(reservationsSeed);
    setPayments(paymentsSeed);
    setElectricity(electricitySeed);
    setMaintenance(maintenanceSeed);
    setContracts(contractsSeed);
    setNotifications(notificationsSeed);
  }

  function handleExportJSON() {
    const data = { customers, containers, reservations, contracts, payments, electricity, maintenance, metadata: { exportTime: new Date().toISOString(), systemVersion: SYSTEM_VERSION, recordCount: customers.length + containers.length + reservations.length + contracts.length + payments.length + electricity.length + maintenance.length } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url; a.download = `FutianStorage_${dateStr}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || !data.customers || !data.containers || !data.contracts) { window.alert("資料格式錯誤：缺少必要欄位。"); return; }
        const missing = [];
        if (!data.reservations) missing.push("預約");
        if (!data.payments) missing.push("帳單");
        if (!data.electricity) missing.push("電費");
        if (!data.maintenance) missing.push("維修");
        if (!data.notifications) missing.push("通知");
        setCustomers(data.customers); setContainers(data.containers); setReservations(data.reservations || reservationsSeed); setContracts(data.contracts); setPayments(data.payments || paymentsSeed); setElectricity(data.electricity || electricitySeed); setMaintenance(data.maintenance || maintenanceSeed); setNotifications(data.notifications || notificationsSeed);
        const msg = missing.length > 0 ? `資料匯入成功！注意：以下欄位未提供，已使用預設資料：${missing.join("、")}。` : "資料匯入成功！";
        window.alert(msg);
      } catch { window.alert("資料格式錯誤，無法解析 JSON。"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function exportCSV(type) {
    const BOM = "\uFEFF";
    let csv = BOM;
    if (type === "customers") {
      csv += "ID,姓名,電話,LINE,狀態,公司,地址,Email,付款偏好,通知偏好,備註\n";
      customers.forEach((c) => { csv += `${c.id},${c.name},${c.phone},${c.lineId},${c.status},${c.companyName || ""},${c.address || ""},${c.email || ""},${c.paymentPreference || ""},${c.noticePreference || ""},${c.remark || ""}\n`; });
    } else if (type === "contracts") {
      csv += "合約ID,客戶,貨櫃,類型,狀態,租期起,租期迄,年租金,押金,版本,簽署時間,收款狀態\n";
      contracts.forEach((c) => { csv += `${c.id},${customersById[c.customerId]?.name || c.customerId},${c.containerId},${c.contractType},${c.status},${c.start},${c.end},${c.rent},${c.deposit},${c.contractVersion},${c.signedAt || ""},${c.paymentStatus}\n`; });
    } else if (type === "payments") {
      csv += "帳單,客戶,貨櫃,類型,金額,已繳,餘額,狀態,付款方式,到期日,付款日期,收款人,備註\n";
      payments.forEach((p) => { csv += `${p.invoice},${customersById[p.customerId]?.name || p.customerId},${p.containerId},${paymentTypes[p.type] || p.type},${p.amount},${getPaidAmount(p)},${p.amount - getPaidAmount(p)},${getPaymentStatus(p)},${p.method},${p.dueDate},${p.paidAt || ""},${p.collectedBy || ""},${p.paymentNote || ""}\n`; });
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const storageMeta = getStorageMeta();
  const totalRecords = getStorageTotalRecords() || (customers.length + containers.length + reservations.length + contracts.length + payments.length + electricity.length + maintenance.length);

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

        {activeTab === "Dashboard" && <Dashboard metrics={metrics} containers={containers} customersById={customersById} payments={payments} reservations={reservations} maintenance={maintenance} contracts={contracts} storageMeta={storageMeta} totalRecords={totalRecords} handleResetData={handleResetData} handleExportJSON={handleExportJSON} handleImportJSON={handleImportJSON} exportCSV={exportCSV} setActiveTab={setActiveTab} />}
        {activeTab === "貨櫃管理" && <ContainerManagement containers={containers} payments={payments} customersById={customersById} addContainer={addContainer} />}
        {activeTab === "QR掃描" && <QrScanner containers={containers} customersById={customersById} payments={payments} maintenance={maintenance} />}
        {activeTab === "維修檢查" && <MaintenanceManagement maintenance={maintenance} containers={containers} addMaintenance={addMaintenance} completeMaintenance={completeMaintenance} />}
        {activeTab === "客戶管理" && <CustomerManagement customers={customers} containers={containers} payments={payments} reservations={reservations} contracts={contracts} customersById={customersById} addCustomer={addCustomer} />}
        {activeTab === "客戶入口" && <CustomerPortal customers={customers} containers={containers} payments={payments} customersById={customersById} contracts={contracts} />}
        {activeTab === "預約管理" && <ReservationManagement reservations={reservations} metrics={metrics} customersById={customersById} containers={containers} reserveNextWaiting={reserveNextWaiting} setReservations={setReservations} />}
        {activeTab === "電子合約" && <ContractManagement contracts={contracts} customersById={customersById} payments={payments} containers={containers} reservations={reservations} signContract={signContract} />}
        {activeTab === "收費管理" && <PaymentManagement payments={payments} customersById={customersById} contracts={contracts} containers={containers} reservations={reservations} markPaymentPaid={markPaymentPaid} generateAnnualBills={generateAnnualBills} sendCollectionNotice={sendCollectionNotice} />}
        {activeTab === "電費管理" && <ElectricityManagement electricity={electricity} />}
        {activeTab === "續約提醒" && <RenewalManagement containers={containers} customersById={customersById} />}
        {activeTab === "退租管理" && <CheckoutManagement containers={containers} customersById={customersById} contracts={contracts} payments={payments} setContainers={setContainers} setContracts={setContracts} setCustomers={setCustomers} />}
        {activeTab === "通知中心" && <NotificationCenter notifications={notifications} />}
        {activeTab === "報表" && <Reports metrics={metrics} containers={containers} payments={payments} />}
        {activeTab === "AI助理" && <AiAssistant metrics={metrics} containers={containers} customersById={customersById} payments={payments} reservations={reservations} maintenance={maintenance} contracts={contracts} />}
        <FloatingAssistant metrics={metrics} containers={containers} customersById={customersById} payments={payments} reservations={reservations} maintenance={maintenance} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

function Dashboard({ metrics, containers, customersById, payments, reservations, maintenance, contracts, storageMeta, totalRecords, handleResetData, handleExportJSON, handleImportJSON, exportCSV, setActiveTab }) {
  const upcoming = containers.filter((item) => item.contractEnd).map((item) => ({ ...item, days: daysUntil(item.contractEnd) })).sort((a, b) => a.days - b.days).slice(0, 4);
  const openMaintenance = maintenance.filter((item) => item.status !== "完成").length;

  const riskItems = [
    ...payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).map((item) => ({
      type: "逾期未繳", tone: "red", customer: customersById[item.customerId]?.name || item.customerId, container: item.containerId, detail: `${paymentTypes[item.type] || item.type} ${formatMoney(item.amount - getPaidAmount(item))} / 逾期 ${overdueDays(item.dueDate)} 天`, action: "發送催收通知"
    })),
    ...containers.filter((c) => c.status === "occupied" && daysUntil(c.contractEnd) !== null && daysUntil(c.contractEnd) <= 30).map((c) => ({
      type: "合約即將到期", tone: "yellow", customer: customersById[c.customerId]?.name || c.customerId, container: c.id, detail: `${c.contractEnd} / 剩 ${daysUntil(c.contractEnd)} 天`, action: "聯絡客戶續約"
    })),
    ...reservations.filter((r) => r.depositRequired && !r.depositPaid).map((r) => ({
      type: "預約未收訂金", tone: "yellow", customer: customersById[r.customerId]?.name || r.customerId, container: r.reservedContainerId || r.containerId || "-", detail: `應收訂金 ${formatMoney(r.reservationDepositAmount)}`, action: "聯繫收取訂金"
    })),
    ...reservations.filter((r) => r.status === "reserved" && r.holdUntil && new Date(r.holdUntil) < new Date("2026-06-22T18:00:00")).map((r) => ({
      type: "預約保留逾期", tone: "red", customer: customersById[r.customerId]?.name || r.customerId, container: r.reservedContainerId || "-", detail: `保留期限 ${r.holdUntil}`, action: "確認是否續留或釋出"
    })),
    ...containers.filter((c) => c.status === "maintenance").map((c) => ({
      type: "貨櫃維修中", tone: "blue", customer: "-", container: c.id, detail: c.inspection, action: "檢查維修進度"
    }))
  ];

  const todoItems = [
    ...payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).map((item) => ({
      priority: "high", tone: "red", task: `催收逾期帳單：${customersById[item.customerId]?.name || item.customerId}`, detail: `${formatMoney(item.amount - getPaidAmount(item))} / ${item.containerId}`, action: "發送 LINE 催收", tab: "收費管理"
    })),
    ...containers.filter((c) => c.status === "occupied" && daysUntil(c.contractEnd) !== null && daysUntil(c.contractEnd) <= 30).map((c) => ({
      priority: "high", tone: "yellow", task: `聯絡續約：${customersById[c.customerId]?.name || c.customerId}`, detail: `${c.id} ${c.contractEnd} / 剩 ${daysUntil(c.contractEnd)} 天`, action: "確認續約意向", tab: "續約提醒"
    })),
    ...reservations.filter((r) => r.depositRequired && !r.depositPaid).map((r) => ({
      priority: "medium", tone: "yellow", task: `跟進訂金：${customersById[r.customerId]?.name || r.customerId}`, detail: `${formatMoney(r.reservationDepositAmount)} / 預約 ${r.id}`, action: "催收預約訂金", tab: "預約管理"
    })),
    ...maintenance.filter((item) => item.status !== "完成").map((item) => ({
      priority: item.priority === "高" ? "high" : "medium", tone: item.priority === "高" ? "red" : "blue", task: `檢查維修：${item.containerId} ${item.type}`, detail: item.status, action: "現場檢查", tab: "維修檢查"
    })),
    { priority: "medium", tone: "blue", task: "合約追蹤", detail: `${contracts.filter((c) => c.status !== "signed").length} 份待簽署`, action: "查看合約狀態", tab: "電子合約" },
    { priority: "low", tone: "green", task: `候補客戶通知`, detail: `${metrics.waitlist} 位等待 / ${metrics.vacant} 個空櫃`, action: "通知候補客戶", tab: "預約管理" }
  ].sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0)).slice(0, 8);

  const containerSummary = {
    available: containers.filter((c) => c.status === "vacant").length,
    occupied: containers.filter((c) => c.status === "occupied").length,
    reserved: containers.filter((c) => c.status === "reserved").length,
    maintenance: containers.filter((c) => c.status === "maintenance").length
  };

  return (
    <>
      <section className="command-center">
        <div>
          <p className="eyebrow">今日重點</p>
          <h2>今日有 {metrics.unpaid + metrics.dueRenewals + openMaintenance} 件營運事項需要處理</h2>
          <p>出租率 {metrics.utilization}%，空櫃 {metrics.vacant} 個，逾期金額 {formatMoney(metrics.overdueAmount)}。</p>
        </div>
        <div className="quick-actions">
          <button className="primary" onClick={() => setActiveTab("預約管理")}>新增預約</button>
          <button className="secondary" onClick={() => setActiveTab("電子合約")}>產生合約</button>
          <button className="secondary" onClick={() => setActiveTab("AI助理")}>詢問 AI</button>
        </div>
      </section>

      <section className="kpi-grid">
        <Kpi label="本期應收租金" value={formatMoney(metrics.totalRentReceivable)} detail="所有租金帳單" tone="blue" />
        <Kpi label="已收金額" value={formatMoney(metrics.totalRentCollected)} detail="租金已入帳" tone="green" />
        <Kpi label="未收金額" value={formatMoney(metrics.receivable)} detail="待追蹤" tone="red" />
        <Kpi label="逾期金額" value={formatMoney(metrics.overdueAmount)} detail={`${metrics.overdueCustomerCount} 位客戶`} tone="red" />
        <Kpi label="押金總額" value={formatMoney(metrics.depositPaid)} detail="已收取" />
        <Kpi label="預約訂金" value={formatMoney(metrics.reservationDepositTotal)} detail={`${metrics.pendingDepositReservations} 筆待收`} tone={metrics.pendingDepositReservations > 0 ? "yellow" : "green"} />
        <Kpi label="空櫃數" value={metrics.vacant} detail="可立即安排" tone="green" />
        <Kpi label="使用中" value={metrics.occupied} detail={`${metrics.utilization}% 出租率`} tone="blue" />
        <Kpi label="維修中" value={metrics.maintenanceCount} detail="需追蹤" tone={metrics.maintenanceCount > 0 ? "yellow" : "green"} />
        <Kpi label="即將到期" value={metrics.nearExpiring30} detail="30 天內" tone="red" />
        <Kpi label="退租中" value={metrics.checkoutCases} detail="案件處理中" tone="yellow" />
        <Kpi label="逾期客戶" value={metrics.overdueCustomerCount} detail="需催繳" tone="red" />
      </section>

      <section className="dashboard-grid refined" style={{ marginBottom: "18px" }}>
        <Panel title="營運風險提醒">
          {riskItems.length > 0 ? (
            <div className="list">
              {riskItems.slice(0, 6).map((item, idx) => (
                <div className="list-row" key={idx} style={{ gridTemplateColumns: "1fr", display: "grid", gap: "4px", borderColor: item.tone === "red" ? "rgba(239,123,99,0.36)" : item.tone === "yellow" ? "rgba(196,154,85,0.4)" : "rgba(200,220,255,0.18)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Badge tone={item.tone}>{item.type}</Badge>
                    <strong>{item.customer}</strong>
                    <span style={{ color: "#aebed4" }}>{item.container}</span>
                  </div>
                  <span style={{ color: "#c3d0e1" }}>{item.detail}</span>
                  <em style={{ color: "#d8c08b", fontStyle: "normal", fontWeight: 700 }}>{item.action}</em>
                </div>
              ))}
              {riskItems.length > 6 && <p className="message">尚有 {riskItems.length - 6} 項風險，請查看各功能頁面。</p>}
            </div>
          ) : <p className="message">目前無營運風險。</p>}
        </Panel>
        <Panel title="今日待辦">
          <div className="list">
            {todoItems.map((item, idx) => (
              <button className="list-row" key={idx} onClick={() => setActiveTab(item.tab)} style={{ gridTemplateColumns: "1fr", display: "grid", gap: "4px", cursor: "pointer", borderColor: item.tone === "red" ? "rgba(239,123,99,0.36)" : item.tone === "yellow" ? "rgba(196,154,85,0.4)" : "rgba(200,220,255,0.18)", textAlign: "left", background: "transparent", width: "100%" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Badge tone={item.tone}>{item.priority === "high" ? "高" : item.priority === "medium" ? "中" : "低"}</Badge>
                  <strong style={{ color: "#e9eef7" }}>{item.task}</strong>
                </div>
                <span style={{ color: "#c3d0e1" }}>{item.detail}</span>
                <em style={{ color: "#d8c08b", fontStyle: "normal", fontWeight: 700 }}>{item.action}</em>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="貨櫃狀態摘要">
          <div className="analysis-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <ProgressBar label={`可租 (available) ${containerSummary.available}`} value={containers.length ? Math.round((containerSummary.available / containers.length) * 100) : 0} tone="green" />
              <ProgressBar label={`出租中 (occupied) ${containerSummary.occupied}`} value={containers.length ? Math.round((containerSummary.occupied / containers.length) * 100) : 0} tone="blue" />
              <ProgressBar label={`預約保留 (reserved) ${containerSummary.reserved}`} value={containers.length ? Math.round((containerSummary.reserved / containers.length) * 100) : 0} tone="yellow" />
              <ProgressBar label={`維修中 (maintenance) ${containerSummary.maintenance}`} value={containers.length ? Math.round((containerSummary.maintenance / containers.length) * 100) : 0} tone="red" />
            </div>
          </div>
        </Panel>
        <Panel title="本月收入">
          <div className="income-card">
            <span>租金 {formatMoney(metrics.rent)}</span>
            <span>電費 {formatMoney(metrics.electric)}</span>
            <span>押金 {formatMoney(metrics.depositPaid)}</span>
            <strong>{formatMoney(metrics.totalIncome)}</strong>
          </div>
        </Panel>
      </section>

      <section className="dashboard-grid refined" style={{ marginBottom: "18px" }}>
        <Panel title="資料管理">
          <div className="storage-status" style={{ marginBottom: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div className="detail-card" style={{ padding: "12px" }}>
                <span style={{ color: "#aebed4", fontSize: "13px", fontWeight: 700 }}>Storage</span>
                <strong style={{ color: "#35b989", display: "block", fontSize: "16px" }}>Healthy</strong>
              </div>
              <div className="detail-card" style={{ padding: "12px" }}>
                <span style={{ color: "#aebed4", fontSize: "13px", fontWeight: 700 }}>Last Save</span>
                <strong style={{ color: "#d8c08b", display: "block", fontSize: "14px" }}>{storageMeta?.savedAt ? new Date(storageMeta.savedAt).toLocaleString("zh-TW") : "尚未儲存"}</strong>
              </div>
              <div className="detail-card" style={{ padding: "12px" }}>
                <span style={{ color: "#aebed4", fontSize: "13px", fontWeight: 700 }}>Total Records</span>
                <strong style={{ color: "#e9eef7", display: "block", fontSize: "16px" }}>{totalRecords}</strong>
              </div>
              <div className="detail-card" style={{ padding: "12px" }}>
                <span style={{ color: "#aebed4", fontSize: "13px", fontWeight: 700 }}>System Version</span>
                <strong style={{ color: "#e9eef7", display: "block", fontSize: "14px" }}>{SYSTEM_VERSION}</strong>
              </div>
            </div>
          </div>
          <div className="quick-actions stacked">
            <button className="primary" onClick={handleExportJSON}>Export JSON</button>
            <label className="secondary" style={{ display: "block", textAlign: "center", cursor: "pointer" }}>
              Import JSON
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: "none" }} />
            </label>
          </div>
          <div className="quick-actions" style={{ marginTop: "8px" }}>
            <button className="secondary" onClick={() => exportCSV("customers")}>CSV: Customers</button>
            <button className="secondary" onClick={() => exportCSV("contracts")}>CSV: Contracts</button>
            <button className="secondary" onClick={() => exportCSV("payments")}>CSV: Payments</button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <button className="small-button" onClick={handleResetData} style={{ background: "#c14535" }}>Reset Demo Data</button>
          </div>
        </Panel>

        <Panel title="本月收入">
          <div className="income-card">
            <span>租金 {formatMoney(metrics.rent)}</span>
            <span>電費 {formatMoney(metrics.electric)}</span>
            <span>押金 {formatMoney(metrics.depositPaid)}</span>
            <strong>{formatMoney(metrics.totalIncome)}</strong>
          </div>
        </Panel>
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
        <Panel title="待收款">
          <div className="list">
            {payments.filter((item) => getPaymentStatus(item) !== "paid").map((item) => (
              <div className="list-row urgent" key={item.id}>
                <strong>{item.containerId}</strong>
                <span>{paymentTypes[item.type]}</span>
                <span>{customersById[item.customerId]?.name || item.customerId}</span>
                <span>{formatMoney(item.amount - getPaidAmount(item))}</span>
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
  const unpaid = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);
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
  const unpaid = payments.filter((item) => item.containerId === container.id && item.status !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);
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
          <span>客戶：{customer?.name || "未出租"}</span>
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

function CustomerManagement({ customers, containers, payments, reservations, contracts, customersById, addCustomer }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const customer = customersById[selectedCustomerId] || customers[0];

  const customerContainers = useMemo(() =>
    containers.filter((c) => c.customerId === customer?.id),
    [containers, customer]
  );

  const customerReservations = useMemo(() =>
    reservations.filter((r) => r.customerId === customer?.id),
    [reservations, customer]
  );

  const customerContracts = useMemo(() =>
    contracts.filter((c) => c.customerId === customer?.id),
    [contracts, customer]
  );

  const customerPayments = useMemo(() =>
    payments.filter((p) => p.customerId === customer?.id),
    [payments, customer]
  );

  const customerUnpaid = useMemo(() =>
    customerPayments.filter((p) => p.status !== "paid").reduce((sum, p) => sum + p.amount - getPaidAmount(p), 0),
    [customerPayments]
  );

  const customerStatusLabels = { prospect: "潛在", reserved: "已預約", active: "活躍", overdue: "逾期", checkout: "退租中", closed: "已結清" };

  return (
    <section className="content-grid">
      <Panel title="客戶中心">
        <div className="filter-bar">
          <label className="select-pill">選擇客戶
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
            </select>
          </label>
        </div>

        {customer && (
          <div className="customer-center-detail">
            <div className="detail-card">
              <div className="detail-hero blue">
                <strong>{customer.name}</strong>
                <span>{customer.id} / {customerStatusLabels[customer.status] || customer.status} / {customer.phone}</span>
              </div>
              <dl className="detail-list">
                <div><dt>身分證</dt><dd>{customer.idNumber || "-"}</dd></div>
                <div><dt>發票抬頭</dt><dd>{customer.invoiceTitle || "-"}</dd></div>
                <div><dt>公司名稱</dt><dd>{customer.companyName || "-"}</dd></div>
                <div><dt>聯絡人</dt><dd>{customer.contactPerson || "-"}</dd></div>
                <div><dt>付款偏好</dt><dd>{customer.paymentPreference || "-"}</dd></div>
                <div><dt>通知偏好</dt><dd>{customer.noticePreference || "-"}</dd></div>
                <div><dt>風險備註</dt><dd>{customer.riskNote || "無"}</dd></div>
                <div><dt>Line ID</dt><dd>{customer.lineId || "-"}</dd></div>
                <div><dt>Email</dt><dd>{customer.email || "-"}</dd></div>
                <div><dt>地址</dt><dd>{customer.address || "-"}</dd></div>
                <div><dt>備註</dt><dd>{customer.remark || "-"}</dd></div>
              </dl>
            </div>

            <div className="customer-summary-cards">
              <div className="detail-card">
                <strong>貨櫃</strong>
                {customerContainers.length ? customerContainers.map((c) => (
                  <div key={c.id} className="list-row">
                    <strong>{c.id}</strong>
                    <span>{c.type} / {c.zone} 區</span>
                    <span>{statusMeta[c.status].label}</span>
                    <span>{c.contractEnd || "無租約"}</span>
                  </div>
                )) : <p className="message">尚無租用貨櫃</p>}
              </div>

              <div className="detail-card">
                <strong>預約</strong>
                {customerReservations.length ? customerReservations.map((r) => (
                  <div key={r.id} className="list-row">
                    <strong>{r.id}</strong>
                    <span>{r.type}</span>
                    <Badge tone={reservationStatus[r.status].tone}>{reservationStatus[r.status].label}</Badge>
                    <span>{r.reservedContainerId || r.containerId || "待指定"}</span>
                  </div>
                )) : <p className="message">尚無預約</p>}
              </div>

              <div className="detail-card">
                <strong>合約</strong>
                {customerContracts.length ? customerContracts.map((c) => (
                  <div key={c.id} className="list-row">
                    <strong>{c.id}</strong>
                    <span>{c.containerId}</span>
                    <span>{c.start} ~ {c.end}</span>
                    <Badge tone={c.status === "signed" ? "green" : c.status === "pending" ? "red" : "yellow"}>{c.status === "signed" ? "已簽" : c.status === "pending" ? "待簽" : "草稿"}</Badge>
                  </div>
                )) : <p className="message">尚無合約</p>}
              </div>

              <div className="detail-card">
                <strong>帳單摘要</strong>
                <div className="summary-strip">
                  <Kpi label="總帳單" value={customerPayments.length} detail="筆" />
                  <Kpi label="未收款" value={formatMoney(customerUnpaid)} detail="待追蹤" tone={customerUnpaid > 0 ? "red" : "green"} />
                  <Kpi label="已繳筆數" value={customerPayments.filter((p) => p.status === "paid").length} detail="已結清" tone="green" />
                </div>
              </div>
            </div>
          </div>
        )}

        <Table
          headers={["客戶編號", "姓名", "電話", "LINE", "狀態", "公司", "付款偏好", "風險備註"]}
          rows={customers.map((item) => [
            item.id,
            item.name,
            item.phone,
            item.lineId,
            <Badge key={item.id} tone={item.status === "active" ? "green" : item.status === "prospect" ? "blue" : item.status === "reserved" ? "yellow" : item.status === "overdue" ? "red" : item.status === "checkout" ? "yellow" : "red"}>{customerStatusLabels[item.status] || item.status}</Badge>,
            item.companyName || "-",
            item.paymentPreference || "-",
            item.riskNote || "-"
          ])}
        />
      </Panel>

      <Panel title="新增客戶">
        <form className="form" onSubmit={addCustomer}>
          <label>姓名<input name="name" required /></label>
          <label>電話<input name="phone" required /></label>
          <label>身分證號<input name="idNumber" /></label>
          <label>發票抬頭<input name="invoiceTitle" /></label>
          <label>公司名稱<input name="companyName" /></label>
          <label>聯絡人<input name="contactPerson" /></label>
          <label>付款偏好<select name="paymentPreference"><option value="">未指定</option><option>匯款</option><option>現金</option><option>支票</option><option>信用卡</option></select></label>
          <label>通知偏好<select name="noticePreference"><option value="LINE">LINE</option><option>電話</option><option>Email</option></select></label>
          <label>Line ID<input name="lineId" /></label>
          <label>地址<input name="address" /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>風險備註<textarea name="riskNote" rows="2" placeholder="例如：高用電、付款延遲風險... " /></label>
          <label>備註<textarea name="remark" rows="2" /></label>
          <button className="primary">新增客戶</button>
        </form>
      </Panel>

      <Panel title="租賃與收款摘要">
        <Table
          headers={["客戶", "貨櫃", "租期", "未收金額"]}
          rows={containers.filter((item) => item.customerId).map((item) => {
            const unpaid = payments.filter((payment) => payment.containerId === item.id && payment.status !== "paid").reduce((sum, payment) => sum + payment.amount - getPaidAmount(payment), 0);
            return [customersById[item.customerId]?.name || item.customerId, item.id, `2026/05/01 ~ ${item.contractEnd}`, formatMoney(unpaid)];
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
  const unpaid = customerPayments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);
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
          rows={customerPayments.map((item) => [item.invoice, paymentTypes[item.type], formatMoney(item.amount), formatMoney(getPaidAmount(item)), formatMoney(item.amount - getPaidAmount(item)), item.status === "paid" ? "已繳" : item.status === "partial" ? "部分付款" : "待繳"])}
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

function ReservationManagement({ reservations, metrics, customersById, containers, reserveNextWaiting, setReservations }) {
  const vacantContainers = containers.filter((c) => c.status === "vacant");
  const [assignContainer, setAssignContainer] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReservations = statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter);

  const kanbanItems = reservations.map((item) => ({
    id: item.id,
    title: `${customersById[item.customerId]?.name || item.customerId} / ${item.type}`,
    status: reservationStatus[item.status].label,
    meta: `順位 ${item.priority}${(item.reservedContainerId || item.containerId) ? " / " + (item.reservedContainerId || item.containerId) : ""}${item.preferredZone ? " / " + item.preferredZone + "區" : ""}`,
    detail: (item.holdUntil || item.note) + (item.depositRequired && !item.depositPaid ? " / 待收訂金" : item.depositPaid ? ` / 已收訂金 ${formatMoney(item.reservationDepositAmount)}${item.reservationDepositPaidAt ? " " + item.reservationDepositPaidAt : ""}` : "")
  }));

  return (
    <section className="content-grid">
      <Panel title="預約與等待名單">
        <div className="filter-bar">
          <SelectPill label="狀態" value={statusFilter} onChange={setStatusFilter} options={[
            ["all", "全部"],
            ["waiting", "等待中"],
            ["reserved", "保留中"],
            ["confirmed", "已確認"],
            ["converted", "已轉租"],
            ["expired", "已失效"],
            ["cancelled", "已取消"]
          ]} />
        </div>
        <KanbanBoard columns={["等待中", "保留中", "已確認", "已轉租", "已失效", "已取消"]} items={kanbanItems} />
        <Table
          headers={["順位", "預約編號", "客戶", "規格", "偏好區域", "保留貨櫃", "日期", "狀態", "訂金", "保留期限", "操作"]}
          rows={[...filteredReservations].sort((a, b) => a.priority - b.priority).map((item) => [
            item.priority,
            item.id,
            customersById[item.customerId]?.name || item.customerId,
            item.type,
            item.preferredZone ? `${item.preferredZone}區` : "-",
            item.reservedContainerId || item.containerId || "-",
            item.date,
            <Badge key={`${item.id}-status`} tone={reservationStatus[item.status].tone}>{reservationStatus[item.status].label}</Badge>,
            item.depositRequired ? (item.depositPaid ? <div key={`${item.id}-dep`}><Badge tone="green">已收 {formatMoney(item.reservationDepositAmount)}</Badge>{item.reservationDepositPaidAt ? <div style={{color:"#aebed4", fontSize:"12px", marginTop:"2px"}}>{item.reservationDepositPaidAt}</div> : null}</div> : <Badge key={`${item.id}-dep`} tone="red">待收訂金</Badge>) : "不需",
            item.holdUntil || "-",
            item.status === "waiting" ? (
              <div key={item.id} className="quick-actions" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                <select
                  value={assignContainer[item.id] || ""}
                  onChange={(e) => setAssignContainer((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ minWidth: "90px" }}
                >
                  <option value="">不指定</option>
                  {vacantContainers.map((c) => <option key={c.id} value={c.id}>{c.id} ({c.type})</option>)}
                </select>
                <button className="small-button" onClick={() => reserveNextWaiting(item.id, assignContainer[item.id] || "")}>通知保留</button>
              </div>
            ) : item.holdUntil || item.note
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

function PaymentManagement({ payments, customersById, contracts, containers, reservations, markPaymentPaid, generateAnnualBills, sendCollectionNotice }) {
  const totalReceivable = payments.filter((item) => getPaymentStatus(item) !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);
  const [payMethodSelections, setPayMethodSelections] = useState({});

  const totalReservationDeposits = reservations.filter((r) => r.depositPaid).reduce((sum, r) => sum + r.reservationDepositAmount, 0);

  return (
    <Panel title="收費管理">
      <div className="summary-strip">
        <Kpi label="未收總額" value={formatMoney(totalReceivable)} detail="含部分付款餘額" tone="red" />
        <Kpi label="逾期筆數" value={payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).length} detail="需催繳" tone="yellow" />
        <Kpi label="已開帳單" value={payments.length} detail="可下載收據" tone="blue" />
      </div>
      {totalReservationDeposits > 0 && (
        <div className="notice-preview" style={{ marginBottom: "16px" }}>
          <strong>預約訂金資訊</strong>
          <p>已有客戶預約時繳付訂金，合計 {formatMoney(totalReservationDeposits)}，可在建立合約時作為押金折抵參考。</p>
        </div>
      )}
      <div className="automation-panel">
        <div>
          <strong>自動帳單與催收流程</strong>
          <span>依合約類型自動套用費率規則，產生年度租金帳單後可發送 LINE 催收。</span>
        </div>
        <button className="primary" onClick={generateAnnualBills}>產生年度租金帳單</button>
      </div>
      <div className="pricing">
        <span>10 呎首年 {formatMoney(48000)}</span>
        <span>10 呎續約 {formatMoney(72000)}</span>
        <span>20 呎首年 {formatMoney(72000)}</span>
        <span>20 呎續約 {formatMoney(84000)}</span>
        <span>押金：1 個月租金</span>
        <span>電費基本費 {formatMoney(1000)}/年，每度 9 元</span>
      </div>
      <Table
        headers={["帳單", "客戶", "貨櫃", "類型", "金額", "已繳", "餘額", "付款方式", "付款日期", "收款人", "後五碼", "收據", "發票", "部分付款", "備註", "到期日", "狀態", "逾期", "操作"]}
        rows={payments.map((item) => {
          const paid = getPaidAmount(item);
          const remaining = item.amount - paid;
          const hasPartial = item.partialPayments && item.partialPayments.length > 0;
          const status = getPaymentStatus(item);
          const isOverdue = status !== "paid" && overdueDays(item.dueDate) > 0;
          const recBadge = receiptBadge[item.receiptStatus] || { tone: "yellow", label: item.receiptStatus };
          const invBadge = invoiceBadge[item.invoiceStatus] || { tone: "yellow", label: item.invoiceStatus };
          return [
            item.invoice,
            customersById[item.customerId]?.name || item.customerId,
            item.containerId,
            paymentTypes[item.type] || item.type,
            <span key={`${item.id}-amt`} style={{ textAlign: "right", display: "block" }}>{formatMoney(item.amount)}</span>,
            <span key={`${item.id}-paid`} style={{ textAlign: "right", display: "block" }}>{formatMoney(paid)}</span>,
            <span key={`${item.id}-bal`} style={{ textAlign: "right", display: "block", color: remaining > 0 ? "#ef7b63" : "#35b989", fontWeight: 700 }}>{formatMoney(remaining)}</span>,
            item.method,
            item.paidAt || item.paidDate || "-",
            item.collectedBy || "-",
            item.bankLastFiveDigits || "-",
            <Badge key={`${item.id}-receipt`} tone={recBadge.tone}>{recBadge.label}</Badge>,
            <Badge key={`${item.id}-inv`} tone={invBadge.tone}>{invBadge.label}</Badge>,
            hasPartial
              ? <div key={`${item.id}-pp`} style={{ whiteSpace: "nowrap" }}>
                  <span style={{ color: "#f6c85f", cursor: "pointer", fontWeight: 700 }} title={item.partialPayments.map((p, i) => `${i + 1}. ${formatMoney(p.amount)} ${p.method}(${p.paidAt}) ${p.note || ""}`).join("\n")}>
                    {item.partialPayments.length} 筆 / {formatMoney(paid)}
                  </span>
                </div>
              : "-",
            item.paymentNote || "-",
            item.dueDate,
            <span key={`${item.id}-badge`}>
              <Badge tone={status === "paid" ? "green" : status === "partial" ? "yellow" : "red"}>
                {status === "paid" ? "已繳" : status === "partial" ? "部分付款" : "未繳"}
              </Badge>
              {isOverdue && <><br /><Badge tone="red">逾期</Badge></>}
            </span>,
            `${overdueDays(item.dueDate)} 天`,
            status !== "paid" ? (
              <div key={`${item.id}-paid`} className="quick-actions" style={{ display: "inline-flex", gap: "6px", alignItems: "center", flexWrap: "nowrap" }}>
                <select
                  value={payMethodSelections[item.id] || item.method || "匯款"}
                  onChange={(e) => setPayMethodSelections((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ minWidth: "80px" }}
                >
                  <option value="匯款">匯款</option>
                  <option value="現金">現金</option>
                  <option value="支票">支票</option>
                  <option value="信用卡">信用卡</option>
                  <option value="LINE Pay">LINE Pay</option>
                </select>
                <button className="small-button" onClick={() => markPaymentPaid(item.id, payMethodSelections[item.id] || "匯款")}>標記已繳</button>
              </div>
            ) : (item.paidDate ? `已繳 ${item.paidDate}` : "收據"),
          ];
        })}
      />
    </Panel>
  );
}

function ContractManagement({ contracts, customersById, payments, containers, reservations, signContract }) {
  const contractStatus = {
    draft: { label: "草稿", tone: "yellow" },
    pending: { label: "待簽署", tone: "red" },
    signed: { label: "已簽署", tone: "green" }
  };
  const [detailContractId, setDetailContractId] = useState(contracts[0]?.id || "");

  const selectedContract = contracts.find((c) => c.id === detailContractId) || contracts[0];
  const selectedCustomer = selectedContract ? customersById[selectedContract.customerId] : null;
  const selectedContainer = selectedContract ? containers.find((c) => c.id === selectedContract.containerId) : null;
  const selectedReservationDeposit = selectedContract
    ? reservations.filter((r) => r.customerId === selectedContract.customerId && r.depositPaid).reduce((sum, r) => sum + r.reservationDepositAmount, 0)
    : 0;

  const kanbanItems = contracts.map((item) => {
    const contractPaid = payments.filter((p) => p.contractId === item.id && p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const custReservationDeposit = reservations.filter((r) => r.customerId === item.customerId && r.depositPaid).reduce((sum, r) => sum + r.reservationDepositAmount, 0);

    return {
      id: item.id,
      title: `${item.containerId} ${customersById[item.customerId]?.name || item.customerId}`,
      status: contractStatus[item.status].label,
      meta: `${item.contractType === "renewal" ? "續約" : "首年"} / ${item.contractVersion} / ${item.start} ~ ${item.end}`,
      detail: `租金 ${formatMoney(item.rent)} / 押金 ${formatMoney(item.deposit)}${custReservationDeposit > 0 ? ` / 預約訂金 ${formatMoney(custReservationDeposit)}` : ""}${item.status === "signed" ? (contractPaid > 0 || item.paymentStatus === "paid" ? " / 已收款" : " / 未收款") : ""}`
    };
  });

  return (
    <section className="content-grid">
      <Panel title="電子合約">
        <KanbanBoard columns={["草稿", "待簽署", "已簽署"]} items={kanbanItems} />
        <Table
          headers={["合約", "承租人", "貨櫃", "類型", "版本", "租期", "租金", "押金", "預約訂金", "收款狀態", "解約通知", "狀態", "簽署時間", "操作"]}
          rows={contracts.map((item) => {
            const paidForContract = payments.filter((p) => p.contractId === item.id && p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
            const container = containers.find((c) => c.id === item.containerId);
            const customer = customersById[item.customerId];
            const custReservationDeposit = reservations.filter((r) => r.customerId === item.customerId && r.depositPaid).reduce((sum, r) => sum + r.reservationDepositAmount, 0);
            return [
              item.id,
              <span key={`${item.id}-cust`}><strong>{customer?.name || item.customerId}</strong><br /><small style={{ color: "#aebed4" }}>{customer?.phone || ""}</small></span>,
              <span key={`${item.id}-ctr`}>{item.containerId} {container?.type || ""}</span>,
              item.contractType === "renewal" ? "續約" : "首年",
              item.contractVersion,
              `${item.start} ~ ${item.end}`,
              formatMoney(item.rent),
              formatMoney(item.deposit),
              custReservationDeposit > 0 ? <Badge key={`${item.id}-rdep`} tone="green">{formatMoney(custReservationDeposit)}</Badge> : "-",
              <Badge key={`${item.id}-pmt`} tone={paidForContract > 0 || item.paymentStatus === "paid" ? "green" : "red"}>{paidForContract > 0 || item.paymentStatus === "paid" ? "已收款" : "未收"}</Badge>,
              `${item.terminationNoticeDays} 天`,
              <Badge key={`${item.id}-status`} tone={contractStatus[item.status].tone}>{contractStatus[item.status].label}</Badge>,
              item.signedAt || "-",
              item.status !== "signed" ? <button className="small-button" key={item.id} onClick={() => signContract(item.id)}>模擬簽署</button> : (paidForContract > 0 ? "已收款" : <span style={{ color: "#ef7b63" }}>待收款</span>)
            ];
          })}
        />
      </Panel>
      <Panel title="合約條款">
        <div className="filter-bar">
          <label className="select-pill">檢視合約
            <select value={detailContractId} onChange={(e) => setDetailContractId(e.target.value)}>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.id} — {customersById[c.customerId]?.name} / {c.containerId}</option>)}
            </select>
          </label>
        </div>

        {selectedContract && selectedCustomer && selectedContainer && (
          <div className="contract-preview checklist" style={{ gap: "8px" }}>
            <strong>{selectedContract.id} 合約條款</strong>

            {selectedReservationDeposit > 0 && (
              <div className="notice-preview" style={{ borderColor: "rgba(53,185,137,0.4)", background: "rgba(53,185,137,0.12)", marginBottom: "4px" }}>
                <strong style={{ color: "#35b989" }}>此客戶已有預約訂金：{formatMoney(selectedReservationDeposit)}</strong>
                <p style={{ color: "#c3d0e1", margin: "4px 0 0" }}>可於建立合約時作為押金折抵參考。</p>
              </div>
            )}

            <span><em>承租人</em>{selectedCustomer.name} / {selectedCustomer.phone} / {selectedCustomer.idNumber} / {selectedCustomer.address}</span>
            <span><em>貨櫃資料</em>{selectedContainer.id} / {selectedContainer.type} / {selectedContainer.zone} 區</span>
            <span><em>租期與租金</em>{selectedContract.start} ~ {selectedContract.end}（{selectedContract.contractType === "renewal" ? "續約" : "首年"}），年租金 {formatMoney(selectedContract.rent)}</span>
            <span><em>押金規則</em>{formatMoney(selectedContract.deposit)}，退租檢查無損後退還</span>
            <span><em>電費規則</em>{selectedContract.electricityPolicy}</span>
            <span><em>中途解約</em>提前 {selectedContract.terminationNoticeDays} 天通知。{selectedContract.earlyTerminationRule}</span>
            <span><em>損壞扣款</em>{selectedContract.damagePolicy}</span>
            <span><em>退款規則</em>{selectedContract.refundPolicy}</span>
            <span><em>簽署與版本</em>版本 {selectedContract.contractVersion} / 簽署{" "}
              {selectedContract.signedAt ? selectedContract.signedAt : "尚未簽署"} /{" "}
              <Badge tone={contractStatus[selectedContract.status].tone}>{contractStatus[selectedContract.status].label}</Badge>
            </span>
            <button className="primary">產生 PDF 預覽</button>
          </div>
        )}
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
      <Table
        headers={["貨櫃", "上期度數", "本期度數", "用量", "基本費", "用電費", "總金額"]}
        rows={electricity.map((item) => {
          const baseFee = RATE.ELECTRICITY_BASE;
          const usageFee = item.usage * RATE.ELECTRICITY_RATE;
          return [item.containerId, item.lastMeter, item.currentMeter, `${item.usage} 度`, formatMoney(baseFee), formatMoney(usageFee), formatMoney(item.amount)];
        })}
      />
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
    detail: `續約價 ${formatMoney(calcAnnualRent(item.type, "renewal"))}`
  }));
  return (
    <Panel title="續約提醒">
      <KanbanBoard columns={["待通知", "已通知", "客戶確認", "已簽約", "已收款", "完成", "追蹤中"]} items={kanbanItems} />
      <Table
        headers={["貨櫃", "客戶", "到期日", "剩餘天數", "提醒狀態", "首年價", "續約價"]}
        rows={renewalRows.map((item) => [
          item.id,
          customersById[item.customerId]?.name || item.customerId,
          item.contractEnd,
          `${item.days} 天`,
          <Badge key={item.id} tone={item.days <= 60 ? "red" : "blue"}>{item.days <= 60 ? "需提醒" : "追蹤中"}</Badge>,
          formatMoney(calcAnnualRent(item.type, "firstYear")),
          formatMoney(calcAnnualRent(item.type, "renewal"))
        ])}
      />
    </Panel>
  );
}

function CheckoutManagement({ containers, customersById, contracts, payments, setContainers, setContracts, setCustomers }) {
  const [checkoutContainerId, setCheckoutContainerId] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("2026-07-31");
  const [damageFee, setDamageFee] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [penaltyFee, setPenaltyFee] = useState(0);
  const [checkoutStage, setCheckoutStage] = useState("requested");

  const container = containers.find((c) => c.id === checkoutContainerId) || (containers.filter((c) => c.status === "occupied")[0]);
  const customer = container ? customersById[container.customerId] : null;

  const calcResult = useMemo(() => {
    if (!container) return null;
    const contract = contracts.find((c) => c.containerId === container.id && (c.status === "signed" || c.status === "pending"));
    if (!contract) return { hasContract: false };

    const usedMonths = monthsBetween(contract.start, checkoutDate);
    const totalMonths = monthsBetween(contract.start, contract.end);
    const remainingMonths = Math.max(0, totalMonths - usedMonths);

    const annualRent = contract.rent || calcAnnualRent(container.type, contract.contractType);
    const remainingRentRefund = totalMonths > 0 ? Math.round((remainingMonths / totalMonths) * annualRent) : 0;

    const unpaidAmount = payments
      .filter((p) => p.customerId === container.customerId && getPaymentStatus(p) !== "paid" && p.type !== "electricity")
      .reduce((sum, p) => sum + (p.amount - getPaidAmount(p)), 0);

    const pendingElectricityFee = payments
      .filter((p) => p.containerId === container.id && getPaymentStatus(p) !== "paid" && p.type === "electricity")
      .reduce((sum, p) => sum + (p.amount - getPaidAmount(p)), 0);

    const damageFeeValue = Number(damageFee) || 0;
    const cleaningFeeValue = Number(cleaningFee) || 0;
    const penaltyFeeValue = Number(penaltyFee) || 0;
    const deposit = contract.deposit || calcMonthlyDeposit(container.type, contract.contractType);

    const totalDeductions = unpaidAmount + pendingElectricityFee + damageFeeValue + cleaningFeeValue + penaltyFeeValue;
    const finalRefundAmount = Math.max(0, deposit + remainingRentRefund - totalDeductions);
    const finalPayableAmount = Math.max(0, totalDeductions - deposit - remainingRentRefund);

    return {
      hasContract: true,
      contractId: contract.id,
      contractStart: contract.start,
      contractEnd: contract.end,
      usedMonths,
      totalMonths,
      remainingMonths,
      deposit,
      annualRent,
      remainingRentRefund,
      unpaidAmount,
      pendingElectricityFee,
      damageFee: damageFeeValue,
      cleaningFee: cleaningFeeValue,
      penaltyFee: penaltyFeeValue,
      totalDeductions,
      finalRefundAmount,
      finalPayableAmount
    };
  }, [container, contracts, payments, checkoutDate, damageFee, cleaningFee, penaltyFee]);

  function handleCompleteCheckout() {
    if (!container || !calcResult?.hasContract) return;
    const contract = contracts.find((c) => c.containerId === container.id && (c.status === "signed" || c.status === "pending"));
    if (!contract) return;

    setCheckoutStage("completed");
    setContainers((items) =>
      items.map((c) =>
        c.id === container.id ? { ...c, status: "vacant", customerId: "", contractEnd: "", inspection: "可出租", vacantDays: 0 } : c
      )
    );
    setContracts((items) =>
      items.map((c) => (c.id === contract.id ? { ...c, status: "closed" } : c))
    );
    setCustomers((items) => {
      const customerId = container.customerId;
      const hasOtherActive = containers.some((c) => c.customerId === customerId && c.id !== container.id && c.status === "occupied");
      return items.map((c) =>
        c.id === customerId ? { ...c, status: hasOtherActive ? "active" : "closed" } : c
      );
    });
  }

  const simItems = container && calcResult?.hasContract ? [
    {
      id: "CHECKOUT-001",
      title: `${container.id} ${customer?.name || ""}`,
      status: withdrawalStageLabels[checkoutStage]?.label || checkoutStage,
      meta: `退租 ${checkoutDate}`,
      detail: `${calcResult.usedMonths}/${calcResult.totalMonths} 個月 / ${calcResult.finalRefundAmount > 0 ? `退款 ${formatMoney(calcResult.finalRefundAmount)}` : calcResult.finalPayableAmount > 0 ? `補繳 ${formatMoney(calcResult.finalPayableAmount)}` : "結清"}`
    }
  ] : [
    { id: "CO001", title: "A01 範例客戶", status: "已申請", meta: "2026-07-31", detail: "待檢查" },
    { id: "CO002", title: "B03 李小姐", status: "點交檢查", meta: "30 天通知", detail: "等待客戶確認" },
    { id: "CO003", title: "A02 空櫃上架", status: "已完成", meta: "已恢復空櫃", detail: "可出租" }
  ];

  return (
    <Panel title="退租流程">
      <KanbanBoard columns={["已申請", "點交檢查", "費用結算", "已完成", "已取消"]} items={simItems} />

      <div className="checkout-sim">
        <h3>中途解約試算</h3>
        <div className="filter-bar" style={{ marginBottom: "16px" }}>
          <label className="select-pill">選擇貨櫃/合約
            <select value={checkoutContainerId || container?.id || ""} onChange={(e) => setCheckoutContainerId(e.target.value)}>
              {containers.filter((c) => c.status === "occupied" && c.contractEnd).map((c) => {
                const ctr = contracts.find((ct) => ct.containerId === c.id);
                return <option key={c.id} value={c.id}>{c.id} {customersById[c.customerId]?.name || ""} ({ctr?.start || ""} ~ {c.contractEnd})</option>;
              })}
            </select>
          </label>
          <label className="select-pill">退租日期
            <input type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} />
          </label>
        </div>
        <div className="filter-bar" style={{ marginBottom: "16px" }}>
          <label className="select-pill">損壞扣款
            <input type="number" value={damageFee} onChange={(e) => setDamageFee(e.target.value)} min="0" style={{ width: "120px" }} />
          </label>
          <label className="select-pill">清潔費
            <input type="number" value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)} min="0" style={{ width: "120px" }} />
          </label>
          <label className="select-pill">違約金
            <input type="number" value={penaltyFee} onChange={(e) => setPenaltyFee(e.target.value)} min="0" style={{ width: "120px" }} />
          </label>
          <label className="select-pill">流程階段
            <select value={checkoutStage} onChange={(e) => setCheckoutStage(e.target.value)}>
              {Object.entries(withdrawalStageLabels).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </label>
        </div>

        {calcResult?.hasContract ? (<>
          <div className="contract-preview">
            <strong>合約 {calcResult.contractId} 退租明細</strong>
            <div className="detail-list" style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>合約租期</span>
                <span>{calcResult.contractStart} ~ {calcResult.contractEnd}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>退租日期</span>
                <span>{checkoutDate}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>已用月份</span>
                <span>{calcResult.usedMonths} 個月</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>剩餘月份</span>
                <span>{calcResult.remainingMonths} 個月</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>年度租金</span>
                <span>{formatMoney(calcResult.annualRent)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>剩餘租金退費</span>
                <span style={{ color: "#35b989" }}>{formatMoney(calcResult.remainingRentRefund)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>押金</span>
                <span>{formatMoney(calcResult.deposit)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>未繳費用</span>
                <span style={{ color: calcResult.unpaidAmount > 0 ? "#ef7b63" : "#35b989" }}>{formatMoney(calcResult.unpaidAmount)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>待收電費</span>
                <span>{formatMoney(calcResult.pendingElectricityFee)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>損壞扣款</span>
                <span style={{ color: calcResult.damageFee > 0 ? "#ef7b63" : "#c3d0e1" }}>{formatMoney(calcResult.damageFee)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>清潔費</span>
                <span style={{ color: calcResult.cleaningFee > 0 ? "#ef7b63" : "#c3d0e1" }}>{formatMoney(calcResult.cleaningFee)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "8px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>違約金</span>
                <span style={{ color: calcResult.penaltyFee > 0 ? "#ef7b63" : "#c3d0e1" }}>{formatMoney(calcResult.penaltyFee)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "12px 0", borderBottom: "2px solid rgba(196,154,85,0.4)" }}>
                <span style={{ color: "#d8c08b", fontWeight: 900 }}>扣款合計</span>
                <span style={{ color: "#ef7b63", fontWeight: 700 }}>{formatMoney(calcResult.totalDeductions)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "12px 0", borderBottom: "2px solid rgba(196,154,85,0.4)" }}>
                <span style={{ color: "#d8c08b", fontWeight: 900 }}>最終應退</span>
                <strong style={{ color: calcResult.finalRefundAmount > 0 ? "#35b989" : "#aebed4", fontSize: "18px" }}>
                  {formatMoney(calcResult.finalRefundAmount)}
                </strong>
              </div>
              {calcResult.finalPayableAmount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "12px 0", borderBottom: "2px solid rgba(196,154,85,0.4)" }}>
                  <span style={{ color: "#d8c08b", fontWeight: 900 }}>最終應補</span>
                  <strong style={{ color: "#ef7b63", fontSize: "18px" }}>{formatMoney(calcResult.finalPayableAmount)}</strong>
                </div>
              )}
            </div>
            <div className="quick-actions" style={{ marginTop: "16px" }}>
              <button className="primary" disabled={checkoutStage === "completed"} onClick={handleCompleteCheckout}>
                {checkoutStage === "completed" ? "已完成退租" : "完成退租"}
              </button>
            </div>
          </div>

          <div className="contract-preview" style={{ marginTop: "18px" }}>
            <strong>退租結案摘要</strong>
            <div style={{ display: "grid", gap: "6px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>客戶名稱</span><span>{customer?.name || "-"}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>貨櫃編號</span><span>{container.id}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>合約編號</span><span>{calcResult.contractId}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>退租日期</span><span>{checkoutDate}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>流程階段</span><Badge tone={withdrawalStageLabels[checkoutStage]?.tone || "blue"}>{withdrawalStageLabels[checkoutStage]?.label || checkoutStage}</Badge></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>押金</span><span>{formatMoney(calcResult.deposit)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>未繳費用</span><span>{formatMoney(calcResult.unpaidAmount)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>待收電費</span><span>{formatMoney(calcResult.pendingElectricityFee)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>損壞扣款</span><span>{formatMoney(calcResult.damageFee)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>清潔費</span><span>{formatMoney(calcResult.cleaningFee)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>違約金</span><span>{formatMoney(calcResult.penaltyFee)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>剩餘租金退費</span><span style={{ color: "#35b989" }}>{formatMoney(calcResult.remainingRentRefund)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>最終應退</span><strong style={{ color: "#35b989" }}>{formatMoney(calcResult.finalRefundAmount)}</strong></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>最終應補</span><strong style={{ color: "#ef7b63" }}>{formatMoney(calcResult.finalPayableAmount)}</strong></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "10px 0", borderTop: "1px solid rgba(196,154,85,0.3)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>結案後貨櫃</span><Badge tone="green">available</Badge></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}><span style={{ color: "#aebed4", fontWeight: 700 }}>結案後合約</span><Badge tone="red">closed</Badge></div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "6px 0", borderBottom: "1px solid rgba(200,220,255,0.12)" }}>
                <span style={{ color: "#aebed4", fontWeight: 700 }}>結案後客戶</span>
                <Badge tone={containers.some((c) => c.customerId === container.customerId && c.id !== container.id && c.status === "occupied") ? "green" : "red"}>
                  {containers.some((c) => c.customerId === container.customerId && c.id !== container.id && c.status === "occupied") ? "active" : "closed"}
                </Badge>
              </div>
            </div>
          </div>
        </>) : (
          <div className="notice-preview">
            <strong>請選擇已出租貨櫃進行退租試算</strong>
            <p>系統將自動計算合約租期、已用月份、押金、未繳費、電費、剩餘租金退費、清潔費、違約金及最終退款/補繳金額。</p>
          </div>
        )}

        <div className="workflow vertical" style={{ marginTop: "16px" }}>
          {Object.entries(withdrawalStageLabels).map(([key, val], idx) => (
            <span key={key} style={{ opacity: Object.keys(withdrawalStageLabels).indexOf(checkoutStage) >= idx ? 1 : 0.5 }}>
              <Badge tone={val.tone}>{val.label}</Badge> {val.label === "已申請" ? "客戶提出退租申請" : val.label === "點交檢查" ? "現場檢查貨櫃狀況" : val.label === "費用結算" ? "計算各項費用與退款" : val.label === "已完成" ? "退租結案，貨櫃釋出" : "退租流程取消"}
            </span>
          ))}
        </div>
      </div>

      <Table
        headers={["退租編號", "客戶", "貨櫃", "合約", "退租日", "已用月", "應退", "應補", "押金", "階段"]}
        rows={calcResult?.hasContract ? [[
          `CO-${container.id}`,
          customer?.name || container.customerId,
          container.id,
          calcResult.contractId,
          checkoutDate,
          `${calcResult.usedMonths} / ${calcResult.totalMonths}`,
          formatMoney(calcResult.finalRefundAmount),
          formatMoney(calcResult.finalPayableAmount),
          formatMoney(calcResult.deposit),
          <Badge tone={withdrawalStageLabels[checkoutStage]?.tone || "blue"}>{withdrawalStageLabels[checkoutStage]?.label || checkoutStage}</Badge>
        ]] : [["CO001", "範例客戶", "A01", "CT001", "2026-07-31", "2 / 12", formatMoney(6000), formatMoney(0), formatMoney(6000), <Badge key="x" tone="blue">已申請</Badge>]]}
      />
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
  const unpaid = payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount - getPaidAmount(item), 0);
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

function AiAssistant({ metrics, containers, customersById, payments, reservations, maintenance, contracts }) {
  const suggestions = [
    "目前有多少空櫃？",
    "誰還沒繳錢？",
    "逾期金額多少？",
    "本期收入多少？",
    "哪些合約快到期？",
    "有哪些預約還沒收訂金？",
    "有哪些退租案件？",
    "哪些貨櫃維修中？",
    "今天要處理什麼？",
    "營運風險有哪些？",
    "目前共有多少資料？",
    "目前 Storage 是否正常？"
  ];
  const [question, setQuestion] = useState(suggestions[0]);

  function answerQuestion(text) {
    if (text.includes("空櫃") || text.includes("可租")) {
      const vacant = containers.filter((item) => item.status === "vacant");
      const list = vacant.map((item) => `${item.id}(${item.type}/${item.zone}區)`).join("、");
      return `目前共有 ${vacant.length} 個空櫃，可出租貨櫃為：${list || "無"}。等待名單有 ${metrics.waitlist} 位客戶。`;
    }
    if (text.includes("未繳") || text.includes("沒繳") || text.includes("欠款")) {
      const rows = payments.filter((item) => getPaymentStatus(item) !== "paid");
      if (!rows.length) return "目前所有帳單已繳清，無未繳款項。";
      const names = [...new Set(rows.map((item) => customersById[item.customerId]?.name || item.customerId))];
      return `目前有 ${rows.length} 筆未繳帳單，${names.length} 位客戶未繳清：${names.join("、")}。\n\n明細：${rows.map((item) => `${customersById[item.customerId]?.name} / ${item.containerId} / ${paymentTypes[item.type] || item.type} ${formatMoney(item.amount - getPaidAmount(item))} / 逾期 ${overdueDays(item.dueDate)} 天`).join("；")}`;
    }
    if (text.includes("逾期") && (text.includes("金額") || text.includes("多少"))) {
      return `目前逾期金額合計 ${formatMoney(metrics.overdueAmount)}，共 ${metrics.overdueCustomerCount} 位客戶逾期未繳。建議優先聯絡：${[...new Set(payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).map((item) => customersById[item.customerId]?.name || item.customerId))].join("、")}。`;
    }
    if (text.includes("收入")) {
      return `本期應收租金 ${formatMoney(metrics.totalRentReceivable)}，已收 ${formatMoney(metrics.totalRentCollected)}（${metrics.totalRentReceivable > 0 ? Math.round((metrics.totalRentCollected / metrics.totalRentReceivable) * 100) : 0}%）。\n\n已收租金 ${formatMoney(metrics.rent)}、電費 ${formatMoney(metrics.electric)}、押金 ${formatMoney(metrics.depositPaid)}，合計 ${formatMoney(metrics.totalIncome)}。未收餘額 ${formatMoney(metrics.receivable)}。`;
    }
    if (text.includes("到期") || text.includes("合約")) {
      const rows = containers.filter((item) => item.contractEnd && daysUntil(item.contractEnd) !== null && daysUntil(item.contractEnd) <= 60);
      if (!rows.length) return "60 天內沒有合約到期。";
      return `60 天內有 ${rows.length} 份合約到期：\n\n${rows.map((item) => `${item.id} ${customersById[item.customerId]?.name || "未指定"} / ${item.contractEnd} / 剩 ${daysUntil(item.contractEnd)} 天`).join("\n")}\n\n建議優先聯絡 ${rows.filter((item) => daysUntil(item.contractEnd) <= 30).length} 位 30 天內到期客戶。`;
    }
    if (text.includes("訂金") || text.includes("預約") && text.includes("收")) {
      const pending = reservations.filter((r) => r.depositRequired && !r.depositPaid);
      if (!pending.length) return "所有預約訂金皆已收取，無待收訂金。";
      return `目前有 ${pending.length} 筆預約尚未收訂金：\n\n${pending.map((r) => `${customersById[r.customerId]?.name} / ${r.id} / ${r.type} / 應收 ${formatMoney(r.reservationDepositAmount)}`).join("\n")}\n\n建議盡快聯繫客戶完成訂金收取。`;
    }
    if (text.includes("退租")) {
      const checkoutContainers = containers.filter((c) => c.status === "occupied" && c.contractEnd && daysUntil(c.contractEnd) !== null && daysUntil(c.contractEnd) <= 90);
      if (checkoutContainers.length > 0) {
        return `目前有 ${checkoutContainers.length} 個貨櫃可能在退租討論範圍內：\n\n${checkoutContainers.map((c) => `${c.id} ${customersById[c.customerId]?.name || c.customerId} / ${c.contractEnd} / 剩 ${daysUntil(c.contractEnd)} 天`).join("\n")}\n\n請前往退租管理頁進行試算與結案。`;
      }
      return "目前尚未建立正式退租案件資料來源，因此無法列出真實退租案件。你可以到退租管理頁查看目前試算與結案摘要。";
    }
    if (text.includes("維修")) {
      const open = maintenance.filter((item) => item.status !== "完成");
      if (!open.length) return "所有貨櫃狀態正常，無維修中貨櫃。";
      return `目前有 ${open.length} 個貨櫃維修/檢查中：\n\n${open.map((item) => `${item.containerId} / ${item.type} / ${item.priority}優先 / ${item.status} / ${item.assignee}`).join("\n")}`;
    }
    if (text.includes("今天") || text.includes("處理")) {
      const todoCount = metrics.unpaid + (containers.filter((c) => c.status === "occupied" && daysUntil(c.contractEnd) !== null && daysUntil(c.contractEnd) <= 30).length) + reservations.filter((r) => r.depositRequired && !r.depositPaid).length + maintenance.filter((m) => m.status !== "完成").length;
      let result = `今日待辦共 ${todoCount} 件：\n\n`;
      let n = 1;
      payments.filter((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0).forEach((item) => { result += `${n++}. 催收 ${customersById[item.customerId]?.name || item.customerId} 逾期${paymentTypes[item.type] || ""} ${formatMoney(item.amount - getPaidAmount(item))}\n`; });
      containers.filter((c) => c.status === "occupied" && daysUntil(c.contractEnd) !== null && daysUntil(c.contractEnd) <= 30).forEach((c) => { result += `${n++}. 聯絡 ${customersById[c.customerId]?.name || c.customerId} 確認續約（${c.id} ${c.contractEnd}）\n`; });
      reservations.filter((r) => r.depositRequired && !r.depositPaid).forEach((r) => { result += `${n++}. 跟進 ${customersById[r.customerId]?.name || r.customerId} 預約訂金 ${formatMoney(r.reservationDepositAmount)}\n`; });
      maintenance.filter((m) => m.status !== "完成").forEach((m) => { result += `${n++}. 檢查 ${m.containerId} ${m.type}（${m.status}）\n`; });
      if (n === 1) result += "暫無待辦事項。";
      return result;
    }
    if (text.includes("風險")) {
      const riskCount = metrics.overdueCustomerCount + metrics.nearExpiring30 + reservations.filter((r) => r.depositRequired && !r.depositPaid).length + metrics.maintenanceCount + metrics.checkoutCases;
      let result = `目前營運風險共 ${riskCount} 項：\n\n`;
      if (metrics.overdueAmount > 0) result += `逾期未繳：${formatMoney(metrics.overdueAmount)} / ${metrics.overdueCustomerCount} 位客戶\n`;
      if (metrics.nearExpiring30 > 0) result += `合約 30 天內到期：${metrics.nearExpiring30} 件\n`;
      if (reservations.filter((r) => r.depositRequired && !r.depositPaid).length > 0) result += `預約訂金待收：${reservations.filter((r) => r.depositRequired && !r.depositPaid).length} 筆\n`;
      if (metrics.maintenanceCount > 0) result += `貨櫃維修中：${metrics.maintenanceCount} 個\n`;
      if (metrics.checkoutCases > 0) result += `退租流程中：${metrics.checkoutCases} 件\n`;
      result += `\n建議優先處理逾期催收與 30 天內到期續約。`;
      return result;
    }
    if (text.includes("資料") || text.includes("總共") || text.includes("幾筆") || text.includes("多少筆")) {
      const total = getStorageTotalRecords() || (customers.length + containers.length + reservations.length + contracts.length + payments.length + electricity.length + maintenance.length);
      return `目前系統共有 ${total} 筆資料。\n\n客戶 ${customers.length} 位 / 貨櫃 ${containers.length} 個 / 預約 ${reservations.length} 筆 / 合約 ${contracts.length} 份 / 帳單 ${payments.length} 筆 / 電費 ${electricity.length} 筆 / 維修 ${maintenance.length} 件。`;
    }
    if (text.includes("儲存") || text.includes("Storage") || text.includes("storage") || text.includes("最後")) {
      const meta = getStorageMeta();
      if (meta) return `Storage 狀態：Healthy\n最後儲存時間：${new Date(meta.savedAt).toLocaleString("zh-TW")}\n系統版本：${meta.version}\n總筆數：${meta.recordCount}`;
      return "Storage 狀態：尚未儲存。系統將在下次資料變更時自動儲存至 LocalStorage。";
    }
    if (text.includes("客戶") && (text.includes("幾位") || text.includes("幾個"))) {
      return `目前共有 ${customers.length} 位客戶。`;
    }
    if (text.includes("合約") && (text.includes("幾份") || text.includes("幾個"))) {
      return `目前共有 ${contracts.length} 份合約。`;
    }
    if (text.includes("帳單") && (text.includes("多少") || text.includes("幾個"))) {
      return `目前共有 ${payments.length} 張帳單。`;
    }
    return "我可以回答：空櫃數量、未繳款項、逾期金額、本期收入、合約到期、預約訂金、退租案件、維修狀態、今日待辦、營運風險、資料統計、儲存狀態、客戶人數、合約數量、帳單數量。請輸入您的問題。";
  }

  return (
    <section className="content-grid">
      <Panel title="AI 營運助理">
        <div className="ai-box">
          <label>輸入問題<input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例如：哪些客戶未繳費？" /></label>
          <div className="ai-answer">
            <strong>AI 回答</strong>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>{answerQuestion(question)}</p>
          </div>
          <div className="quick-actions" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            {suggestions.map((item) => <button className="secondary" key={item} onClick={() => setQuestion(item)}>{item}</button>)}
          </div>
        </div>
      </Panel>
      <Panel title="每日摘要">
        <div className="workflow vertical">
          <span>本期應收 {formatMoney(metrics.totalRentReceivable)} / 已收 {formatMoney(metrics.totalRentCollected)}</span>
          <span>未收餘額 {formatMoney(metrics.receivable)} / 逾期 {formatMoney(metrics.overdueAmount)}</span>
          <span>空櫃 {metrics.vacant} 個 / 使用中 {metrics.occupied} 個</span>
          <span>30 天內到期 {metrics.nearExpiring30} 件 / 維修中 {metrics.maintenanceCount} 個</span>
          <span>預約訂金待收 {metrics.pendingDepositReservations} 筆</span>
          <span>退租處理中 {metrics.checkoutCases} 件</span>
          <span>費率：首年 10呎{formatMoney(48000)} / 20呎{formatMoney(72000)}</span>
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

function FloatingAssistant({ metrics, containers, customersById, payments, reservations, maintenance, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const urgentPayment = payments.find((item) => getPaymentStatus(item) !== "paid" && overdueDays(item.dueDate) > 0);
  const dueContainer = containers.find((item) => item.contractEnd && daysUntil(item.contractEnd) !== null && daysUntil(item.contractEnd) <= 30);
  const openMaintenance = maintenance.filter((item) => item.status !== "完成").length;
  const pendingDeposits = reservations.filter((r) => r.depositRequired && !r.depositPaid).length;

  return (
    <div className={`floating-ai ${open ? "open" : ""}`}>
      {open && (
        <div className="floating-ai-panel">
          <strong>AI 營運助理</strong>
          <p>未收 {formatMoney(metrics.receivable)} / 逾期 {formatMoney(metrics.overdueAmount)}，空櫃 {metrics.vacant} 個，維修中 {openMaintenance} 件。</p>
          {pendingDeposits > 0 && <p style={{ color: "#f6c85f" }}>預約訂金待收 {pendingDeposits} 筆。</p>}
          <button onClick={() => setActiveTab("收費管理")}>催收：{urgentPayment ? (customersById[urgentPayment.customerId]?.name || urgentPayment.customerId) : "無逾期"}</button>
          <button onClick={() => setActiveTab("續約提醒")}>到期：{dueContainer?.id || "無"} ({dueContainer ? customersById[dueContainer.customerId]?.name || "" : ""})</button>
          {pendingDeposits > 0 && <button onClick={() => setActiveTab("預約管理")}>訂金：{pendingDeposits} 筆待收</button>}
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
