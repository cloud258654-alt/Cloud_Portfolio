import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
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
from scipy.stats import norm
import statsmodels.api as sm
import warnings
warnings.filterwarnings('ignore')
import os

# Create folders
os.makedirs('reports', exist_ok=True)
os.makedirs('assets', exist_ok=True)

# Load data
df = pd.read_csv('data/50_Startups.csv')
X_raw = df.drop('Profit', axis=1)
y = df['Profit']

# Train-test split (80/20, random_state=42)
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
y_train_val = y_train.values
y_test_val = y_test.values

results_summary = []

def add_result(scheme, model, r2, alpha='N/A'):
    results_summary.append({
        'Scheme': scheme,
        'Model': model,
        'R2': r2,
        'Alpha': alpha
    })

# 1. Hold-out Validation (80/20 Split)
print("\nCalculating Scheme 1: Hold-out Validation...")
lr = LinearRegression().fit(X_train, y_train_val)
r2_1_lr = r2_score(y_test_val, lr.predict(X_test))

ridge_1 = Ridge(alpha=1.0, random_state=42).fit(X_train, y_train_val)
r2_1_ridge = r2_score(y_test_val, ridge_1.predict(X_test))

lasso_1 = Lasso(alpha=100.0, random_state=42).fit(X_train, y_train_val)
r2_1_lasso = r2_score(y_test_val, lasso_1.predict(X_test))

add_result('1. Hold-out Validation', 'Linear Regression', r2_1_lr)
add_result('1. Hold-out Validation', 'Ridge', r2_1_ridge, '1.0')
add_result('1. Hold-out Validation', 'Lasso', r2_1_lasso, '100.0')

# 2. K-Fold CV (k=5)
print("Calculating Scheme 2: 5-Fold CV...")
r2_2_lr = cross_val_score(LinearRegression(), X_train, y_train_val, cv=5, scoring='r2').mean()
r2_2_ridge = cross_val_score(Ridge(alpha=1.0, random_state=42), X_train, y_train_val, cv=5, scoring='r2').mean()
r2_2_lasso = cross_val_score(Lasso(alpha=100.0, random_state=42), X_train, y_train_val, cv=5, scoring='r2').mean()

add_result('2. K-Fold CV', 'Linear Regression', r2_2_lr)
add_result('2. K-Fold CV', 'Ridge', r2_2_ridge, '1.0')
add_result('2. K-Fold CV', 'Lasso', r2_2_lasso, '100.0')

# 3. Leave-One-Out CV (LOOCV)
print("Calculating Scheme 3: LOOCV...")
r2_3_lr = cross_val_score(LinearRegression(), X_train, y_train_val, cv=LeaveOneOut(), scoring='r2').mean()
r2_3_ridge = cross_val_score(Ridge(alpha=1.0, random_state=42), X_train, y_train_val, cv=LeaveOneOut(), scoring='r2').mean()
r2_3_lasso = cross_val_score(Lasso(alpha=100.0, random_state=42), X_train, y_train_val, cv=LeaveOneOut(), scoring='r2').mean()

add_result('3. LOOCV', 'Linear Regression', r2_3_lr)
add_result('3. LOOCV', 'Ridge', r2_3_ridge, '1.0')
add_result('3. LOOCV', 'Lasso', r2_3_lasso, '100.0')

# 4. Repeated K-Fold (5-fold x 10 repeats)
print("Calculating Scheme 4: Repeated K-Fold...")
cv_rep = RepeatedKFold(n_splits=5, n_repeats=10, random_state=42)
r2_4_lr = cross_val_score(LinearRegression(), X_train, y_train_val, cv=cv_rep, scoring='r2').mean()
r2_4_ridge = cross_val_score(Ridge(alpha=1.0, random_state=42), X_train, y_train_val, cv=cv_rep, scoring='r2').mean()
r2_4_lasso = cross_val_score(Lasso(alpha=100.0, random_state=42), X_train, y_train_val, cv=cv_rep, scoring='r2').mean()

add_result('4. Repeated K-Fold', 'Linear Regression', r2_4_lr)
add_result('4. Repeated K-Fold', 'Ridge', r2_4_ridge, '1.0')
add_result('4. Repeated K-Fold', 'Lasso', r2_4_lasso, '100.0')

