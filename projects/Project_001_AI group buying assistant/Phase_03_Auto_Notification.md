# Phase_03_Auto_Notification.md

# Phase 03 - 自動通知與催款

## 目標

減少團購主手動私訊與追款工作。

---

## 功能範圍

### 自動通知

建立訂單後自動產生：

* 訂單內容
* 金額
* 匯款資訊
* 付款期限

### 自動催款

Day 1：

付款提醒

Day 2：

第二次提醒

Day 3：

最後通知

Day 4：

取消訂單

---

## 資料表

### Messages

* id
* order_id
* content
* type
* status
* created_at

---

## API

POST /messages/send

POST /messages/reminder

---

## 系統流程

建立訂單

↓

產生付款通知

↓

未付款

↓

排程催款

---

## 驗收標準

建立訂單後自動建立通知訊息。

未付款訂單可自動產生催款訊息。

---

## 測試案例

建立一筆 3 天前的 PENDING 訂單。

執行排程。

驗證：

成功建立催款訊息。
