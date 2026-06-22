from manim import *
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.data_generator import generate_ring_dataset


class SVMKernelTrick3D(ThreeDScene):
    def construct(self):
        self.camera.set_euler_angles(phi=65 * DEGREES, theta=-45 * DEGREES)
        self.camera.frame_center = self.camera.frame_center

        title = Text(
            "SVM Kernel Trick: From 2D to 3D",
            font_size=44,
            color=WHITE,
        )
        subtitle = Text(
            "Nonlinear in 2D, linear in feature space.",
            font_size=28,
            color=BLUE_C,
        )
        title_group = VGroup(title, subtitle).arrange(DOWN, buff=0.3)
        self.play(Write(title), Write(subtitle))
        self.wait(3)
        self.play(FadeOut(title_group))

        axes_3d = ThreeDAxes(
            x_range=[-4, 4, 1],
            y_range=[-4, 4, 1],
            z_range=[0, 8, 2],
            x_length=8,
            y_length=8,
            z_length=6,
        )
        axes_labels = axes_3d.get_axis_labels(
            Text("x").scale(0.7),
            Text("y").scale(0.7),
            Text("z").scale(0.7),
        )
        self.play(Create(axes_3d), Write(axes_labels))
        self.wait(1)

        X, y = generate_ring_dataset(noise=0.08, random_seed=7)

        blue_dots_2d = VGroup()
        red_dots_2d = VGroup()
        blue_dots_3d = VGroup()
        red_dots_3d = VGroup()

        for i, (xi, yi) in enumerate(X):
            if y[i] == 0:
                color = BLUE
                dot_2d = Sphere(radius=0.08, fill_opacity=0.9, color=color).move_to(
                    axes_3d.coords_to_point(xi, yi, 0)
                )
                dot_2d.set_color(color)
                blue_dots_2d.add(dot_2d)

                z = xi**2 + yi**2
                dot_3d = Sphere(radius=0.08, fill_opacity=0.9, color=color).move_to(
                    axes_3d.coords_to_point(xi, yi, z)
                )
                dot_3d.set_color(color)
                blue_dots_3d.add(dot_3d)
            else:
                color = RED
                dot_2d = Sphere(radius=0.08, fill_opacity=0.9, color=color).move_to(
                    axes_3d.coords_to_point(xi, yi, 0)
                )
                dot_2d.set_color(color)
                red_dots_2d.add(dot_2d)

                z = xi**2 + yi**2
                dot_3d = Sphere(radius=0.08, fill_opacity=0.9, color=color).move_to(
                    axes_3d.coords_to_point(xi, yi, z)
                )
                dot_3d.set_color(color)
                red_dots_3d.add(dot_3d)

        all_dots_2d = VGroup(blue_dots_2d, red_dots_2d)
        self.play(FadeIn(all_dots_2d, shift=IN, run_time=1.5))
        self.wait(1)

        sep_note = Text(
            "No straight line can separate them in 2D.",
            font_size=30,
            color=YELLOW,
        ).to_corner(UR)
        sep_note.fix_in_frame = True
        self.add_fixed_in_frame_mobjects(sep_note)
        self.play(Write(sep_note))
        self.wait(2)
        self.play(FadeOut(sep_note))

        phi_formula = MathTex(
            r"\phi(x, y) = (x, y, x^2 + y^2)",
            font_size=48,
            color=GREEN,
        )
        phi_formula.to_corner(UL)
        phi_formula.fix_in_frame = True
        self.add_fixed_in_frame_mobjects(phi_formula)
        self.play(Write(phi_formula))
        self.wait(2)

        lift_anims = []
        for b2d, b3d in zip(blue_dots_2d, blue_dots_3d):
            lift_anims.append(Transform(b2d, b3d, run_time=2.5))
        for r2d, r3d in zip(red_dots_2d, red_dots_3d):
            lift_anims.append(Transform(r2d, r3d, run_time=2.5))

        self.play(*lift_anims)
        self.wait(2)

        paraboloid_surface = Surface(
            func=lambda u, v: axes_3d.coords_to_point(u, v, u**2 + v**2),
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=40,
            fill_opacity=0.22,
            stroke_opacity=0.3,
            fill_color=YELLOW,
            stroke_color=YELLOW,
        )
        self.play(Create(paraboloid_surface), run_time=2)
        self.wait(1)

        hyperplane = Surface(
            func=lambda u, v: axes_3d.coords_to_point(u, v, 1.8),
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=30,
            fill_opacity=0.35,
            stroke_opacity=0.5,
            fill_color=GREEN,
            stroke_color=GREEN,
        )
        self.play(Create(hyperplane), run_time=1.5)

        hp_label = Text("Hyperplane in feature space", font_size=26, color=GREEN)
        hp_label.next_to(axes_3d.coords_to_point(0, 0, 1.8), UP, buff=0.8)
        hp_label.fix_in_frame = True
        self.add_fixed_in_frame_mobjects(hp_label)
        self.play(Write(hp_label))
        self.wait(2)

        reduction = MathTex(
            r"z = c \implies x^2 + y^2 = c",
            font_size=40,
            color=YELLOW,
        )
        reduction.to_corner(UL)
        reduction.fix_in_frame = True
        self.remove(phi_formula)
        self.add_fixed_in_frame_mobjects(reduction)
        self.play(Write(reduction))
        self.wait(2)

        circle_2d = Circle(radius=np.sqrt(1.8), color=YELLOW, stroke_width=3)
        circle_2d.move_to(axes_3d.coords_to_point(0, 0, 0))
        self.play(FadeIn(circle_2d, shift=IN), run_time=1.5)
        self.wait(1.5)

        self.begin_3d_illusion_camera_rotation(rate=0.18)
        self.wait(8)

        summary = VGroup(
            Text("A nonlinear problem in 2D", font_size=30, color=WHITE),
            Text("becomes linearly separable in 3D", font_size=30, color=YELLOW),
            Text("by lifting to a feature space.", font_size=30, color=WHITE),
        ).arrange(DOWN, buff=0.25)
        summary.to_corner(DR)
        summary.fix_in_frame = True
        self.add_fixed_in_frame_mobjects(summary)
        self.play(Write(summary))
        self.wait(4)
        self.play(FadeOut(summary))

        self.stop_3d_illusion_camera_rotation()
        self.wait(2)

if __name__ == "__main__":
    import subprocess
    import sys
    cmd = [sys.executable, "-m", "manim", "-pqh", __file__, "SVMKernelTrick3D"]
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd)