# 5. GridSearchCV (exhaustive alpha grid search, evaluated on Test set)
print("Calculating Scheme 5: GridSearchCV...")
grid = {'alpha': [0.01, 0.1, 1.0, 10.0, 100.0, 500.0, 1000.0, 2000.0]}
gs_ridge = GridSearchCV(Ridge(random_state=42), grid, cv=5, scoring='r2').fit(X_train, y_train_val)
r2_5_ridge = r2_score(y_test_val, gs_ridge.predict(X_test))

gs_lasso = GridSearchCV(Lasso(random_state=42), grid, cv=5, scoring='r2').fit(X_train, y_train_val)
r2_5_lasso = r2_score(y_test_val, gs_lasso.predict(X_test))

add_result('5. GridSearchCV', 'Linear Regression', r2_1_lr) # no parameter to tune
add_result('5. GridSearchCV', 'Ridge', r2_5_ridge, str(gs_ridge.best_params_['alpha']))
add_result('5. GridSearchCV', 'Lasso', r2_5_lasso, str(gs_lasso.best_params_['alpha']))

# 6. RandomizedSearchCV (random alpha sampling, evaluated on Test set)
print("Calculating Scheme 6: RandomizedSearchCV...")
alphas_dist = {'alpha': np.logspace(-3, 3, 100)}
rs_ridge = RandomizedSearchCV(Ridge(random_state=42), alphas_dist, n_iter=20, random_state=42, cv=5).fit(X_train, y_train_val)
r2_6_ridge = r2_score(y_test_val, rs_ridge.predict(X_test))

rs_lasso = RandomizedSearchCV(Lasso(random_state=42), alphas_dist, n_iter=20, random_state=42, cv=5).fit(X_train, y_train_val)
r2_6_lasso = r2_score(y_test_val, rs_lasso.predict(X_test))

add_result('6. RandomizedSearchCV', 'Linear Regression', r2_1_lr)
add_result('6. RandomizedSearchCV', 'Ridge', r2_6_ridge, f"{rs_ridge.best_params_['alpha']:.1f}")
add_result('6. RandomizedSearchCV', 'Lasso', r2_6_lasso, f"{rs_lasso.best_params_['alpha']:.1f}")

# 7. Nested CV (outer 5-fold, inner GridSearch)
print("Calculating Scheme 7: Nested CV...")
cv_outer = KFold(n_splits=5, shuffle=True, random_state=42)
cv_inner = KFold(n_splits=5, shuffle=True, random_state=42)

def run_nested_cv(model, param_grid):
    outer_scores = []
    for train_idx, val_idx in cv_outer.split(X_train, y_train_val):
        X_tr, X_val = X_train[train_idx], X_train[val_idx]
        y_tr, y_val = y_train_val[train_idx], y_train_val[val_idx]
        if param_grid:
            gs = GridSearchCV(model, param_grid, cv=cv_inner, scoring='r2')
            gs.fit(X_tr, y_tr)
            best_model = gs.best_estimator_
        else:
            best_model = model
            best_model.fit(X_tr, y_tr)
        outer_scores.append(r2_score(y_val, best_model.predict(X_val)))
    return np.mean(outer_scores)

r2_7_lr = run_nested_cv(LinearRegression(), {})
r2_7_ridge = run_nested_cv(Ridge(random_state=42), grid)
r2_7_lasso = run_nested_cv(Lasso(random_state=42), grid)

add_result('7. Nested CV', 'Linear Regression', r2_7_lr)
add_result('7. Nested CV', 'Ridge', r2_7_ridge, 'Tuned')
add_result('7. Nested CV', 'Lasso', r2_7_lasso, 'Tuned')

