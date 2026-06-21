# Phase_04_AI_Reconciliation.md

# Phase 04 - AI 自動對帳

## 目標

降低人工核帳成本。

---

## 功能範圍

### 客戶付款回報

收集：

* 金額
* 帳號後五碼

### 銀行資料匯入

支援 CSV 上傳。

---

## 對帳邏輯

條件：

1. 金額相同

2. 帳號後五碼相同

符合即完成對帳。

---

## 資料表

### PaymentReports

* id
* order_id
* amount
* account_tail
* created_at

### BankTransactions

* id
* amount
* account_tail
* transaction_date

---

## API

POST /payment-report

POST /bank/import

POST /reconciliation/run

---

## 系統流程

客戶付款

↓

回報資料

↓

匯入銀行紀錄

↓

自動比對

↓

更新 PAID

---

## 驗收標準

符合條件時自動更新訂單狀態。

---

## 測試案例

付款回報：

780

51234

銀行資料：

780

51234

驗證：

訂單狀態更新為 PAID
