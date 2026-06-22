from manim import *
import numpy as np


class SVMRBFKernel(ThreeDScene):
    """3D visualization of the SVM RBF (Gaussian) Kernel trick.

    Demonstrates how a non-linearly separable 2D dataset (inner cluster
    vs outer ring) becomes linearly separable in 3D after applying the
    RBF kernel transformation  z = exp(-γ (x² + y²)).
    """

    def construct(self):
        # ═════════════════════════════════════════════════════════ 1. 3D Axes Setup
        self.set_camera_orientation(phi=70 * DEGREES, theta=-30 * DEGREES)

        axes = ThreeDAxes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            z_range=[0, 1.5, 0.5],
            x_length=7,
            y_length=7,
            z_length=4.5,
        )
        axis_labels = axes.get_axis_labels(
            Text("x", font_size=24),
            Text("y", font_size=24),
            Text("z", font_size=24),
        )

        self.play(Create(axes), Write(axis_labels))
        self.wait(0.5)

        # ═════════════════════════════════════════════════════════ 2. 2D Data on Z=0
        np.random.seed(42)

        # ----- Blue inner cluster -----
        n_blue = 35
        blue_r = np.random.uniform(0.0, 0.5, n_blue)
        blue_theta = np.random.uniform(0, 2 * np.pi, n_blue)
        blue_x = blue_r * np.cos(blue_theta)
        blue_y = blue_r * np.sin(blue_theta)

        # ----- Red outer ring -----
        n_red = 40
        red_r = np.random.uniform(1.2, 2.2, n_red)
        red_theta = np.random.uniform(0, 2 * np.pi, n_red)
        red_x = red_r * np.cos(red_theta)
        red_y = red_r * np.sin(red_theta)

        all_x = np.concatenate([blue_x, red_x])
        all_y = np.concatenate([blue_y, red_y])
        all_colors = [BLUE] * n_blue + [RED] * n_red

        # Create 3D spheres resting on Z=0
        points = VGroup()
        for i in range(len(all_x)):
            sphere = Sphere(
                radius=0.06,
                fill_color=all_colors[i],
                resolution=(8, 8),
            )
            sphere.move_to(axes.c2p(all_x[i], all_y[i], 0))
            points.add(sphere)

        self.play(FadeIn(points, lag_ratio=0.05))
        self.wait(0.5)

        # ═════════════════════════════════════════════════════════ 3. RBF Kernel Trick
        gamma = 0.5

        # On-screen formula (no LaTeX – uses Unicode Greek γ)
        rbf_eq = Text(
            "z = exp(-γ · (x² + y²))",
            font_size=28,
            color=WHITE,
        ).to_corner(UL)
        self.add_fixed_in_frame_mobjects(rbf_eq)
        self.play(Write(rbf_eq))

        # Compute RBF kernel values
        z_rbf = np.exp(-gamma * (all_x**2 + all_y**2))

        # Animate all spheres lifting simultaneously
        rz_anims = [
            sphere.animate.move_to(axes.c2p(all_x[i], all_y[i], z_rbf[i]))
            for i, sphere in enumerate(points)
        ]
        self.play(
            AnimationGroup(*rz_anims, lag_ratio=0),
            run_time=2.5,
        )
        self.wait(1)

        # ═════════════════════════════════════════════════════════ 4. Decision Hyperplane
        plane_z = 0.55

        decision_plane = Surface(
            lambda u, v: axes.c2p(u, v, plane_z),
            u_range=[-2.5, 2.5],
            v_range=[-2.5, 2.5],
            resolution=(12, 12),
            fill_color=YELLOW,
            fill_opacity=0.35,
            stroke_color=YELLOW_E,
            stroke_width=0.5,
        )

        label_text = Text(
            "Decision Hyperplane",
            font_size=28,
            color=YELLOW,
        ).next_to(rbf_eq, DOWN, aligned_edge=LEFT)
        self.add_fixed_in_frame_mobjects(label_text)

        self.play(
            FadeIn(decision_plane),
            Write(label_text),
        )
        self.wait(1)

        # ═════════════════════════════════════════════════════════ 5. 3D Camera Tour
        self.begin_3d_camera_rotation(rate=0.15)
        self.wait(5)
        self.stop_3d_camera_rotation()

        self.move_camera(phi=70 * DEGREES, theta=-30 * DEGREES, run_time=2)
        self.wait(1)
