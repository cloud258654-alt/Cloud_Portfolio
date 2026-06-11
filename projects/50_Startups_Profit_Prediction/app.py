import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_validate, GridSearchCV
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

st.set_page_config(
    page_title="50 Startups Profit Prediction",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-header {font-size: 2.5rem; font-weight: 700; color: #1E88E5; margin-bottom: 0;}
    .sub-header {font-size: 1.2rem; color: #666; margin-top: 0;}
    .metric-card {background: #f0f2f6; border-radius: 10px; padding: 20px; text-align: center;}
    .metric-value {font-size: 2rem; font-weight: 700; color: #1E88E5;}
    .metric-label {font-size: 0.9rem; color: #666;}
    .insight-box {background: #e8f5e9; border-left: 5px solid #4CAF50; padding: 15px; border-radius: 5px;}
    .stApp {background: #ffffff;}
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, 'data', '50_Startups.csv')
    df = pd.read_csv(csv_path)
    return df

@st.cache_resource
def train_and_select_model():
    df = load_data()
    X_raw = df.drop('Profit', axis=1)
    y = df['Profit']

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.2, random_state=42
    )

    numeric_features = ['R&D Spend', 'Administration', 'Marketing Spend']
    categorical_features = ['State']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(drop='first'), categorical_features)
        ]
    )

    X_train = preprocessor.fit_transform(X_train_raw)
    X_test = preprocessor.transform(X_test_raw)

    try:
        names_out = preprocessor.get_feature_names_out()
        feature_names = [n.split('__')[1] if '__' in n else n for n in names_out]
    except Exception:
        feature_names = numeric_features + ['State_Florida', 'State_New York']

    models_to_compare = {
        'Linear Regression': (LinearRegression(), {}),
        'Ridge': (Ridge(random_state=42), {'alpha': [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0]}),
        'Lasso': (Lasso(random_state=42), {'alpha': [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0]})
    }

    comparison = []
    best_model_obj = None
    best_cv_r2 = -np.inf
    best_model_name = None

    for name, (model, param_grid) in models_to_compare.items():
        if not param_grid:
            cv = cross_validate(
                model, X_train, y_train, cv=5,
                scoring={'r2': 'r2', 'mae': 'neg_mean_absolute_error',
                         'mse': 'neg_mean_squared_error'}
            )
            cv_r2 = cv['test_r2'].mean()
            cv_r2_std = cv['test_r2'].std()
            cv_mae = -cv['test_mae'].mean()
            cv_rmse = np.sqrt(-cv['test_mse'].mean())
            model.fit(X_train, y_train)
            best_alpha = None
            selected_model = model
        else:
            pipe = Pipeline(steps=[('regressor', model)])
            gs = GridSearchCV(pipe, {f'regressor__{k}': v for k, v in param_grid.items()},
                              cv=5, scoring='r2')
            gs.fit(X_train, y_train)
            cv_r2 = gs.best_score_
            cv_r2_std = gs.cv_results_['std_test_score'][gs.best_index_]
            best_alpha = gs.best_params_[f'regressor__alpha']
            selected_model = gs.best_estimator_
            cv_full = cross_validate(
                selected_model, X_train, y_train, cv=5,
                scoring={'r2': 'r2', 'mae': 'neg_mean_absolute_error',
                         'mse': 'neg_mean_squared_error'}
            )
            cv_mae = -cv_full['test_mae'].mean()
            cv_rmse = np.sqrt(-cv_full['test_mse'].mean())

        y_test_pred = selected_model.predict(X_test)
        test_r2 = r2_score(y_test, y_test_pred)

        comparison.append({
            'Model': name, 'CV_R2': cv_r2, 'CV_R2_Std': cv_r2_std,
            'CV_MAE': cv_mae, 'CV_RMSE': cv_rmse,
            'Test_R2': test_r2, 'Alpha': best_alpha,
            'ModelObj': selected_model
        })

        if cv_r2 > best_cv_r2:
            best_cv_r2 = cv_r2
            best_model_obj = selected_model
            best_model_name = name

    return {
        'preprocessor': preprocessor,
        'feature_names': feature_names,
        'comparison': comparison,
        'best_model': best_model_obj,
        'best_model_name': best_model_name,
        'best_cv_r2': best_cv_r2,
        'X_train': X_train, 'y_train': y_train,
        'X_test': X_test, 'y_test': y_test,
        'df': df
    }

result = train_and_select_model()
df = result['df']
preprocessor = result['preprocessor']
feature_names = result['feature_names']
comparison = result['comparison']
best_model = result['best_model']
best_model_name = result['best_model_name']
best_cv_r2 = result['best_cv_r2']
X_train = result['X_train']
X_test = result['X_test']
y_train = result['y_train']
y_test = result['y_test']

y_train_pred = best_model.predict(X_train)
y_test_pred = best_model.predict(X_test)

coef = (best_model.named_steps['regressor'].coef_
        if hasattr(best_model, 'named_steps') else best_model.coef_)
intercept = (best_model.named_steps['regressor'].intercept_
             if hasattr(best_model, 'named_steps') else best_model.intercept_)

# Language selector in the sidebar
st.sidebar.title("Language / 語言")
lang = st.sidebar.selectbox("Language Selection", ["English", "繁體中文"], label_visibility="collapsed")

# Translation mappings
if lang == "繁體中文":
    t = {
        'page_title': " Startup 獲利預估分析器",
        'sub_header': "多元線性回歸模型 — 標準化特徵與 5 折交叉驗證",
        'nav_title': "功能導覽",
        'eda_tab': "EDA 數據探索看板",
        'eval_tab': "模型評估與診斷",
        'pred_tab': "獲利即時預估器",
        # EDA Dashboard
        'eda_header': "數據探索與分析 (EDA Dashboard)",
        'total_records': "總數據筆數",
        'features': "特徵欄位數",
        'target': "預測目標 (Target)",
        'missing_values': "缺失值個數",
        'dataset_preview': "數據集預覽 (Dataset Preview)",
        'desc_stats': "描述性統計資訊 (Descriptive Statistics)",
        'corr_analysis': "特徵相關性矩陣分析 (Correlation Matrix Heatmap)",
        'feature_relationships': "特徵與獲利關係散佈圖 (Feature Relationships)",
        'profit_by_state': "不同州別的獲利分布盒鬚圖 (Profit Distribution by State)",
        'pairplot': "特徵配對關係散佈矩陣 (Pairwise Relationships)",
        # Model Evaluation
        'eval_header': "模型效能評估與診斷 (Model Evaluation)",
        'best_model': "最優推薦模型 (Best Model)",
        'cv_r2': "CV R² (5 折交叉驗證)",
        'cv_mae': "CV MAE (5 折平均絕對誤差)",
        'cv_rmse': "CV RMSE (5 折均方根誤差)",
        'model_comparison': "多模型效能對比 (5-Fold Cross-Validation)",
        'feature_importance': "特徵重要性 — 標準化係數 (Feature Importance)",
        'feature_importance_desc': "提示：標準化係數可直接比較大小。絕對值越大，代表該支出對獲利 (Profit) 的邊際影響力越大。",
        'model_formula': "模型數學公式 (標準化尺度 Model Formula)",
        'residual_analysis': "模型殘差診斷分析 (Residual Diagnostics)",
        'actual_vs_pred': "實際獲利 vs 預測獲利 (Actual vs Predicted)",
        'key_insights': "核心商業發現 (Key Insights)",
        'insight_1': "<strong>商業發現 1:</strong> 研發支出 (R&D Spend) 的標準化係數最大，證實其為推動公司獲利的核心引擎。<br>",
        'insight_2': "<strong>商業發現 2:</strong> 市場行銷 (Marketing Spend) 是次要正面因子，仍有顯著提升獲利的效果。<br>",
        'insight_3': "<strong>商業發現 3:</strong> 行政管理支出 (Administration) 對獲利的直接邊際貢獻極低，甚至是輕微的負向因子。<br>",
        'insight_4': "<strong>商業發現 4:</strong> 地理位置 (州別 State) 對獲利的直接影響微乎其微，不應作為主要的投資地點決策依據。",
        # Profit Predictor
        'pred_header': "獲利即時預估與模擬 (Profit Predictor)",
        'input_params': "營運預算參數輸入",
        'rd_spend_label': "研發支出預算 R&D Spend ($)",
        'admin_label': "行政營運支出 Administration ($)",
        'mkt_label': "市場行銷支出 Marketing Spend ($)",
        'state_label': "營運登記州別 (State)",
        'predict_btn': "開始預估公司獲利 (Predict Profit)",
        'predicted_profit': "預估公司年獲利 (Predicted Profit)",
        'biz_recs': "商業決策建議 (Business Recommendations)",
        'rec_rd': "增加研發投資（目前為 ${:,.0f}）— 此特徵的 ROI 最高，對獲利邊際增長最具成效。",
        'rec_mkt_gt_admin': "市場行銷支出 (${:,.0f}) 大於行政支出 (${:,.0f}) — 預算配置結構良善。",
        'rec_admin_gt_mkt': "考慮將部分預算從「行政營運費用」轉移到「市場行銷」或「研發」以創造更高的利潤價值。",
        'rec_admin_highest': "行政管理開銷過高，可能會嚴重侵蝕潛在利潤空間，建議進行內部流程優化與精實管理。",
        'feature_contrib': "特徵預估貢獻度分析",
        'budget_alloc': "當前預算配置占比",
        'sensitivity_analysis': "研發支出敏感度分析 (What-If 模擬)",
        'pie_title': "各項預算配置占比 %",
        'sens_title': "預估利潤隨研發預算之變化曲線 (固定其他預算)",
        'current_input': "當前配置點",
        'chart_rd': "研發支出 R&D Spend",
        'chart_admin': "行政管理 Administration",
        'chart_mkt': "市場行銷 Marketing Spend",
        'no_budget': "請在左側輸入大於 $0 的預算以顯示配置占比。",
        'placeholder_info': "請調整左側側邊欄的預算參數，並點擊「開始預估公司獲利」按鈕查看分析結果。",
        'feature_col': "欄位名稱",
        'value_col': "數值 / 選項",
        'desc_col': "欄位商業定義說明",
        'desc_rd': "投入研發與創新產品的總資金",
        'desc_admin': "公司日常行政、辦公室租金及人事管理成本",
        'desc_mkt': "品牌推廣、廣告及開拓市場所需費用",
        'desc_state': "新創公司成立或主要營運的法定地理位置"
    }
else:
    t = {
        'page_title': " Startup Profit Predictor",
        'sub_header': "Multiple Linear Regression with Standardization & 5-Fold CV",
        'nav_title': "Navigation",
        'eda_tab': "EDA Dashboard",
        'eval_tab': "Model Evaluation",
        'pred_tab': "Profit Predictor",
        # EDA Dashboard
        'eda_header': "Exploratory Data Analysis",
        'total_records': "Total Records",
        'features': "Features",
        'target': "Target",
        'missing_values': "Missing Values",
        'dataset_preview': "Dataset Preview",
        'desc_stats': "Descriptive Statistics",
        'corr_analysis': "Correlation Analysis (Heatmap)",
        'feature_relationships': "Feature Relationships",
        'profit_by_state': "Profit Distribution by State",
        'pairplot': "Pairplot (Sample)",
        # Model Evaluation
        'eval_header': "Model Evaluation",
        'best_model': "Best Model",
        'cv_r2': "CV R² (5-Fold)",
        'cv_mae': "CV MAE (5-Fold)",
        'cv_rmse': "CV RMSE (5-Fold)",
        'model_comparison': "Model Comparison (5-Fold Cross-Validation)",
        'feature_importance': "Feature Importance (Standardized Coefficients)",
        'feature_importance_desc': "Standardized coefficients are directly comparable: a larger absolute value indicates greater relative importance.",
        'model_formula': "Model Formula (Standardized Scale)",
        'residual_analysis': "Residual Analysis",
        'actual_vs_pred': "Actual vs Predicted",
        'key_insights': "Key Insights",
        'insight_1': "<strong>Finding 1:</strong> R&D Spend has the strongest standardized coefficient.<br>",
        'insight_2': "<strong>Finding 2:</strong> Marketing Spend is the secondary factor.<br>",
        'insight_3': "<strong>Finding 3:</strong> Administration expenses have minimal impact.<br>",
        'insight_4': "<strong>Finding 4:</strong> State (location) has limited influence on Profit.",
        # Profit Predictor
        'pred_header': "Profit Predictor",
        'input_params': "Input Parameters",
        'rd_spend_label': "R&D Spend ($)",
        'admin_label': "Administration ($)",
        'mkt_label': "Marketing Spend ($)",
        'state_label': "State",
        'predict_btn': "Predict Profit",
        'predicted_profit': "Predicted Profit",
        'biz_recs': "Business Recommendations",
        'rec_rd': "Increase R&D investment (currently ${:,.0f}) — highest ROI factor",
        'rec_mkt_gt_admin': "Marketing (${:,.0f}) > Administration (${:,.0f}) — good allocation",
        'rec_admin_gt_mkt': "Consider shifting budget from Administration to Marketing or R&D",
        'rec_admin_highest': "High Administration costs may be reducing potential profit",
        'feature_contrib': "Feature Contribution",
        'budget_alloc': "Budget Allocation",
        'sensitivity_analysis': "R&D Spend Sensitivity Analysis (What-If)",
        'pie_title': "Current Budget Allocation %",
        'sens_title': "Predicted Profit vs. R&D Spend (Sensitivity analysis keeping other inputs fixed)",
        'current_input': "Current Input",
        'chart_rd': "R&D Spend",
        'chart_admin': "Administration",
        'chart_mkt': "Marketing Spend",
        'no_budget': "Please enter a budget greater than $0 to view allocation.",
        'placeholder_info': "Adjust the parameters in the sidebar and click **Predict Profit** to see the result.",
        'feature_col': "Feature",
        'value_col': "Value",
        'desc_col': "Description",
        'desc_rd': "Invest in R&D to drive innovation",
        'desc_admin': "Manage operational costs",
        'desc_mkt': "Expand market reach",
        'desc_state': "Choose business location"
    }

st.markdown(f'<p class="main-header">{t["page_title"]}</p>', unsafe_allow_html=True)
st.markdown(f'<p class="sub-header">{t["sub_header"]}</p>', unsafe_allow_html=True)

st.sidebar.title(t['nav_title'])
page = st.sidebar.radio(t['nav_title'], [t['eda_tab'], t['eval_tab'], t['pred_tab']], label_visibility="collapsed")

if page == t['eda_tab']:
    st.header(t['eda_header'])

    col1, col2, col3, col4 = st.columns(4)
    col1.metric(t['total_records'], df.shape[0])
    col2.metric(t['features'], df.shape[1] - 1)
    col3.metric(t['target'], "Profit")
    col4.metric(t['missing_values'], df.isnull().sum().sum())

    st.subheader(t['dataset_preview'])
    st.dataframe(df, use_container_width=True)

    st.subheader(t['desc_stats'])
    st.dataframe(df.describe(), use_container_width=True)

    st.subheader(t['corr_analysis'])
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()
    fig = px.imshow(corr, text_auto=True, color_continuous_scale='RdBu_r', aspect='auto',
                    title=t['corr_analysis'])
    st.plotly_chart(fig, use_container_width=True)

    st.subheader(t['feature_relationships'])
    col1, col2 = st.columns(2)
    with col1:
        fig = px.scatter(df, x='R&D Spend', y='Profit', trendline='ols',
                         title='R&D Spend vs Profit',
                         labels={'R&D Spend': 'R&D Spend ($)', 'Profit': 'Profit ($)'})
        st.plotly_chart(fig, use_container_width=True)
        fig = px.scatter(df, x='Marketing Spend', y='Profit', trendline='ols',
                         title='Marketing Spend vs Profit',
                         labels={'Marketing Spend': 'Marketing Spend ($)', 'Profit': 'Profit ($)'})
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        fig = px.scatter(df, x='Administration', y='Profit', trendline='ols',
                         title='Administration vs Profit',
                         labels={'Administration': 'Administration ($)', 'Profit': 'Profit ($)'})
        st.plotly_chart(fig, use_container_width=True)
        fig = px.histogram(df, x='Profit', nbins=15, title='Profit Distribution',
                           labels={'Profit': 'Profit ($)'}, marginal='box')
        st.plotly_chart(fig, use_container_width=True)

    st.subheader(t['profit_by_state'])
    fig = px.box(df, x='State', y='Profit', color='State', title=t['profit_by_state'])
    st.plotly_chart(fig, use_container_width=True)

    st.subheader(t['pairplot'])
    fig = px.scatter_matrix(df, dimensions=['R&D Spend', 'Administration', 'Marketing Spend', 'Profit'],
                            color='State', title=t['pairplot'])
    fig.update_traces(marker=dict(size=3))
    st.plotly_chart(fig, use_container_width=True)

elif page == t['eval_tab']:
    st.header(t['eval_header'])

    st.subheader(f"{t['best_model']}: {best_model_name} (CV R2 = {best_cv_r2:.4f})")

    col1, col2, col3 = st.columns(3)
    best_comp = [c for c in comparison if c['Model'] == best_model_name][0]
    col1.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{best_comp['CV_R2']:.4f}</div>
        <div class="metric-label">{t['cv_r2']}</div>
    </div>""", unsafe_allow_html=True)
    col2.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">${best_comp['CV_MAE']:,.0f}</div>
        <div class="metric-label">{t['cv_mae']}</div>
    </div>""", unsafe_allow_html=True)
    col3.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">${best_comp['CV_RMSE']:,.0f}</div>
        <div class="metric-label">{t['cv_rmse']}</div>
    </div>""", unsafe_allow_html=True)

    st.subheader(t['model_comparison'])
    comp_rows = []
    for c in comparison:
        alpha_str = str(c['Alpha']) if c['Alpha'] is not None else 'N/A'
        comp_rows.append({
            'Model': c['Model'],
            'CV R2': f"{c['CV_R2']:.4f}",
            'CV MAE': f"${c['CV_MAE']:,.0f}",
            'CV RMSE': f"${c['CV_RMSE']:,.0f}",
            'Test R2': f"{c['Test_R2']:.4f}",
            'Best Alpha': alpha_str
        })
    st.table(pd.DataFrame(comp_rows))

    st.subheader(t['feature_importance'])
    coef_df = pd.DataFrame({
        'Feature': feature_names,
        'Coefficient': coef
    })
    coef_df['Abs_Coefficient'] = coef_df['Coefficient'].abs()
    coef_df = coef_df.sort_values('Abs_Coefficient', ascending=True)

    fig = px.bar(coef_df, x='Coefficient', y='Feature', orientation='h',
                 color='Coefficient', color_continuous_scale='RdYlGn',
                 title=f'Standardized Coefficients — Directly Comparable ({best_model_name})',
                 text_auto='.4f')
    st.plotly_chart(fig, use_container_width=True)

    st.info(t['feature_importance_desc'])

    st.subheader(t['model_formula'])
    formula_parts = [f"{intercept:.4f}"]
    for name, c in zip(feature_names, coef):
        sign = "+" if c >= 0 else "-"
        formula_parts.append(f"{sign} {abs(c):.4f} x Z({name})")
    formula = "Profit = " + " ".join(formula_parts)
    st.info(formula)

    st.subheader(t['residual_analysis'])
    residuals = y_test - y_test_pred
    fig = make_subplots(rows=1, cols=2, subplot_titles=('Residual Plot', 'Q-Q Plot'))

    fig.add_trace(
        go.Scatter(x=y_test_pred, y=residuals, mode='markers',
                   marker=dict(color='blue', size=8, opacity=0.6)),
        row=1, col=1
    )
    fig.add_hline(y=0, line_dash="dash", line_color="red", row=1, col=1)
    fig.update_xaxes(title_text="Predicted Profit", row=1, col=1)
    fig.update_yaxes(title_text="Residuals", row=1, col=1)

    from scipy import stats as sp_stats
    quantiles = np.linspace(0.01, 0.99, len(residuals))
    theoretical_q = sp_stats.norm.ppf(quantiles, loc=np.mean(residuals), scale=np.std(residuals))
    sample_q = np.percentile(residuals, quantiles * 100)
    fig.add_trace(
        go.Scatter(x=theoretical_q, y=sample_q, mode='markers',
                   marker=dict(color='green', size=6, opacity=0.6)),
        row=1, col=2
    )
    min_v = min(theoretical_q.min(), sample_q.min())
    max_v = max(theoretical_q.max(), sample_q.max())
    fig.add_trace(
        go.Scatter(x=[min_v, max_v], y=[min_v, max_v],
                   mode='lines', line=dict(color='red', dash='dash'),
                   showlegend=False),
        row=1, col=2
    )
    fig.update_xaxes(title_text="Theoretical Quantiles", row=1, col=2)
    fig.update_yaxes(title_text="Sample Quantiles", row=1, col=2)
    fig.update_layout(height=450, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

    st.subheader(t['actual_vs_pred'])
    results_df = pd.DataFrame({
        'Actual': y_test.values,
        'Predicted': y_test_pred,
        'Error': y_test.values - y_test_pred
    }).reset_index(drop=True)
    fig = px.scatter(results_df, x='Actual', y='Predicted',
                     hover_data={'Error': ':$,.2f'},
                     title='Actual vs Predicted Profit (Test Set)',
                     labels={'Actual': 'Actual Profit ($)', 'Predicted': 'Predicted Profit ($)'})
    mn = min(results_df['Actual'].min(), results_df['Predicted'].min())
    mx = max(results_df['Actual'].max(), results_df['Predicted'].max())
    fig.add_trace(
        go.Scatter(x=[mn, mx], y=[mn, mx],
                   mode='lines', line=dict(color='red', dash='dash'),
                   name='Perfect Prediction')
    )
    st.plotly_chart(fig, use_container_width=True)

    st.subheader(t['key_insights'])
    st.markdown(f"""
    <div class="insight-box">
        {t['insight_1']}
        {t['insight_2']}
        {t['insight_3']}
        {t['insight_4']}
    </div>""", unsafe_allow_html=True)

elif page == t['pred_tab']:
    st.header(t['pred_header'])
    st.sidebar.header(t['input_params'])
    rd_spend = st.sidebar.number_input(t['rd_spend_label'], min_value=0.0, max_value=200000.0,
                                       value=150000.0, step=1000.0)
    admin = st.sidebar.number_input(t['admin_label'], min_value=0.0, max_value=200000.0,
                                    value=120000.0, step=1000.0)
    marketing = st.sidebar.number_input(t['mkt_label'], min_value=0.0, max_value=500000.0,
                                        value=300000.0, step=1000.0)
    state = st.sidebar.selectbox(t['state_label'], options=['New York', 'California', 'Florida'])
    predict_btn = st.sidebar.button(t['predict_btn'], type="primary", use_container_width=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">{t['chart_rd']}</div>
            <div class="metric-value">${rd_spend:,.0f}</div>
        </div>""", unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">{t['chart_admin']}</div>
            <div class="metric-value">${admin:,.0f}</div>
        </div>""", unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">{t['chart_mkt']}</div>
            <div class="metric-value">${marketing:,.0f}</div>
        </div>""", unsafe_allow_html=True)

    st.markdown(f"""
    <div style="text-align: center; padding: 10px; background: #e3f2fd; border-radius: 5px; margin-bottom: 20px;">
        <strong>{t['state_label']}:</strong> {state}
    </div>""", unsafe_allow_html=True)

    if predict_btn:
        input_df = pd.DataFrame(
            [[rd_spend, admin, marketing, state]],
            columns=['R&D Spend', 'Administration', 'Marketing Spend', 'State']
        )
        input_transformed = preprocessor.transform(input_df)
        prediction = best_model.predict(input_transformed)[0]

        st.markdown(f"""
        <div style="text-align: center; background: linear-gradient(135deg, #1E88E5, #1565C0);
                    padding: 40px; border-radius: 15px; margin: 20px 0;">
            <p style="color: white; font-size: 1.2rem; margin-bottom: 10px;">{t['predicted_profit']}</p>
            <p style="color: white; font-size: 3.5rem; font-weight: 700; margin: 0;">
                ${prediction:,.0f}
            </p>
        </div>""", unsafe_allow_html=True)

        st.subheader(t['biz_recs'])
        recommendations = []
        if rd_spend > 0:
            recommendations.append(t['rec_rd'].format(rd_spend))
        if marketing > admin:
            recommendations.append(t['rec_mkt_gt_admin'].format(marketing, admin))
        else:
            recommendations.append(t['rec_admin_gt_mkt'])
        if admin > rd_spend and admin > marketing:
            recommendations.append(t['rec_admin_highest'])

        for i, rec in enumerate(recommendations, 1):
            st.markdown(f"""
            <div class="insight-box" style="margin-bottom: 10px;">
                <strong>{i}.</strong> {rec}
            </div>""", unsafe_allow_html=True)

        scaler = preprocessor.named_transformers_['num']
        rd_mean, rd_std = scaler.mean_[0], scaler.scale_[0]
        admin_mean, admin_std = scaler.mean_[1], scaler.scale_[1]
        mkt_mean, mkt_std = scaler.mean_[2], scaler.scale_[2]
        
        contribs = []
        for name, c in zip(feature_names, coef):
            if 'State' in name:
                if state.lower() in name.lower():
                    contribs.append({'Feature': name, 'Contribution': c, 'Type': 'Categorical'})
                else:
                    contribs.append({'Feature': name, 'Contribution': 0, 'Type': 'Categorical'})
            elif name == 'R&D Spend':
                scaled_val = (rd_spend - rd_mean) / rd_std
                contribs.append({'Feature': t['chart_rd'], 'Contribution': c * scaled_val, 'Type': 'Numerical'})
            elif name == 'Administration':
                scaled_val = (admin - admin_mean) / admin_std
                contribs.append({'Feature': t['chart_admin'], 'Contribution': c * scaled_val, 'Type': 'Numerical'})
            elif name == 'Marketing Spend':
                scaled_val = (marketing - mkt_mean) / mkt_std
                contribs.append({'Feature': t['chart_mkt'], 'Contribution': c * scaled_val, 'Type': 'Numerical'})

        # Columns for side-by-side charts
        chart_col1, chart_col2 = st.columns(2)
        
        with chart_col1:
            st.subheader(t['feature_contrib'])
            contrib_df = pd.DataFrame(contribs)
            fig = px.bar(contrib_df, x='Feature', y='Contribution',
                         title=t['feature_contrib'],
                         color='Contribution', color_continuous_scale='RdYlGn',
                         text_auto='.2f')
            st.plotly_chart(fig, use_container_width=True)
            
        with chart_col2:
            st.subheader(t['budget_alloc'])
            budget_df = pd.DataFrame({
                'Department': [t['chart_rd'], t['chart_admin'], t['chart_mkt']],
                'Budget': [rd_spend, admin, marketing]
            })
            if rd_spend == 0 and admin == 0 and marketing == 0:
                st.info(t['no_budget'])
            else:
                fig_pie = px.pie(budget_df, values='Budget', names='Department', hole=0.4,
                                 title=t['pie_title'],
                                 color_discrete_sequence=px.colors.qualitative.Pastel)
                st.plotly_chart(fig_pie, use_container_width=True)
                
        # Full width sensitivity analysis
        st.subheader(t['sensitivity_analysis'])
        rd_range = np.linspace(0.0, 200000.0, 50)
        sens_inputs = pd.DataFrame({
            'R&D Spend': rd_range,
            'Administration': [admin] * 50,
            'Marketing Spend': [marketing] * 50,
            'State': [state] * 50
        })
        sens_transformed = preprocessor.transform(sens_inputs)
        sens_predictions = best_model.predict(sens_transformed)
        
        sens_df = pd.DataFrame({
            'R&D Spend': rd_range,
            'Predicted Profit': sens_predictions
        })
        
        fig_sens = px.line(sens_df, x='R&D Spend', y='Predicted Profit',
                           title=t['sens_title'],
                           labels={'R&D Spend': f"{t['chart_rd']} ($)", 'Predicted Profit': f"{t['predicted_profit']} ($)"})
        # Add current selection dot
        fig_sens.add_trace(go.Scatter(
            x=[rd_spend], y=[prediction],
            mode='markers+text',
            name=t['current_input'],
            text=[f"{t['current_input']}: ${prediction:,.0f}"],
            textposition="top left",
            marker=dict(color='red', size=12, symbol='circle'),
            showlegend=True
        ))
        st.plotly_chart(fig_sens, use_container_width=True)

    else:
        st.info(t['placeholder_info'])
        sample_data = pd.DataFrame({
            t['feature_col']: [t['chart_rd'], t['chart_admin'], t['chart_mkt'], t['state_label']],
            t['value_col']: ['$150,000', '$120,000', '$300,000', 'California'],
            t['desc_col']: [t['desc_rd'], t['desc_admin'], t['desc_mkt'], t['desc_state']]
        })
        st.table(sample_data)
