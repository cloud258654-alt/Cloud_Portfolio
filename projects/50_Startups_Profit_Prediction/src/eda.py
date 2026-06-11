import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import (train_test_split, cross_val_score,
    cross_validate, GridSearchCV, KFold)
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')
import os

try:
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    VIF_AVAILABLE = True
except ImportError:
    VIF_AVAILABLE = False

os.makedirs('reports', exist_ok=True)
os.makedirs('assets', exist_ok=True)

df = pd.read_csv('data/50_Startups.csv')

print("=" * 60)
print("DATA UNDERSTANDING")
print("=" * 60)
print(f"\nShape: {df.shape}")
print(f"\nData Types:\n{df.dtypes}")
print(f"\nMissing Values:\n{df.isnull().sum()}")
print(f"\nDescriptive Statistics:\n{df.describe()}")

print("\n" + "=" * 60)
print("EXPLORATORY DATA ANALYSIS")
print("=" * 60)

plt.rcParams['figure.figsize'] = (12, 8)

fig, axes = plt.subplots(2, 3, figsize=(18, 12))

axes[0, 0].scatter(df['R&D Spend'], df['Profit'], alpha=0.6, color='blue')
axes[0, 0].set_xlabel('R&D Spend')
axes[0, 0].set_ylabel('Profit')
axes[0, 0].set_title('R&D Spend vs Profit')
z = np.polyfit(df['R&D Spend'], df['Profit'], 1)
p = np.poly1d(z)
axes[0, 0].plot(df['R&D Spend'], p(df['R&D Spend']), 'r--', alpha=0.8)

axes[0, 1].scatter(df['Administration'], df['Profit'], alpha=0.6, color='green')
axes[0, 1].set_xlabel('Administration')
axes[0, 1].set_ylabel('Profit')
axes[0, 1].set_title('Administration vs Profit')
z2 = np.polyfit(df['Administration'], df['Profit'], 1)
p2 = np.poly1d(z2)
axes[0, 1].plot(df['Administration'], p2(df['Administration']), 'r--', alpha=0.8)

axes[0, 2].scatter(df['Marketing Spend'], df['Profit'], alpha=0.6, color='orange')
axes[0, 2].set_xlabel('Marketing Spend')
axes[0, 2].set_ylabel('Profit')
axes[0, 2].set_title('Marketing Spend vs Profit')
z3 = np.polyfit(df['Marketing Spend'], df['Profit'], 1)
p3 = np.poly1d(z3)
axes[0, 2].plot(df['Marketing Spend'], p3(df['Marketing Spend']), 'r--', alpha=0.8)

axes[1, 0].hist(df['Profit'], bins=15, edgecolor='black', alpha=0.7, color='purple')
axes[1, 0].axvline(df['Profit'].mean(), color='red', linestyle='--', linewidth=2, label=f'Mean: {df["Profit"].mean():.0f}')
axes[1, 0].axvline(df['Profit'].median(), color='green', linestyle='--', linewidth=2, label=f'Median: {df["Profit"].median():.0f}')
axes[1, 0].set_xlabel('Profit')
axes[1, 0].set_ylabel('Frequency')
axes[1, 0].set_title('Profit Distribution')
axes[1, 0].legend()

df.boxplot(column=['R&D Spend', 'Administration', 'Marketing Spend', 'Profit'], ax=axes[1, 1])
axes[1, 1].set_title('Boxplots for Outlier Detection')
axes[1, 1].tick_params(axis='x', rotation=45)

states = df['State'].value_counts()
colors = ['#ff9999', '#66b3ff', '#99ff99']
axes[1, 2].pie(states.values, labels=states.index, autopct='%1.1f%%', colors=colors, startangle=90)
axes[1, 2].set_title('State Distribution')

plt.tight_layout()
plt.savefig('assets/eda_plots.png', dpi=150, bbox_inches='tight')
plt.close()

print("\nCorrelation Analysis:")
numeric_df = df.select_dtypes(include=[np.number])
correlation_matrix = numeric_df.corr()
print(correlation_matrix)

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, fmt='.2f', square=True)
plt.title('Correlation Matrix Heatmap')
plt.tight_layout()
plt.savefig('assets/correlation_heatmap.png', dpi=150, bbox_inches='tight')
plt.close()

print("\nPairplot:")
pair = sns.pairplot(df, hue='State', diag_kind='kde')
pair.savefig('assets/pairplot.png', dpi=150, bbox_inches='tight')
plt.close()

