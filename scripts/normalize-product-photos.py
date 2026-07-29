#!/usr/bin/env python3
"""normalize-product-photos.py — makes every product photo render at the same size
in a product card, with nothing cropped (D049).

The card draws a 132 × 96 box (ratio 1.375) and the sources were square 1000 × 1000,
so `resizeMode="cover"` cut ~30% of the height off every photo — worst on the tight
studio crops (iPhone 15 Pro's subject fills 0.99 of its frame, so the phone lost its
top and bottom). Switching the card to `contain` stops the crop but exposes the second
problem: each file frames its subject differently, from 0.34 × 0.42 of the canvas
(Galaxy S24) to 0.80 × 0.99 (iPhone 15 Pro), so contained side by side they look
randomly sized.

This re-frames each file so the *subject* — not the canvas — is the constant:

  1. composite any alpha onto white, so every ground is the same white (D038)
  2. find the subject's bounding box (background = all channels ≥ 244)
  3. scale it to SUBJECT_H of the canvas height, or SUBJECT_W of the width if it is
     a wide product (shoes, sunglasses) that would otherwise overflow
  4. centre it on a white canvas at the card's own 1.375 ratio

Because the canvas ratio then matches the box, `contain` fills the box exactly and
the subject occupies the same fraction of every card.

Files whose background share is under MIN_BG are left ALONE and reported: without a
white ground the subject can't be isolated, and guessing would crop real content.

    python3 scripts/normalize-product-photos.py [--dry-run] [assets/products]

Re-run after dropping in a new photo. Originals are in git history.
"""
import sys
from pathlib import Path
from PIL import Image

CANVAS_W, CANVAS_H = 1100, 800  # 1.375 — the card's 132 × 96 box
SUBJECT_H = 0.86  # subject height as a share of the canvas
SUBJECT_W = 0.94  # …unless it is wide, then cap the width instead
BG_THRESHOLD = 244  # a pixel this light on every channel is "ground"
MIN_BG = 0.10  # below this share of ground, don't touch the file

def subject_box(im: Image.Image):
    """Tight bbox of non-background pixels, plus the background's share."""
    w, h = im.size
    px = im.load()
    x0, y0, x1, y1 = w, h, -1, -1
    bg = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r >= BG_THRESHOLD and g >= BG_THRESHOLD and b >= BG_THRESHOLD:
                bg += 1
                continue
            if x < x0: x0 = x
            if x > x1: x1 = x
            if y < y0: y0 = y
            if y > y1: y1 = y
    if x1 < x0:
        return None, 1.0
    return (x0, y0, x1 + 1, y1 + 1), bg / (w * h)

def flatten(path: Path) -> Image.Image:
    """Alpha composited onto white — a transparent PNG otherwise picks up the card's
    tint behind it while its JPEG neighbours sit on white."""
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        ground = Image.new('RGBA', im.size, (255, 255, 255, 255))
        ground.alpha_composite(im)
        return ground.convert('RGB')
    return im.convert('RGB')

def normalize(path: Path, dry: bool) -> str:
    im = flatten(path)
    box, bg = subject_box(im)
    if box is None or bg < MIN_BG:
        return f'{path.name:28} SKIPPED — ground is only {bg:.0%}, subject can\'t be isolated'

    subject = im.crop(box)
    sw, sh = subject.size
    scale = min((CANVAS_H * SUBJECT_H) / sh, (CANVAS_W * SUBJECT_W) / sw)
    tw, th = max(1, round(sw * scale)), max(1, round(sh * scale))
    subject = subject.resize((tw, th), Image.LANCZOS)

    out = Image.new('RGB', (CANVAS_W, CANVAS_H), (255, 255, 255))
    out.paste(subject, ((CANVAS_W - tw) // 2, (CANVAS_H - th) // 2))
    if not dry:
        if path.suffix.lower() in ('.jpg', '.jpeg'):
            out.save(path, quality=92, optimize=True, progressive=True)
        else:
            out.save(path, optimize=True)
    limit = 'height' if (CANVAS_H * SUBJECT_H) / sh <= (CANVAS_W * SUBJECT_W) / sw else 'width'
    return (f'{path.name:28} {im.size[0]}x{im.size[1]} subject {sw}x{sh} '
            f'→ {tw}x{th} on {CANVAS_W}x{CANVAS_H} (fit {limit})')

def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    root = Path(args[0] if args else 'assets/products')
    files = sorted(p for p in root.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png'))
    for p in files:
        print(normalize(p, dry))
    print(f'\n{len(files)} file(s){" — dry run, nothing written" if dry else " rewritten"}')

if __name__ == '__main__':
    main()
