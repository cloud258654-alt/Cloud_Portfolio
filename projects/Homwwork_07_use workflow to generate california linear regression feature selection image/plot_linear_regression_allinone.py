import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, LassoCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_selection import SelectKBest, f_regression, mutual_info_regression, RFE, SequentialFeatureSelector
from sklearn.metrics import r2_score, mean_squared_error
from scipy.stats import spearmanr

# ==============================================================================
# 1. Load and Prepare Data
# ==============================================================================
# Set style for premium publication look
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Liberation Sans']

# Load dataset
df = pd.read_csv("boston_housing.csv")

X = df.drop(columns=['medv'])
y = df['medv']

# Split data using random_state=42 (to match solve_linear_regression_crispdm.py)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Preprocessing: Scale all 13 features
feature_cols = list(X.columns)
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), feature_cols)
    ]
)

X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)
feature_names = np.array(feature_cols)

# ==============================================================================
# 2. Compute Feature Rankings for 9 Algorithms
# ==============================================================================

# 1. Pearson Correlation
pearson_scores = [abs(np.corrcoef(X_train_processed[:, i], y_train)[0, 1]) for i in range(X_train_processed.shape[1])]
pearson_rank_order = np.argsort(pearson_scores)[::-1]

# 2. Spearman Correlation
spearman_scores = [abs(spearmanr(X_train_processed[:, i], y_train)[0]) for i in range(X_train_processed.shape[1])]
spearman_rank_order = np.argsort(spearman_scores)[::-1]

# 3. Variance Threshold - KICKED OUT from stepwise evaluation plot

# 4. F-test Regression
f_selector = SelectKBest(score_func=f_regression, k='all')
f_selector.fit(X_train_processed, y_train)
f_rank_order = np.argsort(f_selector.scores_)[::-1]

# 5. Mutual Information Regression
mi_scores = mutual_info_regression(X_train_processed, y_train, random_state=42)
mi_rank_order = np.argsort(mi_scores)[::-1]

# 6. RFE (with LinearRegression)
rfe = RFE(estimator=LinearRegression(), n_features_to_select=1)
rfe.fit(X_train_processed, y_train)
rfe_rank_order = np.argsort(rfe.ranking_)

# 7. SFS (Forward)
sfs_forward_features = []
for k in range(1, 14):
    if k == 13:
        sfs_forward_features.append(np.arange(X_train_processed.shape[1]))
    else:
        sfs = SequentialFeatureSelector(LinearRegression(), n_features_to_select=k, direction="forward", cv=3)
        sfs.fit(X_train_processed, y_train)
        sfs_forward_features.append(np.where(sfs.get_support())[0])

sfs_f_rank_order = []
for k in range(13):
    for idx in sfs_forward_features[k]:
        if idx not in sfs_f_rank_order:
            sfs_f_rank_order.append(idx)
            break
for i in range(13):
    if i not in sfs_f_rank_order:
        sfs_f_rank_order.append(i)

# 8. SBS (Backward)
sfs_backward_features = []
for k in range(1, 14):
    if k == 13:
        sfs_backward_features.append(np.arange(X_train_processed.shape[1]))
    else:
        sfs = SequentialFeatureSelector(LinearRegression(), n_features_to_select=k, direction="backward", cv=3)
        sfs.fit(X_train_processed, y_train)
        sfs_backward_features.append(np.where(sfs.get_support())[0])

sfs_b_rank_order = []
sfs_b_rank_order.append(sfs_backward_features[0][0])
for k in range(1, 13):
    for idx in sfs_backward_features[k]:
        if idx not in sfs_b_rank_order:
            sfs_b_rank_order.append(idx)
            break
for i in range(13):
    if i not in sfs_b_rank_order:
        sfs_b_rank_order.append(i)

# 9. Lasso (L1)
lasso = LassoCV(cv=3, random_state=42)
lasso.fit(X_train_processed, y_train)
lasso_rank_order = np.argsort(abs(lasso.coef_))[::-1]

