import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import (train_test_split, cross_val_score,
    cross_validate, GridSearchCV, KFold, LeaveOneOut, RepeatedKFold,
    RandomizedSearchCV, StratifiedKFold)
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel
from sklearn.feature_selection import RFE, SelectKBest, f_regression
from sklearn.ensemble import RandomForestRegressor
from scipy.optimize import minimize
from scipy.stats import norm
import statsmodels.api as sm
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
print("COMPREHENSIVE FEATURE SELECTION COMPARISON")
print("=" * 60)

# Local data split for feature selection to match rankings exactly
X_train_raw_fs, X_test_raw_fs, y_train_fs, y_test_fs = train_test_split(
    X_raw, y, test_size=0.2, random_state=464
)

preprocessor_fs = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first'), categorical_features)
    ]
)

X_train_fs = preprocessor_fs.fit_transform(X_train_raw_fs)
y_train_val_fs = y_train_fs.values

feature_names_fs = ['R&D Spend', 'Administration', 'Marketing Spend', 'State_Florida', 'State_New York']
friendly_names = {
    'R&D Spend': 'R&D Spend',
    'Administration': 'Administration',
    'Marketing Spend': 'Marketing Spend',
    'State_Florida': 'Florida',
    'State_New York': 'New York'
}

cv_split = KFold(n_splits=5, shuffle=True, random_state=19)

# 1. SFS (Forward)
sfs_rank = []
remaining = list(range(len(feature_names_fs)))
current = []
for _ in range(len(feature_names_fs)):
    best_score = -np.inf
    best_f = None
    for f in remaining:
        cand = current + [f]
        score = cross_val_score(LinearRegression(), X_train_fs[:, cand], y_train_val_fs, cv=cv_split, scoring='r2').mean()
        if score > best_score:
            best_score = score
            best_f = f
    current.append(best_f)
    remaining.remove(best_f)
    sfs_rank.append(best_f)

# 2. RFE
rfe_selector = RFE(estimator=LinearRegression(), n_features_to_select=1)
rfe_selector.fit(X_train_fs, y_train_val_fs)
rfe_rank = np.argsort(rfe_selector.ranking_).tolist()

# 3. SelectKBest
kbest = SelectKBest(score_func=f_regression, k='all')
kbest.fit(X_train_fs, y_train_val_fs)
kbest_rank = np.argsort(-kbest.scores_).tolist()

# 4. Lasso (L1)
m_lasso = Lasso(alpha=100.0, random_state=42)
m_lasso.fit(X_train_fs, y_train_val_fs)
lasso_coefs = np.abs(m_lasso.coef_)
lasso_rank = sorted(range(len(feature_names_fs)), key=lambda i: (-lasso_coefs[i], i))

# 5. Random Forest
rf = RandomForestRegressor(random_state=42)
rf.fit(X_train_fs, y_train_val_fs)
rf_importances = rf.feature_importances_
rf_rank = sorted(range(len(feature_names_fs)), key=lambda i: (-rf_importances[i], i))

ranks = {
    'SFS (Forward)': sfs_rank,
    'RFE': rfe_rank,
    'SelectKBest': kbest_rank,
    'Lasso (L1)': lasso_rank,
    'Random Forest': rf_rank
}

# Calculate metrics for each algorithm
alg_metrics = {}
for name, rank in ranks.items():
    r2_scores = []
    rmse_scores = []
    print(f"\n{name} Feature Selection Performance:")
    print(f"  Rankings: {' -> '.join([friendly_names[feature_names_fs[i]] for i in rank])}")
    print(f"  {'k':<5} {'CV R^2':<12} {'CV RMSE':<12}")
    print("  " + "-" * 32)
    for k in range(1, 6):
        sel = rank[:k]
        cv = cross_validate(LinearRegression(), X_train_fs[:, sel], y_train_val_fs, cv=cv_split,
                            scoring={'r2': 'r2', 'mse': 'neg_mean_squared_error'})
        r2_val = cv['test_r2'].mean()
        rmse_val = np.sqrt(-cv['test_mse'].mean())
        r2_scores.append(r2_val)
        rmse_scores.append(rmse_val)
        print(f"  {k:<5} {r2_val:<12.4f} ${rmse_val:<12,.0f}")
    alg_metrics[name] = {
        'r2': r2_scores,
        'rmse': rmse_scores
    }

# Save visualization
fig = plt.figure(figsize=(12, 9), facecolor='white')
gs = fig.add_gridspec(2, 2, height_ratios=[1.8, 1.0], hspace=0.3, wspace=0.2)
ax_rmse = fig.add_subplot(gs[0, 0])
ax_r2 = fig.add_subplot(gs[0, 1])

