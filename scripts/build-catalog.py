#!/usr/bin/env python3
"""
build-catalog.py — merge verified facts (seed-catalog.py) with editorial copy
(copy-zh-en.py) into src/data/lectures.json, which the site imports.

  python3 scripts/build-catalog.py

Fails loudly on a missing or unknown field rather than emitting a plausible
default. Never hand-edit src/data/lectures.json.
"""
import json, pathlib, importlib.util, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

copy = load("copy", "scripts/copy-zh-en.py")
cat  = json.loads((ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))

errors = []
for rec in cat["lectures"]:
    c = copy.COPY.get(rec["id"])
    if not c:
        errors.append(f"{rec['id']}: no editorial copy"); continue
    for f in ("title_zh", "hook_zh", "hook_en", "summary_zh", "summary_en", "tags"):
        if not c.get(f):
            errors.append(f"{rec['id']}: empty {f}")
    for t in c["tags"]:
        if t not in copy.TAGS:
            errors.append(f"{rec['id']}: unknown tag {t}")
    rec["title"]["zh"]       = c["title_zh"]
    rec["hook"]              = {"zh": c["hook_zh"], "en": c["hook_en"]}
    rec["description"]["zh"] = c["summary_zh"]
    rec["description"]["en"] = c["summary_en"]
    rec["topic_tags"]        = c["tags"]

if errors:
    print("BUILD FAILED:", file=sys.stderr)
    for e in errors: print("  -", e, file=sys.stderr)
    sys.exit(1)

cat["tags"] = {k: {"zh": v[0], "en": v[1]} for k, v in copy.TAGS.items()}
cat["categories"] = {
    "physics":   {"zh": "物理學",     "en": "Physics",   "order": 1},
    "chemistry": {"zh": "化學",       "en": "Chemistry", "order": 2},
    "medicine":  {"zh": "生理學或醫學", "en": "Physiology or Medicine", "order": 3},
    "economics": {"zh": "經濟學",     "en": "Economic Sciences", "order": 4},
    "peace":     {"zh": "和平",       "en": "Peace",     "order": 5},
    "nobel":     {"zh": "諾貝爾與他的獎", "en": "Nobel and his Prize", "order": 6},
}
cat["lectures"].sort(key=lambda r: r["event"]["date"])

out = ROOT / "src" / "data" / "lectures.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(cat, ensure_ascii=False, indent=2), encoding="utf-8")
n = len(cat["lectures"])
print(f"wrote {out.relative_to(ROOT)}  ({n} lectures, {len(cat['special_events'])} special events)")
print(f"  copy complete for {n}/{n};  tags: {len(cat['tags'])};  categories: {len(cat['categories'])}")
