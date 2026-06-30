# Taiwan Social Media Keyword Monitoring System
## 台灣社群輿情監測系統

社群平台關鍵字監測與 AI 輿情分析系統。支援 PTT、Dcard、Google Search 模擬爬取，CSV 匯入高風險平台資料，可選用 OpenAI GPT 強化分析。

---

## 系統架構

```
social-listening-crawler/
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── api/              # auth, keywords, mentions, crawler, dashboard, scheduler, exports, reports, settings, notifications
│   │   ├── connectors/       # PTT, Dcard, Google Search (mock), CSV importer
│   │   ├── models/           # User, Keyword, Mention, CrawlLog, NotificationLog, SystemSetting, ImportLog
│   │   ├── schemas/          # Pydantic
│   │   ├── services/         # CrawlerService, AIService, LLM Service, SchedulerService, NotificationService
│   │   ├── utils/            # auth (JWT/hash), text_cleaner
│   │   └── seed.py           # Demo data (8 keywords, ~130 mentions)
│   └── requirements.txt
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS + Recharts
│   └── src/
│       ├── api/              # API client layer
│       ├── components/       # Dashboard charts, Layout
│       ├── pages/            # Dashboard, Keywords, Mentions, Import, Incidents, Reports, Notifications, Scheduler, Logs, Settings
│       └── types/            # TypeScript interfaces
├── sample_data/              # CSV 範例檔
└── .env.example              # 環境變數範本
```

---

## 合規注意事項

**本系統不會直接爬取 Facebook、TikTok、Threads、抖音、小紅書、Google Maps。**
這些平台的資料僅透過 CSV 匯入。Mock connector 僅限 PTT、Dcard、Google Search。

---

## 快速啟動

### 環境準備

```powershell
# 複製環境變數範本到 backend/ 目錄
copy .env.example backend\.env
# 編輯 backend\.env，填入 OPENAI_API_KEY（可選，不填則使用 rule-based AI）
```

### 後端 Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed           # 產生展示用假資料（8 keywords, ~130 mentions）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger API: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

### 前端 Frontend

```powershell
cd frontend
npm install
npm run dev
```

瀏覽器開啟 http://localhost:5173

### 正式環境部署

```powershell
cd frontend
npm run build         # 產出 dist/ 資料夾
# 將 dist/ 部署到靜態伺服器（Nginx、Vercel、S3）

# 後端建議改用 PostgreSQL
# 修改 .env 中的 DATABASE_URL=postgresql://user:pass@host:5432/db
# pip install psycopg2-binary
```

> SQLite 適合開發與 Demo。正式環境建議改用 PostgreSQL 以支援並發寫入。

---

## 功能總覽

| 功能 | 說明 |
|------|------|
| 登入權限 | admin/manager/viewer 三種角色，JWT Token 驗證 |
| 輿情儀表板 | 總聲量、平台分布、關鍵字排行、7 日趨勢、最新提及、高風險事件 |
| 關鍵字管理 | 新增/啟用/停用監測關鍵字 |
| 聲量資料 | 全文搜尋、平台/情緒/風險篩選、分頁、重新分析、CSV 匯出 |
| 高風險事件 | 事件狀態流程 (new→reviewing→replied→resolved→ignored)、指派、備註 |
| CSV 匯入 | 拖曳上傳或伺服器路徑、欄位驗證、重複跳過、錯誤明細 |
| 每日報告 | 自動產生 Markdown 報告，可複製或匯出 .md |
| 通知中心 | 高風險事件自動通知，可標記已讀 |
| 排程管理 | 定時自動爬取、立即執行、執行紀錄 |
| 系統設定 | 公司/品牌名稱、競品、高風險關鍵字、Demo/正式模式切換 |

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
| manager | manager123 | manager | 儀表板、事件管理、報告、匯出 |
| viewer | viewer123 | viewer | 儀表板、聲量查閱（唯讀） |

---

## Demo 展示腳本

1. 啟動 Backend + Frontend
2. 執行 `python -m app.seed` 產生 ~130 筆展示資料
3. 開啟瀏覽器 → 使用 admin/admin123 登入
4. 打開 Dashboard → 展示總聲量、平台分布、高風險事件
5. 關鍵字管理 → 新增一個品牌關鍵字
6. 點擊 Header「立即爬取」→ 展示 Mock Crawler 結果
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
