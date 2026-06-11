# 50 Startups Profit Prediction

A machine learning project using **Multiple Linear Regression** following the **CRISP-DM** methodology to predict startup profit based on R&D, Administration, and Marketing expenditures across different states.

## Project Overview

| Aspect | Detail |
|--------|--------|
| **Objective** | Predict startup profit using historical data |
| **Dataset** | Kaggle 50 Startups (50 records, 5 features) |
| **Methodology** | CRISP-DM (Cross-Industry Standard Process for Data Mining) |
| **Model** | Multiple Linear Regression |
| **R² Score** | > 0.94 (Target: > 0.90) |

## Key Findings

1. **R&D Spend** — Strongest positive correlation with Profit
2. **Marketing Spend** — Secondary influential factor
3. **Administration** — Minimal impact on Profit
4. **State** — Limited influence on business Profit

## Project Structure

```
50_Startups_Profit_Prediction/
├── data/
│   └── 50_Startups.csv          # Original dataset
├── notebooks/
│   └── EDA.ipynb                 # Jupyter notebook with full analysis
├── src/
│   └── eda.py                    # EDA and model training script
├── reports/                      # Generated reports
├── assets/                       # Generated visualizations
├── app.py                        # Streamlit web application
├── requirements.txt              # Python dependencies
└── README.md                     # Project documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Streamlit |
| Backend | Python |
| ML Model | Scikit-Learn |
| Visualization | Plotly, Matplotlib, Seaborn |
| Deployment | Streamlit Cloud |

## Getting Started

### Installation

```bash
pip install -r requirements.txt
```

### Run EDA Script

```bash
python src/eda.py
```

### Run Streamlit App

```bash
streamlit run app.py
```

## Demo

**Input:**
- R&D Spend: $150,000
- Administration: $120,000
- Marketing: $300,000
- State: California

**Output:**
- Predicted Profit: ~$180,500

## CRISP-DM Phases

1. **Business Understanding** — Define objectives and success criteria
2. **Data Understanding** — EDA, correlation analysis, visualization
3. **Data Preparation** — Encoding, train-test split
4. **Modeling** — Multiple Linear Regression training
5. **Evaluation** — R², MAE, RMSE, residual analysis
6. **Deployment** — Streamlit web application

## License

MIT
