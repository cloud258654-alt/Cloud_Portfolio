# AI Reputation Risk Detection Platform
## AI 商譽風險偵測平台

本系統為專為企業打造的 **AI 商譽風險偵測平台**（而非單純網路爬蟲工具）。系統旨在透過自動化「風險訊號分析」與「AI 危機處置建議」，協助企業在第一時間掌握潛在的商譽危機。網路爬蟲與 CSV 匯入僅為本平台的資料輸入層。

---

## 核心價值與產品定位

- **非單純爬蟲監測**：本系統核心在於「商譽危機偵測」與「決策輔助」，提供即時商譽風險指數、AI 風險摘要與處置建議。
- **高風險平台合規資料策略**：
  - **Mock 資料來源**：PTT、Dcard 與 Google Search 等公開數據，透過模擬方式取得風險信號參考資料。
  - **合規 CSV 匯入**：針對 Facebook、Threads、小紅書、TikTok 與 Google Maps 等限制性或高敏感社群，本系統嚴格遵循平台 API 合規限制，採取**手動 CSV 安全匯入模式**作為資料整合手段，確保企業數據安全與法規合規。

---

## 企業商譽風險分數模型 (0-100)

每筆風險訊號皆由 AI 模組依據以下六大加權維度進行綜合評分：

1. **負面情感分析 (比重 25%)**：分析貼文語氣，若為 Negative 情緒得 25 分，Neutral 得 10 分，Positive 得 0 分。
2. **危機字詞命中 (比重 30%)**：偵測是否包含「詐騙、出事、爆炸、毒、倒閉、訴訟、違法、雷、踩雷、客訴、退費、消保會、爆料、致癌、召回、中毒、停業、崩潰」等危機關鍵字，命中得 30 分。
3. **社群擴散熱度 (比重 15%)**：根據貼文的讚數、留言數與分享數綜合計算擴散風險，最高加 15 分。
4. **平台擴散敏感度 (比重 10%)**：對不同平台的擴散力進行加權。FB/Threads/小紅書/Dcard 得 10 分，PTT 得 8 分，Google 搜尋/地圖得 5 分。
5. **事件處置狀態 (比重 10%)**：未處置或審核中事件，其風險較高，加 10 分。
6. **同標的 24h 擴散頻率 (比重 10%)**：同關鍵字於 24 小時內多次出現代表危機正在升溫，最高加 10 分。

### 事件處置優先級 (Priority Levels)

根據風險分數與敏感度，系統自動將危機劃分為四個響應級別：

- **P0 (立即處置)**：風險分數 >= 90，或命中了「詐騙/違法/消保會/爆料/致癌/中毒」等極高危敏感字。**要求於 1 小時內啟動公關澄清**。
- **P1 (緊急處置)**：風險分數 70-89。**要求於 2 小時內審核並準備回應稿**。
- **P2 (當日處理)**：風險分數 30-69。建議客服團隊於當日內進行主動回覆引導。
- **P3 (常規觀察)**：風險分數 < 30。狀況穩定，持續監控風險訊號即可。

---

## 系統架構

```
reputation-risk-detection/
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── api/              # auth, keywords, mentions, crawler, dashboard, scheduler, exports, reports, settings, notifications
│   │   ├── connectors/       # PTT, Dcard, Google Search (mock), CSV importer
│   │   ├── models/           # User, Keyword, Mention, CrawlLog, NotificationLog, SystemSetting, ImportLog
│   │   ├── schemas/          # Pydantic Schema
│   │   ├── services/         # CrawlerService, AIService (Reputation Scoring Engine), LLM Service, SchedulerService, NotificationService
│   │   ├── utils/            # auth (JWT/hash), text_cleaner
│   │   └── seed.py           # DB Risk Seed scripts
│   └── requirements.txt
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS + Recharts
│   └── src/
│       ├── api/              # API client layer
│       ├── components/       # Dashboard widgets, Layout
│       ├── pages/            # Dashboard (商譽風險戰情室), Keywords (監測品牌設定), Mentions (風險訊號列表), Incidents (高風險商譽事件), Reports (每日商譽風險報告)
│       └── types/            # TypeScript interfaces
├── sample_data/              # CSV 範例檔
└── .env.example              # 環境變數範本
```

---

## 快速啟動

### 環境準備

```powershell
# 複製環境變數範本到 backend/ 目錄
copy .env.example backend\.env
# 編輯 backend\.env，填入 OPENAI_API_KEY（可選，不填則使用規則引擎 AI）
```

### 後端 Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed           # 重新建立資料庫並填入具有商譽評估分數的假資料
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger API 文件: http://127.0.0.1:8000/docs
- Health check 端點: http://127.0.0.1:8000/health

