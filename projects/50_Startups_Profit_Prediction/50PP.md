# 50 Startups Profit Prediction

> **Ridge Regression** · **CRISP-DM Methodology** · **5-Fold Cross-Validation**
> 預測新創企業獲利，分析 R&D、行政、行銷支出與州別對 Profit 的影響

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Business Understanding](#2-business-understanding)
- [3. Data Understanding](#3-data-understanding)
- [4. Exploratory Data Analysis](#4-exploratory-data-analysis)
- [5. Data Preparation](#5-data-preparation)
- [6. Modeling](#6-modeling)
- [7. Model Diagnostics](#7-model-diagnostics)
- [8. Model Evaluation](#8-model-evaluation)
- [9. Feature Importance](#9-feature-importance)
- [10. Residual Analysis](#10-residual-analysis)
- [11. Deployment — Streamlit App](#11-deployment--streamlit-app)
- [12. Key Findings & Business Insights](#12-key-findings--business-insights)
- [13. Project Structure](#13-project-structure)
- [14. Getting Started](#14-getting-started)
- [Appendix](#appendix)

---

## 1. Project Overview

| Aspect | Detail |
|--------|--------|
| **Objective** | Predict startup profit using historical data |
| **Dataset** | Kaggle 50 Startups (50 records, 5 features) |
| **Methodology** | CRISP-DM (Cross-Industry Standard Process for Data Mining) |
| **Best Model** | Ridge Regression (alpha=1.0) |
| **5-Fold CV R²** | **0.9326** (+/- 0.0420) |
| **CV MAE / RMSE** | $7,976 / $10,436 |

### Business Questions

1. 企業獲利最受哪項支出影響？
2. R&D 投資是否與獲利具有顯著關聯？
3. Marketing 投入是否能有效提高利潤？
4. 不同州別 (State) 是否影響企業獲利？
5. 是否可以透過歷史資料預測未來企業獲利？

### Success Criteria

| Metric | Target | Actual (CV) | Status |
|--------|--------|:-----------:|:------:|
| R² > 0.90 | 0.90 | **0.9326** | ✅ |
| MAE (minimize) | — | $7,976 | ✅ |
| RMSE (minimize) | — | $10,436 | ✅ |

---

## 2. Business Understanding

新創企業在營運初期投入大量資金於 R&D、Administration、Marketing。管理者希望了解哪些投資最能影響獲利，以最佳化預算配置。

### 2.1 指標的商業翻譯

| ML 指標 | 對 CFO/投資人的意義 |
|---------|-------------------|
| **R² = 0.93** | 模型可解釋 93% 的獲利變異。若只用平均值猜測，誤差約 $40K；使用模型可將誤差降至 **$10K 以內** |
| **MAE = $7,976** | 每次預測平均偏差不到 $8K，對於數十萬到百萬級的預算決策，誤差率約 **5–8%** |
| **RMSE = $10,436** | 較大偏差的懲罰；RMSE 接近 MAE 表示無嚴重離群預測干擾 |

### 2.2 商業衡量指標 (Business KPIs)

| KPI | 衡量方式 | 預期效益 |
|-----|---------|---------|
| **預算配置效率** | 模型建議 vs 實際配置的 Profit 差異 | 預測準確度 ±$8K，可將預算偏移降至 5% 內 |
| **財務規劃工時** | 每次預算調整所需人工分析時間 | 從 8 小時降至 <1 分鐘（自動化預測） |
| **投資報酬率預測** | 每增加 $1 R&D 對應的預測 Profit 增量 | 提供量化依據，避免盲目投資 |
| **敏感度分析** | 變動單一支出時 Profit 的變化幅度 | 支援 What-If 模擬決策 |

### 2.3 假設與風險邊界 (Assumptions & Risk Boundaries)

> [!WARNING]
> **本模型為線性靜態模型，使用時須注意以下限制：**

| 風險 | 說明 | 緩解方式 |
|------|------|---------|
| **R&D 遞延效應** | 模型假設 R&D 支出與 Profit 為同期關係。實際上 R&D 投資通常需 6–18 個月才能轉化為營收 | 建議搭配時間序列分析驗證滯後效應 |
| **過度投資風險** | 線性模型無法預測「過度投資 R&D 導致現金流斷裂」，係數在極端值範圍外可能不成立 | 預測值應作為輔助參考，搭配現金流壓力測試 |
| **樣本代表性** | n=50 來自 Kaggle 公開數據，未必反映特定產業或地區的新創生態 | 建議收集自有數據重新訓練，或使用遷移學習 |
| **因果 vs 相關** | 高相關 (r=0.97) 不代表因果關係。獲利高的企業可能只是有能力投入更多 R&D | 決策需搭配 A/B 測試或領域專家判斷 |

---

## 3. Data Understanding

### Dataset Overview

| Item | Value |
|------|-------|
| Source | Kaggle — 50 Startups Dataset |
| Records | 50 |
| Features | 5 |
| Missing Values | 0 |

> [!CAUTION]
> **樣本限制 (N=50)：** 本數據集僅含 50 筆樣本，80/20 分割後測試集僅 10 筆。單次測試指標波動大，因此本專案以 **5-Fold Cross-Validation** 作為主要評估依據（CV R²=0.9326），而非單次 Test R²。即便如此，模型泛化至其他新創生態系時仍須謹慎。

### Feature Description

| Feature | Type | Description |
|---------|------|-------------|
| R&D Spend | float64 | 研發支出 ($) |
| Administration | float64 | 行政支出 ($) |
| Marketing Spend | float64 | 行銷支出 ($) |
| State | object | California / Florida / New York |
| Profit | float64 | Target — 公司獲利 ($) |

### Descriptive Statistics

| | R&D Spend | Administration | Marketing Spend | Profit |
|---|----------:|--------------:|----------------:|-------:|
| mean | 73,802 | 123,710 | 205,393 | 112,013 |
| std | 45,776 | 26,520 | 124,701 | 40,306 |
| min | 0 | 51,283 | 0 | 14,681 |
| max | 165,349 | 182,646 | 471,784 | 192,262 |

> Dataset file: [`data/50_Startups.csv`](./data/50_Startups.csv)

---

## 4. Exploratory Data Analysis

### 4.1 Correlation Matrix

| | R&D Spend | Admin | Marketing | **Profit** |
|---|:--------:|:-----:|:---------:|:---------:|
| R&D Spend | 1.000 | 0.112 | 0.782 | **0.973** |
| Administration | 0.112 | 1.000 | -0.172 | 0.043 |
| Marketing Spend | 0.782 | -0.172 | 1.000 | **0.807** |
| **Profit** | **0.973** | 0.043 | **0.807** | 1.000 |

**Key Observations:**
- **R&D vs Profit: r = 0.973** — 高度正相關
- **Marketing vs Profit: r = 0.807** — 中度正相關
- **Admin vs Profit: r = 0.043** — 近乎無關
- **R&D vs Marketing: r = 0.782** — 存在共線性疑慮（詳見 §7 診斷）

### 4.2 Visualizations

- **Scatter Plots**: R&D 與 Profit 呈明顯線性趨勢；Marketing 次之；Admin 無趨勢
- **Profit Distribution**: 右偏分布，mean=$112K, median=$108K
- **State Distribution**: 三州大致均衡（各 ~1/3）

> EDA 圖表（assets 目錄）：[`assets/eda_plots.png`](./assets/eda_plots.png) · [`assets/correlation_heatmap.png`](./assets/correlation_heatmap.png) · [`assets/pairplot.png`](./assets/pairplot.png)

---

## 5. Data Preparation

### 5.1 Pipeline Design

```python
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), ['R&D Spend', 'Administration', 'Marketing Spend']),
    ('cat', OneHotEncoder(drop='first'), ['State'])
])
```

| Component | Detail |
|-----------|--------|
| **StandardScaler** | 數值特徵標準化 (mean=0, std=1)，使係數可直接比較 |
| **OneHotEncoder** | State 編碼 (drop first → California 為基準) |
| **Output** | 5 個特徵 (3 numeric + 2 dummy) |

### 5.2 Train-Test Split

| Split | Samples | Ratio |
|-------|:-------:|:-----:|
| Training | 40 | 80% |
| Testing | 10 | 20% |

> [!IMPORTANT]
> 使用 `train_test_split(random_state=42)` 確保可重現。Preprocessor 僅在 **Training set** 上 fit，避免 data leakage。

---

## 6. Modeling

### 6.1 Model Selection Strategy

為解決小樣本 (n=50) 的過擬合與共線性問題，比較三種模型：

| Model | Hyperparameter | Search Range |
|-------|---------------|--------------|
| Linear Regression | — | — |
| Ridge (L2) | alpha | [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0] |
| Lasso (L1) | alpha | [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0] |

### 6.2 Model Comparison (5-Fold CV)

| Model | CV R² | CV MAE | CV RMSE | Test R² | Best Alpha |
|-------|:-----:|:------:|:-------:|:-------:|:----------:|
| Linear Regression | 0.9304 ± 0.0446 | $8,039 | $10,624 | 0.8746 | N/A |
| **Ridge** | **0.9326 ± 0.0420** | **$7,976** | **$10,436** | 0.8592 | **1.0** |
| Lasso | 0.9314 ± 0.0434 | $8,003 | $10,551 | 0.8821 | 100.0 |

### 6.3 Winner: Ridge Regression (alpha=1.0)

- **最低 CV MAE ($7,976)** 與 **最高 CV R² (0.9326)**
- L2 正則化有效抑制共線性造成的係數膨脹
- 相比 Linear Regression 標準差更小 (0.0420 vs 0.0446)，穩定度更佳

---

## 7. Model Diagnostics

### 7.1 為何需要標準化？

原始資料尺度差異巨大（R&D 範圍 $0~$165K, Marketing $0~$472K），未標準化的係數無法直接比較：

| 特徵 | 原始係數 | 標準化後係數 | 比較性 |
|------|:--------:|:-----------:|:------:|
| R&D Spend | +0.76 | **+33,497** | ✅ 可直接比較 |
| Marketing Spend | +0.05 | **+7,602** | ✅ |
| Administration | -0.06 | **-1,268** | ✅ |

> 標準化後，所有係數的單位為「Profit 變動量 per 1 std of feature」，可直接比大小。

### 7.2 共線性診斷 — VIF

對標準化後的訓練資料計算 VIF (Variance Inflation Factor)：

| Feature | VIF |
|---------|:---:|
| R&D Spend | 3.47 |
| Marketing Spend | 3.57 |
| Administration | 1.20 |
| State_Florida | 1.00 |
| State_New York | 1.01 |

> [!NOTE]
> - VIF < 5：無嚴重共線性
> - R&D (3.47) 與 Marketing (3.57) 存在**中度相關**（源自原始 r=0.78）
> - Ridge 的 L2 正則化可自動處理此問題，無需刪除變數

### 7.3 正則化軌跡

```
Ridge:  alpha=0.01 → CV R²=0.9308
        alpha=0.1  → CV R²=0.9320
        alpha=1.0  → CV R²=0.9326  ← best
        alpha=10.0 → CV R²=0.9298
        alpha=100  → CV R²=0.8921  (過度正則化)

Lasso:  alpha=0.01 → CV R²=0.9304
        alpha=100  → CV R²=0.9314  ← best (稀疏解逼近 Ridge)
```

---

## 8. Model Evaluation

### 8.1 Final Model Performance

| Metric | 5-Fold CV | Test Set |
|--------|:---------:|:--------:|
| **R²** | **0.9326** ± 0.0420 | 0.8592 |
| **MAE** | **$7,976** | $8,539 |
| **RMSE** | **$10,436** | $10,679 |

### 8.2 Sample Predictions (Test Set)

| Actual | Predicted | Error |
|-------:|----------:|------:|
| $134,307 | $128,904 | $5,403 |
| $81,006 | $88,407 | -$7,401 |
| $99,938 | $95,136 | $4,801 |

---

## 9. Feature Importance

使用**標準化後的 Ridge 係數**（可直接比較）：

| Rank | Feature | Coefficient | Interpretation |
|:----:|---------|:-----------:|----------------|
| 1 | **R&D Spend** | **+33,497** | 每增加 1 std R&D，Profit 增加 $33.5K |
| 2 | Marketing Spend | +7,602 | 次要正向因子 |
| 3 | State_New York | -3,647 | 相較 California 略低 |
| 4 | State_Florida | -3,119 | 相較 California 略低 |
| 5 | Administration | -1,268 | 影響最小，負向 |

> [!IMPORTANT]
> R&D 的標準化係數 (33,497) 約為 Marketing (7,602) 的 **4.4 倍**，證實 R&D 是獲利的最主要驅動力。

> Feature importance 圖表：[`assets/feature_importance.png`](./assets/feature_importance.png)

---

## 10. Residual Analysis

| Statistic | Value |
|-----------|:-----:|
| Mean | $3,246 |
| Std | $10,174 |
| Min | -$15,531 |
| Max | $19,728 |

- **Residual Plot**: 殘差隨機分布於零線兩側，無明顯異質變異
- **Q-Q Plot**: 殘差近似常態分布（輕微右尾偏差）

> Residual analysis 圖表：[`assets/residual_analysis.png`](./assets/residual_analysis.png)

---

## 11. Deployment — Streamlit App

### 11.1 Architecture

```
User Input → Streamlit Frontend → Preprocessor (StandardScaler + OneHotEncoder)
                                       ↓
                              Ridge Regression Model
                                       ↓
                              Profit Prediction → Plotly Dashboard
```

### 11.2 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Streamlit |
| ML Engine | Scikit-Learn (Ridge, Pipeline) |
| Visualization | Plotly, Matplotlib, Seaborn |
| Evaluation | 5-Fold Cross-Validation, GridSearchCV, VIF |

### 11.3 App Pages

1. **EDA Dashboard** — 資料概覽、相關性、分布圖
2. **Model Evaluation** — CV 結果、模型比較、標準化係數、殘差分析
3. **Profit Predictor** — 即時預測 + 商業建議

### 11.4 Demo

| Input | Value |
|-------|-------|
| R&D Spend | $150,000 |
| Administration | $120,000 |
| Marketing | $300,000 |
| State | California |

```
Predicted Profit: ~$180,500
```

---

## 12. Key Findings & Business Insights

### Key Findings

1. **R&D Spend** 為最強預測因子（標準化係數 33,497，是 Marketing 的 4.4 倍）
2. **Marketing Spend** 為次要因子（7,602）
3. **Administration** 影響最小（-1,268），甚至呈輕微負向
4. **State** 影響有限（Florida -3,119, New York -3,647 vs California 基準）

### Business Insights

企業若希望提升獲利：

1. **優先增加 R&D 投資** — 每 $1 投入約可帶來 $0.76 獲利
2. **其次 Marketing** — 仍有顯著正向效果
3. **避免過度增加 Administration** — 邊際效益極低且可能為負
4. **地理位置非關鍵因素** — 不應作為主要投資決策依據

### Model Formula (Standardized Scale)

```
Profit = 117,824
        + 33,497 × Z(R&D Spend)
        + 7,602  × Z(Marketing Spend)
        - 3,647  × State_New York
        - 3,119  × State_Florida
        - 1,268  × Z(Administration)
```

---

## 13. Project Structure

```
50_Startups_Profit_Prediction/
├── 50SPP.md                   # 本文件 — 專案摘要
├── README.md                  # 快速入門說明
├── data/50_Startups.csv       # 原始資料集
├── notebooks/EDA.ipynb        # Jupyter Notebook
├── src/eda.py                 # EDA + 模型訓練腳本
├── app.py                     # Streamlit Web 應用程式
├── index.html                 # HTML 簡報
├── assets/*.png               # 視覺化圖表
└── requirements.txt           # 相依套件
```

---

## 14. Getting Started

```bash
pip install -r requirements.txt
python src/eda.py              # 執行完整分析
streamlit run app.py           # 啟動 Web 應用
```

---

## Appendix

### Data & Code References

| Resource | Link |
|----------|------|
| Dataset (CSV) | [`data/50_Startups.csv`](./data/50_Startups.csv) |
| EDA & Training Script | [`src/eda.py`](./src/eda.py) |
| Streamlit Application | [`app.py`](./app.py) |
| Python Dependencies | [`requirements.txt`](./requirements.txt) |
| Jupyter Notebook | [`notebooks/EDA.ipynb`](./notebooks/EDA.ipynb) |
| EDA Plots | [`assets/`](./assets/) |

### Tech Stack

```
Python 3.14 · Scikit-Learn 1.3+ · Streamlit 1.28+ · Plotly 5.15+ · statsmodels 0.14+
```

---

> **Built with CRISP-DM Methodology · 5-Fold Cross-Validation · Ridge Regularization · 2026**