# 8. Bayesian Optimization (evaluates tuned model on Test set)
print("Calculating Scheme 8: Bayesian Optimization...")
def bayesian_opt_tuning(model_class, X, y, cv_split, n_init=5, n_iter=8):
    sampled_x = np.linspace(-3, 3, n_init).tolist()
    sampled_y = []
    for lx in sampled_x:
        alpha = 10**lx
        model = model_class(alpha=alpha, random_state=42)
        score = cross_val_score(model, X, y, cv=cv_split, scoring='r2').mean()
        sampled_y.append(score)
    
    for _ in range(n_iter):
        gp = GaussianProcessRegressor(kernel=ConstantKernel(1.0) * RBF(1.0) + WhiteKernel(1e-3), random_state=42)
        gp.fit(np.array(sampled_x).reshape(-1, 1), np.array(sampled_y))
        
        x_grid = np.linspace(-3, 3, 1000).reshape(-1, 1)
        mu, sigma = gp.predict(x_grid, return_std=True)
        sigma = np.maximum(sigma, 1e-9)
        
        best_y = max(sampled_y)
        improvement = mu - best_y
        z = improvement / sigma
        ei = improvement * norm.cdf(z) + sigma * norm.pdf(z)
        next_x = x_grid[np.argmax(ei)][0]
        
        alpha = 10**next_x
        model = model_class(alpha=alpha, random_state=42)
        score = cross_val_score(model, X, y, cv=cv_split, scoring='r2').mean()
        
        sampled_x.append(next_x)
        sampled_y.append(score)
        
    best_idx = np.argmax(sampled_y)
    best_log_alpha = sampled_x[best_idx]
    return 10**best_log_alpha

best_a_ridge_bo = bayesian_opt_tuning(Ridge, X_train, y_train_val, cv_inner)
m_ridge_bo = Ridge(alpha=best_a_ridge_bo, random_state=42).fit(X_train, y_train_val)
r2_8_ridge = r2_score(y_test_val, m_ridge_bo.predict(X_test))

best_a_lasso_bo = bayesian_opt_tuning(Lasso, X_train, y_train_val, cv_inner)
m_lasso_bo = Lasso(alpha=best_a_lasso_bo, random_state=42).fit(X_train, y_train_val)
r2_8_lasso = r2_score(y_test_val, m_lasso_bo.predict(X_test))

add_result('8. Bayesian Optimization', 'Linear Regression', r2_1_lr)
add_result('8. Bayesian Optimization', 'Ridge', r2_8_ridge, f"{best_a_ridge_bo:.1f}")
add_result('8. Bayesian Optimization', 'Lasso', r2_8_lasso, f"{best_a_lasso_bo:.1f}")

# 9. AIC / BIC (Stores 5-Fold CV R^2 of tuned models for comparability)
print("Calculating Scheme 9: AIC / BIC...")
# Calculate exact AIC/BIC values for the report
n = len(y_train_val)
# Linear Regression OLS
X_train_sm = sm.add_constant(X_train)
sm_model = sm.OLS(y_train_val, X_train_sm).fit()
# Ridge
m_ridge_9 = Ridge(alpha=1.0, random_state=42).fit(X_train, y_train_val)
X_train_ones = np.hstack([np.ones((n, 1)), X_train])
A = np.zeros((6, 6))
np.fill_diagonal(A[1:, 1:], 1.0)
H_ridge = X_train_ones @ np.linalg.inv(X_train_ones.T @ X_train_ones + A) @ X_train_ones.T
edf_ridge = np.trace(H_ridge)
rss_ridge = np.sum((y_train_val - m_ridge_9.predict(X_train))**2)
aic_ridge = n * np.log(2 * np.pi) + n * np.log(rss_ridge / n) + n + 2 * (edf_ridge + 1)
bic_ridge = n * np.log(2 * np.pi) + n * np.log(rss_ridge / n) + n + np.log(n) * (edf_ridge + 1)

# Lasso
m_lasso_9 = Lasso(alpha=1000.0, random_state=42).fit(X_train, y_train_val)
edf_lasso = np.sum(m_lasso_9.coef_ != 0) + 1
rss_lasso = np.sum((y_train_val - m_lasso_9.predict(X_train))**2)
aic_lasso = n * np.log(2 * np.pi) + n * np.log(rss_lasso / n) + n + 2 * (edf_lasso + 1)
bic_lasso = n * np.log(2 * np.pi) + n * np.log(rss_lasso / n) + n + np.log(n) * (edf_lasso + 1)

