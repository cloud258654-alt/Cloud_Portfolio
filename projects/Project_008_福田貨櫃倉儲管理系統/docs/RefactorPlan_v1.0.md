# v1.0 架構重構計畫 — 福田貨櫃倉儲管理系統

## 1. 重構目標

將目前集中在 `src/App.jsx`（~2000 行）的單檔架構，逐步拆分為可維護、可測試、可擴展的企業級前端架構。

### 現況問題
- 23 個組件全部定義在同一個檔案
- 所有 state 集中在 App 頂層
- CSS 為單一全域檔案
- 無單元測試
- 新增功能時難以定位修改點

---

## 2. 建議資料夾結構

```
src/
├── components/          # 共用 UI 元件
│   ├── Badge.jsx
│   ├── Kpi.jsx
│   ├── Panel.jsx
│   ├── Table.jsx
│   ├── KanbanBoard.jsx
│   ├── SelectPill.jsx
│   ├── ProgressBar.jsx
│   ├── ContainerMap.jsx
│   └── FloatingAssistant.jsx
│
├── pages/               # 頁面級組件
│   ├── Dashboard.jsx
│   ├── ContainerManagement.jsx
│   ├── CustomerManagement.jsx
│   ├── ReservationManagement.jsx
│   ├── ContractManagement.jsx
│   ├── PaymentManagement.jsx
│   ├── CheckoutManagement.jsx
│   ├── AiAssistant.jsx
│   └── ... (其他頁面)
│
├── hooks/               # 自定義 hooks
│   ├── useLocalStorage.js
│   ├── useMetrics.js
│   └── usePaymentHelpers.js
│
├── contexts/            # React Context
│   └── AppContext.jsx    # 全域 state (取代 App 頂層)
│
├── services/            # 業務邏輯層
│   ├── storageService.js
│   ├── exportService.js
│   └── importService.js
│
├── utils/               # 工具函式
│   ├── formatters.js     # formatMoney, daysUntil, monthsBetween
│   ├── paymentHelpers.js # getPaidAmount, getPaymentStatus
│   └── rateCalculator.js # calcAnnualRent, calcMonthlyDeposit
│
├── data/                # 種子資料
│   ├── containersSeed.js
│   ├── customersSeed.js
│   ├── reservationsSeed.js
│   ├── contractsSeed.js
│   ├── paymentsSeed.js
│   ├── electricitySeed.js
│   ├── maintenanceSeed.js
│   └── notificationsSeed.js
│
├── constants/           # 常數與設定
│   ├── rates.js
│   ├── statusMeta.js
│   ├── tabs.js
│   └── version.js
│
├── styles/              # CSS 模組化
│   ├── global.css
│   ├── components/
│   └── pages/
│
├── App.jsx              # 入口（只做路由/分發）
└── main.jsx             # ReactDOM render
```

---

## 3. 拆分順序（10 階段）

### Phase 1: Utils + Constants + Data
- 拆分對象：費率常數、formatMoney、getPaidAmount、daysUntil、monthsBetween、所有 seed data
- 風險：極低（純函式，無 state）
- 驗證：`npm run build`

### Phase 2: StorageService
- 拆分對象：loadFromStorage、saveToStorage、resetStorage、getStorageMeta
- 風險：低（目前是獨立函式）
- 驗證：重整網頁後資料不消失

### Phase 3: Shared Components
- 拆分對象：Badge、Kpi、Panel、Table、KanbanBoard、SelectPill、ProgressBar
- 風險：中（需確保所有 import 路徑正確）
- 驗證：全站 15 頁籤 UI 不變

### Phase 4: AppContext + useLocalStorage
- 拆分對象：將 App 的 useState × 8 移入 AppContext
- 風險：高（狀態管理核心重構）
- 方法：使用 React.createContext + useContext
- 驗證：全功能測試

### Phase 5: Page — Dashboard
- 拆分對象：Dashboard 組件
- 風險：中
- 驗證：KPI 12 張卡、風險提醒、待辦、貨櫃摘要、資料管理正常

### Phase 6: Page — Customer + Reservation + Contract
- 拆分對象：客戶管理、預約管理、電子合約
- 風險：中（三個核心頁面）
- 驗證：客戶中心、預約指派、合約條款正常

### Phase 7: Page — Payment + Checkout
- 拆分對象：收費管理、退租管理
- 風險：中
- 驗證：年度帳單、部分付款、退租試算、閉環正常

### Phase 8: Page — Remaining Pages
- 拆分對象：貨櫃管理、QR 掃描、維修檢查、電費管理、續約提醒、通知中心、報表、AI 助理
- 風險：低（每次拆一個）
- 驗證：逐頁測試

### Phase 9: CSS Modularization
- 拆分對象：將 styles.css 拆分為 component/page 級 CSS
- 風險：中（選擇器優先級可能變）
- 驗證：視覺回歸測試

### Phase 10: Cleanup + Documentation
- 移除 App.jsx 中的殘留 import
- 更新 docs/
- 最終 build + 全功能測試

---

## 4. 每階段驗證

每次拆完都必須執行：

```bash
npm run build
```

並人工測試以下頁面：

- Dashboard
- 客戶管理（客戶中心 + 新增）
- 預約管理（通知保留 + 訂金）
- 電子合約（簽署 + 條款）
- 收費管理（年度帳單 + 部分付款）
- 退租管理（試算 + 閉環）
- Import / Export
- AI 助理

---

## 5. Git 建議

```bash
# 標記 v0.5.1 為穩定基準
git add .
git commit -m "Release v0.5.1: QA fixes and documentation"
git tag v0.5.1

# 開分支做 v1.0 重構
git checkout -b feature/v1-enterprise-refactor

# 每完成一個 phase 就 commit
git add .
git commit -m "v1.0 Phase 1: extract utils, constants, data"

# 若任何 phase 出問題
git checkout v0.5.1  # rollback 到穩定版
```

---

## 6. 風險提醒

| 風險 | 說明 | 緩解措施 |
|------|------|----------|
| 一次拆太多檔案導致 build fail | 難以定位問題來源 | 每次只拆一個模組 |
| import 路徑錯誤 | 相對路徑在拆分後變更 | 每次拆完立即 build |
| State 傳遞斷鏈 | Context 重構後 props 接不上 | 先在分支測試，不影響 main |
| CSS 樣式失效 | 選擇器優先級或 scope 改變 | Phase 9 最後做，前面先不分 CSS |
| 退租閉環/付款計算邏輯受損 | 核心邏輯依賴多個 state | 每個 phase 都測試退租 + 收費 |

---

> **核心原則**：小步快走，每次只動一個模組，每次動完都 build + 人工驗證。v0.5.1 tag 隨時可 rollback。
