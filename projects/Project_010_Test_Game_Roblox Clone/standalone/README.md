# Mythic Seas 神話之海：單機版

這是可單機遊玩的獨立版本，不需要 Roblox、不需要伺服器。

## 開始遊玩

方式一，直接開啟：

```text
standalone/index.html
```

方式二，使用本機啟動器：

```text
standalone/start-game.cmd
```

遊戲會用瀏覽器本機儲存進度。關掉後再開，等級、任務、Coins、背包、裝備都會保留。

## 已包含

- 等級 1 至 100
- 3 座島嶼
- 5 種一般怪物
- 3 個 Boss
- 3 種 Mythic Core
- 武器與掉寶
- 任務、地圖解鎖、屬性點
- 本機自動存檔

## 之後可包成安裝檔

若要做成真正的 Windows 安裝程式，可用 Electron 或 Tauri 包裝 `standalone/index.html`。目前版本先保持免安裝、可直接開檔遊玩。
