import sys
import os
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.data_generator import generate_ring_dataset
from utils.svm_utils import train_svm, make_decision_grid, compute_decision_surface

import streamlit as st
import plotly.graph_objects as go

st.set_page_config(
    page_title="SVM Kernel Trick 3D Demo",
    page_icon="🧠",
    layout="wide",
)

st.title("🎯 Interactive SVM Kernel Trick 3D Demo")

with st.sidebar:
    st.header("⚙️ Model & Data Controls")

    kernel = st.selectbox(
        "Kernel",
        options=["rbf", "linear", "poly", "sigmoid"],
        index=0,
        help="SVM kernel type. RBF is the most common for nonlinear problems.",
    )

    C = st.slider(
        "C (Regularization)",
        min_value=0.1,
        max_value=100.0,
        value=10.0,
        step=0.1,
        help="Small C → wider margin, more misclassification tolerated. Large C → harder margin.",
    )

    gamma = st.slider(
        "gamma",
        min_value=0.01,
        max_value=10.0,
        value=1.0,
        step=0.01,
        help="Kernel coefficient. High gamma → tighter fit, risk of overfitting.",
        disabled=(kernel == "linear"),
    )

    degree = st.slider(
        "degree (poly only)",
        min_value=2,
        max_value=6,
        value=3,
        step=1,
        help="Polynomial kernel degree.",
        disabled=(kernel != "poly"),
    )

    noise = st.slider(
        "Data Noise",
        min_value=0.0,
        max_value=0.5,
        value=0.08,
        step=0.01,
        help="Gaussian noise added to the ring data points.",
    )

    n_points = st.slider(
        "Number of Points",
        min_value=40,
        max_value=300,
        value=120,
        step=5,
        help="Total data points (split evenly between inner and outer rings).",
    )

    random_seed = st.number_input(
        "Random Seed",
        min_value=0,
        max_value=9999,
        value=7,
        step=1,
    )

GRID_RESOLUTION = 80


@st.cache_data
def cached_generate_ring_dataset(
    n_inner, n_outer, noise, random_seed
):
    X, y = generate_ring_dataset(
        n_inner=n_inner,
        n_outer=n_outer,
        noise=noise,
        random_seed=random_seed,
    )
    return X, y


@st.cache_data
def cached_train_svm_and_surface(X, y, kernel, C, gamma, degree):
    X_copy = X.copy()
    y_copy = y.copy()

    params = {"kernel": kernel, "C": C}
    if kernel != "linear":
        params["gamma"] = gamma
    if kernel == "poly":
        params["degree"] = degree

    model = train_svm(X_copy, y_copy, **params)

    x_range = (-3.2, 3.2)
    y_range = (-3.2, 3.2)
    xx, yy, grid_points = make_decision_grid(
        x_range=x_range,
        y_range=y_range,
        resolution=GRID_RESOLUTION,
    )
    Z_decision = compute_decision_surface(model, grid_points, xx)

    return model, xx, yy, Z_decision, x_range, y_range


n_inner = n_points // 2
n_outer = n_points - n_inner

X, y = cached_generate_ring_dataset(
    n_inner=n_inner, n_outer=n_outer, noise=noise, random_seed=random_seed
)

model, xx, yy, Z_decision, x_range, y_range = cached_train_svm_and_surface(
    X, y, kernel=kernel, C=C, gamma=gamma, degree=degree
)

support_vectors = model.support_vectors_

accuracy = model.score(X, y) * 100

st.markdown("---")
st.markdown("## 📘 Concept Overview")
st.markdown(
    """
    **Support Vector Machines (SVM)** find the optimal hyperplane that separates two classes
    with the maximum margin. When data is not linearly separable in its original space, the **kernel trick**
    implicitly maps the data into a higher-dimensional *feature space* where linear separation is possible —
    without ever computing the coordinates in that space explicitly.

    This demo uses a **concentric rings dataset** — two nested circles that cannot be separated
    by a straight line in 2D. Choose a kernel and tune the hyperparameters to see how the SVM
    constructs a nonlinear decision boundary.
    """,
)

