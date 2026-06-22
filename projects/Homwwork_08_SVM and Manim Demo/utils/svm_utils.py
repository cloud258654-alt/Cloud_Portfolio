import numpy as np
from sklearn.svm import SVC


def train_svm(X, y, kernel="rbf", C=10.0, gamma=1.0, degree=3):
    params = {"kernel": kernel, "C": C}
    if kernel != "linear":
        params["gamma"] = gamma
    if kernel == "poly":
        params["degree"] = degree
    model = SVC(**params)
    model.fit(X, y)
    return model


def make_decision_grid(x_range=(-3, 3), y_range=(-3, 3), resolution=80):
    xs = np.linspace(x_range[0], x_range[1], resolution)
    ys = np.linspace(y_range[0], y_range[1], resolution)
    xx, yy = np.meshgrid(xs, ys)
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    return xx, yy, grid_points


def compute_decision_surface(model, grid_points, xx):
    Z = model.decision_function(grid_points)
    return Z.reshape(xx.shape)
