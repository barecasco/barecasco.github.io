from manim import *


class AnimatedSquareToCircle(Scene):
    def construct(self):
        circle = Circle()  # create a circle
        square = Square()  # create a square
        triangle = Triangle()

        self.play(Create(square))  # show the square on screen
        self.play(square.animate.rotate(PI/2))  # rotate the square
        self.play(square.animate.rotate(PI/2))  # rotate the square
        self.play(square.animate.rotate(PI/2))  # rotate the square
        self.play(Transform(square, triangle))  # transform the square into a circle
        self.play(square.animate.rotate(PI/2))  # rotate the square
        self.play(square.animate.rotate(PI/2))  # rotate the square
        self.play(Transform(square, circle))  # transform the square into a circle
        self.play(
            square.animate.set_fill(PURPLE, opacity=1.0)
        )  # color the circle on screen