st.markdown("---")
st.markdown("## 📊 2D Decision Boundary")

col1, col2 = st.columns([3, 1])

with col1:
    fig2d = go.Figure()

    fig2d.add_trace(
        go.Contour(
            z=Z_decision,
            x=np.linspace(x_range[0], x_range[1], GRID_RESOLUTION),
            y=np.linspace(y_range[0], y_range[1], GRID_RESOLUTION),
            colorscale="RdBu",
            contours=dict(
                coloring="fill",
                showlabels=False,
            ),
            colorbar=dict(title="f(x, y)", x=1.02),
            opacity=0.4,
            name="Decision f(x, y)",
            showscale=True,
        )
    )

    fig2d.add_trace(
        go.Contour(
            z=Z_decision,
            x=np.linspace(x_range[0], x_range[1], GRID_RESOLUTION),
            y=np.linspace(y_range[0], y_range[1], GRID_RESOLUTION),
            contours=dict(
                type="constraint",
                coloring="lines",
                showlabels=True,
                labelfont=dict(size=10, color="black"),
            ),
            line=dict(width=1.5, dash="dash", color="gray"),
            showscale=False,
            name="Level sets",
            hoverinfo="skip",
        )
    )

    fig2d.add_trace(
        go.Contour(
            z=Z_decision,
            x=np.linspace(x_range[0], x_range[1], GRID_RESOLUTION),
            y=np.linspace(y_range[0], y_range[1], GRID_RESOLUTION),
            contours=dict(
                type="constraint",
                coloring="lines",
                showlabels=False,
            ),
            line=dict(width=3, color="#FFD700"),
            showscale=False,
            name="Boundary f=0",
        )
    )

    fig2d.add_trace(
        go.Scatter(
            x=X[y == 0, 0],
            y=X[y == 0, 1],
            mode="markers",
            marker=dict(
                color="#1f77b4",
                size=7,
                line=dict(width=0.5, color="black"),
            ),
            name="Inner (class 0)",
            hovertemplate="x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>",
        )
    )

    fig2d.add_trace(
        go.Scatter(
            x=X[y == 1, 0],
            y=X[y == 1, 1],
            mode="markers",
            marker=dict(
                color="#d62728",
                size=7,
                line=dict(width=0.5, color="black"),
            ),
            name="Outer (class 1)",
            hovertemplate="x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>",
        )
    )

    fig2d.add_trace(
        go.Scatter(
            x=support_vectors[:, 0],
            y=support_vectors[:, 1],
            mode="markers",
            marker=dict(
                size=14,
                color="rgba(0,255,255,0.0)",
                line=dict(width=2.5, color="#00FFFF"),
                symbol="circle-open",
            ),
            name=f"Support Vectors ({len(support_vectors)})",
            hovertemplate="SV<br>x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>",
        )
    )

    fig2d.update_layout(
        xaxis=dict(
            title="x",
            scaleanchor="y",
            scaleratio=1,
            range=[-3.4, 3.4],
            constrain="domain",
        ),
        yaxis=dict(
            title="y",
            range=[-3.4, 3.4],
        ),
        width=700,
        height=550,
        margin=dict(l=40, r=40, t=20, b=40),
        legend=dict(
            x=1.02, y=1.0, xanchor="left", yanchor="top",
            font=dict(size=10),
        ),
        hovermode="closest",
    )

    st.plotly_chart(fig2d, use_container_width=True)

with col2:
    st.markdown("### Legend")
    st.markdown("🔵 **Blue dots** — Inner ring (class 0)")
    st.markdown("🔴 **Red dots** — Outer ring (class 1)")
    st.markdown(
        "🟡 **Gold curve** — Decision boundary \\(f(x,y)=0\\)"
    )
    st.markdown("🟦 **Cyan circles** — Support vectors")
    st.markdown(
        "⬜ **Dashed lines** — Level sets"
    )
    st.markdown("---")
    st.markdown("### Interpretation")
    st.markdown(
        "The decision boundary \\(f(x,y)=0\\) separates the two classes. "
        "Points where \\(f > 0\\) are classified as outer; \\(f < 0\\) as inner. "
        "Support vectors (cyan circles) are the critical data points that define the margin."
    )

