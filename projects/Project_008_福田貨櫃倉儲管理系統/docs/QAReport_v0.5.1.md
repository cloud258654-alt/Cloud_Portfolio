# QA Report v0.5.1 — 福田貨櫃倉儲管理系統

## 測試環境

| 項目 | 值 |
|------|-----|
| 前端框架 | React 19 + Vite 7 |
| Node 版本 | 18.20.8 |
| 瀏覽器 | Chrome / Edge（Windows 11） |
| 後端 | 無（純前端） |
| 儲存 | Browser LocalStorage |
| 測試日期 | 2026-07-01 |

---

## 已修復問題

| # | 嚴重度 | 問題 | 修正 |
|---|--------|------|------|
| 1 | 🔴 嚴重 | `resetStorage()` undefined → crash | 補上函式 |
| 2 | 🟠 高 | `daysUntil()` hardcoded `2026-06-22` | 改 `new Date()` |
| 3 | 🟠 高 | KanbanBoard 內 orphaned `completeCheckout` | 移除死碼 |
| 4 | 🟠 高 | 6 處仍用 `item.paidAmount` | 改 `getPaidAmount()` |
| 5 | 🟡 中 | Import JSON 缺欄位無警示 | 補上警示 |
| 6 | 🟡 中 | AI 退租回固定假資料 | 動態判斷 |
| 7 | 🟡 中 | 裝飾 pseudo-element 無 `pointer-events: none` | 補上 |
| 8 | 🟡 中 | `.dashboard-grid.refined` CSS no-op | 補定義 |
| 9 | 🟡 中 | 無 `:focus-visible` 鍵盤焦點 | 補樣式 |

---

## 已知限制

| 問題 | 影響 | 目前處理 |
|------|------|----------|
| Node 18 + Vite 7 警告 | 每次 build 顯示警告 | 保留，升 Node 20 可解 |
| 無後端/資料庫 | 多裝置無法同步 | 標示為 Demo |
| 無登入權限 | 所有功能開放 | 標示為 Demo |
| AI 非真實 LLM | 只能 keyword 匹配 | 文件說明 |
| 退租無獨立 state | 案件數無法精確追蹤 | 依合約到期推導 |
| App.jsx 單檔 | 維護困難 | v1.0 拆分 |
| `<Table>` key={index} | 極端情況 DOM 錯位 | 暫不影響 |

---

## 功能模組測試（15 個頁籤）

| 頁籤 | 測試項目 | 結果 |
|------|----------|------|
| Dashboard | KPI 12 項、風險提醒、今日待辦、貨櫃摘要、資料管理 | ✅ |
| 貨櫃管理 | 新增、過濾、地圖選取 | ✅ |
| QR 掃描 | 模擬掃描、現場提醒 | ✅ |
| 維修檢查 | Kanban、新增工單、完成 | ✅ |
| 客戶管理 | 選取器、詳細卡片、新增客戶 | ✅ |
| 客戶入口 | 模擬登入、帳單/合約表 | ✅ |
| 預約管理 | Kanban、容器指定、通知保留、訂金 Badge | ✅ |
| 電子合約 | Kanban、表格、條款檢視、模擬簽署 | ✅ |
| 收費管理 | 未收總額、年度帳單、部分付款、標記已繳 | ✅ |
| 電費管理 | 度數表格、基本費/用電費 | ✅ |
| 續約提醒 | Kanban、首年價/續約價 | ✅ |
| 退租管理 | 試算、扣款合計、最終應退/應補、結案摘要、閉環 | ✅ |
| 通知中心 | 模板、發送紀錄 | ✅ |
| 報表 | 年度收入、規格出租率、收款結構 | ✅ |
| AI 助理 | 12 個問題類型、浮動助理 | ✅ |

---

## LocalStorage 測試

| 測試 | 結果 |
|------|------|
| 新增加載後重整不消失 | ✅ |
| 修改資料後重整保留 | ✅ |
| Export JSON | ✅ |
| Import JSON（完整） | ✅ 成功提示 |
| Import JSON（缺欄位） | ✅ 警示缺欄位 |
| Export CSV（Customers/Contracts/Payments） | ✅ UTF-8 BOM |
| Reset Demo Data | ✅ Confirm + 還原 seed |

---

## Import / Export 測試

| 操作 | 結果 |
|------|------|
| Export JSON → 下載 `FutianStorage_YYYYMMDD.json` | ✅ 含 metadata |
| Export CSV: Customers | ✅ Excel 可開 |
| Export CSV: Contracts | ✅ Excel 可開 |
| Export CSV: Payments | ✅ Excel 可開 |
| Import 正常 JSON | ✅ 成功 |
| Import 格式錯誤 JSON | ✅ 提示錯誤 |
| Import 缺欄位 JSON | ✅ 提示缺欄位 + seed fallback |

---

## AI 助理測試

| 問題 | 回答準確度 |
|------|-----------|
| 目前有多少空櫃？ | ✅ 正確列出 |
| 誰還沒繳錢？ | ✅ 正確列出 |
| 逾期金額多少？ | ✅ 正確計算 |
| 本期收入多少？ | ✅ 正確 |
| 哪些合約快到期？ | ✅ 正確列出 |
| 預約未收訂金？ | ✅ 正確 |
| 退租案件？ | ✅ 動態判斷（不再假資料） |
| 維修中貨櫃？ | ✅ 正確 |
| 今天要處理什麼？ | ✅ 編號列表 |
| 營運風險？ | ✅ 分類統計 |
| 共多少資料？ | ✅ 總數 + 分類 |
| Storage 正常？ | ✅ 時間 + 版本 |

---

## 結論

- **9 項問題全數修復**，無 crash 風險
- **15 個頁籤功能正常**
- **LocalStorage 持久化正常**
- **Import / Export 含錯誤處理**
- **AI 助理 12 問全數正常**
- **Accessibility 鍵盤導航可用**
- **build 成功**，建議可正式標記為 v0.5.1 穩定展示版
