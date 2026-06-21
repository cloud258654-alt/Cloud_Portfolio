# Phase_05_Logistics_Integration.md

# Phase 05 - 物流串接與完整流程

## 目標

完成團購流程閉環。

---

## 功能範圍

### 建立物流單

支援：

* 7-11
* 全家
* 宅配

第一版使用 Mock API。

---

## 物流資訊

* tracking_no
* carrier
* shipping_status

---

## API

POST /shipping/create

GET /shipping/{tracking_no}

---

## 系統流程

留言

↓

AI 建立訂單

↓

自動通知

↓

付款

↓

AI 對帳

↓

建立物流單

↓

通知出貨

↓

完成訂單

---

## 驗收標準

訂單完成後可成功建立物流單號。

系統更新為 SHIPPED。

---

## 最終 Demo

王小明留言：

+2

↓

建立訂單

↓

付款通知

↓

付款完成

↓

自動對帳

↓

建立物流單

↓

通知出貨

↓

訂單狀態：

SHIPPED
