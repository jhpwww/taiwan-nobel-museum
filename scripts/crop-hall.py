#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
crop-hall.py — cut the bright museum's plate from its source render.

The hall is a photograph, and the video wall is placed in per cent of it, so
the crop is not a matter of taste: change it and the wall drifts off the
architecture. This records the crop rather than leaving it in an image editor,
and prints the landmarks HallBright.astro needs after any change.

Where the horizon is, and how it was found
------------------------------------------
This room is a rotunda, so its 'horizontal' lines are circles, and a circle
photographs as a straight line only when the camera's eye is at its height.
Fitting the rings — the dome ring, the entablature, the step nosing, the step
foot — and reading off the height where their curvature changes sign puts the
eye at y = 590 of 941, dead level with the top step. The step ring is visibly
flat there while the entablature above dips in the middle and the floor below
rises: the two signatures of being under and over eye level.

(A Hough-and-least-squares fit over every receding line, which is how the
previous plate was measured, answers 43% here and is wrong. In a rotunda most
of what it finds are dome ribs converging on the dome's own axis.)

    .venv-cv/bin/python scripts/crop-hall.py
"""
import pathlib
import sys

import cv2
import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent.parent
SRC = HERE / 'assets-src/hall/bright-hall-source.png'
OUT = HERE / 'public/media'

#: A light trim only — the flat crown of the dome off the top, and foreground
#: marble off the bottom that the page's own wash covers anyway.
#:
#: The temptation is to crop much harder, to a letterbox like the previous
#: plate. Don't. The plate is sized to cover the hero, so a wide plate on a
#: 16:10 screen is blown up until only its middle third is visible — a 2.28:1
#: crop came out 2056px wide inside a 1440px window, which magnifies the room
#: until the video wall alone is most of the screen. Keeping the plate near the
#: render's own 1.78 keeps the whole rotunda in frame.
CROP_TOP = 30
CROP_BOTTOM = 40

#: measured on the source, in source pixels — see the note above
HORIZON = 590.0
AXIS = 838.0
LANDMARKS = {
    'dome ring': 117.5,
    'entablature': 297.3,
    'door arch': 400.0,
    'horizon / platform': HORIZON,
    'step foot': 637.4,
}

#: The two red banners come out.
#:
#: Not a matter of taste. The plate is wider than the window it is shown in, so
#: the outermost part of the picture is cropped away at most viewport widths,
#: and the banners sit exactly there — at 1440px the left one loses its first
#: column of characters and the English beneath it reads '...rate the / ...f
#: Knowledge / ...etter World'. Text clipped mid-character is a defect however
#: handsome the banner is. And this text could not be fixed in place even if it
#: were whole: it is baked into a photograph, so it cannot be edited, cannot be
#: translated for the English rooms, and speaks in a voice the rest of the
#: museum does not use.
#:
#: They are removed rather than cropped around, because cropping the plate
#: narrow enough to miss them costs the outer bays and the edges of the dome.
#: Everything behind a banner is flat wall, and every feature in that wall runs
#: vertically — pilaster, shaft, capital, the string course below. So each
#: column of the patch is a ramp between the wall above and the wall below it,
#: which loses the banner and keeps the architecture. Marble at this scale
#: carries no texture worth reconstructing; a whisper of grain is enough.
#:
#: x0, y0, x1, y1 — the banner with its rod, its finials, its fringe, and the
#: shadow it casts on the wall.
BANNERS = [(70, 146, 229, 532), (1444, 146, 1603, 532)]
BANNER_PAD = 40          # rows of clean wall sampled above and below
BANNER_FEATHER = 8       # px, so the patch has no seam

#: the plate is served at twice its CSS size; the hall is the first thing on
#: the page and a soft one is the first thing anybody sees
SCALE = 2
QUALITY = {'jpg': 82, 'webp': 78}


def take_down_the_banners(bgr: np.ndarray) -> np.ndarray:
    """Replace each banner with the wall it hangs on — see the note above."""
    rng = np.random.default_rng(7)
    img = bgr.astype(np.float32)
    out = img.copy()
    for x0, y0, x1, y1 in BANNERS:
        top = np.median(img[y0 - BANNER_PAD:y0, x0:x1], axis=0)
        bot = np.median(img[y1:y1 + BANNER_PAD, x0:x1], axis=0)
        h = y1 - y0
        t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
        t = t * t * (3 - 2 * t)                 # smoothstep: no kink where it rejoins
        patch = top[None] * (1 - t) + bot[None] * t
        patch += cv2.GaussianBlur(
            rng.normal(0, 1.6, (h, x1 - x0, 3)).astype(np.float32), (0, 0), 1.1)
        out[y0:y1, x0:x1] = patch
    mask = np.zeros(img.shape[:2], np.float32)
    for x0, y0, x1, y1 in BANNERS:
        mask[y0:y1, x0:x1] = 1
    mask = cv2.GaussianBlur(mask, (0, 0), BANNER_FEATHER)[..., None]
    return np.clip(img * (1 - mask) + out * mask, 0, 255).astype(np.uint8)


def main() -> None:
    if not SRC.exists():
        sys.exit(f'{SRC} missing')
    bgr = cv2.imread(str(SRC))
    if bgr is None:
        sys.exit(f'{SRC} unreadable')
    src = Image.fromarray(cv2.cvtColor(take_down_the_banners(bgr), cv2.COLOR_BGR2RGB))
    w, h = src.size
    box = (0, CROP_TOP, w, h - CROP_BOTTOM)
    plate = src.crop(box)
    pw, ph = plate.size

    print(f'source {w}x{h}  →  plate {pw}x{ph}   ratio {pw / ph:.4f}')
    print(f'\nHallBright.astro wants:')
    print(f'  const PLATE = {{ w: {pw // SCALE}, h: {ph // SCALE} }};   '
          f'/* aspect-ratio: {pw} / {ph} */')
    print(f'  const VP = {{ x: {100 * AXIS / pw:.1f}, y: {100 * (HORIZON - CROP_TOP) / ph:.1f} }};')
    print('\nlandmarks, in per cent of the plate:')
    for name, y in LANDMARKS.items():
        print(f'  {name:20} {100 * (y - CROP_TOP) / ph:5.1f}%')

    OUT.mkdir(parents=True, exist_ok=True)
    out = plate if SCALE == 2 else plate.resize((pw * SCALE // 2, ph * SCALE // 2), Image.LANCZOS)
    out.save(OUT / 'bright-hall.jpg', quality=QUALITY['jpg'], optimize=True, progressive=True)
    out.save(OUT / 'bright-hall.webp', quality=QUALITY['webp'], method=6)
    print()
    for f in ('bright-hall.jpg', 'bright-hall.webp'):
        print(f'  {f:20} {(OUT / f).stat().st_size / 1024:6.1f} KB')


if __name__ == '__main__':
    main()
