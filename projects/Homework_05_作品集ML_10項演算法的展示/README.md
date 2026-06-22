# 🧠 十大機器學習方法：互動式視覺化資訊圖表

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://nizfwkilcanstommejqhs3.streamlit.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Cloud__Portfolio-181717?logo=github)](https://github.com/asia17242/Cloud_Portfolio/tree/main/projects/Homework_05_%E4%BD%9C%E5%93%81%E9%9B%86ML_10%E9%A0%85%E6%BC%94%E7%AE%97%E6%B3%95%E7%9A%84%E5%B1%95%E7%A4%BA)

> 這是一個基於 **HTML5 Canvas、Tailwind CSS 與 Streamlit** 建立的機器學習演算法動態視覺化教學教材。
> 使用者可以透過直觀的調整參數，即時觀察 10 大演算法的動態收斂行為。

---

## 🚀 線上展示 (Live Demo)

👉 **[點此觀看 Streamlit 線上展示](https://nizfwkilcanstommejqhs3.streamlit.app/)**

---

## ✨ 專案特色

| 特色 | 說明 |
|---|---|
| 🎨 淺黃色高質感主題 | 精心設計的奶油黃底色，玻璃質感字卡，舒適易讀的文字對比度 |
| 🧪 10 組即時模擬實驗 | 點擊 Canvas 新增數據點、拖動滑桿觀察擬合曲線、發射 ANN 前向傳播動畫 |
| 📐 核心數學公式展示 | 每個演算法均附帶核心數學表達式，搭配優/劣勢分析與工業應用案例 |
| ⚡ 純前端零依賴 | HTML5 + Vanilla JS，無需後端即可直接在瀏覽器運行 |

---

## 📚 涵蓋的 10 大核心演算法

| # | 演算法 | 學習範式 | 互動實驗 |
|---|---|---|---|
| 1 | 線性回歸 Linear Regression | 監督學習・回歸 | 點擊繪製數據點，即時 OLS 回歸線 |
| 2 | 邏輯回歸 Logistic Regression | 監督學習・分類 | 拖動分類閾值滑桿 |
| 3 | 決策樹 Decision Tree | 監督學習・分類/回歸 | 特徵選擇動態點亮節點路徑 |
| 4 | 隨機森林 Random Forest | 監督學習・Bagging | 五棵決策樹隨機投票演示 |
| 5 | 梯度提升樹 GBDT | 監督學習・Boosting | 調整弱學習器數量觀察擬合曲線 |
| 6 | 支持向量機 SVM | 監督學習・二分類 | 點擊放置 A/B 類點，自動繪製超平面 |
| 7 | K-近鄰 K-NN | 監督學習・惰性學習 | 滑鼠移動即時追蹤 K 個鄰居連線 |
| 8 | K-平均分群 K-Means | 非監督學習・分群 | 手動逐步迭代觀察質心移動 |
| 9 | 主成分分析 PCA | 非監督學習・降維 | 旋轉投影軸觀察方差最大化 |
| 10 | 人工神經網路 ANN | 深度學習 | 發射前向傳播訊號光效動畫 |

---

## 💻 本地端運行步驟

### 前置需求
- Python 3.8+
- pip

### 1. 安裝相依套件
```bash
pip install -r requirements.txt
```

### 2. 啟動 Streamlit 應用程式
```bash
streamlit run streamlit_app.py
```

執行後，系統會自動在瀏覽器中開啟 `http://localhost:8501`。

> 💡 您也可以直接用瀏覽器打開 `code_artifact.html` 來檢視網頁，不需要安裝 Python。

---

## 📂 專案結構

```text
Cloud_Portfolio/
└── projects/
    └── Homework_05_作品集ML_10項演算法的展示/
        ├── code_artifact.html    # 主要互動式前端網頁 (HTML5/JS/Canvas + TailwindCSS)
        ├── streamlit_app.py      # Streamlit Python 應用程式進入點
        ├── requirements.txt      # Python 套件相依清單
        ├── README.md             # 專案說明文件（本檔案）
        └── log.md                # 開發工作日誌
```

---

## 🔗 相關連結

- 📦 [GitHub Repository](https://github.com/asia17242/Cloud_Portfolio/tree/main/projects/Homework_05_%E4%BD%9C%E5%93%81%E9%9B%86ML_10%E9%A0%85%E6%BC%94%E7%AE%97%E6%B3%95%E7%9A%84%E5%B1%95%E7%A4%BA)
- 🚀 [Streamlit App](https://nizfwkilcanstommejqhs3.streamlit.app/)
- 📋 [開發工作日誌 log.md](./log.md)

---

*© 2026 機器學習全景圖互動教研組・專為教育與學術研討設計*