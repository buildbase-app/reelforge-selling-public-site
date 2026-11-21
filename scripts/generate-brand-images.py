"""Generate public/og.png (1200x630) and public/logo.png (512x512) for ReelForge.

A placeholder wordmark until real brand art exists. Needs Pillow and the
DejaVu fonts. Run from the repo root: python3 scripts/generate-brand-images.py public
"""
import sys
from PIL import Image, ImageDraw, ImageFont

out = sys.argv[1]
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def gradient_square(size, radius):
    sq = Image.new('RGBA', (size, size))
    px = sq.load()
    a, b = (59, 130, 246), (139, 92, 246)  # matches /api/og
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius, fill=255)
    sq.putalpha(mask)
    d = ImageDraw.Draw(sq)
    f = ImageFont.truetype(BOLD, int(size * 0.62))
    bbox = d.textbbox((0, 0), 'R', font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), 'R', font=f, fill='white')
    return sq


# Logo: the mark alone, square, transparent corners.
logo = gradient_square(512, 112)
logo.save(f'{out}/logo.png', optimize=True)

# OG image.
W, H = 1200, 630
og = Image.new('RGB', (W, H), (3, 7, 18))
glow = Image.new('RGB', (W, H), (3, 7, 18))
gd = ImageDraw.Draw(glow)
for r, col in [(420, (18, 30, 58)), (300, (26, 40, 80))]:
    gd.ellipse((300 - r, 160 - r, 300 + r, 160 + r), fill=col)
og = Image.blend(og, glow, 0.6)
mark = gradient_square(120, 26)
og.paste(mark, (80, 150), mark)
d = ImageDraw.Draw(og)
d.text((230, 168), 'ReelForge', font=ImageFont.truetype(BOLD, 76), fill='white')
d.text((82, 330), 'Polished Reels, rendered on your own machine.',
       font=ImageFont.truetype(REG, 40), fill=(209, 213, 219))
d.text((82, 395), 'Self-hosted studio for short-form video · Early access',
       font=ImageFont.truetype(REG, 30), fill=(156, 163, 175))
og.save(f'{out}/og.png', optimize=True)
