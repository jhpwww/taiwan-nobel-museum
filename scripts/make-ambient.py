#!/usr/bin/env python3
"""
make-ambient.py — renders the looping ambient background video.

  python3 scripts/make-ambient.py   ->  public/media/ambient.webm  (+ .mp4, + poster)

A dark, warm museum atmosphere: two slow light shafts, drifting embers and a
faint dust haze. Everything moves on sine waves whose periods divide the clip
length exactly, so the loop is seamless with no crossfade.

Deliberately dark and smooth: VP9 compresses this to a few hundred KB. Re-run
only if the look needs to change; the output is committed.
"""
import math, os, pathlib, shutil, subprocess, tempfile
import numpy as np
from PIL import Image

W, H = 1280, 720
FPS = 24
SECONDS = 12
N = FPS * SECONDS

root = pathlib.Path(__file__).resolve().parent.parent
out = root / "public" / "media"
out.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(7)
EMBERS = 340
e_x = rng.random(EMBERS)
e_phase = rng.random(EMBERS)
e_speed = 0.9 + rng.random(EMBERS) * 1.5
e_size = 1.1 + rng.random(EMBERS) * 3.0
e_sway = 0.004 + rng.random(EMBERS) * 0.016

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
nx = xx / W
ny = yy / H

# static warm ground: a pool of light low-centre, deep shadow at the edges
base = np.zeros((H, W, 3), np.float32)
glow = np.exp(-(((nx - 0.5) / 0.42) ** 2 + ((ny - 0.62) / 0.34) ** 2))
base[..., 0] += glow * 0.115
base[..., 1] += glow * 0.062
base[..., 2] += glow * 0.022
top = np.exp(-(((nx - 0.5) / 0.5) ** 2 + ((ny - 0.02) / 0.3) ** 2))
base[..., 0] += top * 0.075
base[..., 1] += top * 0.046
base[..., 2] += top * 0.020
base += 0.007

vig = 1.0 - 0.97 * np.clip(((nx - 0.5) ** 2 * 2.4 + (ny - 0.5) ** 2 * 2.7), 0, 1) ** 1.1

tmp = pathlib.Path(tempfile.mkdtemp(prefix="ambient-"))
try:
    for f in range(N):
        t = f / N                      # 0..1, wraps exactly
        img = base.copy()

        # two light shafts sweeping through, periods that divide the loop
        for k, (cx0, amp, wide, gain, cycles) in enumerate(
            [(0.30, 0.30, 0.135, 0.20, 1), (0.72, 0.24, 0.095, 0.14, 2), (0.50, 0.40, 0.075, 0.10, 1)]
        ):
            cx = cx0 + amp * math.sin(TAU := 2 * math.pi * cycles * t)
            d = (nx - cx) - (ny - 0.5) * 0.30
            shaft = np.exp(-((d / wide) ** 2)) * np.clip(1.25 - ny, 0, 1)
            g = gain * (0.78 + 0.22 * math.sin(2 * math.pi * (cycles * t + 0.25)))
            img[..., 0] += shaft * g
            img[..., 1] += shaft * g * 0.66
            img[..., 2] += shaft * g * 0.30

        # a broad haze drifting across, so the motion reads even on a still glance
        hx = (t * 1.0) % 1.0
        for lobe in (hx - 1.0, hx, hx + 1.0):
            haze = np.exp(-(((nx - lobe) / 0.30) ** 2 + ((ny - 0.55) / 0.42) ** 2)) * 0.085
            img[..., 0] += haze
            img[..., 1] += haze * 0.6
            img[..., 2] += haze * 0.26

        # embers drifting upward; each wraps within the loop
        for i in range(EMBERS):
            p = (e_phase[i] + t * e_speed[i]) % 1.0
            ey = 1.06 - p * 1.16
            ex = e_x[i] + math.sin(2 * math.pi * (p + e_phase[i])) * e_sway[i]
            if not (0 < ex < 1 and -0.05 < ey < 1.05):
                continue
            fade = math.sin(math.pi * p) ** 0.6
            px, py = int(ex * W), int(ey * H)
            r = int(e_size[i] * 3) + 2
            x0, x1 = max(0, px - r), min(W, px + r + 1)
            y0, y1 = max(0, py - r), min(H, py + r + 1)
            if x1 <= x0 or y1 <= y0:
                continue
            gx = np.arange(x0, x1) - px
            gy = (np.arange(y0, y1) - py)[:, None]
            blob = np.exp(-((gx ** 2 + gy ** 2) / (2 * (e_size[i] * 1.35) ** 2))) * fade * 0.85
            img[y0:y1, x0:x1, 0] += blob
            img[y0:y1, x0:x1, 1] += blob * 0.68
            img[y0:y1, x0:x1, 2] += blob * 0.30

        img *= vig[..., None]
        frame = np.clip(img, 0, 1) ** (1 / 1.35)
        Image.fromarray((frame * 255).astype(np.uint8)).save(tmp / f"f{f:04d}.png")

    ff = __import__("imageio_ffmpeg").get_ffmpeg_exe()
    src = str(tmp / "f%04d.png")

    subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", src,
                    "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1",
                    "-pix_fmt", "yuv420p", "-an", str(out / "ambient.webm")], check=True)
    subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", src,
                    "-c:v", "libx264", "-crf", "31", "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                    str(out / "ambient.mp4")], check=True)
    shutil.copy(tmp / "f0000.png", out / "ambient-poster.png")
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(out / "ambient-poster.png"),
                    "-vf", "scale=640:-1", "-q:v", "6", str(out / "ambient-poster.jpg")], check=True)
    (out / "ambient-poster.png").unlink()
finally:
    shutil.rmtree(tmp, ignore_errors=True)

for f in sorted(out.iterdir()):
    print(f"  {f.name:<22} {f.stat().st_size/1024:8.0f} KB")