### 前端 Frontend

```powershell
cd frontend
npm install
npm run dev
```

瀏覽器開啟 http://localhost:5173

---

## 功能總覽

| 功能 | 說明 |
|------|------|
| **商譽風險戰情室** | 即時呈現「今日商譽風險指數」、「高風險事件數」、「負面比例」、「危機關鍵字排行」、「商譽風險趨勢」 |
| **監測品牌設定** | 設定需要監控品牌或競品關鍵字，支援一鍵立即對公開資料源發起風險偵測 |
| **風險訊號列表** | 完整列出所有訊號，展示「優先級(P0-P3)」、「風險分數(0-100)」、「風險成因」與 AI 摘要/建議 |
| **高風險商譽事件** | 事件流轉處理流程 (指派人、處理備註、結案時間)，針對 P0/P1 事件優先追蹤，支援 CASCADE 刪除保護 |
| **每日商譽風險報告** | 自動產生 Markdown 風險分析日報，包含今日風險指數、P0/P1 高優先事件、主要風險來源平台與對策 |
| **CSV 匯入** | 專為 Facebook/Threads/小紅書等平台設計 of 合規上傳通道，自動紀錄檔案大小與處理歷程至 `ImportLog` |
| **通知中心** | 偵測到 P0/P1 級別商譽危機時，主動在頂部 Header 發出危機警訊通知 |

---

## LLM AI 分析

系統預設使用 rule-based AI 進行情緒、風險、購買意圖分析。

若要使用 OpenAI GPT 強化分析品質：
1. 在 `.env` 設定 `OPENAI_API_KEY=sk-xxx`
2. 系統會自動切換為 GPT-4o-mini 分析
3. API 呼叫失敗或 timeout 時自動 fallback 到 rule-based
4. 分析結果記錄 model_name

---

## CSV 匯入格式

### 標準 Mentions CSV
```csv
platform,keyword,title,content,url,author,published_at,sentiment
小紅書 Import,品牌,推薦！,超好用！,https://...,user123,2026-06-01,Positive
```

### Google Map Reviews CSV
```csv
store_name,rating,review_text,author,published_at
鼎泰豐,5,服務超好！,張小明,2026-06-01
```

---

## Demo 帳號

| 帳號 | 密碼 | 角色 | 權限 |
|------|------|------|------|
| admin | admin123 | admin | 所有功能（管理使用者、關鍵字、匯入、設定） |
| manager | manager123 | manager | 戰情室、高風險事件處理、商譽日報、CSV 匯出 |
| viewer | viewer123 | viewer | 戰情室、風險訊號查閱（唯讀） |

---

## Demo 展示腳本

1. 啟動 Backend + Frontend
2. 執行 `python -m app.seed` 產生 ~130 筆展示資料
3. 開啟瀏覽器 → 使用 admin/admin123 登入
4. 打開商譽風險戰情室 → 展示商譽風險指數、平台風險分布、高風險事件
5. 監測品牌設定 → 新增一個品牌關鍵字
6. 點擊 Header「立即掃描」→ 展示資料來源匯入結果
7. 高風險事件 → 指派、備註、變更狀態
8. CSV 匯入 → 拖曳上傳 CSV 檔案
9. 每日報告 → 複製或下載 .md 報告
10. 通知中心 → 查看高風險事件通知
11. 排程管理 → 展示排程狀態與立即執行
12. 系統設定 → 設定品牌名稱與模式

---

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| DATABASE_URL | 資料庫連線字串 | sqlite:///./social_listening.db |
| OPENAI_API_KEY | OpenAI API 金鑰（可選） | (空) |
| DEMO_MODE | Demo 模式開關 | true |

---

## 常見問題排除

**Q: 前端顯示「無法載入」錯誤**
A: 確認後端正以 `uvicorn app.main:app --host 0.0.0.0 --port 8000` 運行，且無防火牆阻擋 port 8000。

**Q: CSV 匯入失敗**
A: 確認 CSV 編碼為 UTF-8，且包含必要欄位 (platform, keyword, content)。

**Q: 排程無法啟動**
A: 需要安裝 `apscheduler`（已在 requirements.txt）。若環境無法安裝（SSL 錯誤），排程 API 會回傳提示訊息。

**Q: Dashboard 沒有資料**
A: 執行 `python -m app.seed` 產生展示資料。

---

## 未來擴充方向

- PostgreSQL 正式環境部署
- Redis 快取熱門 Dashboard 查詢
- JWT 多使用者登入與角色權限（v2.0 已實作 admin/manager/viewer）
- LINE / Slack / Email 即時推播
- PDF 報表匯出
- 資料視覺化日期範圍選擇器
