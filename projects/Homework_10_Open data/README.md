# 🌤️ Taiwan Weather Visualization Dashboard

即時台灣天氣觀測與預報視覺化平台，整合中央氣象署 (CWA) 官方觀測資料與 Windy 全球天氣預報 API，提供互動式地圖、圖表分析與鄰近攝影機查詢。

---

## 📸 Live Demo

### CWA 官方觀測模式

| 功能 | 畫面說明 |
|------|----------|
| 地圖總覽 | 台灣全島測站地圖，顏色標示即時溫度（藍=冷、綠=涼、橘=暖、紅=熱） |
| 關鍵觀測 | 左側面板顯示最高溫、最大雨量、最大陣風測站 |
| 溫度排名 | 互動式長條圖顯示 Top 10 高溫測站 |
| 雨量排名 | 即時降雨量排行，含測站名稱與數值 |
| 測站彈窗 | 點擊地圖標記顯示完整觀測（溫度/濕度/風速/氣壓/雨量） |

### Windy 預報模式

| 功能 | 畫面說明 |
|------|----------|
| 互動地圖 | Windy 地圖載入，支援圖層切換 |
| 天氣圖層 | 溫度 / 風速 / 雨量 / 氣壓 / 雲量 五種視覺化圖層 |
| 點擊查詢 | 點擊地圖任意位置查詢該點 GFS 數值預報 |
| 預報卡片 | 顯示 Now / +3h / +6h / +12h / +24h 五個時間點預報 |
| 附近攝影機 | 自動搜尋 50km 內 Windy Webcams，顯示即時畫面 |
| 城市搜尋 | 支援 Taipei, Taichung, Tainan, Kaohsiung, Hualien, Taitung 快速定位 |

### UI 風格