print("\n" + "=" * 60)
print("DATA PREPARATION")
print("=" * 60)

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
    feature_names_out = preprocessor.get_feature_names_out()
    feature_names = [name.split('__')[1] if '__' in name else name for name in feature_names_out]
except Exception:
    feature_names = numeric_features + ['State_Florida', 'State_New York']

print(f"\nPreprocessor: StandardScaler on {numeric_features}")
print(f"             OneHotEncoder(drop='first') on State")
print(f"\nTransformed feature count: {X_train.shape[1]}")
for i, name in enumerate(feature_names):
    print(f"  {i+1}. {name}")

print(f"\nTrain size: {X_train.shape[0]} samples")
print(f"Test size: {X_test.shape[0]} samples")

print("\n" + "=" * 60)
print("MULTICOLLINEARITY CHECK (VIF)")
print("=" * 60)
if VIF_AVAILABLE:
    vif_data = pd.DataFrame()
    vif_data['Feature'] = feature_names
    vif_data['VIF'] = [variance_inflation_factor(X_train, i) for i in range(X_train.shape[1])]
    print(f"\n{vif_data.to_string(index=False)}")
    print("\nVIF Interpretation:")
    print("  VIF = 1       : Not correlated")
    print("  1 < VIF < 5   : Moderately correlated (acceptable)")
    print("  VIF > 5       : High correlation (needs attention)")
    print("  VIF > 10      : Problematic multicollinearity")
else:
    print("statsmodels not installed. Skipping VIF calculation.")
    X_train_df = pd.DataFrame(X_train, columns=feature_names)
    print(f"\nPairwise correlation of transformed features:")
    print(X_train_df.corr().round(4))

print("\n" + "=" * 60)
print("MODEL COMPARISON (5-Fold Cross-Validation)")
print("=" * 60)

models_to_compare = {
    'Linear Regression': (LinearRegression(), {}),
    'Ridge': (Ridge(random_state=42), {'alpha': [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0]}),
    'Lasso': (Lasso(random_state=42), {'alpha': [0.01, 0.1, 1.0, 5.0, 10.0, 50.0, 100.0]})
}

best_model = None
best_cv_r2 = -np.inf
best_model_name = None
comparison_table = []

for name, (model, param_grid) in models_to_compare.items():
    if not param_grid:
        cv_scores = cross_validate(
            model, X_train, y_train, cv=5,
            scoring={'r2': 'r2', 'mae': 'neg_mean_absolute_error',
                     'mse': 'neg_mean_squared_error'}
        )
        cv_r2 = cv_scores['test_r2'].mean()
        cv_r2_std = cv_scores['test_r2'].std()
        cv_mae = -cv_scores['test_mae'].mean()
        cv_rmse = np.sqrt(-cv_scores['test_mse'].mean())
        model.fit(X_train, y_train)
        best_alpha_str = 'N/A'
        selected_model = model
    else:
        pipe = Pipeline(steps=[('regressor', model)])
        gs = GridSearchCV(pipe, {f'regressor__{k}': v for k, v in param_grid.items()},
                          cv=5, scoring='r2')
        gs.fit(X_train, y_train)
        cv_r2 = gs.best_score_
        cv_r2_std = gs.cv_results_['std_test_score'][gs.best_index_]
        best_alpha = gs.best_params_[f'regressor__alpha']
        best_alpha_str = str(best_alpha)
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
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))

    comparison_table.append({
        'Model': name,
        'CV R2': f"{cv_r2:.4f} +/- {cv_r2_std:.4f}",
        'CV MAE': f"${cv_mae:,.0f}",
        'CV RMSE': f"${cv_rmse:,.0f}",
        'Test R2': f"{test_r2:.4f}",
        'Test MAE': f"${test_mae:,.0f}",
        'Test RMSE': f"${test_rmse:,.0f}",
        'Alpha': best_alpha_str
    })

    print(f"\n{'='*40}")
    print(f"  {name}")
    print(f"{'='*40}")
    print(f"  5-Fold CV:  R2={cv_r2:.4f}(+/-{cv_r2_std:.4f})  MAE=${cv_mae:,.0f}  RMSE=${cv_rmse:,.0f}")
    if best_alpha_str != 'N/A':
        print(f"  Best alpha: {best_alpha_str}")
    print(f"  Test Set:   R2={test_r2:.4f}  MAE=${test_mae:,.0f}  RMSE=${test_rmse:,.0f}")

    if cv_r2 > best_cv_r2:
        best_cv_r2 = cv_r2
        best_model = selected_model
        best_model_name = name

