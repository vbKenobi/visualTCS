"""
Behrend's Construction Animation
Renders to: ../animations/behrend.mp4

Run with: manim -pqh behrend.py BehrendConstruction
"""

from manim import *
import numpy as np

class BehrendCircle(Scene):
    """Phase 1: Show that circle midpoints lie inside"""
    def construct(self):
        # Title
        title = Text("Behrend's Key Insight", font_size=36).to_edge(UP)
        self.play(Write(title))
        
        # Draw circle
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        self.wait(0.5)
        
        # Points on circle
        angle_a, angle_b = PI/4, 3*PI/4
        point_a = circle.point_at_angle(angle_a)
        point_b = circle.point_at_angle(angle_b)
        
        dot_a = Dot(point_a, color=GREEN)
        dot_b = Dot(point_b, color=GREEN)
        label_a = MathTex("a").next_to(dot_a, UR, buff=0.1)
        label_b = MathTex("b").next_to(dot_b, UL, buff=0.1)
        
        self.play(Create(dot_a), Create(dot_b))
        self.play(Write(label_a), Write(label_b))
        
        # Line between points
        line = Line(point_a, point_b, color=YELLOW)
        self.play(Create(line))
        
        # Midpoint
        midpoint = (point_a + point_b) / 2
        dot_mid = Dot(midpoint, color=RED)
        label_mid = MathTex(r"\frac{a+b}{2}").next_to(dot_mid, DOWN, buff=0.2)
        
        self.play(Create(dot_mid))
        self.play(Write(label_mid))
        
        # Explanation
        explanation = Text("Midpoint lies INSIDE the circle!", 
                          font_size=24, color=YELLOW).to_edge(DOWN)
        self.play(Write(explanation))
        
        # Show it's not on circle
        dashed_line = DashedLine(ORIGIN, midpoint, color=RED)
        self.play(Create(dashed_line))
        
        self.wait(2)


class BehrendSphere(ThreeDScene):
    """Phase 2: Extend to d-dimensional sphere"""
    def construct(self):
        self.set_camera_orientation(phi=70 * DEGREES, theta=30 * DEGREES)
        
        # Create sphere
        sphere = Surface(
            lambda u, v: np.array([
                np.cos(u) * np.cos(v),
                np.cos(u) * np.sin(v),
                np.sin(u)
            ]),
            u_range=[-PI/2, PI/2],
            v_range=[0, TAU],
            resolution=(24, 48),
            fill_opacity=0.3,
            stroke_color=BLUE,
            stroke_width=0.5
        )
        
        self.play(Create(sphere))
        self.begin_ambient_camera_rotation(rate=0.2)
        
        # Add title
        title = Text("S^(d-1): No 3-APs on sphere surface", font_size=28)
        title.to_corner(UL)
        title.fix_in_frame()
        self.add_fixed_in_frame_mobjects(title)
        self.play(Write(title))
        
        self.wait(4)
        self.stop_ambient_camera_rotation()


class BehrendLattice(Scene):
    """Phase 3: Lattice points on sphere shell"""
    def construct(self):
        title = Text("Lattice Points in [k]^d", font_size=36).to_edge(UP)
        self.play(Write(title))
        
        # Create grid of dots
        k = 5
        dots = VGroup()
        for i in range(k):
            for j in range(k):
                dot = Dot(
                    point=np.array([i - k/2 + 0.5, j - k/2 + 0.5, 0]) * 0.6,
                    radius=0.08,
                    color=WHITE
                )
                dots.add(dot)
        
        self.play(Create(dots))
        self.wait(0.5)
        
        # Highlight points on a "shell" (circle in 2D)
        R = 2  # Target radius squared = 8 in our scaled coords
        shell_dots = VGroup()
        for dot in dots:
            pos = dot.get_center()
            # Scale back to get integer coords
            x = int(round(pos[0] / 0.6 + k/2 - 0.5))
            y = int(round(pos[1] / 0.6 + k/2 - 0.5))
            if x*x + y*y == 8:  # Points where x^2 + y^2 = 8
                shell_dots.add(dot.copy().set_color(YELLOW).scale(1.5))
        
        # Draw circle
        circle = Circle(radius=np.sqrt(8) * 0.6, color=BLUE, stroke_width=2)
        self.play(Create(circle))
        
        # Highlight shell points
        formula = MathTex(r"S_R = \{x \in [k]^d : \sum x_i^2 = R\}", font_size=30)
        formula.to_edge(DOWN)
        self.play(Write(formula))
        
        for dot in shell_dots:
            self.play(Create(dot), run_time=0.3)
        
        self.wait(2)


