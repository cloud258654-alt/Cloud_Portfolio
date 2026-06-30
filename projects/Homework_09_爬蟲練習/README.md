# 電影資料爬蟲系統 — Scrape Center SSR1

從 [Scrape Center](https://scrape.center/) 的 SSR1 電影資料網站爬取完整電影資訊，包含本地化資料儲存與 FastAPI 查詢介面。

## 架構

```
scrape_movies.py   # 爬蟲主程式：爬取 → 表格/JSON/CSV/Excel/海報
list_movies.py     # 終端機電影清單
create_db.py       # JSON → SQLite 資料庫
api.py             # FastAPI 查詢服務
movies.db          # SQLite 資料庫 (100 筆電影)
movies.xlsx        # Excel 表格 (含海報圖片)
movies.csv         # CSV 表格
movies.json        # JSON 原始資料
posters/           # 100 張海報 JPG
```

## 快速開始

### 1. 安裝依賴

```bash
pip install requests beautifulsoup4 lxml openpyxl Pillow fastapi uvicorn
```

### 2. 執行爬蟲

```bash
python scrape_movies.py
```

產出：
- `movies.xlsx` — Excel（含嵌入式海報）
- `movies.csv` — CSV 表格
- `movies.json` — JSON 原始資料
- `posters/` — 100 張海報 JPG

### 3. 建立資料庫

```bash
python create_db.py
```

產出 `movies.db`（SQLite）

### 4. 啟動 API

```bash
python api.py
```

開啟 http://localhost:8080/docs 進入 Swagger 互動文件。

## API 端點

| 方法 | 路徑 | 參數 | 說明 |
|------|------|------|------|
| GET | `/movies` | `q`, `category`, `country`, `sort`, `order`, `page`, `size` | 電影列表 |
| GET | `/movies/{id}` | — | 單一電影 |
| GET | `/categories` | — | 類別統計 |
| GET | `/stats` | — | 評分統計 |
| GET | `/posters/{filename}` | — | 海報圖片 |
| GET | `/docs` | — | Swagger UI |

### 範例

```bash
# 搜尋「哈利波特」
curl "http://localhost:8080/movies?q=哈利"

# 篩選動畫類，依評分降冪
curl "http://localhost:8080/movies?category=動畫&sort=score&order=desc"

# 取得電影詳情
curl "http://localhost:8080/movies/1"

# 取得海報
curl "http://localhost:8080/posters/001_霸王别姬.jpg" -o poster.jpg
```

## 資料庫結構

**movies** — 電影主表

| 欄位 | 型態 | 說明 |
|------|------|------|
| id | INTEGER PK | 電影編號 |
| name_cn | TEXT | 中文片名 |
| name_en | TEXT | 英文片名 |
| categories | TEXT | 類別 |
| country | TEXT | 國家 |
| duration | TEXT | 片長 |
| release_date | TEXT | 上映日期 |
| score | REAL | 評分 |
| cover_url | TEXT | 海報網址 |
| detail_url | TEXT | 詳情頁網址 |
| poster_file | TEXT | 本地海報檔名 |

**categories** — 類別表

**movie_category** — 多對多關聯

**v_movie_full** — 完整 JOIN 視圖

## 目標網站

- 入口：https://scrape.center/
- 練習站：https://ssr1.scrape.center/
- 資料：100 部電影，10 頁，伺服器端渲染，無反爬
