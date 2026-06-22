import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.svm import SVC
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.data_generator import generate_ring_dataset
from utils.svm_utils import make_decision_grid


print("=" * 68)
print("  PHASE 2 — RBF SVM Decision Surface Visualization")
print("=" * 68)
print()
print("  The RBF kernel maps data into an infinite-dimensional feature space.")
print("  That space cannot be drawn directly. What we visualize here is the")
print("  decision-function landscape  f(x, y)  over the original 2D plane —")
print("  i.e. the *evaluation* of the learned boundary, not the feature map itself.")
print()
print("  Think of  f(x, y)  as a \"score\" surface: positive = predicted outer ring,")
print("  negative = predicted inner ring. The zero-crossing is the decision boundary.")
print("=" * 68)
print()

X, y = generate_ring_dataset(noise=0.08, random_seed=7)

model = SVC(kernel="rbf", C=10.0, gamma=1.0)
model.fit(X, y)

xx, yy, grid_points = make_decision_grid(
    x_range=(-3.2, 3.2), y_range=(-3.2, 3.2), resolution=120
)
Z = model.decision_function(grid_points).reshape(xx.shape)

fig = plt.figure(figsize=(16, 7))
fig.suptitle(
    "RBF SVM on Concentric Rings  |  C=10  gamma=1.0",
    fontsize=15,
    fontweight="bold",
)

ax1 = fig.add_subplot(1, 2, 1)
ax1.set_title("2D View — Decision Boundary & Margins", fontsize=12, fontweight="bold")
ax1.set_xlim(-3.2, 3.2)
ax1.set_ylim(-3.2, 3.2)
ax1.set_xlabel("x")
ax1.set_ylabel("y")
ax1.set_aspect("equal")

ax1.contourf(xx, yy, Z, levels=50, cmap="coolwarm", alpha=0.5)
cs = ax1.contour(xx, yy, Z, levels=[0], colors="yellow", linewidths=2.5)
ax1.contour(xx, yy, Z, levels=[-1, 1], colors="yellow", linewidths=1.5, linestyles="--")

ax1.scatter(X[y == 0, 0], X[y == 0, 1], c="blue", s=40, edgecolors="black", linewidths=0.5, label="Inner (class 0)", zorder=5)
ax1.scatter(X[y == 1, 0], X[y == 1, 1], c="red", s=40, edgecolors="black", linewidths=0.5, label="Outer (class 1)", zorder=5)

sv = model.support_vectors_
ax1.scatter(
    sv[:, 0], sv[:, 1],
    facecolors="none", edgecolors="cyan", s=140, linewidths=2,
    label=f"Support Vectors ({len(sv)})", zorder=6,
)

ax1.legend(loc="upper right", fontsize=8)
acc = model.score(X, y) * 100
ax1.text(
    0.02, 0.02, f"Train Acc = {acc:.1f}%",
    transform=ax1.transAxes, fontsize=10,
    bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.85),
)

ax2 = fig.add_subplot(1, 2, 2, projection="3d")
ax2.set_title("3D View — Decision Function $f(x, y)$", fontsize=12, fontweight="bold")
ax2.set_xlabel("x")
ax2.set_ylabel("y")
ax2.set_zlabel("f(x, y)")

surf = ax2.plot_surface(
    xx, yy, Z, cmap="coolwarm", alpha=0.55, linewidth=0, antialiased=True
)

ax2.contour(xx, yy, Z, levels=[0], colors="yellow", linewidths=2.5, zdir="z", offset=Z.min() - 0.5)

Z_points = model.decision_function(X)
ax2.scatter(
    X[y == 0, 0], X[y == 0, 1], Z_points[y == 0],
    c="blue", s=30, edgecolors="black", linewidths=0.5, depthshade=True, label="Inner"
)
ax2.scatter(
    X[y == 1, 0], X[y == 1, 1], Z_points[y == 1],
    c="red", s=30, edgecolors="black", linewidths=0.5, depthshade=True, label="Outer"
)
ax2.scatter(
    sv[:, 0], sv[:, 1], model.decision_function(sv),
    facecolors="none", edgecolors="cyan", s=100, linewidths=2,
    depthshade=False, label="Support Vectors", zorder=10,
)

ax2.legend(loc="upper left", fontsize=7)

plt.tight_layout()
plt.show()
