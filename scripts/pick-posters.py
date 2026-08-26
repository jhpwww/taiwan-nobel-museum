#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pick-posters.py — choose the card thumbnail for each lecture.

Two rules, both from the project owner:

  · the thumbnail comes from the **Taiwan lecture** recording, never the 導讀
  · it shows the **laureate's** face

Detection alone cannot do the second. Run over these recordings it happily
returns a face — on the printed banner behind the stage, on a slide, on a
member of the audience, on the host holding the microphone. Several of the
uploader-chosen thumbnails are designed promo cards rather than footage at
all, and one lecture's opens on a string quartet.

So this recognises rather than detects. Each laureate's official portrait is
read from the nobelprize.org page the catalogue already links to, embedded
with SFace, and every face in every candidate frame is compared against it.
A frame only wins if the person in it *is* the laureate.

Candidates are the three automatic frames YouTube samples from inside the
recording. `maxresdefault` is deliberately last: it is whatever the uploader
chose, which for this series is usually a title card. The full recording
cannot be reached from this network to cut a frame at an arbitrary time — see
the backdrop clip pipeline for why — so three frames is the pool.

Writes src/data/posters.json: lecture id → frame suffix. Anything unmatched
is omitted, and LectureCard falls back to the recording's default thumbnail.

    .venv-cv/bin/python scripts/pick-posters.py [--report]
"""
import html
import json
import pathlib
import re
import subprocess
import sys

import cv2
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent.parent
DETECT = HERE / '.tools/yunet.onnx'
RECOGNISE = HERE / '.tools/sface.onnx'
OUT = HERE / 'src/data/posters.json'
SHOTS = HERE / 'assets-src/posters'
CACHE = HERE / 'assets-src/portraits'

# Real frames from inside the recording first; the uploader's pick last,
# because in this series it is usually a designed title card.
CANDIDATES = ['hq1', 'hq2', 'hq3', 'maxresdefault']
DETECT_CONF = 0.70
#: SFace's own documented same-person threshold for cosine similarity. Lower
#: values let through the audience member in the third row who happens to be a
#: grey-haired man in a dark suit — which, at a lecture like these, is most of
#: the third row. Better to fail loudly and let a human supply the still.
SAME_PERSON = 0.363

UA = 'Mozilla/5.0 (compatible; nobel-museum-poster-picker/1.0)'


def get(url: str) -> bytes:
    r = subprocess.run(['curl', '-sL', '--max-time', '30', '-A', UA, url],
                       capture_output=True)
    return r.stdout if r.returncode == 0 else b''


def decode(raw: bytes) -> np.ndarray | None:
    if not raw:
        return None
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    # YouTube answers a missing size with a small grey placeholder
    return None if img is None or img.shape[0] < 180 else img


def portrait(lid: str, facts_url: str) -> np.ndarray | None:
    """The laureate's official portrait, cached so reruns are cheap."""
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f'{lid}.jpg'
    if cached.exists():
        return cv2.imread(str(cached))
    page = html.unescape(get(facts_url).decode('utf-8', 'replace'))
    urls = re.findall(r'https://www\.nobelprize\.org/images/[^"\'\s]+\.(?:jpg|jpeg|png)', page)
    # the portrait crop is tighter on the face than the landscape one
    urls.sort(key=lambda u: (0 if 'portrait' in u else 1, len(u)))
    for u in urls:
        img = decode(get(u))
        if img is not None:
            cached.write_bytes(get(u))
            return img
    return None


def faces(det, img: np.ndarray):
    h, w = img.shape[:2]
    det.setInputSize((w, h))
    _, found = det.detect(img)
    return [] if found is None else [f for f in found if f[-1] >= DETECT_CONF]


def main() -> None:
    for m in (DETECT, RECOGNISE):
        if not m.exists():
            sys.exit(f'{m} missing — see the note at the top of this file')
    report = '--report' in sys.argv
    if report:
        SHOTS.mkdir(parents=True, exist_ok=True)

    lectures = json.loads((HERE / 'src/data/lectures.json').read_text(encoding='utf-8'))['lectures']
    det = cv2.FaceDetectorYN.create(str(DETECT), '', (320, 320), 0.6)
    rec = cv2.FaceRecognizerSF.create(str(RECOGNISE), '')

    chosen: dict[str, str] = {}
    misses: list[str] = []

    for lec in lectures:
        lid = lec['id']
        vid = lec['video'].get('lecture')
        if not vid:
            misses.append(f'{lid}: no Taiwan recording')
            continue

        ref_img = portrait(lid, lec['links'].get('nobel_facts', ''))
        ref_faces = faces(det, ref_img) if ref_img is not None else []
        if not ref_faces:
            misses.append(f'{lid}: no usable official portrait')
            print(f'{lid:<12} —  no reference portrait')
            continue
        ref_vec = rec.feature(rec.alignCrop(ref_img, ref_faces[0]))

        results = []
        for name in CANDIDATES:
            img = decode(get(f'https://i.ytimg.com/vi/{vid}/{name}.jpg'))
            if img is None:
                continue
            h, w = img.shape[:2]
            best = (0.0, 0.0, None)
            for f in faces(det, img):
                sim = rec.match(ref_vec, rec.feature(rec.alignCrop(img, f)),
                                cv2.FaceRecognizerSF_FR_COSINE)
                if sim < SAME_PERSON:
                    continue
                x, y, fw, fh = f[0], f[1], f[2], f[3]
                # how much of the frame the face fills: separates a portrait
                # from a speck on a distant stage
                size = min(1.0, (fh / h) / 0.30)
                cx, cy = (x + fw / 2) / w, (y + fh / 2) / h
                central = 1.0 - min(1.0, abs(cx - 0.5) * 1.2 + abs(cy - 0.45) * 0.7)
                s = 0.50 * float(sim) + 0.32 * size + 0.18 * central
                if s > best[0]:
                    best = (s, float(sim), (int(x), int(y), int(fw), int(fh)))
            if best[2] is not None:
                results.append((best[0], best[1], name, img, best[2]))

        if not results:
            misses.append(f'{lid}: laureate not recognised in any frame')
            print(f'{lid:<12} —  not recognised')
            continue

        # A hard preference, not a scoring nudge. A title card carries a large,
        # well-lit, dead-centre portrait and will out-score any real stage shot
        # every time — and a title card is not a 講座截圖. Take the best frame
        # from inside the recording whenever one recognises the laureate at
        # all, and only fall back to the uploader's pick when none does.
        inside = [r for r in results if r[2] != 'maxresdefault']
        pool = inside or results
        pool.sort(key=lambda r: -r[0])
        s, sim, name, img, box = pool[0]
        chosen[lid] = name
        rest = ' '.join(f'{n}:{v:.2f}' for v, _, n, _, _ in pool[1:])
        flag = '' if inside else '   ← title card, no in-video frame matched'
        print(f'{lid:<12} {name:<14} score {s:.2f}  match {sim:.2f}   ({rest}){flag}')

        if report:
            x, y, w, h = box
            cv2.rectangle(img, (x, y), (x + w, y + h), (80, 200, 255), 3)
            cv2.imwrite(str(SHOTS / f'{lid}-{name}.jpg'), img)

    OUT.write_text(json.dumps(chosen, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print(f'\n{len(chosen)}/{len(lectures)} recognised  →  {OUT}')
    if misses:
        print('\nfalling back to the default thumbnail:')
        for m in misses:
            print(' ', m)


if __name__ == '__main__':
    main()