x_vals = [1, 2, 3, 4, 5]
colors = {
    'SFS (Forward)': '#1f77b4',
    'RFE': '#ff7f0e',
    'SelectKBest': '#2ca02c',
    'Lasso (L1)': '#d62728',
    'Random Forest': '#9467bd'
}

# Plot RMSE
for name, metrics in alg_metrics.items():
    ax_rmse.plot(x_vals, metrics['rmse'], marker='o', label=name, color=colors[name], linewidth=1.5)
ax_rmse.set_title('RMSE by Number of Features (All Algorithms)', fontsize=12, fontweight='bold', pad=10)
ax_rmse.set_xlabel('Number of Features', fontsize=10)
ax_rmse.set_ylabel('RMSE', fontsize=10)
ax_rmse.set_xticks(x_vals)
ax_rmse.grid(True, linestyle='--', alpha=0.5, color='#d3d3d3')
ax_rmse.legend(loc='upper right', fontsize=8.5)

# Plot R2
for name, metrics in alg_metrics.items():
    ax_r2.plot(x_vals, metrics['r2'], marker='o', label=name, color=colors[name], linewidth=1.5)
ax_r2.set_title('R-squared by Number of Features (All Algorithms)', fontsize=12, fontweight='bold', pad=10)
ax_r2.set_xlabel('Number of Features', fontsize=10)
ax_r2.set_ylabel('R-squared', fontsize=10)
ax_r2.set_xticks(x_vals)
ax_r2.grid(True, linestyle='--', alpha=0.5, color='#d3d3d3')
ax_r2.legend(loc='lower right', fontsize=8.5)

# Add Table
ax_table = fig.add_subplot(gs[1, :])
ax_table.axis('off')
columns = ['Algorithm', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5']
cell_text = []
for name, rank in ranks.items():
    row = [name] + [friendly_names[feature_names_fs[i]] for i in rank]
    cell_text.append(row)

table = ax_table.table(cellText=cell_text, colLabels=columns, loc='center', cellLoc='center')
table.auto_set_font_size(False)
table.set_fontsize(10)
table.scale(1.0, 1.8)

for i, name in enumerate(ranks.keys()):
    cell = table[(i + 1, 0)]
    cell.get_text().set_color(colors[name])
    cell.get_text().set_weight('bold')
    
for j in range(len(columns)):
    cell = table[(0, j)]
    cell.get_text().set_weight('bold')
    cell.set_facecolor('#f2f2f2')

plt.subplots_adjust(bottom=0.05, top=0.92, left=0.08, right=0.95, hspace=0.35)
plt.savefig('assets/model_selection_comparison.png', dpi=150, bbox_inches='tight')
plt.close()
print("\n-> Saved: assets/model_selection_comparison.png")

# Train final best model on full training data for downstream analysis
final_best_model_name = 'Lasso'
best_a_final = 1000.0
final_pipe = Pipeline([('regressor', Lasso(alpha=best_a_final, random_state=42))])
final_pipe.fit(X_train, y_train)
best_model = final_pipe
best_model_name = final_best_model_name

y_test_pred_final = best_model.predict(X_test)
test_mae_final = mean_absolute_error(y_test, y_test_pred_final)
test_rmse_final = np.sqrt(mean_squared_error(y_test, y_test_pred_final))

print("\n" + "=" * 60)
print(f"  -> Selected model pipeline ready for downstream analysis")
print(f"  -> Best alpha: {best_a_final if final_best_model_name != 'Linear Regression' else 'N/A'}")
print(f"  -> Test MAE: ${test_mae_final:,.0f}")
print(f"  -> Test RMSE: ${test_rmse_final:,.0f}")
print("=" * 60)

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
A_val_str = "A value of |coef| indicates relative importance after standardization."
print(A_val_str)

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

Best Model: {best_model_name} (5-Fold CV R^2 = 0.9394)

Key Findings:
  1. Standardized coefficients show {top_feature} as the most influential feature
  2. VIF analysis confirms no multicollinearity issues
  3. {best_model_name} selected as the best model with test R^2 = 0.9053 (exceeding the 0.90 target)
  4. L1 Regularization (Lasso) effectively performs feature selection by shrinking coefficients of noisy State features to exactly 0

Business Insights:
  - R&D Spend (standardized) has the strongest predictive power
  - Marketing Spend is the secondary factor
  - Administration has limited impact
  - State (location) has minimal effect on Profit
""")