灰白金屬風格 (Gray-White Metallic)，清爽現代介面：
- 淺灰底色 + 白色卡片 + 細緻陰影
- 鋼鐵藍 (#4a6fa5) 作為主色調
- 圓角設計，平滑過渡動畫

---

## 🏗️ 系統架構

```
CWA OpenData API                    Windy API (Map / Point / Webcams)
       │                                       │
       ▼                                       ▼
  fetch_raw.py                          Flask Backend (app.py)
  fetch_and_convert.py                  ├── /api/windy-forecast (POST)
       │                                └── /api/windy-webcams  (POST)
       ▼                                       │
  weather.csv ──► weather.db                   │
       │                                       │
       ▼                                       ▼
  Flask Backend (app.py)              React Frontend (Vite + TypeScript)
  ├── /api/weather    (GET)           ├── CwaDashboardPage (官方觀測)
  └── /api/stats      (GET)           └── WindyForecastPage (預報視覺化)
```

---

## ✨ 功能特色

### CWA 官方觀測頁面

- **即時測站地圖**：Leaflet 互動地圖，近 400 個台灣測站
- **溫度顏色編碼**：紅 (≥30°C) / 橘 (25-30°C) / 綠 (20-25°C) / 藍 (<20°C)
- **重點觀測摘要**：最高溫、最大雨量、最大陣風測站
- **統計圖表**：Chart.js 長條圖，溫度/雨量 Top 10 排名
- **自動刷新**：每 10 秒自動更新最新觀測資料
- **彈窗資訊**：點擊測站顯示完整 12 項觀測數值

### Windy 預報頁面

- **Windy 地圖整合**：5 種天氣圖層可自由切換
- **Dev Proxy 繞過 Domain 限制**：localhost 開發時自動透過 Vite proxy 代理，不再顯示 403
- **Fallback 地圖**：Windy 載入失敗自動降級為 Leaflet 地圖
- **GFS 點預報**：點擊地圖查詢 Now~+24h 數值預報
- **Webcams 攝影機**：搜尋鄰近 50km 即時攝影機畫面
- **城市搜尋**：支援台灣六大都會區快速定位

---

## 🚀 快速開始

### 環境需求

- **Python** ≥ 3.9
- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone 專案

```bash
git clone https://github.com/cloud258654-alt/Cloud_Portfolio.git
cd Cloud_Portfolio/projects/Homework_10_Open\ data
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env`，填入 API Keys：

```env
CWA_API_TOKEN=你的_CWA_API_TOKEN
VITE_WINDY_API_KEY=你的_Windy_Map_API_Key
VITE_WINDY_POINT_API_KEY=你的_Windy_Point_API_Key
VITE_WINDY_WEBCAMS_API_KEY=你的_Windy_Webcams_API_Key
```

> **🔐 API Key 取得方式：**
> - CWA Token：[中央氣象署開放資料平台](https://opendata.cwa.gov.tw/)
> - Windy API Key：[Windy API Console](https://api.windy.com/)

### 3. 啟動後端 (Flask)

```bash
# 安裝 Python 依賴
pip install -r backend/requirements.txt

# 啟動後端伺服器 (port 5000)
python backend/app.py
```

### 4. 啟動前端 (Vite)

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

瀏覽器打開 `http://localhost:5173`（或 terminal 顯示的 port）。

---

## 📖 操作說明

### 頁面切換

左側 Sidebar 點擊切換兩種視圖：

1. **Official Weather (CWA)** — 台灣官方氣象觀測
2. **Windy Forecast** — 全球天氣預報視覺化

### CWA 觀測模式操作

| 操作 | 說明 |
|------|------|
| 點擊地圖標記 | 顯示該測站完整觀測資訊（溫度/濕度/風速/氣壓等 12 項） |
| 查看左側面板 | 即時更新最高溫、最大雨量、最大陣風測站 |
| 滾動圖表 | 溫度 Top 10 & 雨量排行榜自動更新 |

### Windy 預報模式操作

| 操作 | 說明 |
|------|------|
| 點擊地圖任意位置 | 查詢該點 GFS 數值預報 |
| 切換圖層按鈕 | Temp / Wind / Rain / Pressure / Clouds |
| 搜尋城市 | 輸入 Taipei / Kaohsiung 等城市名稱後自動飛往 |
| 時間軸點擊 | 切換 Now → +3h → +6h → +12h → +24h 預報 |
| 查看 Webcams | 點擊地圖後自動顯示附近 50km 攝影機 |
| 點擊 View on Windy | 在新分頁開啟 Windy 官方攝影機頁面 |

### Fallback 地圖

當 Windy Map 因 domain 限制 (403) 或 API Key 問題無法載入時：
- 自動降級為 Leaflet 深色地圖
- 仍可點擊地圖查詢預報與攝影機
- 顯示開發者警告與設定指引

---

## 🔧 疑難排解

### Windy Map 403 Unauthorized Domain

本地開發時出現 403 錯誤有兩種解決方式：

**方式一：Vite Proxy（自動，開發模式已設定）**

`npm run dev` 會自動透過 Vite proxy 代理 `api.windy.com` 請求，繞過 domain 檢查。

**方式二：Windy 後台設定**

至 [Windy API Console](https://api.windy.com/) → Allowed Domains 加入：
- `localhost`
- `localhost:5173`
- `127.0.0.1`
- `127.0.0.1:5173`

### 401 Invalid API Key

表示 API Key 錯誤或過期，請確認 `.env` 中的 Key 正確且未過期。

### 後端無法連線

確認 Flask 後端在 `http://127.0.0.1:5000` 執行中。

詳細說明請參閱 `frontend/WINDY_TROUBLESHOOTING.md`。

---

## 📁 專案結構

```
Homework_10_Open data/
├── backend/
│   ├── app.py                  # Flask REST API 後端
│   └── requirements.txt        # Python 依賴
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CwaDashboardPage.tsx    # CWA 官方觀測頁面
│   │   │   └── WindyForecastPage.tsx   # Windy 預報頁面
│   │   ├── components/weather/
│   │   │   ├── WindyMap.tsx             # Windy 地圖 + Fallback
│   │   │   ├── WindyToolbar.tsx         # 圖層工具列
│   │   │   ├── WindyForecastCard.tsx    # 預報卡片
│   │   │   ├── WindyWebcamPanel.tsx     # 攝影面板
│   │   │   ├── WindyWebcamCard.tsx      # 攝影機卡片
│   │   │   └── WindySearchBox.tsx       # 城市搜尋框
│   │   ├── services/
│   │   │   ├── windyMapService.ts       # 地圖城市/圖層設定
│   │   │   ├── windyPointService.ts     # Point Forecast API
│   │   │   ├── windyWebcamService.ts    # Webcams API
│   │   │   └── windyProxyInterceptor.ts # 開發 Proxy 攔截器
│   │   ├── index.css                    # 全域樣式（灰白金屬風格）
│   │   └── App.tsx                      # 應用入口
│   ├── vite.config.ts                   # Vite 配置 + Proxy 設定
│   ├── index.html                       # HTML 入口
│   └── WINDY_TROUBLESHOOTING.md         # Windy API 疑難排解
├── docs/
│   ├── design_for_windy.md              # Windy 整合設計文件
│   └── TODO_CWA_Weather_Visualization.md
├── design.md                            # CWA 資料管線設計文件
├── fetch_raw.py                         # CWA 原始資料擷取
├── fetch_and_convert.py                 # CWA 資料清洗轉換
├── run.py                               # 資料管線執行腳本
└── weather.db                           # SQLite 觀測資料庫
```

---

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 構建工具 | Vite 5 |
| 地圖 | Leaflet 1.4 + Windy Map API |
| 圖表 | Chart.js 4 (react-chartjs-2) |
| 圖示 | Lucide React |
| 後端 | Flask + Python |
| 資料庫 | SQLite3 |
| 外部 API | CWA OpenData / Windy Map / Windy Point Forecast / Windy Webcams |
| 字型 | Inter + Outfit (Google Fonts) |

---

## 📝 更新日誌

詳見 `frontend/PROJECT_LOG.md`

---

## 📄 License

MIT
