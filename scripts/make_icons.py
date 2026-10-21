"""Draw the app's PNG icons into icons/.

Run:   python3 scripts/make_icons.py
Needs: Pillow  (install with: pip3 install pillow)

The design matches icons/icon.svg (an eye with the sun for outdoor light).
Coordinates below use the same 512 x 512 grid as the SVG, so if you change
one file, copy the numbers to the other.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

GREEN = (42, 147, 97)
SUN = (255, 209, 102)
WHITE = (255, 255, 255)
IRIS = (31, 95, 122)
PUPIL = (15, 42, 54)

ICONS = Path(__file__).resolve().parent.parent / "icons"
SMOOTH = 4  # draw 4x bigger, then shrink, for smooth edges


def curve(start, control, end, steps=64):
    """Points along a curved line (the same 'Q' curve the SVG uses)."""
    points = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t**2 * end[0]
        y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t**2 * end[1]
        points.append((x, y))
    return points


def draw_icon(size, rounded, artwork_scale):
    """rounded: transparent rounded corners. artwork_scale < 1 leaves a margin (for Android masks)."""
    big = size * SMOOTH
    k = big / 512

    def at(x, y):
        return ((256 + (x - 256) * artwork_scale) * k, (256 + (y - 256) * artwork_scale) * k)

    def circle(draw, x, y, r, fill):
        cx, cy = at(x, y)
        r = r * artwork_scale * k
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)

    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if rounded:
        draw.rounded_rectangle([0, 0, big - 1, big - 1], radius=112 * k, fill=GREEN)
    else:
        draw.rectangle([0, 0, big, big], fill=GREEN)

    circle(draw, 392, 120, 40, SUN)

    eye_outline = curve((96, 272), (256, 120), (416, 272)) + curve((416, 272), (256, 424), (96, 272))[1:]
    eye_outline = [at(x, y) for x, y in eye_outline]
    draw.polygon(eye_outline, fill=WHITE)

    # Iris, pupil and sparkle, trimmed so they stay inside the eye shape.
    inner = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    inner_draw = ImageDraw.Draw(inner)
    circle(inner_draw, 256, 272, 68, IRIS)
    circle(inner_draw, 256, 272, 30, PUPIL)
    circle(inner_draw, 278, 250, 12, WHITE)
    eye_mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(eye_mask).polygon(eye_outline, fill=255)
    img.paste(inner, (0, 0), ImageChops.multiply(inner.getchannel("A"), eye_mask))

    return img.resize((size, size), Image.LANCZOS)


def main():
    ICONS.mkdir(exist_ok=True)
    draw_icon(192, rounded=True, artwork_scale=1).save(ICONS / "icon-192.png")
    draw_icon(512, rounded=True, artwork_scale=1).save(ICONS / "icon-512.png")
    # Android may cut "maskable" icons into circles or other shapes, so keep a margin.
    draw_icon(512, rounded=False, artwork_scale=0.78).save(ICONS / "icon-maskable-512.png")
    # iPhone rounds the corners itself and needs a solid (not see-through) square.
    draw_icon(180, rounded=False, artwork_scale=1).convert("RGB").save(ICONS / "apple-touch-icon.png")
    print("Icons written to", ICONS)


if __name__ == "__main__":
    main()
