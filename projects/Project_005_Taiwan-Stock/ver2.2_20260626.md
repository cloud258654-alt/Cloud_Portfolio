# 台股即時資料準確性驗證規格

## 目標

建立一套台股即時資訊網站，必須確保資料來源可追溯、可驗證、可備援、可標記異常。

## 資料來源

1. 主即時來源：Fugle API
2. 備援即時來源：TWSE MIS
3. 官方校正來源：TWSE OpenAPI / TPEx OpenAPI
4. 新聞來源：Yahoo 股市 RSS

## 每筆行情資料必須包含

- `symbol`
- `name`
- `price`
- `open`
- `high`
- `low`
- `volume`
- `source`
- `exchange_time`
- `received_at`
- `latency_ms`
- `is_stale`
- `validation_status`
- `quality_score`
- `raw_payload`

## 驗證規則

1. `price` 不可為負數
2. `volume` 不可為負數
3. `high >= low`
4. `high >= price >= low`
5. 成交量盤中不可異常倒退
6. 資料超過 30 秒未更新，標記 `stale`
7. 資料超過 120 秒未更新，標記 `unavailable`
8. Fugle 與 TWSE MIS 價格差異超過 1 tick，標記 `source_conflict`
9. `source_conflict` 連續 3 次，前端顯示警示
10. 盤後用 TWSE / TPEx 官方資料校正收盤價、成交量、最高價、最低價

## 前端顯示

每個股票卡片必須顯示：

- 股票代號
- 股票名稱
- 最新價
- 漲跌
- 漲跌幅
- 成交量
- 資料來源
- 最後更新時間
- 資料狀態：即時 / 延遲 / 失效 / 來源衝突 / 盤後校正

## 後端要求

1. 所有外部 API 由後端呼叫，不可由前端直接呼叫
2. 建立 cache，避免大量請求外部 API
3. 實作 retry 機制
4. 實作 fallback 機制
5. 保留 `raw_payload` 方便除錯
6. 建立 `data_quality_log`
7. 當資料異常時寫入 `alert_log`

## 盤後校正流程

1. 盤中使用即時資料
2. 13:30 後停止即時模式
3. 14:00 後抓 TWSE / TPEx 官方盤後資料
4. 用官方資料覆蓋當日正式 OHLCV
5. 保留盤中資料作為 intraday log，不作為正式歷史資料

## 實作完成定義

此規格完成時，系統必須具備：

1. 每筆行情資料可追溯來源與原始 payload。
2. 前端能清楚標示資料狀態與異常。
3. 後端具備 cache、retry、fallback。
4. 資料異常會寫入品質紀錄與警示紀錄。
5. 盤後能以官方資料校正正式 OHLCV。