# 10. Random Forest Feature Importance
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train_processed, y_train)
rf_rank_order = np.argsort(rf.feature_importances_)[::-1]

# ==============================================================================
# 3. Evaluate Stepwise Models
# ==============================================================================
methods = {
    "Pearson Corr": lambda k: pearson_rank_order[:k],
    "Spearman Corr": lambda k: spearman_rank_order[:k],
    "F-test Reg": lambda k: f_rank_order[:k],
    "Mutual Info": lambda k: mi_rank_order[:k],
    "RFE": lambda k: rfe_rank_order[:k],
    "SFS (Forward)": lambda k: sfs_f_rank_order[:k],
    "SBS (Backward)": lambda k: sfs_b_rank_order[:k],
    "Lasso (L1)": lambda k: lasso_rank_order[:k],
    "Random Forest": lambda k: rf_rank_order[:k]
}

eval_results = {name: {"R2": [], "MSE": []} for name in methods}
ks = list(range(1, 14))

for m_name, get_indices in methods.items():
    for k in ks:
        indices = get_indices(k)
        X_tr = X_train_processed[:, indices]
        X_te = X_test_processed[:, indices]
        
        model = LinearRegression()
        model.fit(X_tr, y_train)
        y_pred = model.predict(X_te)
        
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        
        eval_results[m_name]["R2"].append(r2)
        eval_results[m_name]["MSE"].append(mse)

# ==============================================================================
# 4. Generate Publication-Quality Plot
# ==============================================================================
fig = plt.figure(figsize=(16, 9.5))
# GridSpec: 2 columns in the top row for plots, and 1 full-width row at the bottom for the table
gs = fig.add_gridspec(2, 2, height_ratios=[1.2, 0.65], hspace=0.3, wspace=0.22)

ax1 = fig.add_subplot(gs[0, 0])  # Top Left: R-squared
ax2 = fig.add_subplot(gs[0, 1])  # Top Right: MSE
ax3 = fig.add_subplot(gs[1, :])   # Bottom: Full-width Table

# Set 10 distinct colors using matplotlib's tab10 qualitative palette
import matplotlib
color_palette = matplotlib.colormaps['tab10']
colors = {name: color_palette(i) for i, name in enumerate(methods)}

markers = {
    "Pearson Corr": "o",
    "Spearman Corr": "v",
    "F-test Reg": "<",
    "Mutual Info": ">",
    "RFE": "s",
    "SFS (Forward)": "p",
    "SBS (Backward)": "*",
    "Lasso (L1)": "D",
    "Random Forest": "h"
}

# Plot R-squared and MSE curves
for m_name in methods:
    ax1.plot(ks, eval_results[m_name]["R2"], label=m_name, color=colors[m_name], 
             marker=markers[m_name], markersize=5, linewidth=1.8, alpha=0.85)
    ax2.plot(ks, eval_results[m_name]["MSE"], label=m_name, color=colors[m_name], 
             marker=markers[m_name], markersize=5, linewidth=1.8, alpha=0.85)

# Subplot 1 (R-squared) styling
ax1.set_title("Test R-squared Score by Feature Subset Size", fontsize=13, fontweight='bold', pad=10)
ax1.set_xlabel("Number of Features in Model", fontsize=11, fontweight='semibold', labelpad=8)
ax1.set_ylabel("Test R-squared ($R^2$)", fontsize=10, fontweight='semibold')
ax1.set_xticks(ks)
ax1.set_xlim(1, 13)
ax1.set_ylim(0.25, 0.75)
ax1.grid(True, linestyle="--", alpha=0.6)

# Subplot 2 (MSE) styling
ax2.set_title("Test MSE by Feature Subset Size", fontsize=13, fontweight='bold', pad=10)
ax2.set_xlabel("Number of Features in Model", fontsize=11, fontweight='semibold', labelpad=8)
ax2.set_ylabel("Test Mean Squared Error (MSE)", fontsize=10, fontweight='semibold')
ax2.set_xticks(ks)
ax2.set_xlim(1, 13)
ax2.set_ylim(20.0, 65.0)
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, loc: "{:.1f}".format(x)))
ax2.grid(True, linestyle="--", alpha=0.6)