st.markdown("---")
st.markdown("## 🌐 3D Decision Function Surface")

col_a, col_b = st.columns([3, 1])

with col_a:
    xs = np.linspace(x_range[0], x_range[1], GRID_RESOLUTION)
    ys = np.linspace(y_range[0], y_range[1], GRID_RESOLUTION)

    fig3d = go.Figure()

    z_min = float(Z_decision.min())
    z_max = float(Z_decision.max())
    z_offset = z_min - 0.5
    z_range_3d = [z_offset, z_max + 0.5]

    fig3d.add_trace(
        go.Surface(
            z=Z_decision,
            x=xs,
            y=ys,
            colorscale="RdBu",
            opacity=0.7,
            contours=dict(
                x=dict(show=False),
                y=dict(show=False),
                z=dict(
                    show=True,
                    usecolormap=False,
                    highlightcolor="gold",
                    project=dict(z=False),
                    width=2,
                ),
            ),
            colorbar=dict(
                title="f(x, y)",
                x=1.02,
                len=0.75,
            ),
            name="Decision Surface",
            hovertemplate="x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.3f}<extra></extra>",
        )
    )

    fig3d.add_trace(
        go.Surface(
            z=np.zeros_like(Z_decision) + z_offset,
            x=xs,
            y=ys,
            colorscale=[[0, "lightgray"], [1, "lightgray"]],
            opacity=0.2,
            showscale=False,
            name="Reference plane (z=0)",
            hoverinfo="skip",
        )
    )

    point_z = model.decision_function(X)

    fig3d.add_trace(
        go.Scatter3d(
            x=X[y == 0, 0],
            y=X[y == 0, 1],
            z=point_z[y == 0],
            mode="markers",
            marker=dict(
                color="#1f77b4",
                size=4,
                line=dict(width=0.5, color="black"),
            ),
            name="Inner (class 0)",
            hovertemplate="x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.3f}<extra></extra>",
        )
    )

    fig3d.add_trace(
        go.Scatter3d(
            x=X[y == 1, 0],
            y=X[y == 1, 1],
            z=point_z[y == 1],
            mode="markers",
            marker=dict(
                color="#d62728",
                size=4,
                line=dict(width=0.5, color="black"),
            ),
            name="Outer (class 1)",
            hovertemplate="x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.3f}<extra></extra>",
        )
    )

    fig3d.add_trace(
        go.Scatter3d(
            x=support_vectors[:, 0],
            y=support_vectors[:, 1],
            z=model.decision_function(support_vectors),
            mode="markers",
            marker=dict(
                size=7,
                color="rgba(0,255,255,0.0)",
                line=dict(width=2.5, color="#00FFFF"),
                symbol="circle-open",
            ),
            name=f"Support Vectors ({len(support_vectors)})",
            hovertemplate="SV<br>x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.3f}<extra></extra>",
        )
    )

    fig3d.update_layout(
        scene=dict(
            xaxis=dict(title="x", range=[-3.4, 3.4]),
            yaxis=dict(title="y", range=[-3.4, 3.4]),
            zaxis=dict(title="f(x, y)", range=z_range_3d),
            camera=dict(
                eye=dict(x=1.6, y=1.6, z=1.2),
            ),
            aspectmode="manual",
            aspectratio=dict(x=1, y=1, z=0.8),
        ),
        width=750,
        height=600,
        margin=dict(l=0, r=0, t=20, b=0),
        legend=dict(
            x=1.02, y=1.0, xanchor="left", yanchor="top",
            font=dict(size=10),
        ),
        hovermode="closest",
    )

    st.plotly_chart(fig3d, use_container_width=True)

