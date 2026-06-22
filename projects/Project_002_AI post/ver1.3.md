# Ghibli POS System UI Specification

## Project

建立一套溫暖、療癒、手繪感的 POS 收銀系統。

設計風格參考：

* 宮崎駿動畫的鄉村商店
* 木質雜貨店
* 森林系配色
* 水彩手繪質感
* 柔和光影
* 溫暖紙張材質

---

# Design Style

## Theme

Ghibli Inspired Fantasy POS

### Keywords

* warm
* handmade
* watercolor
* wooden
* cozy
* cottage
* nature
* forest
* vintage shop
* magical

---

# Color Palette

## Background

```css
#F7F1E5
#EDE4D3
#DCCFB0
```

## Primary

```css
#7A9E7E
#5F8063
```

## Secondary

```css
#DDBB6B
#C89F44
```

## Accent

```css
#6AAED6
#E37B5D
```

## Text

```css
#3A342D
#5A5248
```

---

# Typography

Heading:

```css
font-family: Noto Serif TC
font-weight: 700
```

Body:

```css
font-family: Noto Sans TC
font-weight: 400
```

---

# Global Layout

```text
┌──────────────────────────────────────┐
│ Header                               │
├─────────────────────┬────────────────┤
│ Product Area        │ Summary Area   │
│                     │                │
│ Product List        │ Transaction    │
│                     │                │
├─────────────────────┴────────────────┤
│ Footer Actions                       │
└──────────────────────────────────────┘
```

---

# Header

顯示：

* 店鋪名稱
* 收銀員
* 系統時間
* 網路狀態
* 設定按鈕

```text
┌──────────────────────────────────────┐
│ 🌿 吉卜力雜貨店 POS 系統              │
│ 收銀員：小梅                         │
│ 2026-06-22 10:45                     │
└──────────────────────────────────────┘
```

Style:

* 米白背景
* 木紋邊框
* 圓角 20px
* 陰影柔和

---

# Product Scan Area

## Search Input

```text
[ 掃描商品條碼 ]
```

支援：

* Barcode
* SKU
* 商品名稱

---

# Product Table

Columns:

| 商品 | 單價 | 數量 | 金額 |
| -- | -- | -- | -- |

Example:

```text
可樂600ml
P001

$40

[-] 3 [+]

$120
```

---

# Quantity Control

Button Style

```css
width:40px;
height:40px;
border-radius:50%;
```

Icon

```text
+
-
```

風格：

* 葉子按鈕
* 木頭按鈕
* 浮雕效果

---

# Transaction Summary

顯示：

```text
交易編號
交易狀態
付款方式
小計
折扣
稅額
應付總額
```

Example:

```text
交易編號
T202501010001

狀態
SUCCESS

付款
LINE PAY

小計
280

折扣
20

稅額
14

總額
274
```

---

# Status Badge

SUCCESS

```css
background:#D9F2D9;
color:#2E7D32;
```

PENDING

```css
background:#FFF4CC;
color:#A67600;
```

CANCELLED

```css
background:#FFD6D6;
color:#C62828;
```

---

# Payment Section

Main Button

```text
結帳 / 付款
```

Style:

```css
height:72px;
border-radius:20px;
font-size:28px;
```

使用森林綠漸層。

---

# Footer Actions

Buttons:

```text
清空購物車
暫存交易
載入暫存
列印發票
交易記錄
取消交易
```

---

# Notification Panel

顯示：

* 庫存不足
* 商品加入成功
* 付款完成
* 列印成功

---

# Animation

Hover

```css
transform:scale(1.03);
```

Click

```css
transform:scale(0.98);
```

Page Transition

```css
300ms ease
```

---

# UX Rules

## 商品重複掃描

如果商品已存在：

```text
qty += 1
amt = qty * price
```

不新增新列。

---

## 庫存不足

顯示：

```text
⚠ 庫存不足
目前庫存：5
已加入：5
```

禁止再增加。

---

## 付款成功

流程：

```text
建立交易
→ 扣除庫存
→ 列印發票
→ 完成
```

---

# Technology

Preferred Stack

```text
Next.js 15
TypeScript
TailwindCSS
Shadcn UI
Lucide Icons
React Hook Form
Zustand
TanStack Query
```

---

# Final Design Goal

建立一套看起來像：

「森林裡的雜貨店收銀系統」

而不是：

「企業 ERP 系統」

使用者在結帳時應感受到：

* 溫暖
* 放鬆
* 手作感
* 治癒感

整體視覺品質需達到 AAA 遊戲介面等級。
