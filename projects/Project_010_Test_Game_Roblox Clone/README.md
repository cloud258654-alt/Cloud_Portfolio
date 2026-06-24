# Mythic Seas 神話之海

Roblox 原創動漫戰鬥 RPG MVP。所有角色、島嶼、能力、任務與設定皆為原創，不使用既有動漫或遊戲 IP。

## 第一階段 MVP

- 玩家等級 1 至 100
- 3 個島嶼
- 5 種怪物
- 3 個 Boss
- 3 種 Mythic Core
- 1 套武器系統
- 1 套 NPC 任務系統
- 基礎 UI
- DataStore 自動存檔

## 專案結構

- `src/shared`: 共享設定與數值表
- `src/server`: 伺服端遊戲系統
- `src/client`: 客戶端 UI

## 使用方式

1. 使用 Rojo 將 `default.project.json` 同步到 Roblox Studio。
2. 在 Studio 中開啟 API Services，讓 DataStore 可運作。
3. 進入遊戲測試。系統會自動建立玩家資料、任務狀態、背包與基礎 UI。

## MVP 測試指令

在 Roblox Studio 的伺服器 Command Bar 可呼叫：

```lua
game.ServerScriptService.Server.MythicSeasServer.TestSpawn:Fire()
```

若沒有手動呼叫，伺服端啟動後仍會根據設定生成三座島嶼的怪物與 Boss。
