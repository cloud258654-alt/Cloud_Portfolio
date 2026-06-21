# Phase_01_Order_Core.md

# Phase 01 - 訂單核心系統

## 目標

建立團購系統最基本的訂單管理能力。

此階段不考慮 AI 功能。

重點是完成商品、訂單與資料庫架構。

---

## 功能範圍

### 商品管理

* 新增商品
* 修改商品
* 查看商品
* 商品庫存管理

### 訂單管理

* 建立訂單
* 查詢訂單
* 修改訂單狀態
* 刪除訂單

### 訂單狀態

* PENDING
* PAID
* SHIPPED
* CANCELLED

---

## 資料表

### Products

* id
* name
* price
* stock
* created_at

### Orders

* id
* customer_name
* product_id
* qty
* total_amount
* status
* created_at

---

## API

GET /products

POST /products

GET /orders

POST /orders

PATCH /orders/{id}

---

## 驗收標準

建立商品後可以成功建立訂單。

訂單資料正確儲存至資料庫。

---

## 測試案例

商品：

草莓

價格：

390

建立：

王小明

草莓 x2

驗證：

總金額 = 780
