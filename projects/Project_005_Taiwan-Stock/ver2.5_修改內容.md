# ver2.5 — 台股 AI 即時多專家分析系統 優化修改內容

> 🧠 **審核模型**：Gemini 3.5 Flash (股市分析系統設計專家視角)
> 📅 **審核日期**：2026-06-26
> 🏷️ **版本基礎**：基於 ver2.4 (HTML/CSS/Vanilla JS 純前端) 進行全面審查

---

## 📋 審核範疇

| 檔案 | 行數 | 大小 | 審查深度 |
|------|------|------|----------|
| `index.html` | 859 行 | 44.7 KB | ✅ 完整 |
| `style.css` | 3,683 行 | 79 KB | ✅ 完整 |
| `app.js` | 4,502 行 | 245 KB | ✅ 完整 |
| **合計** | **9,044 行** | **368.7 KB** | ✅ 全檔逐行審查 |

---

## 🔴 P0 — 嚴重問題（必須修復）

### 1. 完全缺乏 RWD 響應式設計（CSS 無 @media 查詢）

**問題描述**：整個 `style.css` 共 3,683 行，除了末尾的 `.master-header-row` 有一個孤立的 `@media (max-width: 768px)` 外，**完全沒有任何其他響應式斷點**。這意味著：

- 在手機和平板上，所有 `grid-template-columns` 佈局會被壓縮到無法辨識
- `market-index-grid`（4 欄）、`market-lower-grid`（3 欄）、`toolkit-grid`（2 欄）全部崩壞
- `agents-grid`（6 個代理人卡片）會溢出螢幕
- 所有表格（專家觀點、籌碼表、分點表）會出現水平滾動條
- Header 的 logo + nav + status 排列會破版

**修復建議**：

```css
/* ====== 建議新增：全面響應式斷點系統 ====== */

/* Tablet (768px 以下) */
@media (max-width: 768px) {
    .container { padding: 1rem; gap: 1.2rem; }
    .app-header { flex-direction: column; gap: 1rem; }
    .header-nav { margin: 0; }
    .market-index-grid { grid-template-columns: repeat(2, 1fr); }
    .market-lower-grid { grid-template-columns: 1fr; }
    .toolkit-grid { grid-template-columns: 1fr; }
    .agents-grid { grid-template-columns: repeat(2, 1fr); }
    .cross-analysis-grid { grid-template-columns: 1fr; }
    .confidence-grid { grid-template-columns: 1fr; }
    .rec-grid { grid-template-columns: 1fr; }
    .branch-tables-wrapper { flex-direction: column; }
    .intraday-grid { grid-template-columns: 1fr; }
    .intraday-snapshot { grid-template-columns: repeat(2, 1fr); }
    .screener-stock-grid { grid-template-columns: repeat(2, 1fr); }
    .signal-workbench { flex-direction: column; }
}

/* Mobile (480px 以下) */
@media (max-width: 480px) {
    .market-index-grid { grid-template-columns: 1fr; }
    .agents-grid { grid-template-columns: 1fr; }
    .intraday-snapshot { grid-template-columns: 1fr; }
    .screener-stock-grid { grid-template-columns: 1fr; }
    .live-market-tape { grid-template-columns: 1fr 1fr; }
    .agent-result-grid { grid-template-columns: 1fr; }
    .fund-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .company-profile-grid { grid-template-columns: 1fr; }
}
```

---

### 2. HTML 缺少 SEO Meta 標籤與 Favicon

**問題描述**：`<head>` 區塊完全缺少：

- `<meta name="description">` — 搜尋引擎摘要
- `<meta name="keywords">` — 關鍵字
- `<meta property="og:*">` — Open Graph 社群分享
- `<link rel="icon">` — Favicon
- `<meta name="robots">` — 搜尋引擎爬蟲指引

**修復建議**：

