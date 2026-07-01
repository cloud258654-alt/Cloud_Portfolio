# 版本發布說明 — 福田貨櫃倉儲管理系統 v0.5.1

## 版本定位

**QA 修正版 + Demo 文件版**

此版本不新增功能，只修正 QA Report 中指出的已知問題，並建立完整的文件資料夾。

## 新增內容

- `docs/` 文件資料夾（6 份文件）
- Accessibility focus-visible 鍵盤焦點樣式（`button`、`input`、`select`、`textarea`、`a`）
- `.dashboard-grid.refined` CSS 定義

## 修正內容

| 問題 | 影響範圍 | 修正 |
|------|----------|------|
| `resetStorage()` 未定義 → 點 Reset 按鈕 crash | Dashboard 資料管理 | 補上 `function resetStorage()` |
| `daysUntil()` 使用 hardcoded `2026-06-22` | 全部到期/逾期計算 | 改為 `new Date()` |
| Orphaned `completeCheckout()` 死碼在 KanbanBoard | 維護陷阱 | 移除 17 行死碼 |
| 全站 6 處仍用 `item.paidAmount` 而非 `getPaidAmount(item)` | 部分付款計算不一致 | 統一使用 `getPaidAmount()` |
| Import JSON 缺欄位無警示 | 資料管理 | 補上缺欄位提示 |
| AI 退租查詢回固定假資料 | AI 助理 | 改為動態判斷 |
| `.kpi::after` / `.slot::after` 無 `pointer-events: none` | 點擊攔截 | 補上 |

## 已知限制

| 項目 | 說明 |
|------|------|
| Node 18 + Vite 7 警告 | 不影響 build，升 Node 20 可解 |
| 無後端 / 無資料庫 | 目前純前端 Demo，資料存 localStorage |
| 無使用者登入權限 | 管理員單一角色 |
| AI 助理為 keyword-based | 非真實 LLM |
| 退租案件無獨立 state | 依合約到期日推導 |
| App.jsx 單檔架構 | v1.0 將拆分 |

## Build 結果

```
✓ built in 1.10s
dist/index.js: 286.90 kB (gzip: 84.83 kB)
dist/index.css: 18.08 kB
```

仍有 Node 18 + Vite 7 版本警告（不影響功能）。

## 下一階段建議

**v1.0 Enterprise Refactor** — 將 App.jsx 拆分為 component/page/hook/service 架構，並補上單元測試基礎。