with col_b:
    st.markdown("### Reading the 3D Plot")
    st.markdown(
        "The surface shows \\(f(x,y)\\), the SVM decision function "
        "evaluated over the 2D input plane."
    )
    st.markdown(
        "- **Red regions** → \\(f>0\\) → classified as outer ring"
    )
    st.markdown(
        "- **Blue regions** → \\(f<0\\) → classified as inner ring"
    )
    st.markdown(
        "- **Gold contour** → \\(f=0\\) → decision boundary"
    )
    st.markdown("---")
    st.markdown("### Interaction Tips")
    st.markdown("🖱️ **Drag** to rotate the view")
    st.markdown("🖱️ **Scroll** to zoom in/out")
    st.markdown("🖱️ **Right-drag** to pan")

st.markdown("---")
st.markdown("## 📈 Model Metrics")

metric_cols = st.columns(3)

with metric_cols[0]:
    st.metric(
        label="Training Accuracy",
        value=f"{accuracy:.1f}%",
    )

with metric_cols[1]:
    st.metric(
        label="Support Vectors",
        value=len(support_vectors),
        delta=f"{len(support_vectors) - n_points // 3} vs ~n/3",
    )

with metric_cols[2]:
    st.metric(
        label="Kernel",
        value=kernel.upper(),
    )

st.markdown("---")
st.markdown("## 💡 Dynamic Teaching Notes")

notes = []

if kernel == "rbf" and gamma > 3.0:
    notes.append(
        "⚠️ **High gamma warning:** With gamma > 3, the RBF kernel creates highly "
        "localized influence regions. The decision boundary becomes very wiggly — "
        "this is classic **overfitting**. Each point essentially gets its own "
        "little island of influence. Try lowering gamma to see a smoother boundary."
    )

if kernel == "rbf" and gamma < 0.1:
    notes.append(
        "ℹ️ **Low gamma notice:** With gamma < 0.1, the RBF kernel becomes very "
        "broad. The decision boundary approaches a simple circle, but may lose "
        "precision on the training data. This is **underfitting** — the model "
        "is too simple to capture the data structure."
    )

if C < 1.0:
    notes.append(
        "🟢 **Soft margin regime (C < 1):** A small C value allows more "
        "misclassifications (slack). The margin is wider and the boundary "
        "is smoother, but training accuracy may drop. This is the **soft-margin SVM** "
        "behavior — trading off perfect separation for better generalization."
    )

if C > 50.0:
    notes.append(
        "🔴 **Hard margin regime (C > 50):** A very large C penalizes "
        "misclassifications heavily. The model tries to classify every training "
        "point correctly, potentially overfitting to noise."
    )

if kernel == "linear":
    notes.append(
        "📏 **Linear kernel:** A linear SVM tries to draw a straight line (hyperplane) "
        "through the data. For concentric rings, this will always fail — "
        "you should see very poor accuracy, which demonstrates why nonlinear "
        "kernels like RBF are essential for this dataset."
    )

if kernel == "poly":
    notes.append(
        "📐 **Polynomial kernel (degree={}):** Maps data using polynomial features "
        "of the given degree. Higher degrees create more complex boundaries. "
        "This is the original kernel trick idea — computing inner products in an "
        "explicit polynomial feature space without constructing it directly.".format(degree)
    )

if kernel == "sigmoid":
    notes.append(
        "🌀 **Sigmoid kernel:** Behaves similarly to a two-layer neural network "
        "perceptron. It originates from the connection between SVMs and neural "
        "networks. However, the sigmoid kernel is not positive definite for all "
        "parameter choices, which can lead to optimization issues."
    )

if len(support_vectors) > n_points * 0.7:
    notes.append(
        "📊 **High SV count:** More than 70% of training points are support vectors. "
        "This is a sign that the model is overfitting — nearly every point "
        "is needed to define the boundary. Consider simplifying the model."
    )

if not notes:
    notes.append(
        "✅ **Balanced configuration:** The current parameters produce a reasonable "
        "decision boundary. The concentric rings are well separated. Experiment "
        "with the sliders to see how overfitting and underfitting manifest."
    )

for note in notes:
    st.info(note)

st.markdown("---")
st.caption(
    "Built for education  |  SVM Kernel Trick 3D Interactive Demo  |  "
    "Uses scikit-learn SVC with Plotly visualizations"
)