```html
<!-- SEO Meta Tags -->
<meta name="description" content="台股 AI 即時多專家分析系統 — 由 6 位 AI 專家即時交叉論證，提供技術面、基本面、籌碼面、總經面、公司資訊、分點面綜合分析報告。">
<meta name="keywords" content="台股,AI分析,股市,多專家系統,技術分析,基本面分析,籌碼分析,台積電,鴻海">
<meta name="author" content="Antigravity Stock AI">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:title" content="台股 AI 綜合分析團隊 — 跨維度多代理人協作決策系統">
<meta property="og:description" content="由 6 位 AI 專家即時交叉論證，提供最全面的台股投資研究輔助報告。">
<meta property="og:type" content="website">

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">
```

---

### 3. 無障礙性 (Accessibility) 嚴重不足

**問題描述**：整個 HTML 中只有 1 個 `aria-label`（選股下拉選單）和 1 個 `aria-live`（Toast 容器），其餘所有互動元素均缺乏：

- 表格缺少 `<caption>` 和 `scope` 屬性
- 大量 `<button>` 缺少 `aria-label`（如快捷按鈕、分頁切換）
- Modal 缺少 `role="dialog"` 和 `aria-modal="true"`
- 使用 `<div>` 模擬按鈕行為的地方未加 `role="button"` 和 `tabindex`
- 圖表（Canvas）完全缺少替代文字描述

**修復建議**：

- 為所有 `<button>` 添加 `aria-label`
- 為 Modal 添加 `role="dialog"` `aria-modal="true"` `aria-labelledby`
- 為 Canvas 添加 `role="img"` `aria-label`
- 為所有互動區塊添加 `tabindex` 支援鍵盤操作
- 為重要表格添加 `<caption>` 摘要

---

### 4. app.js 單檔 4,502 行，極需模組化拆分

**問題描述**：整個應用邏輯（資料庫、UI 渲染、圖表引擎、事件處理、Pipeline 邏輯）全部擠在一個 245 KB 的 `app.js` 中，造成：

- 維護成本極高：任何修改都需在 4,500 行中搜尋
- 函式之間隱性耦合嚴重
- 變數命名空間全部是全域（`let currentAnalysisData` 等）
- 無法進行單元測試

**修復建議**：建議按功能拆分為至少 6 個模組檔案：

```
scripts/
├── data/
│   ├── stockDB.js          // 個股靜態資料庫
│   ├── marketData.js        // 市場總覽 & 工具台資料
│   ├── mockGenerator.js     // generateMockReport 等動態生成器
│   └── safetyPolicy.js      // AI 安全政策與過濾邏輯
├── engines/
│   ├── klineEngine.js       // drawKLineChart 技術面繪圖引擎
│   ├── financeEngine.js     // drawFinanceChart / Revenue / PERiver
│   ├── chipEngine.js        // 籌碼面所有繪圖引擎
│   └── radarEngine.js       // 總經雷達圖引擎
├── components/
│   ├── pipeline.js          // runPipeline / runMacroOnlyPipeline
│   ├── modal.js             // openDetailModal / closeModal
│   ├── masters.js           // renderMasterContent 高手群組
│   ├── committee.js         // buildAgentCommittee / renderAgentCommittee
│   └── stockPicking.js      // 即時選股 Agent 全部邏輯
└── app.js                   // 主入口：DOMContentLoaded + 初始化
```

---

## 🟡 P1 — 重要優化（強烈建議修復）

### 5. 資料品質 Badge 的顏色辨識度不足

**問題描述**：`getStockPickingQualityClass()` 返回的 `"mock"` / `"warning"` / `"bad"` 等 class，在 CSS 中的樣式辨識度不夠明顯，特別是：
- "Mock 資料" 標記與實際資料狀態的視覺區分不夠突出
- 品質分數 `< 60` 的低分股票沒有更明顯的風險警示

**修復建議**：
- 為 `quality-badge.bad` 增加紅色閃爍動畫
- 為 `quality-badge.mock` 使用較低飽和度的灰色調
- 在品質分數 `< 60` 時，卡片邊框改為醒目的紅色虛線

---

### 6. Header 系統狀態文字硬編碼 "6 代理人系統已連線"

