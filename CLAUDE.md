# CLAUDE.md

Conventions for this repository. Read `README.md` first for what the project is.

## Stack

Astro 5 + TypeScript, plain CSS, no UI framework. Fully static: no server, no serverless
function, no database, no login. If a task seems to need one, stop and say so.

## Layout

```
data/
  catalog.json          verified facts, produced by scripts/seed-catalog.py
  sheet-seed.csv        the CSV to import when creating the Google Sheet
scripts/
  seed-catalog.py       hand-verified source data -> data/catalog.json
  copy-zh-en.py         editorial hook + summary for all 31, both languages
  build-catalog.py      catalog.json + copy -> src/data/lectures.json
  export-sheet-csv.py   src/data/lectures.json -> data/sheet-seed.csv
  sync-sheet.mjs        published Google Sheet -> src/data/lectures.json (CI)
  shots.mjs             serve dist/ and screenshot it with Playwright
src/
  data/catalog.ts       the typed accessor — import from here, never from the JSON
  data/lectures.json    generated; do not hand-edit
  i18n/ui.ts            every user-facing string
  i18n/routing.ts       every internal URL
  components/ layouts/ pages/ styles/
```

## Rules

**Content**
- The published Google Sheet is authoritative. Never hand-edit `src/data/lectures.json`.
- Never invent a laureate name, date, video id, or URL. A missing field renders as absent,
  not as a plausible guess. `sync-sheet.mjs` fails the build on a malformed required field.
- The 導讀 narration scripts are reference material. Their text must not appear on the site.
- Do not put pronunciation glosses (e.g. `Sudhof (酥豆腐)`) anywhere near a page.

**Language**
- zh-TW is primary, en is secondary, with a switch in the header. Taiwanese usage throughout
  — 軟體, 資訊, 程式. Never mainland variants.
- English lecture titles stay as delivered; the Chinese rendering sits under them in `.gloss`.
- No hardcoded user-facing strings in components. Everything goes through `src/i18n/ui.ts`.

**Links and routing**
- Every internal URL comes from `src/i18n/routing.ts`. Never hardcode a leading `/` — this is
  a project site served from `/<repo>/` and `base` must be respected.

**Media and rights**
- YouTube only, via `youtube-nocookie.com`, behind the click-to-load facade. Never download,
  re-host, re-cut or proxy a video.
- Nobel Foundation material is linked, never copied into the repo.

**Security**
- No API key, token or secret in the repo or in client code. The site is public and static.
- Never add staff names, phone numbers or email addresses to content. They exist in the
  internal production sheet and must not reach the published tab or this repo.

**Galleries**
- `CategoryKey` is the six real prize categories. `GalleryKey` adds `nobel`, the introduction
  room, which is *not* a prize category — the hall renders it separately from the plinths and
  `categoryList()` deliberately excludes it. Use `galleryKeys()` for routing.
- A category with zero lectures still gets a plinth and a page. Say so plainly and link out;
  never hide the category or show a bare "0". Hall order comes from `categoryList()`, which reads
  the `order` field — change it in `scripts/build-catalog.py`, not in the component.
- Every gallery must carry material beyond video: intro, history, statistics, official links.
  Category prose lives in `scripts/copy-galleries.py`; the numbers in `data/prize-facts.json`.
- The materials strip sits in the summary band, above the lectures, and shows titles only.
  Descriptions live in a popup anchored to the *list*, not to each chip — that is deliberate,
  so the popup spans the strip and can never overflow the viewport whichever chip is hovered.
  Always pair a hover affordance with `:focus-visible` and a `@media (hover: none)` fallback
  that reveals the text inline; a tooltip a touch user cannot open is a tooltip that does not exist.
- nobelprize.org slugs are **not** uniform — Peace and Economic Sciences break the
  `…-nobel-prize-in-X` pattern. Every URL in `fetch-prize-facts.py` was checked with a live
  request. Verify before changing one; do not tidy them by pattern.

**CSS**
- Warm palette only. Prize category is the sole carrier of hue, via `[data-cat]` → `--accent`.
- Tokens live in `src/styles/global.css`. Add a token rather than a one-off hex value.
- Every animation must be disabled under `prefers-reduced-motion`.

**SVG**
- Gradient strokes need `gradientUnits="userSpaceOnUse"`. With the default
  `objectBoundingBox`, a perfectly straight line has a zero-area box and renders **invisible**.
  This already cost one debugging round — do not reintroduce it.

## Definition of done

- `npm run check` and `npm run build` both clean
- `npm run shots` and actually look at the result before claiming a visual change works
- Keyboard-navigable, visible focus, WCAG AA contrast
- No console errors; no layout shift
- Test at 390px before 1440px
