# AuraReader AI - 書籍雙 Agent 播客與精華萃取平台

AuraReader AI 是一個採用雙 Agent 架構的書籍閱讀、智慧精華萃取與語音播客生成平台。透過精美現代的 Cosmic Glassmorphism 磨砂玻璃風格介面，提供流暢的單頁式 Dashboard 儀表板體驗。

## 🌐 Live Demo & 專案連結
- **GitHub Pages 展示：** [https://asia17242.github.io/0604--podcast/](https://asia17242.github.io/0604--podcast/)
- **GitHub 專案庫：** [https://github.com/asia17242/0604--podcast](https://github.com/asia17242/0604--podcast)

> [!NOTE]
> 由於語音播客合成 (TTS) 功能需依賴本地 Python 後端進行即時語音流傳輸，若直接使用 GitHub Pages 靜態網頁展示，語音播放功能將受限。如需完整體驗完整的 AI 說書播客功能，請參閱下方的 **「本地安裝與運行」** 步驟。

---

## ✨ 核心功能
1. **書籍多來源匯入：** 支援直接拖曳上傳 `.epub` / `.txt` 書籍，或者貼上純文字、點選經典範本（如《原子習慣》、《深度工作力》、《快思慢想》）。
2. **Agent 01: 核心精華萃取：** 智慧分析痛點與核心概念，自動產出一句話亮點、三大核心觀點與實踐行動指南。
3. **Agent 02: 播客音訊生成：** AI 撰寫口語化的雙人/單人 Podcast 說書講稿，並透過後端即時合成溫雅的台灣女聲進行說書。
4. **互動式提詞播放器：** 支援自訂語音與播放速度，提詞器 (Teleprompter) 字幕會隨音訊進度自動同步高亮與滾動。
5. **輸出匯出：** 支援一鍵複製大綱 Markdown、下載大綱 `.md` 檔案、下載播客腳本 `.txt`，以及下載完整播客語音 `.mp3`（本地運行時啟用）。

---

## 🛠️ 本地安裝與運行

### 1. 複製專案與安裝依賴項
請確保您的系統已安裝 Python 3.8+。
```bash
git clone https://github.com/asia17242/0604--podcast.git
cd 0604--podcast
pip install fastapi uvicorn edge-tts
```

### 2. 啟動後端 Web 伺服器
執行 `server.py` 來啟動本地 Web 伺服器：
```bash
python server.py
```
伺服器將在 `http://localhost:8000` 運行，這同時解決了瀏覽器直接開啟 HTML 檔案所產生的 `file:///` CORS 安全限制。

### 3. 開始使用
- 開啟瀏覽器並瀏覽 [http://localhost:8000/](http://localhost:8000/)。
- 點擊右上角的 **「API 設定」**，填入您的 Gemini API Key，或切換到 **「經典範本」** 分頁在展示模式 (Demo Mode) 下體驗完整的播放與字幕動畫。

---

## 🎨 介面設計亮點
- **雙欄式 Dashboard：** 標頭與底部操作列永遠固定，網頁無全頁滾動條，維持高度的視覺一致性與易操作性。
- **微光起動動畫：** 融合動態 HSL 漸變霓虹背景與 Lucide icons 微交互動畫。
- **自適應排版：** 對平板、行動端（寬度低於 1100px）進行自適應單欄重排。