**問題描述**：`index.html` Line 45 寫死 `6 代理人系統已連線`，但 Ver 2.3 已升級至 9-Agent 投資委員會。實際在 `aiAgentBlueprints` 陣列中定義了 9 個 Agent。

**修復建議**：
```html
<!-- 將 "6 代理人" 改為 "9 代理人"，或改為動態讀取 -->
<span class="status-text">9 代理人系統已連線</span>
```
或在 `app.js` 中動態更新：
```javascript
document.querySelector('.status-text').textContent = 
    `${aiAgentBlueprints.length} 代理人系統已連線`;
```

---

### 7. Canvas 圖表缺少 HiDPI (Retina) 顯示適配

**問題描述**：所有 `<canvas>` 都使用固定的 `width` 和 `height` 屬性（如 `800x400`），在 Retina 螢幕上會出現模糊問題。

**修復建議**：
```javascript
function setupHiDPICanvas(canvas, logicalWidth, logicalHeight) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
}
```

---

### 8. 高手群組預設頁籤不一致

**問題描述**：
- `index.html` Line 561 中，歐尼爾的 tab button 帶有 `active` class（預設選中）
- 但 `renderReport()` Line 3355 中，初始渲染卻呼叫 `renderMasterContent('graham')`（葛拉漢）
- 兩者不一致，使用者看到歐尼爾被高亮但內容顯示葛拉漢

**修復建議**：統一為一個預設值，建議改為歐尼爾：
```javascript
// renderReport() 中改為：
renderMasterContent('oneil');
```
或將 HTML 中的 `active` class 移到葛拉漢的按鈕上。

---

### 9. 市場價格模擬邏輯會產生 NaN

**問題描述**：`startMarketSimulation()` 中 Line 2946 使用 `parseFloat(stock.price.replace(/,/g, ''))` 解析帶千位分隔符的價格字串。但在多次迭代後，`toLocaleString()` 可能產出不符合 `parseFloat()` 預期的格式（如使用全形逗號），導致 `NaN`。

**修復建議**：改用數值型態儲存，僅在渲染時格式化：
```javascript
// 使用數值陣列而非格式化字串進行運算
// stock.price 應始終為 Number 型態
```

---

### 10. 「全球總經診斷」模式回傳個股分析時的 DOM 殘留

**問題描述**：`runMacroOnlyPipeline()` 結束後會隱藏 `.strategy-block` 和 `.masters-block`。但如果使用者在此之後點擊其他個股進行分析，`runPipeline()` 中雖有 `classList.remove("hidden")` 來恢復這兩個區塊（Line 3066-3067），但存在一個潛在的風險：如果 DOM 查詢失敗（如 `document.querySelector(".strategy-block")` 返回 null），會拋出未捕捉的 TypeError。

**修復建議**：加入空值保護：
```javascript
document.querySelector(".strategy-block")?.classList.remove("hidden");
document.querySelector(".masters-block")?.classList.remove("hidden");
```

---

## 🟢 P2 — 體驗優化（建議改善）

### 11. 分析管線等待時間過長（12.5 秒固定延遲）

**問題描述**：`runPipeline()` 中各階段的 `setTimeout` 是硬編碼的固定延遲，最終報告在 12.5 秒後才產出。對於重複查詢同一檔股票的使用者，每次都要等 12.5 秒。

**修復建議**：
- 增加「快速模式」：若使用者在 30 秒內重複查詢同一股號，跳過動畫直接顯示報告
- 增加「跳過動畫」按鈕，讓使用者可以隨時直接跳到結果
- 使用 localStorage 快取最近分析的結果

---

### 12. 缺少 Loading Skeleton 與錯誤邊界

**問題描述**：除了高手群組有 Skeleton Screen 外，其他所有區塊（市場總覽、推薦列表、盤中即時作戰室）在資料加載時沒有任何 loading 狀態指示。

**修復建議**：
- 為所有動態渲染的區塊加入 Skeleton Screen
- 為 Canvas 繪圖加入載入動畫
- 建立全局錯誤邊界，避免單一模組錯誤導致全站白屏

---

### 13. 新增「黑暗 / 明亮模式」切換

