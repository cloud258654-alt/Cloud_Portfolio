# 🅿️ 智慧停車場管理系統

停車場收費管理流程系統 MVP 版本，模擬完整停車場營運流程。

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS |
| 後端 | Node.js + Express |
| 資料庫 | SQLite + Prisma ORM |
| 語言 | JavaScript |

## 快速啟動

### 1. 安裝依賴

```bash
# 後端
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed

# 前端
cd ../frontend
npm install
```

### 2. 啟動服務

```bash
# 終端機 1 - 後端 (port 3001)
cd backend
node src/index.js

# 終端機 2 - 前端 (port 5173)
cd frontend
npm run dev
```

### 3. 登入

- 網址：**http://localhost:5173**
- 帳號：`admin`
- 密碼：`admin123`

## 系統頁面

| 路徑 | 功能 |
|------|------|
| `/login` | 管理員登入 |
| `/dashboard` | 即時看板（車位、營收、場內車輛） |
| `/entry` | 車輛進場登記 |
| `/exit` | 車輛出場與付款 |
| `/records` | 停車紀錄查詢（含分頁篩選） |
| `/monthly` | 月租車管理（新增/編輯/刪除） |
| `/blacklist` | 黑名單管理 |
| `/rates` | 費率設定 |
| `/reports` | 報表分析（營收/車流/異常事件） |
| `/settings` | 系統設定（停車場名稱/總車位） |

## 計費規則

| 車輛類型 | 規則 |
|----------|------|
| 臨停 | 前 30 分鐘免費，每小時 $40，每日最高 $300 |
| 月租 | 有效期內免費，過期改為臨停計費 |
| VIP | 永久免費 |
| 黑名單 | 禁止進場，出場時顯示警告 |

## 商業邏輯

- 同一車牌不可重複進場
- 無進場紀錄不可出場
- 付款完成才能出場
- 出場後不可重複付款
- 車位數自動加減，不得超限
- 異常事件自動紀錄

## 付款方式

現金 / 信用卡 / LINE Pay / 悠遊卡（模擬付款）

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/login` | 登入 |
| GET | `/api/auth/me` | 取得當前使用者 |
| GET | `/api/parking/dashboard` | 即時看板 |
| POST | `/api/parking/entry` | 車輛進場 |
| POST | `/api/parking/exit/calculate` | 計算出場費用 |
| POST | `/api/parking/exit/confirm` | 確認出場付款 |
| GET | `/api/records` | 停車紀錄查詢 |
| GET | `/api/records/:id` | 單筆紀錄詳情 |
| GET | `/api/monthly` | 月租車列表 |
| POST | `/api/monthly` | 新增月租車 |
| PUT | `/api/monthly/:id` | 編輯月租車 |
| DELETE | `/api/monthly/:id` | 刪除月租車 |
| GET | `/api/blacklist` | 黑名單列表 |
| POST | `/api/blacklist` | 新增黑名單 |
| PUT | `/api/blacklist/:id` | 編輯黑名單 |
| DELETE | `/api/blacklist/:id` | 刪除黑名單 |
| GET | `/api/rates` | 費率設定 |
| PUT | `/api/rates` | 更新費率 |
| GET | `/api/reports/summary` | 報表摘要 |
| GET | `/api/reports/events` | 異常事件紀錄 |
| GET | `/api/settings` | 系統設定 |
| PUT | `/api/settings` | 更新系統設定 |

## 專案結構

```
Project_003_Smart parking/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # 資料庫模型
│   │   └── seed.js            # 初始資料
│   └── src/
│       ├── index.js           # Express 伺服器入口
│       ├── middleware/
│       │   └── auth.js        # JWT 驗證
│       ├── routes/
│       │   ├── auth.js        # 登入/驗證
│       │   ├── parking.js     # 進出場/即時看板
│       │   ├── records.js     # 紀錄查詢
│       │   ├── monthly.js     # 月租車管理
│       │   ├── blacklist.js   # 黑名單管理
│       │   ├── rates.js       # 費率設定
│       │   ├── reports.js     # 報表分析
│       │   └── settings.js    # 系統設定
│       └── utils/
│           └── billing.js     # 計費邏輯
└── frontend/
    └── src/
        ├── App.jsx            # 路由設定
        ├── main.jsx           # 入口
        ├── components/
        │   └── Layout.jsx     # 側邊欄 + Toast
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Entry.jsx
        │   ├── Exit.jsx
        │   ├── Records.jsx
        │   ├── Monthly.jsx
        │   ├── Blacklist.jsx
        │   ├── Rates.jsx
        │   ├── Reports.jsx
        │   └── Settings.jsx
        └── utils/
            └── api.js         # API 客戶端
```
