import numpy as np


def generate_ring_dataset(
    n_inner=35,
    n_outer=45,
    inner_radius_range=(0.0, 1.0),
    outer_radius_range=(1.6, 2.5),
    noise=0.08,
    random_seed=7,
):
    rng = np.random.default_rng(random_seed)

    theta_inner = rng.uniform(0, 2 * np.pi, n_inner)
    radius_inner = rng.uniform(*inner_radius_range, n_inner)

    x_inner = radius_inner * np.cos(theta_inner)
    y_inner = radius_inner * np.sin(theta_inner)

    theta_outer = rng.uniform(0, 2 * np.pi, n_outer)
    radius_outer = rng.uniform(*outer_radius_range, n_outer)

    x_outer = radius_outer * np.cos(theta_outer)
    y_outer = radius_outer * np.sin(theta_outer)

    X = np.vstack([
        np.column_stack([x_inner, y_inner]),
        np.column_stack([x_outer, y_outer]),
    ])

    X += rng.normal(0, noise, X.shape)

    y = np.array([0] * n_inner + [1] * n_outer)

    return X, y
