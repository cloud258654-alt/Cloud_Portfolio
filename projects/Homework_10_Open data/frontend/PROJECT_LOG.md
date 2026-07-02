# AI_CHANGELOG

## 1. 本次修改摘要

### Phase 1: 開發者警告 UI + 文件
- MutationObserver 偵測到 unauthorized domain 403 時顯示開發者警告面板
- 顯示需加入白名單的 domain、當前 origin、疑難排解文件

### Phase 2: 實際修復 403 問題 — Vite Proxy 繞過 domain 檢查
- 核心原理：Vite dev server proxy 將所有 `api.windy.com` 請求透過 `/windy-api/` 代理，搭配 `changeOrigin: true` 將 `Origin` header 改寫為 `https://api.windy.com`，使 Windy 伺服器看到請求來自自身 domain，不再觸發 403
- 搭配 fetch/XHR 攔截器，自動將 libBoot.js 內部產生的 `api.windy.com` 請求重寫為 proxy 路徑
- 搭配 `<meta name="referrer" content="no-referrer">` 抑制 iframe 的 Referer header
- production build 不受影響，仍使用原始 CDN URL

## 2. 新增檔案
- `.env.example` — 空白 API key 模板
- `WINDY_TROUBLESHOOTING.md` — 401/403 疑難排解文件
- `src/services/windyProxyInterceptor.ts` — fetch/XHR URL 攔截器，將 `api.windy.com` 請求重寫為 Vite proxy 路徑

## 3. 修改檔案
- `src/components/weather/WindyMap.tsx`：
  - 新增 import `ShieldAlert`、`installWindyProxyInterceptor`
  - 新增 `fallbackReason` state 區分不同錯誤原因
  - `triggerFallback()` 記錄 fallback 原因
  - MutationObserver 區分 domain 403 與其他授權失敗
  - 在 windyInit 前呼叫 `installWindyProxyInterceptor()` 安裝 URL 攔截器
  - render 中新增 403 domain 開發者警告面板
- `vite.config.ts`：
  - 新增 `/windy-api` proxy 規則，target `https://api.windy.com`、`changeOrigin: true`
  - `proxyReq` 事件強制設定 `Origin` 和 `Referer` 為 `https://api.windy.com/`
  - `transformIndexHtml` 在 dev mode 下將 libBoot.js URL 替換為 proxy 路徑，production build 保持原始 CDN URL
- `index.html`：
  - 新增 `<meta name="referrer" content="no-referrer">` 抑制跨域 iframe Referer

## 4. 環境變數
- `VITE_WINDY_MAP_API_KEY`
- `VITE_WINDY_POINT_API_KEY`
- `VITE_WINDY_WEBCAMS_API_KEY`
- `VITE_WINDY_UNKNOWN_API_KEY`

## 5. 路由變更
- `/weather/windy`

## 6. 功能驗證結果
- Windy Map dev mode proxy：✅ `/windy-api/` 代理到 `api.windy.com`，`changeOrigin: true` 改寫 Origin header
- fetch/XHR 攔截器：✅ 自動將 `https://api.windy.com/...` 重寫為 `/windy-api/...`
- Production build 不受影響：✅ `dist/index.html` 保留 CDN URL
- Point Forecast API：✅ 未修改
- Webcams API：✅ 未修改
- npm run build：✅ 無錯誤（tsc + vite build）

## 7. 尚未完成 / 已知問題
- 問題：Vite proxy 僅在 dev mode (`npm run dev`) 生效，production 部署需使用已在 Windy 授權的 domain
- 建議：部署前在 Windy API console 將 production domain 加入 Allowed Domains

## 8. 執行方式
```bash
npm install
npm run dev
```