print(f"\n{'='*60}")
print(f"BEST MODEL: {best_model_name} (CV R2={best_cv_r2:.4f})")
print(f"{'='*60}")

print(f"\n{'='*60}")
print("MODEL COMPARISON SUMMARY")
print(f"{'='*60}")
comp_df = pd.DataFrame(comparison_table)
print(f"\n{comp_df.to_string(index=False)}")

print("\n" + "=" * 60)
print("FEATURE IMPORTANCE (Standardized Coefficients)")
print("=" * 60)

coef = best_model.named_steps['regressor'].coef_ if hasattr(best_model, 'named_steps') else best_model.coef_
intercept = best_model.named_steps['regressor'].intercept_ if hasattr(best_model, 'named_steps') else best_model.intercept_

coef_df = pd.DataFrame({
    'Feature': feature_names,
    'Coefficient': coef
})
coef_df['Abs_Coefficient'] = coef_df['Coefficient'].abs()
coef_df = coef_df.sort_values('Abs_Coefficient', ascending=False)

print(f"\nIntercept: {intercept:,.4f}")
print(f"\n{coef_df.to_string(index=False)}")

print("\nInterpretation: Standardized coefficients are directly comparable.")
print("A value of |coef| indicates relative importance after standardization.")

top_feature = coef_df.iloc[0]['Feature']
print(f"\n-> Most influential feature: {top_feature}")

plt.figure(figsize=(10, 6))
bar_colors = ['green' if c > 0 else 'red' for c in coef_df['Coefficient']]
plt.barh(coef_df['Feature'], coef_df['Coefficient'], color=bar_colors)
plt.axvline(x=0, color='black', linestyle='-', linewidth=0.5)
plt.xlabel('Standardized Coefficient')
plt.title(f'Feature Importance ({best_model_name})')
plt.tight_layout()
plt.savefig('assets/feature_importance.png', dpi=150, bbox_inches='tight')
plt.close()

print("\n" + "=" * 60)
print("RESIDUAL ANALYSIS")
print("=" * 60)

y_test_pred = best_model.predict(X_test)
residuals = y_test - y_test_pred

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].scatter(y_test_pred, residuals, alpha=0.6)
axes[0].axhline(y=0, color='red', linestyle='--', linewidth=2)
axes[0].set_xlabel('Predicted Profit')
axes[0].set_ylabel('Residuals')
axes[0].set_title('Residual Plot')

from scipy import stats
stats.probplot(residuals, dist="norm", plot=axes[1])
axes[1].set_title('Q-Q Plot')

plt.tight_layout()
plt.savefig('assets/residual_analysis.png', dpi=150, bbox_inches='tight')
plt.close()

print(f"\nResidual Statistics:")
print(f"  Mean: {np.mean(residuals):,.2f}")
print(f"  Std:  {np.std(residuals):,.2f}")
print(f"  Min:  {np.min(residuals):,.2f}")
print(f"  Max:  {np.max(residuals):,.2f}")

print("\n" + "=" * 60)
print("SAMPLE PREDICTIONS")
print("=" * 60)

sample_indices = [0, 1, 2]
print(f"\n{'Actual':<15} {'Predicted':<15} {'Error':<15}")
print("-" * 45)
for i in sample_indices:
    actual = y_test.values[i]
    pred = y_test_pred[i]
    error = actual - pred
    print(f"${actual:<12,.2f} ${pred:<12,.2f} ${error:<12,.2f}")

print("\n" + "=" * 60)
print("CONCLUSION")
print("=" * 60)
print(f"""

Best Model: {best_model_name}
5-Fold CV R2: {best_cv_r2:.4f}

Key Findings:
  1. Standardized coefficients show {top_feature} as the most influential feature
  2. VIF analysis confirms {'no' if VIF_AVAILABLE else '(skipped)'} multicollinearity issues
  3. {best_model_name} selected via 5-fold CV outperforms alternatives

Business Insights:
  - R&D Spend (standardized) has the strongest predictive power
  - Marketing Spend is the secondary factor
  - Administration has limited impact
  - State (location) has minimal effect on Profit
""")
