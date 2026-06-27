# v2.1 國際競品分析與優化建議

> **日期**: 2026-06-26
> **版本**: v2.1
> **狀態**: Draft
> **作者**: PM Review
> **參考平台**: Glean、Guru、Bloomfire、Slab

---

## 執行摘要

本研究針對全球四大知識管理/AI 平台（Glean、Guru、Bloomfire、Slab）進行深度分析，提取可應用於 KTS 的優化建議。核心發現：國際競品已從「被動搜尋」進化到「主動治理 + 自我修復 + 無所不在」，KTS 需補強四大能力。

---

## 競品對照矩陣

| 面向 | Glean | Guru | Bloomfire | Slab | KTS 現狀 |
|---|---|---|---|---|---|
| AI 搜尋 | 100+ connectors, permission-aware RAG | Cited AI + MCP protocol | Deep index (video/audio) | Full-text search | Hybrid BM25+vector |
| 知識治理 | Observability dashboard | Auto-verify, conflict detect | Self-healing KB, hallucination detection | Version history | Schema only, no logic |
| 內容生命週期 | Auto-index from tools | Stale detection, auto-archive | Duplicate flag, review workflows | Manual | Manual upload only |
| 學習驗證 | 無原生 | 無原生 | Learn & Confirm quiz | 無 | M05 spec only, no code |
| 整合生態 | 100+ native connectors | Slack/Chrome/Teams/MCP | API + extensibility | API | LINE Bot spec only |
| 分析與 ROI | Adoption metrics, token savings | Usage dashboards | ROI calculator, analytics suite | Basic analytics | Analytics schema only |
| 幻覺防護 | Permission-gated answers | Citation on every answer | Hallucination detection | N/A | Citation exists, no fact-check |
| 行動端 | Native mobile | Chrome extension + Slack | Mobile responsive | Mobile responsive | PWA not configured |

---

## 優化建議

### P0-1: 知識治理與自我修復系統（參考 Guru + Bloomfire）

#### 1.1 Knowledge Health Score

每份文件自動計算健康分數（0-100），基於：
- **時效性 (25%)**: 最後更新距今的天數
- **使用率 (25%)**: 被引用次數、被搜尋命中次數
- **品質 (25%)**: 使用者回饋平均分數
- **完整性 (25%)**: 版本數量、有無 description/summary

低於閾值（例如 < 40）自動觸發 review notification。

#### 1.2 Stale Content Auto-Archive

排程任務定期掃描：
- 超過 180 天未更新 + 近 30 天無引用 → 標記為 "stale"
- 超過 365 天未更新 + 無引用 → 自動歸檔
- 通知文件 owner

#### 1.3 Duplicate Detection

基於 embedding cosine similarity：
- 新文件上傳時，向量比對現有文件（threshold > 0.92）
- 通知上傳者可能的重複文件
- 提供 merge 或 keep separate 選項

#### 1.4 Knowledge Gap Analysis

分析搜尋日誌：
- 無結果的搜尋 query → 知識缺口
- 高頻率問答但無對應文件的 topic → 建議建立
- 自動產生 Weekly Gap Report

---

### P0-2: 幻覺檢測與可信度分級（參考 Bloomfire + Glean）

#### 2.1 Sentence-Level Factual Grounding

每個 LLM 回答的句子對比 retrieval context：
- 有來源支撐 → 正常顯示
- 無來源支撐 → 黃色標記 "未驗證"
- 與來源矛盾 → 紅色標記並隱藏

#### 2.2 Confidence Tier System

回答分為三級：
- **Verified**: 多個獨立來源一致支持
- **Partial**: 單一來源支持，或來源分數偏低
- **Uncertain**: 無來源支持，或來源互相矛盾

前端 UI 上顯示對應的信任徽章。

#### 2.3 Human-in-the-Loop Review

低信心回答自動進入人工審查隊列：
- QA manager 可審查並修正
- 修正後的回答作為 fine-tuning 資料（未來）

---

### P1-1: Analytics Dashboard 與 ROI 可視化（參考 Bloomfire + Glean）

#### 3.1 ROI Calculator

