# design_for_windy.md

# Windy Integration Page Design

Version: 1.1  
Scope: Only add Windy page. Do not redesign existing system.

---

## 1. Goal

新增一個獨立 Windy 頁面，整合：

- Windy Map Forecast API
- Windy Point Forecast API
- Windy Webcams API

此頁面只負責 Windy 視覺化與預報，不影響既有 CWA 頁面、Dashboard、Supabase 架構。

---

## 2. Route

新增路由：

```text
/weather/windy
```

Sidebar 新增：

```text
Weather
 └── Windy Forecast
```

---

## 3. API Keys

請新增 `.env`：

```env
VITE_WINDY_MAP_API_KEY=s4XE2JqUZZ1gPqgiZXbuMZDrr27ZKNTD
VITE_WINDY_POINT_API_KEY=F7xMBjtmbispqbhMb7d3lPLJqRl1uf91
VITE_WINDY_WEBCAMS_API_KEY=6a14A8zHJQqVneFJPNNzQIoDN0RcZAne

# 未確認用途，先保留，不要使用
VITE_WINDY_UNKNOWN_API_KEY=3tVwVcdA8Px6c3wZtV74G49QW7bxhM82
```

要求：

- 不可 hardcode API key
- 不可把 `.env` commit 到 GitHub
- 新增 `.env.example`

---

## 4. Page Layout

```text
┌────────────────────────────────────────────────────────┐
│ Windy Weather Forecast                                │
├────────────────────────────────────────────────────────┤
│ Toolbar                                                │
│ Temperature | Wind | Rain | Pressure | Clouds | Webcam │
├────────────────────────────────────────────────────────┤
│                                                        │
│                     Windy Map                          │
│                                                        │
├───────────────────────────────┬────────────────────────┤
│ Forecast Card                 │ Webcam Panel           │
│ Temperature                   │ Nearby Cameras         │
│ Humidity                      │ Camera Name            │
│ Wind Speed                    │ Distance               │
│ Wind Direction                │ Preview / Link         │
│ Pressure                      │                        │
│ Forecast Time                 │                        │
└───────────────────────────────┴────────────────────────┘
```

---

## 5. Required Components

新增檔案：

```text
src/pages/WindyForecastPage.tsx

src/components/weather/WindyMap.tsx
src/components/weather/WindyToolbar.tsx
src/components/weather/WindyForecastCard.tsx
src/components/weather/WindyWebcamPanel.tsx
src/components/weather/WindyWebcamCard.tsx
src/components/weather/WindySearchBox.tsx
```

新增 service：

```text
src/services/windyMapService.ts
src/services/windyPointService.ts
src/services/windyWebcamService.ts
```

---

## 6. Map Forecast API

用途：

- 載入 Windy 地圖
- 顯示天氣圖層
- 支援圖層切換

預設設定：

```text
center: Taiwan
zoom: 7
default overlay: temperature
```

支援 Layer：

```text
temperature
wind
rain
pressure
clouds
```

若 API 不支援某 layer，不要讓系統 crash，顯示 disabled 狀態。

---

## 7. Point Forecast API

用途：

點擊地圖後，用經緯度取得該位置預報。

流程：

```text
User clicks map
↓
Get latitude / longitude
↓
Call Windy Point Forecast API
↓
Update Forecast Card
```

Forecast Card 顯示：

```text
Temperature
Humidity
Wind Speed
Wind Direction
Rain
Cloud
Pressure
Forecast Time
Weather Model
Source: Windy Point Forecast API
```

---

## 8. Webcams API

用途：

點擊地圖後，搜尋附近 Webcam。

流程：

```text
User clicks map
↓
Get latitude / longitude
↓
Call Windy Webcams API
↓
Show nearest 3 webcams
```

Webcam Panel 顯示：

```text
Camera Name
Location
Distance
Preview image if available
Open link
Source: Windy Webcams API
```

若 Webcams API 失敗，不可影響 Map 與 Forecast Card。

---

## 9. Search

新增搜尋框，支援常用城市：

```text
Taipei
Taichung
Tainan
Kaohsiung
Hualien
Taitung
```

搜尋後：

```text
FlyTo map location
↓
Call Point Forecast API
↓
Call Webcams API
↓
Update cards
```

---

## 10. Error Handling

### Map API Error

顯示：

```text
Unable to load Windy Map.
Please check Windy Map Forecast API key.
```

### Point API Error

顯示：

```text
Unable to load point forecast.
Please check Windy Point Forecast API key.
```

### Webcams API Error

顯示：

```text
Unable to load nearby webcams.
Map and forecast are still available.
```

### 401 Error

顯示：

```text
Windy API key is invalid or not authorized for this API type.
```

---

## 11. Loading State

第一次進入頁面：

```text
Loading Windy Map...
```

點擊地圖查詢：

```text
Loading forecast...
Loading webcams...
```

---

## 12. Development Order

請依照順序實作，不要一次全部混在一起。

### Phase 1

- Create WindyForecastPage
- Add route `/weather/windy`
- Add sidebar link
- Load Windy Map Forecast API
- Show map centered on Taiwan

### Phase 2

- Add layer toolbar
- Support temperature / wind / rain / pressure / clouds
- Add map click event

### Phase 3

- Connect Point Forecast API
- Show Forecast Card
- Handle loading / error / empty state

### Phase 4

- Connect Webcams API
- Show nearest 3 webcams
- Add Webcam Panel

### Phase 5

- Add SearchBox
- Support city search and FlyTo
- Trigger forecast + webcam refresh after search

---

## 13. Restrictions

Do not modify:

```text
CWA page
Existing Dashboard
Existing database schema
Existing Supabase logic
Existing API routes unless required for routing only
```

Only add:

```text
Windy page
Windy components
Windy services
Windy route
Windy sidebar link
```

---

## 14. Acceptance Criteria

完成後需符合：

- [ ] Sidebar 可以進入 Windy Forecast 頁面
- [ ] Windy Map 可以正常載入
- [ ] 地圖預設中心在台灣
- [ ] 可以切換 temperature / wind / rain / pressure / clouds
- [ ] 點擊地圖後可以取得 lat/lon
- [ ] 點擊地圖後可以顯示 Point Forecast
- [ ] 點擊地圖後可以顯示附近 Webcams
- [ ] 搜尋城市後地圖會移動
- [ ] 搜尋城市後會更新 Forecast Card
- [ ] API key 全部使用 `.env`
- [ ] 401 error 有明確提示
- [ ] Webcams API 失敗不影響地圖
- [ ] 不影響既有功能

---

## 15. Objective Notes

Windy 頁面定位：

```text
Forecast visualization page
```

不是：

```text
Official Taiwan observation page
```

因此 UI 必須明確標示：

```text
Source: Windy Forecast API
Source: Windy Webcams API
```

CWA 官方觀測資料不要混在本頁第一版。