#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make-backdrop-clips.py — the short loops that play behind the halls.

The backdrop used to be a live youtube-nocookie embed. Measured on the live
site it streamed 0.27–0.30 MB/s and never stopped: ten seconds of looking cost
7 MB, a minute cost 21 MB. For decoration behind a hall, at 38–50% opacity
under a grading layer, that is indefensible.

These are ten-second cuts, encoded small, that loop. A visitor downloads a few
hundred KB once and the traffic then goes to nothing however long they stay.
It also fixes mobile: a muted, playsinline <video> autoplays on iOS where a
cross-origin iframe never will.

The clips are excerpts of the lecture recordings, held only as background
decoration. Update the About page if this changes.

    python3 scripts/make-backdrop-clips.py [--probe]

--probe writes a contact sheet of the chosen frames so the cuts can be judged
before committing several minutes of encoding.
"""
import json
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
FF = str(HERE / '.tools/ffmpeg')
YTDLP = 'yt-dlp'
RAW = HERE / 'assets-src/backdrop'
OUT = HERE / 'public/media/backdrop'
SECONDS = 10

# id → (youtube id, start). Starts are chosen to land on the speaker mid-talk,
# clear of title cards and applause, and verified from the probe sheet.
CLIPS = [
    ('geim',     'rcE23c82xUc', '00:07:30'),
    ('thooft',   'OHIoN7OcMTM', '00:09:10'),
    ('karman',   'q3V6sN0zE7c', '00:08:40'),
    ('kornberg', 'zBzFC9ODs1M', '00:11:20'),
    ('queloz',   'awXleH-HVEI', '00:10:05'),
    ('murad',    'K86pQuvw144', '00:09:45'),
]


def grab(name: str, vid: str, start: str) -> pathlib.Path:
    """Pull just the needed seconds, not the whole recording."""
    RAW.mkdir(parents=True, exist_ok=True)
    dest = RAW / f'{name}.mp4'
    if dest.exists():
        return dest
    end = f'{start[:6]}{int(start[6:]) + SECONDS + 2:02d}' if int(start[6:]) + SECONDS + 2 < 60 \
        else None
    section = f'*{start}-{end}' if end else f'*{start}+{SECONDS + 2}'
    subprocess.run([
        YTDLP, '-q', '--no-warnings',
        # yt-dlp needs ffmpeg to cut a section, and this box has no system one
        '--ffmpeg-location', str(HERE / '.tools'),
        '-f', 'bv*[height<=720][ext=mp4]/bv*[height<=720]',
        '--download-sections', section, '--force-keyframes-at-cuts',
        '-o', str(dest), f'https://www.youtube.com/watch?v={vid}',
    ], check=True)
    return dest


def encode(src: pathlib.Path, name: str) -> tuple[float, float]:
    OUT.mkdir(parents=True, exist_ok=True)
    # 854x480 is generous for something shown at 40% opacity behind a grading
    # layer; the halls blur and darken it further.
    common = ['-y', '-i', str(src), '-t', str(SECONDS), '-an', '-sn',
              '-vf', 'scale=854:-2:flags=lanczos,fps=24']
    subprocess.run([FF, '-loglevel', 'error', *common,
                    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '44',
                    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
                    str(OUT / f'{name}.webm')], check=True)
    subprocess.run([FF, '-loglevel', 'error', *common,
                    '-c:v', 'libx264', '-crf', '32', '-preset', 'slow',
                    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                    str(OUT / f'{name}.mp4')], check=True)
    return ((OUT / f'{name}.webm').stat().st_size / 1024,
            (OUT / f'{name}.mp4').stat().st_size / 1024)


def main() -> None:
    probe = '--probe' in sys.argv
    sheet = []
    total_w = total_m = 0
    for name, vid, start in CLIPS:
        src = grab(name, vid, start)
        if probe:
            shot = RAW / f'{name}.png'
            subprocess.run([FF, '-loglevel', 'error', '-y', '-i', str(src),
                            '-vf', 'scale=320:-2', '-frames:v', '1', str(shot)], check=True)
            sheet.append(str(shot))
            print(f'{name:<10} frame → {shot}')
            continue
        w, m = encode(src, name)
        total_w += w
        total_m += m
        print(f'{name:<10} webm {w:6.0f}KB   mp4 {m:6.0f}KB')

    if probe:
        subprocess.run([FF, '-loglevel', 'error', '-y', *sum([['-i', s] for s in sheet], []),
                        '-filter_complex', f'hstack=inputs={len(sheet)}',
                        str(RAW / 'contact.png')], check=True)
        print(f'\n→ {RAW / "contact.png"}')
        return

    manifest = [{'id': n, 'webm': f'media/backdrop/{n}.webm', 'mp4': f'media/backdrop/{n}.mp4'}
                for n, _, _ in CLIPS]
    (HERE / 'src/data/backdrop.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'\ntotal      webm {total_w:6.0f}KB   mp4 {total_m:6.0f}KB')
    print('→ src/data/backdrop.json')


if __name__ == '__main__':
    main()