內建計算器頁面，input：
- 員工人數
- 平均時薪
- 每日搜尋次數（預設值）
- 每次搜尋節省分鐘數（預設值）

Output: 年度節省金額、節省工時、投資回報率

#### 3.2 Analytics Dashboard

即時儀表板包含：
- **Adoption Funnel**: 註冊 → 首次搜尋 → 週活躍
- **Content Metrics**: 總文件數、本週新增、待審查數
- **Search Analytics**: Top queries、Zero-result queries
- **Department Scorecard**: 各部門貢獻量/使用量排名

#### 3.3 Weekly Digest

自動寄送週報：
- 本週熱門文件 Top 5
- 知識缺口 Top 5
- 待審查文件清單

---

### P1-2: 學習與測驗模組（參考 Bloomfire Learn & Confirm）

#### 4.1 Auto-Quiz Generation

從文件自動產生測驗題：
- 選擇題（4 選 1）
- 是非題
- 填空題

#### 4.2 Learn & Confirm 頁面

- 閱讀文件 → 點擊「開始測驗」
- 即時批改，顯示正確答案與文件出處
- 通過門檻（例如 80%）→ 標記為 "已學習"

#### 4.3 Knowledge Coverage Map

每位員工的雷達圖：
- 已閱讀的文件類別覆蓋率
- 測驗通過率
- 建議補強領域

---

### P2-1: 知識協作機制（參考 Slab + Guru）

#### 5.1 Inline Commenting

文件的任意段落可留言討論：
- Highlight 文字 → 新增 comment
- Thread 回覆
- @mention 通知同事

#### 5.2 Knowledge Request Board

員工可提交知識請求：
- 「我需要關於 XXX 的文件」
- SME 認領並撰寫
- 完成後自動通知請求者

#### 5.3 Expert Endorsement

SME 可對文件背書：
- 背書後文件增加可信度權重
- 搜尋結果排序提升

---

### P2-2: 外部整合（參考 Glean + Guru）

#### 6.1 Slack Bot

- Slash command `/kts ask <問題>`
- 直接在頻道中回覆（含 citation）
- 新文件通知推送到指定頻道

#### 6.2 Browser Extension

Chrome 擴充：
- 側邊欄 KTS 搜尋
- 瀏覽網頁時可一鍵儲存到 KTS
- 在任何文字框內 @kts 提問

---

## 行動計畫

| 優先級 | ID | 功能 | 投入估算 | 影響 |
|---|---|---|---|---|
| **P0** | 1.1 | Knowledge Health Score | 2-3 天 | 知識品質自動化 |
| **P0** | 1.2 | Stale Content Detection | 1-2 天 | 減少內容腐化 |
| **P0** | 1.3 | Duplicate Detection | 2-3 天 | 減少重複內容 |
| **P0** | 1.4 | Knowledge Gap Analysis | 2-3 天 | 資料驅動的內容策略 |
| **P0** | 2.1 | Sentence-Level Factual Grounding | 3-4 天 | 回答可信度 |
| **P0** | 2.2 | Confidence Tier | 1-2 天 | 使用者信任 |
| **P0** | 2.3 | Human-in-the-Loop Review | 2-3 天 | 品質控制迴路 |
| **P1** | 3.1 | ROI Calculator | 1-2 天 | 向管理層證明價值 |
| **P1** | 3.2 | Analytics Dashboard | 3-5 天 | 資料驅動決策 |
| **P1** | 3.3 | Weekly Digest | 1-2 天 | 持續 engagement |
| **P1** | 4.1 | Auto-Quiz Generation | 2-3 天 | 知識內化驗證 |
| **P1** | 4.2 | Learn & Confirm 頁面 | 2-3 天 | 學習體驗 |
| **P2** | 5.1 | Inline Commenting | 3-5 天 | 協作文化 |
| **P2** | 5.2 | Knowledge Request Board | 2-3 天 | 需求驅動內容 |
| **P2** | 5.3 | Expert Endorsement | 1-2 天 | 品質信號 |
| **P2** | 6.1 | Slack Bot | 3-5 天 | 降低使用門檻 |
| **P2** | 6.2 | Browser Extension | 3-5 天 | 無所不在的知識 |

---

總計估算：約 **35–55 工作天**