# Highlight sweet spot (k=3 for Boston Housing)
for ax in [ax1, ax2]:
    ax.axvline(x=3, color="#b91c1c", linestyle=":", linewidth=2.0, alpha=0.7)
    
ax1.text(3.2, 0.30, "Sweet Spot (k=3)", color="#b91c1c", fontsize=9.5, fontweight='bold')
ax2.text(3.2, 60.0, "Sweet Spot (k=3)", color="#b91c1c", fontsize=9.5, fontweight='bold')

# ── Performance Frontier: best method at each k ──────────────────────────────
best_r2_per_k = []
best_mse_per_k = []
for k in ks:
    r2_vals = [eval_results[m]["R2"][k-1] for m in methods]
    mse_vals = [eval_results[m]["MSE"][k-1] for m in methods]
    best_r2_per_k.append(max(r2_vals))
    best_mse_per_k.append(min(mse_vals))

ax1.plot(ks, best_r2_per_k, color="#f59e0b", linewidth=2.5, linestyle="--",
         marker="D", markersize=6, zorder=10, label="Best (Frontier)", alpha=0.95)
ax2.plot(ks, best_mse_per_k, color="#f59e0b", linewidth=2.5, linestyle="--",
         marker="D", markersize=6, zorder=10, label="Best (Frontier)", alpha=0.95)

# Update legends to include frontier entry
ax1.legend(loc='lower right', ncol=2, frameon=True, facecolor='white', edgecolor='lightgray', fontsize=8.5)
ax2.legend(loc='upper right', ncol=2, frameon=True, facecolor='white', edgecolor='lightgray', fontsize=8.5)


# ==============================================================================
# 5. Add Feature Selection Ranking Table at the Bottom
# ==============================================================================
ax3.axis('off')

# Prepare table data for 9 columns and all 13 ranks
headers = ["Rank", "Pearson", "Spearman", "F-test", "Mutual Info", "RFE", "SFS (Fwd)", "SBS (Bwd)", "Lasso (L1)", "Random Forest"]
row_data = []
for r in range(13):
    row_data.append([
        f"Rank {r+1}",
        feature_names[pearson_rank_order[r]],
        feature_names[spearman_rank_order[r]],
        feature_names[f_rank_order[r]],
        feature_names[mi_rank_order[r]],
        feature_names[rfe_rank_order[r]],
        feature_names[sfs_f_rank_order[r]],
        feature_names[sfs_b_rank_order[r]],
        feature_names[lasso_rank_order[r]],
        feature_names[rf_rank_order[r]]
    ])

table = ax3.table(
    cellText=row_data, 
    colLabels=headers, 
    loc='center',
    cellLoc='center'
)

# Style the table cells
table.auto_set_font_size(False)
table.set_fontsize(7.0) 
table.scale(1.0, 1.25)

for (row, col), cell in table.get_celld().items():
    # Style headers
    if row == 0:
        cell.set_text_props(weight='bold', color='white')
        cell.set_facecolor('#1e293b') # Slate 800 background
    else:
        # Highlight top 3 ranks (common selections: rm, lstat, ptratio)
        if row in [1, 2, 3]:
            cell.set_text_props(weight='bold', color='#1e293b')
            cell.set_facecolor('#f1f5f9') # light highlight
        else:
            cell.set_facecolor('#ffffff')
            
    cell.set_linewidth(0.8)
    cell.set_edgecolor('#cbd5e1')

plt.suptitle("CRISP-DM Step 4: 9 Feature Selection Algorithms Stepwise Evaluation (Boston Housing)", fontsize=15, fontweight='bold', y=0.96)

# Save plot
plot_path = "feature_selection_performance_allinone.png"
plt.savefig(plot_path, dpi=300, bbox_inches='tight')
print(f"Successfully generated and saved plot to {plot_path}")
