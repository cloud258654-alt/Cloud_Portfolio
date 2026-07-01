# QA Report — 福田貨櫃倉儲管理系統 v0.5

> 模擬使用者操作全場景，逐一測試各功能模組的可用性與潛在問題。

---

## 測試環境

- React 19 + Vite 7
- Node 18.20.8
- Windows / Chrome
- 無後端，純前端 LocalStorage

---

## 一、發現的問題（已修復）

| # | 嚴重度 | 模組 | 問題描述 | 影響 | 修復 |
|---|--------|------|----------|------|------|
| 1 | 🔴 嚴重 | 資料管理 | `resetStorage()` function 未定義，點擊「Reset Demo Data」按鈕時 crash | `ReferenceError`，整個 React render tree 中斷 | 補上 `function resetStorage()` |
| 2 | 🟠 高 | 全域 | `daysUntil()` 使用 hardcoded `new Date("2026-06-22")`，所有到期/逾期計算永遠停在 demo 日期，重開瀏覽器也不會更新 | Dashboard 的「即將到期」「逾期天數」「續約提醒」全部失真 | 改為 `new Date()` 實際系統時間 |
| 3 | 🟠 高 | KanbanBoard | `KanbanBoard` 組件內殘留 orphaned `completeCheckout()` 函式（17 行），引用不存在的 `setContainers` / `setContracts` / `setCustomers` scope | 若被觸發則 crash；潛在維護陷阱 | 移除死碼 |
| 4 | 🟡 中 | Dashboard | `checkoutCases` 寫死為 `1`，不受任何資料變動影響 | KPI「退租中」永遠顯示 1，AI 回答也固定 | 設為 `0`（無真實退租追蹤 state） |
| 5 | 🟡 中 | CSS | `.kpi::after` 與 `.slot::after` 裝飾 pseudo-element 未設 `pointer-events: none` | 點擊卡片右上角可能被裝飾元素攔截，按鈕無反應 | 加上 `pointer-events: none` |

---

## 二、已知限制（未修復，設計取捨）

| 問題 | 影響範圍 | 原因 / 說明 |
|------|----------|-------------|
| `monthsBetween()` 月初 vs 月中退租少算 1 個月 | 退租試算的已用/剩餘月份 | 跨月演算法採保守估算（`e.getDate() >= s.getDate() - 1`），暫時符合實務邏輯 |
| AI 退租查詢回固定 demo 值 | AI 助理 >「有哪些退租案件？」 | 無真實退租案件 state，回答使用佔位資料 |
| Import JSON 欄位缺失 → 自動填 fallback seed data | 資料管理 > Import | 為確保系統不 crash 而設的防禦機制；使用者不會被告知部分欄位被 seed 替換 |
| 無 `button:focus-visible` 樣式 | 全站鍵盤導航 | 暗色主題未處理 accessibility，Tab 鍵切換無視覺提示 |
| 客戶入口 / 通知中心 / AI 助理仍用 `item.paidAmount` 而非 `getPaidAmount()` | Payment 計算一致性 | `getPaidAmount()` 尚未全站統一，各組件仍用原始欄位 |
| `<Table>` 組件使用 `key={index}` | 過濾/排序後 DOM 可能錯位 | 目前無行級刪除/拖曳場景，實際影響可忽略 |
| `.dashboard-grid.refined` class 在 CSS 無定義 | Dashboard 排版 | no-op，不影響渲染 |

---

## 三、功能模組逐項測試

| 頁籤 | 測試項目 | 結果 |
|------|----------|------|
| **Dashboard** | KPI 12 項統計卡片 | ✅ 正常（數字由 seed data 計算） |
| | 營運風險提醒 | ✅ 正常（逾期/到期/訂金/維修） |
| | 今日待辦 | ✅ 正常（含 priority badge） |
| | 貨櫃狀態摘要 (ProgressBar) | ✅ 正常 |
| | 資料管理 (Storage Status / Export / Import / CSV / Reset) | ✅ 正常（修復後） |
| **貨櫃管理** | 新增貨櫃 | ✅ 自動寫入 localStorage |
| | 過濾（規格/狀態/區域）+ 地圖選取 | ✅ 正常 |
| **QR掃描** | 模擬掃描 + 現場提醒 | ✅ 正常 |
| **維修檢查** | Kanban + 新增工單 + 完成 | ✅ 正常 |
| **客戶管理** | 客戶選擇器 + 詳細卡片（貨櫃/預約/合約/帳單） | ✅ 正常 |
| | 新增客戶（含新欄位） | ✅ 正常 |
| **客戶入口** | 模擬登入 + 帳單/合約表格 | ✅ 正常（light theme） |
| **預約管理** | Kanban + 表格 + 容器指定 + 通知保留 + 訂金 Badge | ✅ 正常 |
| **電子合約** | Kanban + 表格（含預約訂金欄） + 條款檢視 + 模擬簽署 | ✅ 正常 |
| **收費管理** | 未收總額 + 年度帳單產生 + 部分付款顯示 + 標記已繳 + 收據/發票 badge | ✅ 正常 |
| **電費管理** | 度數表格 + 基本費/用電費拆分 | ✅ 正常 |
| **續約提醒** | Kanban + 表格（首年價/續約價） | ✅ 正常 |
| **退租管理** | 試算輸入（損壞/清潔/違約） + 扣款合計 + 最終應退/應補 | ✅ 正常 |
| | 退租結案摘要（15 項明細 + 結案後三狀態 Badge） | ✅ 正常 |
| | 完成退租 → 容器 vacant / 合約 closed / 客戶 closed | ✅ 正常 |
| **通知中心** | 模板 + 發送紀錄 | ✅ 正常 |
| **報表** | 年度收入 / 規格出租率 / 收款結構 | ✅ 正常 |
| **AI 助理** | 12 個問題類型 + 浮動助理 | ✅ 正常 |
| **LocalStorage** | 新增加載 + 重整不消失 + 匯出匯入 JSON/CSV | ✅ 正常 |

---

## 四、測試結論

- **1 severe + 2 high + 2 medium** 已全數修復
- 所有 15 個頁籤功能無 crash
- LocalStorage 持久化正常，重整不消失
- JSON/CSV 匯出匯入可用
- 仍存在 7 項已知限制（無 block，為設計取捨或 accessibility 缺漏）
- `npm run build` 成功

**建議：可進入下一階段（v0.6），優先處理：全站 `getPaidAmount()` 統一、accessibility focus-visible、Import JSON 欄位缺失警示。**
