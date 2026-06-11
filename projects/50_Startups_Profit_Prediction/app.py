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
    df = pd.read_csv('data/50_Startups.csv')
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

st.markdown('<p class="main-header"> Startup Profit Predictor</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Multiple Linear Regression with Standardization & 5-Fold CV</p>',
            unsafe_allow_html=True)

st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["EDA Dashboard", "Model Evaluation", "Profit Predictor"])

if page == "EDA Dashboard":
    st.header("Exploratory Data Analysis")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Records", df.shape[0])
    col2.metric("Features", df.shape[1] - 1)
    col3.metric("Target", "Profit")
    col4.metric("Missing Values", df.isnull().sum().sum())

    st.subheader("Dataset Preview")
    st.dataframe(df, use_container_width=True)

    st.subheader("Descriptive Statistics")
    st.dataframe(df.describe(), use_container_width=True)

    st.subheader("Correlation Analysis")
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()
    fig = px.imshow(corr, text_auto=True, color_continuous_scale='RdBu_r', aspect='auto',
                    title="Correlation Matrix Heatmap")
    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Feature Relationships")
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

    st.subheader("Profit by State")
    fig = px.box(df, x='State', y='Profit', color='State', title='Profit Distribution by State')
    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Pairplot (Sample)")
    fig = px.scatter_matrix(df, dimensions=['R&D Spend', 'Administration', 'Marketing Spend', 'Profit'],
                            color='State', title='Feature Pairwise Relationships')
    fig.update_traces(marker=dict(size=3))
    st.plotly_chart(fig, use_container_width=True)

elif page == "Model Evaluation":
    st.header("Model Evaluation")

    st.subheader(f"Best Model: {best_model_name} (CV R2 = {best_cv_r2:.4f})")

    col1, col2, col3 = st.columns(3)
    best_comp = [c for c in comparison if c['Model'] == best_model_name][0]
    col1.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{best_comp['CV_R2']:.4f}</div>
        <div class="metric-label">CV R2 (5-Fold)</div>
    </div>""", unsafe_allow_html=True)
    col2.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">${best_comp['CV_MAE']:,.0f}</div>
        <div class="metric-label">CV MAE (5-Fold)</div>
    </div>""", unsafe_allow_html=True)
    col3.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">${best_comp['CV_RMSE']:,.0f}</div>
        <div class="metric-label">CV RMSE (5-Fold)</div>
    </div>""", unsafe_allow_html=True)

    st.subheader("Model Comparison (5-Fold Cross-Validation)")
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

    st.subheader("Feature Importance (Standardized Coefficients)")
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

    st.info("Standardized coefficients are directly comparable: a larger absolute value indicates greater relative importance.")

    st.subheader("Model Formula (Standardized Scale)")
    formula_parts = [f"{intercept:.4f}"]
    for name, c in zip(feature_names, coef):
        sign = "+" if c >= 0 else "-"
        formula_parts.append(f"{sign} {abs(c):.4f} x Z({name})")
    formula = "Profit = " + " ".join(formula_parts)
    st.info(formula)

    st.subheader("Residual Analysis")
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

    st.subheader("Actual vs Predicted")
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

    st.subheader("Key Insights")
    st.markdown("""
    <div class="insight-box">
        <strong>Finding 1:</strong> R&D Spend has the strongest standardized coefficient.<br>
        <strong>Finding 2:</strong> Marketing Spend is the secondary factor.<br>
        <strong>Finding 3:</strong> Administration expenses have minimal impact.<br>
        <strong>Finding 4:</strong> State (location) has limited influence on Profit.
    </div>""", unsafe_allow_html=True)

elif page == "Profit Predictor":
    st.header("Profit Predictor")
    st.sidebar.header("Input Parameters")
    rd_spend = st.sidebar.number_input("R&D Spend ($)", min_value=0.0, max_value=200000.0,
                                       value=150000.0, step=1000.0)
    admin = st.sidebar.number_input("Administration ($)", min_value=0.0, max_value=200000.0,
                                    value=120000.0, step=1000.0)
    marketing = st.sidebar.number_input("Marketing Spend ($)", min_value=0.0, max_value=500000.0,
                                        value=300000.0, step=1000.0)
    state = st.sidebar.selectbox("State", options=['New York', 'California', 'Florida'])
    predict_btn = st.sidebar.button("Predict Profit", type="primary", use_container_width=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">R&D Spend</div>
            <div class="metric-value">${rd_spend:,.0f}</div>
        </div>""", unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Administration</div>
            <div class="metric-value">${admin:,.0f}</div>
        </div>""", unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Marketing Spend</div>
            <div class="metric-value">${marketing:,.0f}</div>
        </div>""", unsafe_allow_html=True)

    st.markdown(f"""
    <div style="text-align: center; padding: 10px; background: #e3f2fd; border-radius: 5px; margin-bottom: 20px;">
        <strong>State:</strong> {state}
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
            <p style="color: white; font-size: 1.2rem; margin-bottom: 10px;">Predicted Profit</p>
            <p style="color: white; font-size: 3.5rem; font-weight: 700; margin: 0;">
                ${prediction:,.0f}
            </p>
        </div>""", unsafe_allow_html=True)

        st.subheader("Business Recommendations")
        recommendations = []
        if rd_spend > 0:
            recommendations.append(f"Increase R&D investment (currently ${rd_spend:,.0f}) — highest ROI factor")
        if marketing > admin:
            recommendations.append(f"Marketing (${marketing:,.0f}) > Administration (${admin:,.0f}) — good allocation")
        else:
            recommendations.append("Consider shifting budget from Administration to Marketing or R&D")
        if admin > rd_spend and admin > marketing:
            recommendations.append("High Administration costs may be reducing potential profit")

        for i, rec in enumerate(recommendations, 1):
            st.markdown(f"""
            <div class="insight-box" style="margin-bottom: 10px;">
                <strong>{i}.</strong> {rec}
            </div>""", unsafe_allow_html=True)

        st.subheader("Feature Contribution (Standardized Coefficients)")
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
                contribs.append({'Feature': name, 'Contribution': c * scaled_val, 'Type': 'Numerical'})
            elif name == 'Administration':
                scaled_val = (admin - admin_mean) / admin_std
                contribs.append({'Feature': name, 'Contribution': c * scaled_val, 'Type': 'Numerical'})
            elif name == 'Marketing Spend':
                scaled_val = (marketing - mkt_mean) / mkt_std
                contribs.append({'Feature': name, 'Contribution': c * scaled_val, 'Type': 'Numerical'})

        contrib_df = pd.DataFrame(contribs)
        fig = px.bar(contrib_df, x='Feature', y='Contribution',
                     title='Standardized Feature Contribution to Predicted Profit',
                     color='Contribution', color_continuous_scale='RdYlGn',
                     text_auto='.2f')
        st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("Adjust the parameters in the sidebar and click **Predict Profit** to see the result.")
        sample_data = pd.DataFrame({
            'Feature': ['R&D Spend', 'Administration', 'Marketing Spend', 'State'],
            'Value': ['$150,000', '$120,000', '$300,000', 'California'],
            'Description': ['Invest in R&D to drive innovation', 'Manage operational costs',
                            'Expand market reach', 'Choose business location']
        })
        st.table(sample_data)