**問題描述**：目前僅有深色模式，缺乏主題切換功能。

**修復建議**：
- 在 `:root` 中定義 `[data-theme="light"]` 變數組
- 在 Header 區塊加入主題切換按鈕
- 使用 localStorage 記憶使用者偏好

---

### 14. 缺少微互動動畫（Micro-interactions）

**問題描述**：除了 `pulse-glow` 和背景 `drift` 動畫外，整個 3,683 行的 CSS 中**完全沒有 @keyframes 動畫**（被 BOM 或編碼問題遮蔽）。具體缺失：

- 按鈕點擊無反饋動畫
- 卡片出現時無漸入動畫
- 代理人節點激活時缺少脈動效果
- 進度條缺少漸變動畫
- 表格行 hover 效果過於靜態
- Toast 通知缺少滑入/滑出動畫

**修復建議**：
```css
/* 建議新增動畫 */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.glass-card { animation: fadeInUp 0.6s ease-out; }
.signal-toast { animation: slideInRight 0.4s ease-out; }
.agent-node.active { animation: pulse 1.5s infinite; }
```

---

### 15. 免責聲明位置與曝光度不足

**問題描述**：免責聲明僅出現在報告區塊的 9-Agent 投資委員會底部（Line 487），且以小字灰色顯示。根據金融法規要求，風險提示應更醒目。

**修復建議**：
- 在搜尋面板下方永久顯示精簡版免責聲明
- 在報告頁面頂部增加醒目的風險警示 Banner
- 使用 `<aside>` 或 `role="alert"` 標記
- 字體大小不得小於 12px

---

### 16. localStorage 資料管理缺少容量檢查與過期清理

**問題描述**：系統大量使用 localStorage 儲存歷史紀錄、警示、自選股等，但：
- 沒有容量上限檢查（localStorage 通常限制 5-10 MB）
- 沒有過期清理機制
- `getStoredList()` 和 `getStoredAlerts()` 的 `try-catch` 只捕獲 JSON 解析錯誤

**修復建議**：
- 添加 `StorageManager` 統一管理所有 localStorage 讀寫
- 記錄資料建立時間，自動清理超過 30 天的記錄
- 在每次寫入前檢查剩餘容量

---

### 17. 搜尋輸入缺少模糊搜尋與自動補全

**問題描述**：目前的搜尋只支援精確股號匹配（`stockDB` 中的鍵值查找）和 `commonStockNames` 字典查找。缺乏：
- 模糊匹配（如輸入「台積」應自動匹配「2330 台積電」）
- 輸入下拉建議清單
- 搜尋歷史自動補全

**修復建議**：
- 實作 Fuzzy Search 演算法
- 在輸入時渲染即時建議的 Dropdown
- 使用 `debounce` 優化輸入事件觸發頻率

---

### 18. Excel 匯出缺少「9-Agent 投資委員會」工作表

**問題描述**：`exportToExcel()` 目前匯出 4 張工作表（專家觀點、深度多空、操作策略、股市高手群組），但缺少 Ver 2.3 新增的 **9-Agent 投資委員會** 結論與各 Agent 個別立場數據。

**修復建議**：
新增第 5 張工作表 `"投資委員會"`，包含：
- 綜合結論、信心分數、適合類型
- 9 位 Agent 各自立場、信心值、理由、風險
- 資料品質狀態

---

## 🔧 P3 — 代碼品質（最佳實踐）

### 19. 全域變數過多，缺乏封裝

**問題描述**：以下變數全部掛在全域作用域：
```javascript
let currentAnalysisData = null;
let timerInterval = null;
let activeKLineData = null;
let klineMousePos = { x: -1, y: -1 };
let klineCanvasRef = null;
let activeFinanceData = null;
let currentFundView = 'margins';
let financeMousePos = { x: -1, y: -1 };
let currentChipView = 'summary';
let chipMousePos = { x: -1, y: -1 };
let stockPickingAlerts = [];
let stockPickingTimer = null;
```