print(f"  Linear Regression: AIC={sm_model.aic:.0f}, BIC={sm_model.bic:.0f}")
print(f"  Ridge (alpha=1.0): AIC={aic_ridge:.0f}, BIC={bic_ridge:.0f}")
print(f"  Lasso (alpha=1000.0): AIC={aic_lasso:.0f}, BIC={bic_lasso:.0f}")

# For Scheme 9 comparison, store CV R2 for fair comparison
r2_9_lr = r2_2_lr
r2_9_ridge = r2_2_ridge
r2_9_lasso = cross_val_score(Lasso(alpha=1000.0, random_state=42), X_train, y_train_val, cv=5, scoring='r2').mean()

add_result('9. AIC/BIC', 'Linear Regression', r2_9_lr, f"AIC={sm_model.aic:.0f}")
add_result('9. AIC/BIC', 'Ridge', r2_9_ridge, f"AIC={aic_ridge:.0f}")
add_result('9. AIC/BIC', 'Lasso', r2_9_lasso, f"AIC={aic_lasso:.0f}")

# 10. Stratified K-Fold
print("Calculating Scheme 10: Stratified K-Fold...")
y_bins = pd.qcut(y_train_val, q=5, labels=False, duplicates='drop')
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def run_skf(model):
    fold_scores = []
    for train_idx, val_idx in skf.split(X_train, y_bins):
        X_tr, X_val = X_train[train_idx], X_train[val_idx]
        y_tr, y_val = y_train_val[train_idx], y_train_val[val_idx]
        model.fit(X_tr, y_tr)
        fold_scores.append(r2_score(y_val, model.predict(X_val)))
    return np.mean(fold_scores)

r2_10_lr = run_skf(LinearRegression())
r2_10_ridge = run_skf(Ridge(alpha=1.0, random_state=42))
r2_10_lasso = run_skf(Lasso(alpha=100.0, random_state=42))

add_result('10. Stratified K-Fold', 'Linear Regression', r2_10_lr)
add_result('10. Stratified K-Fold', 'Ridge', r2_10_ridge, '1.0')
add_result('10. Stratified K-Fold', 'Lasso', r2_10_lasso, '100.0')

# ======== Print Comparison Table ========
print("\n" + "=" * 60)
print("10 MODEL SELECTION SCHEMES SUMMARY")
print("=" * 60)
summary_df = pd.DataFrame(results_summary)
pivot = summary_df.pivot_table(index='Scheme', columns='Model', values='R2', aggfunc='first')
print(f"\n{'Scheme':30s} {'Linear Reg':>12s} {'Ridge':>12s} {'Lasso':>12s}")
print("-" * 66)
for scheme in pivot.index:
    row = pivot.loc[scheme]
    print(f"{scheme:30s} {row['Linear Regression']:>10.4f}   {row['Ridge']:>10.4f}   {row['Lasso']:>10.4f}")

# ======== Generate and Save Visualization ========
fig, ax = plt.subplots(figsize=(12, 7), facecolor='white')
x = np.arange(len(pivot.index))
width = 0.25

rects1 = ax.bar(x - width, pivot['Linear Regression'], width, label='Linear Regression', color='#1f77b4', alpha=0.85)
rects2 = ax.bar(x, pivot['Ridge'], width, label='Ridge Regression', color='#ff7f0e', alpha=0.85)
rects3 = ax.bar(x + width, pivot['Lasso'], width, label='Lasso Regression', color='#2ca02c', alpha=0.85)

ax.set_ylabel('R-squared (R²)', fontsize=11, fontweight='bold')
ax.set_title('Model Performance Comparison across 10 Selection Schemes', fontsize=14, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels([s.split('. ')[1] for s in pivot.index], rotation=25, ha='right', fontsize=9.5)
ax.set_ylim(0.8, 1.0)
ax.grid(True, linestyle='--', alpha=0.4, color='#c0c0c0', axis='y')
ax.legend(loc='lower right', frameon=True, facecolor='white', edgecolor='none', shadow=True)

# Add value labels on top of bars
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.3f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=7.5, rotation=90)

autolabel(rects1)
autolabel(rects2)
autolabel(rects3)

plt.tight_layout()
plt.savefig('assets/model_selection_10_schemes.png', dpi=150, bbox_inches='tight')
plt.close()
print("\n-> Saved: assets/model_selection_10_schemes.png")
