import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# 設定 Matplotlib 顯示中文與負號
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'DejaVu Sans', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

# 設定網頁標題與介紹
st.set_page_config(layout="wide")
st.title("📊 線性迴歸模擬與離群值偵測系統")
st.markdown("""
這個應用程式實現了 CRISP-DM 的模型建立與評估階段。
你可以透過左側控制面板調整真實參數，系統將自動生成帶有常態分佈雜訊的數據，進行線性迴歸擬合，並自動偵測出前 10 大離群值。
""")

# ==========================================
# 1. 建立側邊欄控制面板 (Control Panel)
# ==========================================
st.sidebar.header("🎛️ 參數控制面板")

# 依題目要求設定控制滑桿
n = st.sidebar.slider("數據點數量 (n)", min_value=15, max_value=500, value=100, step=5)
true_a = st.sidebar.slider("真實斜率 (a)", min_value=-50.0, max_value=50.0, value=15.0, step=0.5)
true_b = st.sidebar.slider("真實截距 (b)", min_value=0.0, max_value=100.0, value=50.0, step=1.0)
var = st.sidebar.slider("雜訊變異數 (var)", min_value=0.0, max_value=300.0, value=150.0, step=5.0)

# 固定隨機種子按鈕（選用，方便比對結果）
seed_on = st.sidebar.checkbox("固定隨機結果 (Set Seed)", value=True)
if seed_on:
    np.random.seed(42)

# ==========================================
# 2. 數據生成
# ==========================================
# 將變異數轉換為標準差
std_dev = np.sqrt(var)

# 生成 x (-100 到 100 之間均勻分佈)
x = np.random.uniform(-100, 100, n).reshape(-1, 1)
# 生成常態分佈雜訊 N(0, var)
noise = np.random.normal(0, std_dev, n).reshape(-1, 1)
# 依公式生成 y
y = true_a * x + true_b + noise

# ==========================================
# 3. 線性迴歸擬合
# ==========================================
model = LinearRegression()
model.fit(x, y)

pred_a = model.coef_[0][0]
pred_b = model.intercept_[0]
r2_score = model.score(x, y)
y_pred = model.predict(x)

# ==========================================
# 4. 離群值偵測 (前 10 大絕對殘差)
# ==========================================
residuals = np.abs(y - y_pred).flatten()
# 為了避免 n 小於 10 導致出錯，動態計算離群值數量
num_outliers = min(10, n)
top10_indices = np.argsort(residuals)[-num_outliers:]

# 建立 DataFrame 處理數據
df_all = pd.DataFrame({
    'X': x.flatten(),
    '實際 Y': y.flatten(),
    '預測 Y': y_pred.flatten(),
    '絕對殘差 (誤差)': residuals
})
# 篩選出離群值並排序
df_outliers = df_all.iloc[top10_indices].sort_values(by='絕對殘差 (誤差)', ascending=False)

# ==========================================
# 5. 網頁版面配置與視覺化呈現
# ==========================================
# 使用 Streamlit 的欄位功能將網頁切成左右兩邊
col1, col2 = st.columns([3, 2])

with col1:
    st.subheader("📈 迴歸模型與數據分佈圖")
    
    # 繪製 Matplotlib 圖表
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # 1. 畫出普通數據點
    ax.scatter(x, y, color='dodgerblue', alpha=0.6, label='普通數據點 (Data Points)')
    
    # 2. 畫出前 10 大離群值 (金黃色放大)
    ax.scatter(x[top10_indices], y[top10_indices], 
               color='gold', edgecolor='black', s=120, zorder=5, label=f'前 {num_outliers} 大離群值 (Top Outliers)')
    
    # 3. 畫出紅色的迴歸線 (regression line is red)
    x_line = np.linspace(-100, 100, 100).reshape(-1, 1)
    y_line = model.predict(x_line)
    ax.plot(x_line, y_line, color='red', linewidth=2.5, label=f'迴歸線: y = {pred_a:.2f}x + {pred_b:.2f}')
    
    # 圖表細節設定
    ax.set_xlabel("X", fontsize=12)
    ax.set_ylabel("Y", fontsize=12)
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.legend(fontsize=10)
    
    # 將圖表渲染至 Streamlit
    st.pyplot(fig)

with col2:
    st.subheader("📊 模型指標對比")
    
    # 用美觀的 Metric 組件顯示真實與預測指標
    m1, m2 = st.columns(2)
    m1.metric("真實斜率 (a)", f"{true_a:.2f}")
    m2.metric("估計斜率 (✨ a)", f"{pred_a:.2f}", f"{pred_a - true_a:.2f}")
    
    m3, m4 = st.columns(2)
    m3.metric("真實截距 (b)", f"{true_b:.2f}")
    m4.metric("估計截距 (✨ b)", f"{pred_b:.2f}", f"{pred_b - true_b:.2f}")
    
    st.metric("模型決定係數 (R² Score)", f"{r2_score:.4f}")
    
    st.write("---")
    st.subheader(f"🚨 前 {num_outliers} 大離群值清單")
    # 在網頁上呈現漂亮互動式表格
    st.dataframe(df_outliers[['X', '實際 Y', '絕對殘差 (誤差)']].style.format("{:.2f}"))
