# 專案名稱：台股 AI 即時投資分析 Agent 系統

## 目標

建立一套台股即時資訊分析網站，使用者可以輸入股票代號，系統即時取得股價、成交量、新聞、重大訊息與歷史指標，並提供多位投資專家 AI Agent 分析。

本系統定位為「投資研究與決策輔助工具」，不是自動下單系統，也不是保證獲利系統。所有 AI 分析都必須附上資料來源、分析理由、風險提示、信心分數與資料更新時間。

---

## 核心功能

### 1. 股票查詢

使用者可以輸入股票代號，例如：

- 2330
- 2317
- 2454
- 2382
- 3231

查詢後顯示：

- 股票代號
- 股票名稱
- 最新價格
- 漲跌
- 漲跌幅
- 開盤價
- 最高價
- 最低價
- 昨收
- 成交量
- 資料來源
- 最後更新時間
- 資料品質狀態

---

### 2. 即時資料來源

系統資料來源設計如下：

#### 即時行情主來源

- Fugle API

#### 即時行情備援來源

- TWSE MIS

#### 新聞來源

- Yahoo 股市 RSS

#### 重大訊息來源

- 公開資訊觀測站 MOPS
- 初版可以先提供連結跳轉，後續再做自動擷取與摘要

---

### 3. 資料品質驗證

每筆行情資料必須包含：

- `symbol`
- `name`
- `price`
- `change`
- `changePercent`
- `open`
- `high`
- `low`
- `previousClose`
- `volume`
- `source`
- `exchangeTime`
- `receivedAt`
- `latencyMs`
- `dataQualityStatus`
- `qualityScore`
- `rawPayload`

驗證規則：

1. `price` 不可小於 0
2. `volume` 不可小於 0
3. `high` 必須大於等於 `low`
4. `price` 必須介於 `high` 與 `low` 之間
5. 資料超過 30 秒未更新，標記為 `stale`
6. 資料超過 120 秒未更新，標記為 `unavailable`
7. 主來源與備援來源價格差異超過 1 tick，標記為 `source_conflict`
8. 若資料來源異常，不允許 AI 產出高信心結論

---

## AI 專家 Agent 設計

系統必須建立以下 Agent：

### 1. FundamentalAnalystAgent 基本面專家

分析：

- 營收
- EPS
- 毛利率
- 營業利益率
- ROE
- 本益比
- 股價淨值比
- 長期競爭力
- 估值合理性

輸出：

- 基本面結論
- 主要理由
- 主要風險
- 長期觀察重點
- 信心分數

---

### 2. TechnicalAnalystAgent 技術分析專家

分析：

- K 線
- 均線
- 支撐
- 壓力
- RSI
- MACD
- KD
- 成交量
- 突破或跌破

輸出：

- 技術面結論
- 支撐價
- 壓力價
- 警戒價
- 短線風險
- 信心分數

---

### 3. ChipAnalystAgent 籌碼專家

分析：

- 外資買賣超
- 投信買賣超
- 自營商買賣超
- 融資融券
- 大戶持股
- 分點券商
- 借券餘額

輸出：

- 籌碼結論
- 法人態度
- 散戶籌碼風險
- 主力動向
- 信心分數

---

### 4. IntradayTraderAgent 短線交易專家

分析：

- 盤中漲跌幅
- 成交量變化
- 分時走勢
- 五檔委買委賣
- 當日高低點
- VWAP
- 當沖風險

輸出：

- 短線結論
- 是否過熱
- 是否適合追價
- 觀察價位
- 風險提示
- 信心分數

注意：此 Agent 不可直接輸出「立即買進」或「立即賣出」，只能使用「偏多」、「偏空」、「等待確認」、「不追高」、「風險升高」等描述。

---

### 5. RiskManagerAgent 風控專家

分析：

- 波動率
- 最大回撤
- 部位風險
- 停損風險
- 事件風險
- 財報風險
- 隔日跳空風險

輸出：

- 風險等級
- 主要風險
- 風控建議
- 適合部位大小描述
- 信心分數

---

### 6. IndustryAnalystAgent 產業專家

分析：

- 產業趨勢
- 同業比較
- 上下游供應鏈
- 國際市場
- 題材持續性
- 景氣循環

輸出：

- 產業結論
- 題材真實性
- 同業比較
- 中長期風險
- 信心分數

---

### 7. NewsEventAnalystAgent 新聞事件專家

分析：

- 即時新聞
- 重大訊息
- 法說會
- 月營收
- 財報
- 除權息
- 處置股
- 注意股

輸出：

- 今日事件摘要
- 利多 / 利空 / 中性分類
- 是否有官方公告支持
- 新聞可信度
- 信心分數

---

### 8. BearCaseAnalystAgent 反方風險專家

分析：

