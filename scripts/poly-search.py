#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
poly-search.py — find candidate GLBs on Poly Pizza, with their provenance.

Poly Pizza's API needs a key, but every model page carries what attribution
requires: title, author, licence and the GLB URL. This reads those pages so
that nothing is downloaded without knowing who made it and under what terms.

    python3 scripts/poly-search.py atom dove "balance scale"
"""
import html
import json
import re
import subprocess
import sys
import time

UA = "Mozilla/5.0 (compatible; nobel-museum-asset-check/1.0)"


def get(url: str) -> str:
    r = subprocess.run(
        ["curl", "-sL", "--max-time", "25", "-A", UA, url],
        capture_output=True, text=True,
    )
    return r.stdout


def size_of(url: str) -> int:
    r = subprocess.run(
        ["curl", "-sIL", "--max-time", "25", "-A", UA, url,
         "-o", "/dev/null", "-w", "%{size_download} %{header_json}"],
        capture_output=True, text=True,
    )
    m = re.search(r'"content-length":\s*\[\s*"(\d+)"', r.stdout)
    return int(m.group(1)) if m else -1


def model(mid: str) -> dict | None:
    s = get(f"https://poly.pizza/m/{mid}")
    glb = re.search(r"https://static\.poly\.pizza/[A-Za-z0-9_-]+\.glb\b", s)
    if not glb:
        return None
    text = " ".join(
        re.sub(r"<[^>]+>", " ", html.unescape(
            re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S))).split()
    )
    title = re.search(r"^(.*?) - Free 3D Model By (.*?) - Poly Pizza", text)
    lic = "CC0" if re.search(r"\bCC0\b|Public Domain", text) else (
        "CC-BY" if "Creative Commons Attribution" in text else "?")
    tris = re.search(r"By .*?Poly Pizza .*?([\d.]+k?)\s+([\d.]+k?)\s+\d", text)
    return {
        "id": mid,
        "title": title.group(1).strip() if title else "?",
        "author": title.group(2).strip() if title else "?",
        "licence": lic,
        "glb": glb.group(0),
        "page": f"https://poly.pizza/m/{mid}",
        "tris": tris.group(1) if tris else "?",
    }


def search(term: str, limit: int = 8) -> list[dict]:
    s = get("https://poly.pizza/search/" + term.replace(" ", "%20"))
    ids, seen = [], set()
    for m in re.finditer(r'href="/m/([A-Za-z0-9_-]+)"', s):
        if m.group(1) not in seen:
            seen.add(m.group(1))
            ids.append(m.group(1))
    out = []
    for mid in ids[:limit]:
        d = model(mid)
        if d:
            d["bytes"] = size_of(d["glb"])
            out.append(d)
        time.sleep(0.3)
    return out


if __name__ == "__main__":
    result = {t: search(t) for t in sys.argv[1:]}
    for term, rows in result.items():
        print(f"\n=== {term} ===")
        for r in rows:
            kb = r["bytes"] / 1024 if r["bytes"] > 0 else -1
            print(f'  {kb:7.0f}KB  {r["licence"]:<6} {r["tris"]:>6}tri  '
                  f'{r["title"][:34]:<34} — {r["author"][:22]:<22} {r["id"]}')
    with open("/tmp/poly-candidates.json", "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print("\n→ /tmp/poly-candidates.json")
