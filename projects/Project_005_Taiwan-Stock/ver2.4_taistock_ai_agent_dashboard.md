# ver1.0_taistock_ai_agent_dashboard.md

# 專案名稱：台股 AI 即時多專家分析系統 MVP

## 一、專案目標

請建立一套「台股 AI 即時多專家分析系統 MVP」。

本系統不是自動下單系統，也不是保證獲利系統，而是「投資研究與決策輔助工具」。

核心目標是：

1. AI 幫使用者把台股即時資訊整理成多位專家觀點。
2. AI 告訴使用者目前訊號偏多、偏空或中立。
3. AI 說明主要風險在哪裡。
4. AI 判斷即時資料是否可靠。
5. AI 幫使用者避免情緒化追高殺低。
6. 所有分析都必須有資料來源、更新時間、資料品質狀態、信心分數與風險提示。

---

## 二、重要限制

請嚴格遵守以下限制：

1. 不可提供保證獲利描述。
2. 不可使用「一定會漲」、「一定會跌」、「穩賺」、「無風險」等語句。
3. 不可直接鼓勵使用者立即買進或立即賣出。
4. 不可設計自動下單功能。
5. 不可設計槓桿、融資、期貨或高風險交易推薦功能。
6. AI 分析結果必須附上免責聲明。
7. 當資料品質不足時，AI 必須降低信心分數，並提示「資料不足，不宜做高信心判斷」。

建議用語：

- 偏多
- 中立偏多
- 中立觀察
- 中立偏空
- 高風險
- 等待確認
- 不追高
- 觀察支撐
- 觀察壓力
- 資料不足
- 風險升高

禁止用語：

- 立即買進
- 立即賣出
- 保證獲利
- 穩賺
- 明天一定漲
- 目標價必到
- 無風險操作

---

## 三、技術目標

請優先完成一個可執行 MVP。

如果目前專案資料夾是空的，請建立以下架構：

```text
taistock-ai-agent-dashboard/
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── StockSearch.tsx
│       │   ├── QuoteCard.tsx
│       │   ├── DataQualityBadge.tsx
│       │   ├── ExpertButtonPanel.tsx
│       │   ├── AgentReportCard.tsx
│       │   ├── RiskNotice.tsx
│       │   └── AnalysisHistory.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── types.ts
│       └── styles/
│
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── market.py
│   │   │   ├── agent.py
│   │   │   └── quality.py
│   │   ├── services/
│   │   │   ├── market_data_service.py
│   │   │   ├── mock_market_data_service.py
│   │   │   ├── data_quality_service.py
│   │   │   ├── feature_engineering_service.py
│   │   │   ├── agent_orchestrator.py
│   │   │   └── report_service.py
│   │   ├── agents/
│   │   │   ├── base_agent.py
│   │   │   ├── technical_agent.py
│   │   │   ├── chip_agent.py
│   │   │   ├── news_event_agent.py
│   │   │   ├── risk_manager_agent.py
│   │   │   └── investment_committee_agent.py
│   │   └── api/
│   │       ├── routes_quote.py
│   │       ├── routes_agents.py
│   │       └── routes_health.py
│
├── README.md
└── docker-compose.yml
```

---

## 本專案執行策略

目前資料夾不是空專案，既有系統為 HTML / CSS / Vanilla JS 靜態前端。因此 Ver 2.4 不重建 Next.js / FastAPI 架構，先在既有系統完成可執行 MVP：

1. 新增 AI 輸出安全規則與禁止用語過濾。
2. 報告頁新增風險提示區。
3. 資料品質不足時，自動降低投資委員會信心分數。
4. 顯示「資料不足，不宜做高信心判斷」。
5. 延續 Ver 2.3 的 9-Agent 與分析紀錄功能。

Next.js / FastAPI / PostgreSQL / Redis 架構保留為後續獨立重構階段。