**修復建議**：使用 IIFE 或 ES Module 封裝：
```javascript
const App = (() => {
    let state = {
        currentAnalysis: null,
        timerInterval: null,
        // ...
    };
    return { init, runPipeline, resetToHome };
})();
```

---

### 20. 硬編碼數據日期 "2026-06-02" 散落各處

**問題描述**：`stockDB` 中所有個股的 `time` 欄位、新聞日期、K 線終點日期等全部硬編碼為 `"2026-06-02"`。當展示時會造成資料看起來過時。

**修復建議**：
- 改用 `new Date().toISOString().split('T')[0]` 動態生成當日日期
- 在 `generateHistoricalKLine()` 中使用 `new Date()` 作為終點
- 在新聞渲染中使用相對時間（如「1 天前」、「本週」）

---

### 21. innerHTML 存在 XSS 風險

**問題描述**：大量使用 `innerHTML` 拼接 HTML 字串，雖然目前數據來自本地靜態資料庫，但若未來接入真實 API 或使用者輸入（如自訂股名），可能存在 XSS 風險。

**修復建議**：
- 建立 `escapeHTML()` 工具函式
- 對所有使用者輸入進行 Sanitize
- 考慮使用 `textContent` 替代 `innerHTML`（純文字內容場景）

---

### 22. CSS 變數命名缺少語義化分層

**問題描述**：CSS 變數混合了顏色用途和語義用途：
- `--color-tech` / `--color-fund` 是 Agent 顏色（語義化 ✅）
- `--color-strong-buy` / `--color-sell` 是決策顏色（語義化 ✅）
- 但缺少：互動狀態色（hover / focus / disabled）、層級間距、圓角統一

**修復建議**：增加設計系統級別的 Token：
```css
:root {
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    
    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-pill: 99px;
    
    /* Z-index */
    --z-modal: 1000;
    --z-toast: 900;
    --z-header: 800;
}
```

---

## 📊 優化優先級總覽

| 等級 | 項目數 | 優先修復項目 |
|------|--------|------------|
| 🔴 P0 嚴重 | 4 項 | RWD 響應式、SEO Meta、無障礙性、模組化拆分 |
| 🟡 P1 重要 | 6 項 | Agent 數量不一致、Canvas HiDPI、高手預設頁籤、DOM 殘留、NaN 風險、品質 Badge |
| 🟢 P2 體驗 | 8 項 | 動畫管線跳過、Skeleton、暗亮切換、微互動、免責聲明、localStorage、搜尋補全、Excel 匯出 |
| 🔧 P3 品質 | 4 項 | 全域變數、硬編碼日期、XSS 防護、CSS Token |

---

## 🚀 建議執行順序

```
Phase 1 (基礎穩固)
 ├─ [1] 新增全面 RWD 響應式設計（CSS @media 查詢）
 ├─ [2] 新增 SEO Meta / OG / Favicon
 ├─ [6] 修正 Header Agent 數量為 9
 └─ [8] 統一高手群組預設頁籤

Phase 2 (品質提升)
 ├─ [7] Canvas HiDPI 適配
 ├─ [9] 修復 NaN 價格模擬風險
 ├─ [10] 加入 DOM 空值保護
 └─ [20] 動態日期替換

Phase 3 (體驗升級)
 ├─ [11] 分析管線「跳過動畫」按鈕
 ├─ [14] 微互動動畫系統
 ├─ [17] 搜尋模糊匹配與自動補全
 └─ [13] 暗亮模式切換

Phase 4 (架構重構)
 ├─ [4] app.js 模組化拆分
 ├─ [19] 全域變數封裝
 └─ [3] 無障礙性全面修正
```

---

> **結論**：目前的系統在功能完整度方面已經達到了極高的水準（6 維分析 + 6 位高手 + 9-Agent 委員會 + 即時選股 + K 線/籌碼/財務/雷達圖引擎 + Excel 匯出），可以說是業界頂級的純前端台股分析 Demo。但在**響應式設計**、**SEO**、**無障礙性**和**代碼架構**方面存在系統性的基礎缺口，這些是從「作品集展示」升級為「專業產品」必須解決的瓶頸。