- 市場可能錯估的地方
- 利多是否已反映
- 估值是否過熱
- 籌碼是否鬆動
- 技術面是否背離
- 新聞是否只是短線題材

輸出：

- 反方結論
- 最大風險
- 可能失敗條件
- 需要重新評估的條件
- 信心分數

---

### 9. InvestmentCommitteeAgent 投資委員會總結

此 Agent 必須整合所有專家結論，輸出最終報告。

輸出格式：

- 綜合結論：強勢偏多 / 中立偏多 / 中立觀察 / 中立偏空 / 高風險
- 信心分數：0 到 100
- 適合類型：短線 / 波段 / 長期 / 僅觀察
- 主要支持理由
- 主要反對理由
- 主要風險
- 支撐價
- 壓力價
- 警戒價
- 資料品質狀態
- 最後更新時間
- 免責聲明

---

## 前端 UI 設計

### 頁面區塊

1. Header
   - 系統名稱
   - 搜尋股票
   - 資料更新狀態

2. 即時行情卡片
   - 最新價
   - 漲跌幅
   - 成交量
   - 今日高低
   - 資料來源
   - 最後更新時間

3. 專家按鈕區
   - 基本面專家
   - 技術分析專家
   - 籌碼專家
   - 短線交易專家
   - 風控專家
   - 產業專家
   - 新聞事件專家
   - 反方風險專家
   - 投資委員會總結

4. AI 分析結果區
   - 專家名稱
   - 結論
   - 信心分數
   - 主要理由
   - 主要風險
   - 觀察價位
   - 資料來源
   - 免責聲明

5. 分析紀錄區
   - 保存最近 20 筆分析紀錄

---

## 後端 API 設計

### 股票即時資訊

`GET /api/stocks/:symbol/quote`

回傳：

- 即時股價
- 漲跌幅
- 成交量
- 資料來源
- 資料品質狀態

---

### 新聞資訊

`GET /api/stocks/:symbol/news`

回傳：

- 新聞標題
- 來源
- 發布時間
- 原文連結
- AI 短摘要

---

### 單一專家分析

`POST /api/agents/:expert/analyze`

body：

```json
{
  "symbol": "2330",
  "timeframe": "intraday"
}
```

expert 可用值：

- `fundamental`
- `technical`
- `chip`
- `intraday`
- `risk`
- `industry`
- `news`
- `bearcase`

---

### 投資委員會分析

`POST /api/agents/investment-committee/analyze`

body：

```json
{
  "symbol": "2330",
  "timeframe": "intraday"
}
```

此 API 會依序執行多位專家 Agent，最後由 InvestmentCommitteeAgent 彙整。

---

## AI 輸出限制

AI 不得輸出以下內容：

- 保證獲利
- 明確承諾報酬
- 無依據的目標價
- 未列分析基礎的買賣建議
- 鼓勵高槓桿或過度交易
- 直接要求使用者立即買進或賣出

AI 必須輸出以下內容：

- 分析依據
- 資料來源
- 主要風險
- 信心分數
- 資料更新時間
- 免責聲明

---

## 建議技術棧

Frontend：

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

Backend：

- FastAPI 或 Node.js Express
- PostgreSQL
- Redis
- Background Scheduler
- OpenAI API 或本地 LLM

資料處理：

- MarketDataService
- NewsService
- DataQualityService
- FeatureEngineeringService
- AgentOrchestrator
- ReportGenerator

---

## 資料庫資料表

### stocks

- id
- symbol
- name
- market
- industry
- created_at
- updated_at

### realtime_quotes

- id
- symbol
- price
- change
- change_percent
- open
- high
- low
- previous_close
- volume
- source
- exchange_time
- received_at
- quality_score
- quality_status
- raw_payload

### news_items

- id
- symbol
- title
- source
- url
- published_at
- summary
- sentiment
- created_at

### agent_reports

- id
- symbol
- expert_type
- stance
- confidence
- summary
- reasons
- risks
- watch_levels
- suggested_action
- data_sources
- created_at

### data_quality_logs

- id
- symbol
- source
- status
- message
- created_at

---

## 免責聲明

所有 AI 分析內容僅作為投資研究與決策輔助，不構成個人化投資建議、招攬、推薦或保證獲利。使用者應自行評估風險，並根據自身財務狀況、投資目標與風險承受度做出決策。

---

## 本專案靜態前端 MVP 執行範圍

目前專案仍是 HTML / CSS / Vanilla JS 靜態前端，Ver 2.3 先落地以下可執行項目：

1. 在報告頁新增 9-Agent 專家矩陣。
2. 在報告頁新增 Investment Committee 總結卡。
3. 在報告頁顯示資料品質狀態、更新時間與免責聲明。
4. 建立最近 20 筆分析紀錄，使用 `localStorage` 保存。
5. 後端 API、資料庫、Fugle / TWSE MIS / Yahoo RSS 串接保留為下一階段實作。
