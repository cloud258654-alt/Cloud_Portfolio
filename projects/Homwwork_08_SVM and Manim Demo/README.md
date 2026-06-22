# SVM Kernel Trick 3D Interactive Demo

A complete educational repository that teaches the SVM kernel trick through three stages: a 3D Manim animation building geometric intuition, a Matplotlib deep-dive into RBF decision surfaces, and a fully interactive Streamlit + Plotly playground.

## Target Audience

- **University students** in introductory machine learning or data mining courses
- **Instructors** looking for classroom visual aids for SVM / kernel methods
- **Self-learners** who want interactive exploration of hyperparameter effects

## Educational Story Architecture

| Phase | Tool | Purpose |
|-------|------|---------|
| **Phase 1** | Manim (3D animation) | Build intuition: lift a 2D concentric-ring dataset into 3D via an explicit polynomial mapping $\phi(x,y) = (x, y, x^2 + y^2)$. Show that a nonlinear 2D problem becomes **linearly separable** in the higher-dimensional feature space. |
| **Phase 2** | Matplotlib 3D | Real RBF SVM behavior: train `SVC(kernel='rbf')` on the same rings dataset and plot the *decision-function landscape* $f(x,y)$ as a 3D surface. Highlight support vectors and the decision boundary. |
| **Phase 3** | Streamlit + Plotly | Full interactive playground. Tune kernel type, C, gamma, degree, noise, and dataset size in real time. Explore 2D contours, 3D surfaces, and dynamic teaching notes that warn about overfitting/underfitting. |

## Live Demo

The Phase 3 interactive playground is deployed on Streamlit Community Cloud — no installation needed to try it:

**[![Open in Streamlit](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://cloudportfolio-2ylxy2lbvefaladuuktunk.streamlit.app/)**

🔗 **https://cloudportfolio-2ylxy2lbvefaladuuktunk.streamlit.app/**

Run it locally in under 60 seconds:

```bash
pip install -r requirements.txt
streamlit run phase3_streamlit_app.py
# Open http://localhost:8501
```

> Use the sidebar to switch kernels, tweak C, gamma, noise, and dataset size. Plots update instantly.

## Installation (Full)

```bash
git clone <your-repo-url>
cd svm-kernel-trick-3d-demo
pip install -r requirements-dev.txt
```

### Dependencies

- `manim` — mathematical animation engine
- `numpy` — numerical computation
- `scikit-learn` — SVM implementation
- `matplotlib` — static 3D visualization
- `streamlit` — interactive web app framework
- `plotly` — interactive 3D charts
- `pandas` — data handling (utility)

### Additional requirements for Manim

Manim requires a LaTeX distribution to render `MathTex` objects:

- **Windows**: Install [MiKTeX](https://miktex.org/)
- **macOS**: Install [MacTeX](https://tug.org/mactex/)
- **Linux**: `sudo apt install texlive texlive-latex-extra`

## Execution Commands

### Phase 1 — Manim 3D Animation

**Low quality** (faster render, good for preview):
```bash
manim -pql phase1_manim_kernel_trick.py SVMKernelTrick3D
```

**High quality** (4K, for presentations):
```bash
manim -pqh phase1_manim_kernel_trick.py SVMKernelTrick3D
```

Flags: `-p` = preview after render, `-ql` = quality low (480p15), `-qh` = quality high (2160p60).

### Phase 2 — RBF Decision Surface (Matplotlib)

```bash
python phase2_rbf_decision_surface.py
```

This opens a Matplotlib window with two side-by-side panels:
- **Left**: 2D contour plot with decision boundary, margins, and support vectors
- **Right**: 3D surface of the RBF decision function $f(x,y)$

Close the window to exit.

### Phase 3 — Interactive Streamlit App

```bash
streamlit run phase3_streamlit_app.py
```

Opens in your browser at `http://localhost:8501`. Use the sidebar to change any parameter — the plots update in real time.

## Important Mathematical Note

**$\phi(x,y) = (x, y, x^2 + y^2)$ is a teaching metaphor**, not how the RBF kernel actually works.

- **Phase 1** uses an *explicit* polynomial feature map so we can literally "lift" points in 3D. This concretely demonstrates **why** higher-dimensional spaces help — a circle in 2D becomes a paraboloid intersection in 3D, and a flat hyperplane separates the two rings.
- **The real RBF kernel** ($K(x, x') = \exp(-\gamma \lVert x - x' \rVert^2)$) maps into an **infinite-dimensional** Hilbert space. That space cannot be drawn.
- **Phase 2 and Phase 3** visualize the **decision function** $f(x,y)$ evaluated over the original 2D input plane — this is the *learned scoring landscape*, not the feature-space geometry itself.

Understanding this distinction is the core insight this project aims to teach.

## Teaching Suggestions

1. **Lecture order**: Phase 1 → Phase 2 → Phase 3. Start with the geometric intuition, then connect it to real SVM behavior, and finally let students experiment freely.

2. **Phase 1 in the classroom**:
   - Pause at the "No straight line can separate them in 2D" moment and ask students to brainstorm solutions.
   - After showing the lifting, ask: *"What other functions $\phi$ would work?"* (e.g., $x^2 - y^2$, $xy$, etc.)

3. **Phase 3 workshop prompts**:
   - *"Set kernel=linear. What happens? Why?"* — reinforces that linear SVMs fail on nonlinear data.
   - *"Set gamma=10. Describe the boundary shape. Is this overfitting?"* — teaches the bias-variance tradeoff.
   - *"Set C=0.1. What does the margin look like? Count the support vectors."* — demonstrates soft-margin behavior.
   - *"Switch between rbf and poly with degree=2. Which produces a more circular boundary? Why?"*

4. **Assessment ideas**:
   - Have students reproduce the concentric-rings experiment and determine the smallest gamma that achieves >95% accuracy.
   - Ask students to explain in their own words why a linear SVM fails on the rings dataset but an RBF SVM succeeds.

## Repository Structure

```
.
├── requirements.txt           # Streamlit Cloud / Phase 2 & 3
├── requirements-dev.txt       # Full local install (includes Manim)
├── README.md
├── utils/
│   ├── __init__.py
│   ├── data_generator.py      # Concentric rings dataset generator
│   └── svm_utils.py           # SVM training + grid helpers
├── phase1_manim_kernel_trick.py   # Manim 3D animation
├── phase2_rbf_decision_surface.py # Matplotlib static visualization
└── phase3_streamlit_app.py        # Streamlit interactive playground
```

## License

This project is intended for educational use. Feel free to adapt and share.
