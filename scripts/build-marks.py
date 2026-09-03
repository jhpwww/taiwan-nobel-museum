#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-marks.py — the six gold devices cut into the plinths.

The project owner draws them one per prize, at 1254px on transparency. They
arrive at whatever size and padding the render gave them, and dropping those
into a row unchanged would not read as a set: the caduceus is half again as
tall as it is wide, the open book half again as wide as it is tall, and each
carries a different margin of empty pixels.

So each is trimmed to its own ink and then scaled to a common **area** rather
than a common width or height — the geometric mean of its sides, which is what
makes mixed shapes carry the same visual weight. A cap on the longest side
stops the tallest and the widest from overreaching that; without it the book
runs a fifth wider than the rest.

Output is WebP on transparency at a size the page will never exceed: the mark
draws at about 24 CSS px on a plinth 140 wide, so 192px covers three times the
device pixel ratio anyone has.

    python3 scripts/build-marks.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent.parent
SRC = HERE / 'assets-src/marks'
OUT = HERE / 'public/assets/marks'

CATS = ['physics', 'chemistry', 'medicine', 'peace', 'economics', 'literature']

CANVAS = 192
#: the geometric mean each mark is scaled to, and the most any one side may take
TARGET = 150
CAP = 176
#: anything this faint is the render's own fringe, not the mark
ALPHA_FLOOR = 8
QUALITY = 88


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for cat in CATS:
        f = SRC / f'{cat}.png'
        if not f.exists():
            sys.exit(f'{f} missing')
        im = Image.open(f).convert('RGBA')

        box = im.getchannel('A').point(lambda v: 255 if v > ALPHA_FLOOR else 0).getbbox()
        ink = im.crop(box)
        w, h = ink.size

        s = TARGET / (w * h) ** 0.5
        s = min(s, CAP / max(w, h))
        size = (max(1, round(w * s)), max(1, round(h * s)))
        ink = ink.resize(size, Image.LANCZOS)

        canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
        canvas.paste(ink, ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2), ink)
        canvas.save(OUT / f'{cat}.webp', quality=QUALITY, method=6)

        kb = (OUT / f'{cat}.webp').stat().st_size / 1024
        print(f'{cat:11} {w}x{h} → {size[0]}x{size[1]}  on {CANVAS}px   {kb:5.1f} KB')


if __name__ == '__main__':
    main()
