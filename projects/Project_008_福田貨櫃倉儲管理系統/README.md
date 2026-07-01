# 福田貨櫃倉儲管理系統 v0.5.1

[![Version](https://img.shields.io/badge/version-v0.5.1-blue)](./PROJECT_STATUS.md)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![React](https://img.shields.io/badge/react-19-61dafb)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-7-646cff)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8)](./public/manifest.json)

---

## Live Demo

| Platform | URL |
|----------|-----|
| **Live Demo** | [https://your-account.github.io/futian-storage](https://your-account.github.io/futian-storage) |
| **Netlify** | `npm run build` → drag `dist/` to [Netlify Drop](https://app.netlify.com/drop) |
| **Vercel** | `npx vercel --prod` → select `dist/` |

> Replace `https://your-account.github.io/futian-storage` with your actual GitHub Pages URL after deployment.

---

## 快速啟動 / Quick Start

```bash
npm install        # 安裝依賴
npm run build      # 建置（Node 18 可正常 build）
node scripts/serve-static.mjs   # 本機靜態伺服器
# 瀏覽器打開 http://127.0.0.1:4173/
```

## 專案結構 / Project Structure

```text
.
├── index.html                  # 可直接開啟的靜態入口 / Static entry for direct browser opening
├── app-source.html             # Vite 建置入口 / Vite build entry
├── public/                     # PWA 靜態資源 / PWA static assets
│   ├── manifest.json           # Web App Manifest
│   ├── sw.js                   # Service Worker（含快取策略）
│   ├── icon-192.png            # PWA 圖示 192x192
│   └── icon-512.png            # PWA 圖示 512x512
├── src/
│   ├── App.jsx                 # 主要應用程式 / Main application
│   ├── main.jsx                # React 掛載入口 + Service Worker 註冊
│   └── styles.css              # 全域樣式 / Global styles
├── scripts/
│   ├── copy-dist-index.mjs     # 建置後處理（PWA 檔案複製到根目錄）
│   ├── generate-icons.mjs      # PWA 圖示產生器（純 Node.js，無外部依賴）
│   └── serve-static.mjs        # 本機靜態伺服器 / Local static server
├── dist/                       # 建置輸出 / Build output
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
dist/manifest.json
dist/sw.js
dist/icon-192.png
dist/icon-512.png
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

## PWA 部署與 Live Demo / PWA Deployment & Live Demo

本專案已實作 PWA（Progressive Web App），支援離線瀏覽、可安裝至桌面/主畫面。

This project is PWA-enabled with offline support and installability.

### 部署到靜態主機 / Deploy to Static Hosting

**⚠ PWA 需要 HTTPS 才能啟用 Service Worker**（本機 `127.0.0.1` 除外）。

**PWA requires HTTPS for Service Worker to work** (except on `localhost`/`127.0.0.1`).

#### Netlify（最簡單 / Easiest）

1. `npm run build`
2. 將 `dist/` 資料夾直接拖曳到 [app.netlify.com/drop](https://app.netlify.com/drop)
3. 取得 `https://xxx.netlify.app` 網址即可使用

```bash
npm run build
# 然後將 dist/ 拖到 Netlify Drop 頁面
```

Drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop).

#### GitHub Pages

```bash
npm run build
npx gh-pages -d dist
# 在 GitHub 倉庫 Settings > Pages 選擇 gh-pages 分支
```

> **注意**：若部署在子目錄（如 `https://帳號.github.io/倉庫名/`），需將 `vite.config.js` 的 `base` 改為 `"/倉庫名/"` 並重新建置。
>
> If deploying to a subdirectory (e.g. `https://user.github.io/repo/`), change `base` in `vite.config.js` to `"/repo/"` and rebuild.

#### Vercel

```bash
npm run build
npx vercel --prod
# 依提示選擇 dist/ 作為輸出目錄
```

Follow the prompts, select `dist/` as the output directory.

#### ngrok（臨時測試 / Temporary Testing）

```bash
node scripts/serve-static.mjs     # 終端機 1：啟動靜態伺服器
ngrok http 4173                    # 終端機 2：建立 HTTPS 隧道
```

取得 `https://xxx.ngrok.io` 即可分享給他人測試。

Share the `https://xxx.ngrok.io` URL for others to test.

### 安裝為 PWA / Install as PWA

部署到 HTTPS 網址後，依裝置操作：

After deploying to an HTTPS URL, follow these steps per device:

| 裝置 / Device | 操作步驟 / Steps |
|---|---|
| **Windows / Mac / Linux (Chrome / Edge)** | 瀏覽器網址列右側點擊 ⊕「安裝」圖示 → 確認安裝 → 桌面出現應用程式捷徑 |
| **Android (Chrome)** | 開啟網址 → 右上選單 ⋮ →「安裝應用程式」/「加到主畫面」 |
| **Android (Samsung Internet)** | 開啟網址 → 下方選單 ≡ →「加入主畫面」 |
| **iPhone / iPad (Safari)** | 開啟網址 → 下方分享鈕 ↑ →「加入主畫面」→ 命名 →「新增」 |
| **PC (Edge)** | 網址列右側 ⊕「應用程式可用」→「安裝」 |

安裝後可像原生 App 使用，支援離線存取已快取的頁面內容。

Once installed, it works like a native app with offline access to cached content.

### PWA 功能說明 / PWA Features

| 功能 / Feature | 說明 / Description |
|---|---|
| **可安裝 / Installable** | 支援 Windows、macOS、Android、iOS 安裝到桌面/主畫面 |
| **離線瀏覽 / Offline** | Service Worker 快取核心資源，無網路時仍可開啟應用 |
| **獨立視窗 / Standalone** | 安裝後以獨立視窗開啟，無瀏覽器工具列 |
| **自適應 / Responsive** | 自動適配手機、平板、PC 螢幕尺寸 |

### 重新產生 PWA 圖示 / Regenerate PWA Icons

```bash
npm run generate-icons
```

圖示會在 `public/` 目錄中產生，建置時自動複製到 `dist/`。

Icons are generated in `public/` and copied to `dist/` during build.

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

- ✅ 資料已透過 LocalStorage 自動保存，重整後不消失。
- ✅ 支援 JSON / CSV 匯出與匯入，可備份至本機。
- ⚠️ 多裝置無法同步（純前端，無後端資料庫）。
- ⚠️ 目前為管理員單一角色，無使用者登入權限。
- ⚠️ Node 18 可 build 但 dev server 無法啟動（需 Node 20.19+）。
- 若需要正式營運，建議加入後端 API、資料庫、登入權限與測試。

- ✅ Data persists via LocalStorage across page refreshes.
- ✅ JSON / CSV export & import supported for local backup.
- ⚠️ No cross-device sync (frontend only, no backend database).
- ⚠️ Single admin role; no user authentication.
- ⚠️ Node 18 builds fine but dev server requires Node 20.19+.
- For production, add backend API, database, authentication, validation, and tests.
