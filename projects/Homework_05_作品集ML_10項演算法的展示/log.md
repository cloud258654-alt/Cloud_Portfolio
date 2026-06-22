# 📅 工作記錄 (Log) - 2026-06-08

本文件記錄了今天在專案 `HW52` 中完成的所有工作。

---

## 🛠️ 完成工作摘要

### 1. 檔案與目錄初始化
* **新增 `123.txt`**：在專案根目錄成功建立 `123.txt` 檔案。
* **部署互動資訊圖表 `code_artifact.html`**：
  * 將使用者下載資料夾中的完整 HTML 網頁複製至專案路徑 [code_artifact.html](file:///d:/WorkSpace_Cloud/HW52/code_artifact.html)。
  * 本地執行系統指令在預設瀏覽器中開啟該檔案，以確認網頁渲染效果。

### 2. 淺黃色高質感主題改版
* **背景漸層優化**：將主體背景改為淺黃/暖奶油色漸層色（`#FFFDF0` 至 `#FDF9DB`）。
* **字卡與元件重設**：
  * 重新設計玻璃質感面板（Glassmorphism），加入淡黃色調邊框及柔和陰影。
  * 調整文字與對比度，將主標題、副標題、內容文字改為深 Slate 色調以確保易讀性。
  * 調整下拉選單、滑動控制條、主選單 active/inactive 狀態樣式以契合新色調。
* **Canvas 實驗室色彩修正**：
  * 修正 Canvas 格線為暗灰透明。
  * 修正線性迴歸的殘差線（Residual Lines）為清晰紅色。
  * 修正 GBDT 的散佈點色彩。
  * 修正 KNN 的鄰近連線。
  * 修正 PCA 投影垂線。
  * 修正人工神經網路 (ANN) 的權重連線。
  * *確保所有模擬組件在淺色 Canvas 畫布下具備高清晰度。*

### 3. Streamlit 架構與套件配置
* **編寫 `streamlit_app.py`**：利用 Streamlit HTML 元件載入並以滿版、無邊框及高度自動調節方式無縫嵌入 [code_artifact.html](file:///d:/WorkSpace_Cloud/HW52/code_artifact.html)。
* **配置 `requirements.txt`**：新增相依套件清單 `streamlit>=1.20.0`。

### 4. Git 儲存庫管理與 GitHub 上傳
* **Git 初始化與本地提交**：
  * 初始化本地儲存庫並配置 repository 的 git config user 帳密。
  * 完成檔案的本地 Git Commit。
* **關聯與同步遠端 Repository**：
  * 將遠端 Origin 設定為：`https://github.com/asia17242/HW52.git`。
  * 處理 GitHub 遠端已初始化有 `README.md` 的情況，執行 `git pull --rebase origin main` 完成安全合併。
* **推送代碼**：執行 `git push -u origin main` 成功將程式碼推送至 GitHub。

### 5. 撰寫專案 README 文件
* **編寫 `README.md`**：
  * 詳細說明本專案之背景、功能特色、檔案結構。
  * 指引如何在本地端透過 `streamlit run` 執行測試。
  * 留下 Streamlit 部署網址（Live Demo）的設定說明。
  * **成功 Push**：已將此說明的異動推送到 GitHub。

---

## 📂 專案最終檔案清單

* [code_artifact.html](file:///d:/WorkSpace_Cloud/HW52/code_artifact.html) - 主要互動式機器學習資訊圖表（已完成淺黃色改版）
* [streamlit_app.py](file:///d:/WorkSpace_Cloud/HW52/streamlit_app.py) - Streamlit 程式入口
* [requirements.txt](file:///d:/WorkSpace_Cloud/HW52/requirements.txt) - Python 套件相依清單
* [README.md](file:///d:/WorkSpace_Cloud/HW52/README.md) - 專案說明書
* [log.md](file:///d:/WorkSpace_Cloud/HW52/log.md) - 本日工作日誌 (本檔案)
* [123.txt](file:///d:/WorkSpace_Cloud/HW52/123.txt) - 新增檔案