class BehrendMapping(Scene):
    """Phase 4: Base-(2k+1) mapping to integers"""
    def construct(self):
        title = Text("Mapping to Integers", font_size=36).to_edge(UP)
        self.play(Write(title))
        
        # Show the formula
        formula = MathTex(
            r"f(x) = \sum_{i=1}^d x_i \cdot (2k+1)^{i-1}",
            font_size=36
        )
        self.play(Write(formula))
        self.wait(1)
        
        # Example
        self.play(formula.animate.shift(UP * 1.5))
        
        example_title = Text("Example: k=3, d=2", font_size=24).next_to(formula, DOWN)
        self.play(Write(example_title))
        
        # Show specific mapping
        examples = VGroup(
            MathTex(r"(1, 2) \mapsto 1 \cdot 7^0 + 2 \cdot 7^1 = 15"),
            MathTex(r"(3, 1) \mapsto 3 \cdot 7^0 + 1 \cdot 7^1 = 10"),
            MathTex(r"(2, 3) \mapsto 2 \cdot 7^0 + 3 \cdot 7^1 = 23"),
        ).arrange(DOWN, buff=0.3).shift(DOWN * 0.5)
        
        for ex in examples:
            self.play(Write(ex))
            self.wait(0.5)
        
        # Key property
        key = Text("No carry-over: preserves 3-AP structure!", 
                  font_size=24, color=YELLOW).to_edge(DOWN)
        self.play(Write(key))
        
        self.wait(2)


class BehrendResult(Scene):
    """Phase 5: Final result"""
    def construct(self):
        title = Text("Behrend's Result (1946)", font_size=40).to_edge(UP)
        self.play(Write(title))
        
        # Main theorem
        theorem = MathTex(
            r"r_3(N) \geq \frac{N}{2^{c\sqrt{\log N}}}",
            font_size=48
        )
        box = SurroundingRectangle(theorem, color=YELLOW, buff=0.3)
        
        self.play(Write(theorem))
        self.play(Create(box))
        self.wait(1)
        
        # Interpretation
        interp = VGroup(
            Text("This means:", font_size=24),
            Text("We can find LARGE 3-AP free sets!", font_size=28, color=GREEN),
            Text("Size is almost N (sub-polynomial loss)", font_size=24),
        ).arrange(DOWN, buff=0.3).shift(DOWN * 1.5)
        
        for line in interp:
            self.play(Write(line))
            self.wait(0.5)
        
        self.wait(2)


class BehrendConstruction(Scene):
    """Full Behrend construction walkthrough"""
    def construct(self):
        # This combines all phases into one scene
        # For the web, you might want to render phases separately
        
        # Phase 1: Circle insight
        phase1 = Text("Step 1: Circle Midpoints", font_size=32)
        self.play(Write(phase1))
        self.wait(1)
        self.play(FadeOut(phase1))
        
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        
        angle_a, angle_b = PI/4, 3*PI/4
        point_a = circle.point_at_angle(angle_a)
        point_b = circle.point_at_angle(angle_b)
        
        dot_a = Dot(point_a, color=GREEN)
        dot_b = Dot(point_b, color=GREEN)
        self.play(Create(dot_a), Create(dot_b))
        
        midpoint = (point_a + point_b) / 2
        dot_mid = Dot(midpoint, color=RED)
        line = Line(point_a, point_b, color=YELLOW)
        
        self.play(Create(line))
        self.play(Create(dot_mid))
        
        insight = Text("Midpoint is INSIDE!", font_size=24, color=YELLOW).to_edge(DOWN)
        self.play(Write(insight))
        self.wait(2)
        
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        
        # Phase 2: Formula
        phase2 = Text("Step 2: Map to Integers", font_size=32)
        self.play(Write(phase2))
        self.wait(1)
        self.play(FadeOut(phase2))
        
        formula = MathTex(
            r"f(x) = \sum_{i=1}^d x_i \cdot (2k+1)^{i-1}",
            font_size=40
        )
        self.play(Write(formula))
        self.wait(2)
        
        self.play(FadeOut(formula))
        
        # Phase 3: Result
        phase3 = Text("Step 3: The Result", font_size=32)
        self.play(Write(phase3))
        self.wait(1)
        self.play(FadeOut(phase3))
        
        result = MathTex(
            r"|S| \geq \frac{N}{2^{c\sqrt{\log N}}}",
            font_size=48
        )
        box = SurroundingRectangle(result, color=YELLOW, buff=0.3)
        
        self.play(Write(result))
        self.play(Create(box))
        
        self.wait(3)
