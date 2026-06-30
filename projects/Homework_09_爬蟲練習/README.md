# 🎬 電影資料庫 — Scrape Center SSR1

從 [Scrape Center](https://scrape.center/) SSR1 爬取 100 部經典電影，提供 Streamlit 互動儀表板、FastAPI 後端、聊天機器人與 Gemini LLM 整合。

## 🚀 Live Demo

```bash
streamlit run app.py --server.port 5173
```

開啟 **http://localhost:5173**

## 📁 架構

```
scrape_movies.py   # 爬蟲主程式：爬取 → Excel/CSV/JSON/海報
app.py             # Streamlit 互動儀表板（主入口）
api.py             # FastAPI 後端 + Gemini LLM 端點
template.html      # 手繪風格 RWD 網頁模板
build_html.py      # 模板 → index.html 注入資料
create_db.py       # JSON → SQLite 資料庫
analyze.py         # 終端機數據分析
list_movies.py     # 終端機電影清單
movies.db          # SQLite 資料庫（100 筆）
movies.xlsx        # Excel（含海報圖片）
movies.csv / .json # 結構化資料
posters/           # 100 張海報 JPG
```

## ⚡ 快速開始

### 1. 安裝依賴

```bash
pip install streamlit fastapi uvicorn requests beautifulsoup4 lxml openpyxl Pillow google-genai python-dotenv
```

### 2. 執行爬蟲（已有資料可跳過）

```bash
python scrape_movies.py
```

### 3. 啟動 Streamlit 儀表板

```bash
streamlit run app.py --server.port 5173
```

### 4. （可選）啟動 FastAPI + 手繪網頁

```bash
python api.py
# 手繪風格 RWD 網頁：http://localhost:5173/
# Swagger 文件：http://localhost:5173/docs
```

## ✨ Streamlit 功能

| Tab | 內容 |
|-----|------|
| 🎞️ 電影列表 | 海報卡片網格、搜尋、類別/國家篩選、排序 |
| 📊 數據分析 | 評分分布、類別/國家/年代長條圖、Top 10 |
| 💬 AI 聊天 | 內建關鍵字機器人 + 可選 Gemini API Key |
| 📋 原始資料 | 表格檢視 + CSV 下載 |

- 右下角 **🤖 可愛機器人**，點擊跳到聊天分頁
- 每張電影卡片（含海報）整區可點擊

## 🤖 Gemini LLM 串接

聊天分頁支援兩種模式：

| 模式 | 說明 |
|------|------|
| 🔍 關鍵字 | 本機關鍵字比對，無需 API |
| ✨ Gemini | 輸入 API Key 即可啟用 Gemini 2.0 Flash |

API Key 申請：https://aistudio.google.com/apikey

## 🎨 手繪風格網頁（FastAPI）

`python api.py` 啟動後提供：

- 手繪/塗鴉風 RWD 網頁（Comic Sans + 黑框 + 不對稱圓角）
- 孩子手繪機器人吉祥物（關鍵字模式 vs LLM 模式變身）
- 繁中 / English 雙語切換
- 聊天泡泡支援 Gemini + 關鍵字自動降級

## 🛠 API 端點（FastAPI）

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 手繪風格網頁 |
| GET | `/movies` | 電影列表（支援搜尋/篩選/排序/分頁） |
| GET | `/movies/{id}` | 單一電影詳情 |
| POST | `/chat` | Gemini 聊天（可選 `api_key`） |
| GET | `/categories` | 類別統計 |
| GET | `/stats` | 評分統計 |
| GET | `/docs` | Swagger UI |

## 📊 資料統計

- 100 部電影 | 22 種類別 | 23 個國家/地區
- 評分範圍：8.8 ~ 9.5 | 平均：8.97
- 年代跨度：1939 ~ 2020（81 年）

## 🌐 目標網站

- 入口：https://scrape.center/
- 練習站：https://ssr1.scrape.center/
- 伺服器端渲染，無反爬，100 部電影 / 10 頁
