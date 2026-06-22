# Minecraft Tetris (麥塊方塊)

一個以《當個創世神 (Minecraft)》GUI 介面與經典方塊材質為主題的單檔案 HTML5 俄羅斯方塊遊戲。666

## 🌐 線上試玩 / Live Demo
👉 **[點此開始遊玩！(Live Demo)](https://asia17242.github.io/0903-2-game/)**
*(註：推送至 GitHub 後，可在 Repository 設定中開啟 GitHub Pages，即可透過此網址線上遊玩)*

---

## 🎨 遊戲特色

1. **經典麥塊方塊造型 (8x8 像素材質)**：
   * **I (青色)**：鑽石磚 (Diamond Block)
   * **O (黃色)**：黃金磚 (Gold Block)
   * **T (紫色)**：黑曜石磚 (Obsidian)
   * **S (綠色)**：苦力怕 (Creeper Face)
   * **Z (紅色)**：紅石磚 (Redstone Block)
   * **J (藍色)**：青金石磚 (Lapis Lazuli)
   * **L (橙色)**：TNT 炸藥磚 (印有 TNT 字樣)

2. **麥塊 GUI 介面**：
   * 整合 `Press Start 2P` 8-Bit 像素字體。
   * 遊戲底板網格繪製為麥塊背包的**物品欄凹槽 (Inventory Slots)**，具有經典的立體凹陷陰影。
   * 控制面板與彈出視窗採用麥塊物品箱/選單的**灰色立體浮雕邊框 (GUI Panels)**。
   * 按鈕點擊時會像麥塊遊戲內一樣下沉並切換凹凸邊框。

3. **全息像素影子 (Ghost Piece)**：
   * 投影影子為 30% 透明度的像素方塊，更符合麥塊的立體堆疊與空間對齊感。

4. **內建動態合成音效**：
   * 利用 Web Audio API 動態合成正弦波與三角波，模擬麥塊風格的清脆按鍵音、消除聲與遊戲結束音，無須下載任何外部音效檔。

5. **行動裝置觸擬按鍵**：
   * 支援手機與平板！在小螢幕上會自動調整排版並顯示像素風觸控按鍵。

---

## 🎮 操作說明

| 鍵盤按鍵 | 功能 |
| :--- | :--- |
| **左方向鍵 `←` / `A`** | 向左移動 |
| **右方向鍵 `→` / `D`** | 向右移動 |
| **上方向鍵 `↑` / `W`** | 旋轉方塊 |
| **下方向鍵 `↓` / `S`** | 軟降落 (Soft Drop，獲得額外分數) |
| **空白鍵 `SPACE`** | 瞬間降落 (Hard Drop，獲得雙倍額外分數) |
| **`P` 鍵** | 暫停 / 繼續 |

在手機或平板上，可直接使用下方的虛擬按鍵 (`←`, `ROTATE`, `→`, `↓`, `DROP`) 進行遊戲。

---

## 🛠️ 開發與建置

本遊戲為單一檔案設計，HTML、CSS 與 JavaScript 均整合於 `index.html` 中。

1. **本機遊玩**：
   直接使用瀏覽器開啟 `index.html` 即可開始遊玩。
2. **部署至 GitHub Pages**：
   * 推送本專案至 GitHub 倉庫。
   * 至該倉庫的 **Settings** -> **Pages**。
   * 在 **Build and deployment** 下，將 Source 設定為 **Deploy from a branch**。
   * Branch 選擇 **main** (或 **master**)，目錄選擇 **/ (root)**，點擊 **Save**。
   * 約等 1-2 分鐘後，即可透過上面的 Live Demo 網址線上遊玩！
