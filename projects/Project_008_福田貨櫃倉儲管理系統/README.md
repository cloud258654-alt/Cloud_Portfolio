# 福田貨櫃倉儲管理系統

福田貨櫃倉儲管理系統是一個以 React 和 Vite 建置的前端管理介面，提供貨櫃管理、客戶管理、預約、收費、電費、維修、續約提醒、通知中心、報表與 AI 助理等展示型功能。

This project is a React and Vite based frontend management interface for container storage operations. It includes demo modules for container management, customers, reservations, payments, electricity, maintenance, renewal reminders, notifications, reports, and an AI assistant.

## 專案結構 / Project Structure

```text
.
├── index.html              # 可直接開啟的靜態入口 / Static entry for direct browser opening
├── app-source.html         # Vite 建置入口 / Vite build entry
├── src/
│   ├── App.jsx             # 主要應用程式 / Main application
│   ├── main.jsx            # React 掛載入口 / React mount entry
│   └── styles.css          # 全域樣式 / Global styles
├── scripts/
│   ├── copy-dist-index.mjs # 建置後複製 dist/index.html / Copies dist/index.html after build
│   └── serve-static.mjs    # 本機靜態伺服器 / Local static server
├── dist/                   # 建置輸出 / Build output
├── package.json
└── vite.config.js
```

## 環境需求 / Requirements

- Node.js 20.19+ 或 22.12+ 建議使用。
- npm。

- Node.js 20.19+ or 22.12+ is recommended.
- npm.

> 目前 Node 18 可能仍可執行 build，但 Vite 7 會顯示版本警告，且 `npm run dev` 可能因 `crypto.hash is not a function` 無法啟動。
>
> Node 18 may still run the build, but Vite 7 will show a version warning, and `npm run dev` may fail with `crypto.hash is not a function`.

## 安裝 / Installation

```bash
npm install
```

## 建置 / Build

```bash
npm run build
```

建置後會產生：

After building, the following files are generated:

```text
dist/index.html
dist/assets/index.js
dist/assets/index.css
```

## 開啟方式 / How to Open

### 方式一：直接開啟 HTML / Option 1: Open HTML Directly

建置完成後，可以直接開啟根目錄的 `index.html`：

After building, open the root `index.html` directly:

```text
D:\WorkSpace_Cloud\VS-Code\VS-004_福田貨櫃倉儲管理系統\index.html
```

### 方式二：使用本機靜態伺服器 / Option 2: Use the Local Static Server

```bash
node scripts/serve-static.mjs
```

然後在瀏覽器開啟：

Then open:

```text
http://127.0.0.1:4173/
```

## 開發伺服器 / Development Server

```bash
npm run dev
```

如果使用 Node 18，Vite 7 的開發伺服器可能無法啟動。建議升級 Node 到 20.19+ 或 22.12+。

If you are using Node 18, the Vite 7 development server may fail to start. Upgrade Node to 20.19+ or 22.12+.

## 主要功能 / Main Features

- Dashboard 營運總覽 / Operations dashboard
- 貨櫃管理 / Container management
- QR 現場掃描模擬 / QR scan simulation
- 維修與檢查工單 / Maintenance and inspection tickets
- 客戶管理與客戶入口 / Customer management and customer portal
- 預約與等待名單 / Reservations and waitlist
- 電子合約 / Digital contracts
- 收費與催收通知 / Payment management and collection notices
- 電費管理 / Electricity management
- 續約提醒 / Renewal reminders
- 退租流程 / Checkout workflow
- 通知中心 / Notification center
- 經營報表 / Reports
- AI 營運助理 / AI operations assistant

## 注意事項 / Notes

- 目前資料為前端展示用種子資料，重新整理頁面後不會保存新增或修改內容。
- 若需要正式營運，建議加入後端 API、資料庫、登入權限、資料驗證與測試。
- 根目錄 `index.html` 是為了方便直接開啟而設計；Vite 的原始建置入口為 `app-source.html`。

- The current data is frontend demo seed data. Added or edited content is not persisted after refresh.
- For production use, add a backend API, database, authentication, validation, and tests.
- The root `index.html` is designed for direct opening. The Vite source build entry is `app-source.html`.
