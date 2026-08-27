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
- In Chinese copy, gloss every proper noun and technical term with its original on first use:
  人名（Ragnar Frisch）, 機構（Sveriges Riksbank）, 學術用語（click chemistry）. The audience is
  students who will meet these terms in English everywhere else.
- zh-TW is primary, en is secondary, with a switch in the header. Taiwanese usage throughout
  — 軟體, 資訊, 程式. Never mainland variants.
- English lecture titles stay as delivered; the Chinese rendering sits under them in `.gloss`.
  Laureate names follow the same rule: English is primary, the Chinese name is the gloss
  beneath it. Set names in `--font-display`, not `--font-han-serif`, or the `:lang(zh) h1`
  rule will render Latin text in the CJK serif.
- No hardcoded user-facing strings in components. Everything goes through `src/i18n/ui.ts`.

**Links and routing**
- Every internal URL comes from `src/i18n/routing.ts`. Never hardcode a leading `/` — this is
  a project site served from `/<repo>/` and `base` must be respected.
- Every EXTERNAL link goes through `ExtLink.astro`, or carries the same three things it does:
  `target="_blank"`, `rel="noopener noreferrer"`, and a visually-hidden "opens in a new tab".
  The gallery material buttons are the one hand-rolled exception, because they need
  `aria-describedby` for the popup. Audit with a grep over `dist/` for external `<a>` without
  `target="_blank"` — it should return zero.

**Home page**
- The announcement slot is never empty: `nextUpcoming()` if the schedule still has a future
  lecture, otherwise `recommended()`. "Today" is the BUILD date, so a lecture stops being
  upcoming at the next rebuild, not at midnight. An upcoming lecture may have no video yet —
  that branch must keep working.

**The hall**
- Three variants share one `HomePage.astro` via a `style` prop: `flat` (SVG), `room` (CSS 3D),
  `gl` (WebGL). Only the hall differs; never fork the pages below it.
- `Sculpture3D.astro` EXTRUDES `Sculpture.astro` — it stacks the same SVG along Z and darkens
  the back slices. Do not rebuild the forms from CSS primitives; that was tried and the
  silhouettes came out worse than the artwork.
- The WebGL scene is procedural on purpose: no model files, so the only payload is three.js.
  Keep it that way. DPR is capped at 1.5, there are no shadow maps, and the loop must stop on
  IntersectionObserver and visibilitychange.
- Anything drawn on the canvas is decoration. Every link must exist in the markup underneath.
- NEVER gate an animation on `@media (prefers-reduced-motion: reduce)` or on
  `matchMedia(...).matches` alone. Ask `motionOn()` (`src/scripts/motion.ts`) in JS and key CSS
  off `html[data-motion='off']`. The OS switch is system-wide and unoverridable; used raw it
  leaves visitors with a completely static museum and no way back.
- Overlays that need clicking must be checked against the fixed header, which spans the full
  width. Painting above it (z-index) is not enough — the header still swallows the pointer.
- Camera moves are WALL-CLOCK driven (`performance.now()` against a stored `t0`), never by
  accumulating a clamped per-frame delta. With a clamp, a slow renderer stretches a 1.15 s move
  into tens of seconds and any navigation waiting on its callback never happens.
- Any action that waits on the render loop needs a timeout backstop that runs regardless.
- The adaptive quality ladder in `degrade()` must always draw a frame before it stops; resizing
  clears the buffer, so stopping straight after a resize leaves a black canvas.
- The footer copyright must never wrap. It is `white-space: nowrap` with a viewport-scaled font,
  and it needs `max-width: none` because the global `p { max-width: 62ch }` otherwise forces a
  break. Verified from 320px up.
- `scripts/make-ambient.py` regenerates the background loop. Every motion period must divide the
  clip length exactly — that is what makes it seamless without a crossfade. Keep it dark; it sits
  behind text.

**Outbound links**
- Run `python3 scripts/check-links.py dist` after any change touching external URLs. A HEAD
  request is NOT enough — it misses dead DNS and soft 404s. `educational.nobelprize.org` was
  shipped broken because only the per-category URLs were verified and the shared ones were not.
- Verify every link that gets added, not a sample of them.
- The YouTube ids are NOT in `href` — they sit in `data-yt`, iframe srcs and `data-picks`. Any
  link audit that only reads `href` misses every video on the site.
- oEmbed 200 proves a video is public, not that it is embeddable. Check the embed endpoint too.

**Framing**
- This site is a MUSEUM. Its name, its home page and its navigation are the museum's.
- The learning tools are museum features that happen to suit a course. Course-specific framing
  must stay subordinate: an aside at the foot of `/learn/`, or a parenthetical note — never a
  page title, never a nav item, never the first thing on a lecture page. A visitor who is not
  taking the course must not feel they have wandered into a classroom.

**Media and rights**
- The hall backdrop is real lecture footage via `LectureScreen.astro`, not a stock loop. A
  cross-origin YouTube iframe CANNOT be read into a WebGL texture — that is why the rotunda
  cycles the 1/2/3.jpg frames instead. Do not try to sample the player.
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

**Badges**
- The 導讀影片 badge is the same object in two components — `.card__badge` in LectureCard and
  `.vf__label` in VideoFacade. Top-left, `--accent-block`, dark text. Restyle both or neither.

**Touch**
- Never leave a `:hover` rule ungated on anything that navigates or acts on tap. On a touch
  device the first tap applies hover; if the page visibly changes the browser withholds the
  click, so the control only fires on the second or third tap. Put hover effects inside
  `@media (hover: hover) and (pointer: fine)` and give the same affordance to `:focus-visible`.
- Gate `pointerenter`/`pointerleave` handlers on `pointerType === 'mouse'` for the same reason —
  reacting to the pointer events of a tap is itself the visible change that eats the tap.
- Interactive elements carry `touch-action: manipulation` (set globally in global.css) so the
  browser does not hold the click waiting for a possible double-tap-zoom.
- Playwright's device emulation does NOT reproduce these behaviours: it delivers a clean tap and
  ignores sticky hover. A green emulated test is not evidence the bug is fixed on a real phone.

**The video facade**
- The player is built on `pointerdown`, hidden behind the poster, and revealed on `click`.
  That ordering is the point: mobile browsers refuse to start unmuted video in an iframe created
  AFTER the gesture, so building it first lets the tap land on a player that already exists.
  A gesture that turns into a scroll (pointermove past ~12px, pointercancel, or a scroll event)
  discards the half-built player.
- Never put `pointer-events: none` on the facade button. It is still waiting for the pointerup
  and click that hand over to the player; suppressing them strands the video permanently.

**Weight of the CSS-3D room**
- `Sculpture3D` extrudes each SVG into 12 slices, each with its own `filter` — so each slice is
  a separate composited surface. The room holds six of those plus a mirrored copy of each: 144
  filtered SVGs. That is fine on a desktop GPU and will get the tab discarded on iOS Safari.
- Below 62rem the mirrors, the video wall and all but three slices are removed — the extra
  slices are deleted from the DOM, not merely hidden, because display:none still retains them.
- The walk-in zoom is set from JS (`--walk-zoom`), 1 on small screens. Scaling the room
  re-rasterises every composited layer at the new size, which is what used to kill the tab at
  exactly the moment of navigating into a gallery.
- If you add anything to this room, check the phone numbers first: `document.querySelectorAll('.x3d svg').length` should stay around 39 on a phone, not 150.

**CSS**
- Two accent tokens, and they are not interchangeable. `--accent` paints strokes, text, borders
  and the sculptures — full-strength hue. `--accent-block` paints solid fills (material buttons,
  the 導讀影片 badge); for chemistry and medicine it is the white-tinted pastel, because those two
  hues read as garish over a large filled area. Never use `--accent` for a solid block.
- Dark text sits on `--accent-block`, so any change to those tokens or to the button gradient
  must be re-checked for WCAG AA (4.5:1). Economics is currently the tightest at 6.40:1.
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

## Copy voice

Every descriptive string on the site is a museum wall label, not a lesson.

- Facts first. State what was found, then why it mattered. No preamble.
- Third person throughout gallery, lecture and hall copy. Second person is
  allowed only in the study tools, where the reader is writing.
- No rhetorical-question hooks, no closing moral, no telling the reader what
  to feel or how impressed to be.
- Never the 「不是 X，而是 Y」 rhythm as an ornament; only where the contrast
  is the actual point, and at most once.
- Chinese: 破折號 (——) sparingly, and never in a hook. Official lecture
  titles keep whatever punctuation they were delivered with.
- Every proper noun carries its original in parentheses on first use.

## PageNav (the two standing controls, lower right)

`src/components/PageNav.astro`, mounted once in `Base.astro`, so every page
has it.

- "Back to top" appears only past `max(320px, 60vh)` of scroll. Clicking it
  also moves focus to `#main` (which carries `tabindex="-1"`), or a keyboard
  visitor is returned to the top visually while their focus stays deep in the
  page.
- "Previous page" is shown only when `document.referrer` is same-origin.
  `history.length` is useless for this — a fresh tab already reports 2 — and
  without the check the control would dead-end on a search engine.
- z-index is 35: above page content, below the walk-in overlay (40) so the
  transition covers it, and clear of the switcher (60) and toggle (61).
- The button keeps its slot when hidden (`visibility`), so nothing shifts as
  it fades in. Only the referrer check uses `hidden`, and it is decided once
  at load.

## The study store must never claim a save it did not make

`localStorage.setItem` throws in a private window and wherever the browser is
set to block site data. Swallowing that and printing 「已儲存」 is worse than
any crash: the student writes six notes, trusts the confirmation, and loses
all of it on reload.

- `write()` in `src/scripts/study.ts` returns whether the value was kept.
  `setNote()` and `updateKept()` pass it up; the UI shows 「未能儲存」 in the
  warning colour, and holds it longer than the success message.
- `storageAvailable()` probes once on load; both `StudyPanel` and `StudyPage`
  show a standing banner when it fails, before anything has been typed.

## Where a visitor can actually write

Notes belong to a lecture, but requiring a trip to each lecture page made
學習專區 a signpost with no writing surface anywhere behind it. `/study/` now
carries the chooser (all 31 lectures), the watch toggles and the note fields,
so the whole task can be done on one page. The lecture-page panel stays, and
its notes open automatically once that lecture is chosen.

Rebuild the editable blocks only when the *set* of chosen ids changes — never
on input. Repainting a textarea from storage mid-sentence is exactly how the
panel used to lose text.

## The objects hall (`/models/`)

The fourth hall shows real glTF models instead of drawn ones. Three scripts
own the pipeline and are meant to be re-run in order:

1. `scripts/fetch-models.py` — downloads the four borrowed GLBs from Poly
   Pizza. Provenance is re-read from the model page at fetch time rather than
   typed in, so the credit cannot drift from the file. Swapping one is a
   one-line change to `PICKS`.
1b. `scripts/build-models.mjs` — the atom and the balance, built here: Poly
   Pizza has no balance worth using and nothing that reads as an atom, and a
   telescope narrowed physics to astronomy. Flat-shaded low-poly on purpose,
   to sit beside the borrowed four.

   Both scripts write `data/model-credits.json` and **merge** rather than
   overwrite — each owns part of the six, and running either alone must leave
   a complete set. `source: 'original'` suppresses the outbound credit link.

   Matrix order in build-models.mjs is column-major: in `chain(a, b)` it is
   `b` that reaches the point first. Getting this backwards silently collapses
   the atom's three shells into one plane and swings the balance beam off its
   column — both looked plausible until rendered.
2. `scripts/normalise-models.mjs` — six authors means six scales (the flask
   arrives 19 units tall, the coin 0.03) and six pivots. Each is re-centred on
   its own bounding box and scaled so its longest axis is 1, after which every
   icon takes the same camera. Materials are then re-cast in the hall's accent
   colour, which is also what removes the coin's dollar sign.
3. `scripts/render-posters.mjs` — renders the poster through model-viewer
   itself, so the still matches the frame the live model settles into. Serves
   `public/` on its own port; needs no external server.

`CAMERA` appears in both the renderer and `HallModels.astro`. They must match
or the poster jumps when the model takes over.

- model-viewer lives in `vendor/`, not `public/`. Imported it is bundled once;
  a copy in `public/` would ship a second megabyte that nothing requests.
- The model is decoration inside the link, so it carries `pointer-events:
  none`. Without it the anchor never sees the click.
- The fallback chain is model → poster → bare link. The `<img slot="poster">`
  is what a browser that never upgrades the custom element renders, so it must
  stay a real child element.
- Credits are emitted with `<Fragment set:html>`. A JSX comment (`{/* … */}`)
  is stripped at build and never reaches the page.
- Rotation follows `motionOn()`, never the media query alone.

## Fonts are self-hosted and subset

`scripts/subset-fonts.mjs` owns the three web fonts. Google Fonts was sending
2.1–3.6 MB of CJK chunks per page — more than the difference between any two of
the four hall designs — and put a third party in the request path of every
visit, which the About page's privacy claim reads badly against.

- The corpus is bucketed by **resolved** font, not by selector: the script
  opens all 92 built pages and reads `getComputedStyle().fontFamily` on every
  text node. The serif only draws headings, so it carries 350 ideographs where
  the sans carries 993 — that split alone is worth 220 KB.
- Two-pass, because the corpus comes from the rendered site:
  `npm run build && node scripts/subset-fonts.mjs && npm run build`.
- `src/styles/fonts.css` and `src/data/font-manifest.json` are **generated**.
  The manifest exists so the preload in `Base.astro` names the identical
  hashed URL the CSS asks for — name it differently and the font downloads
  twice.
- Font files are hashed for the same reason the models are: `public/` URLs are
  stable across deploys and GitHub Pages serves them with `max-age`.
- Upstream TTFs (29 MB) and `.venv-fonts/` are gitignored; the script fetches
  the fonts if they are missing.
- A glyph outside the corpus is not tofu — it falls back to PingFang TC /
  Microsoft JhengHei. Visitors typing into the study notes are fine; only the
  typeface shifts.

## The hall backdrop

`LectureScreen.astro` has two paths and picks the first that is available:

1. **Self-hosted cuts** — `src/data/backdrop.json`, generated by
   `scripts/make-backdrop-clips.py`. Ten seconds each, looping, a few hundred
   KB. Downloaded once; the backdrop then costs nothing however long a visitor
   stays. A muted `playsinline` `<video>` also autoplays on iOS.
2. **Cross-faded stills** — the fallback when that file is empty. The same
   lecture frames, alternating between two `<img>` layers every nine seconds.

It used to be a live youtube-nocookie embed. On the deployed site that
streamed 0.27–0.30 MB/s and never stopped: 7 MB for ten seconds of looking,
21 MB for a minute. It could not work on a phone at all — iOS will not
autoplay a cross-origin iframe without a gesture, so the player mounted, sat
paused, and put a pause glyph over the hall.

**When clips are added, the About page must change.** It currently states, in
both languages, that nothing here is stored, re-cut or re-hosted. That is true
while `backdrop.json` is empty and false the moment it is not.

Never verify this by asking whether the element exists. `iframe present` and
`data-on set` say nothing about playback — that mistake is what shipped a
paused player to phones. Compare two frames after the reveal has finished, and
remember that headless Chromium applies desktop autoplay policy whatever the
`isMobile` flag says.

## Card thumbnails

`scripts/pick-posters.py` chooses them; `src/data/posters.json` is its output;
`LectureCard.astro` reads it. Two rules from the owner: the frame comes from
the **Taiwan lecture** recording, never the 導讀, and it shows the
**laureate's** face.

Detection alone cannot do the second. Run over these recordings YuNet happily
returns a face — on the printed banner behind the stage, on a portrait in a
slide, on an audience member. So each laureate's official portrait is read
from the nobelprize.org page the catalogue already links to and every
candidate face is matched against it with SFace. `SAME_PERSON` is 0.363, the
model's own threshold; loosening it lets through any grey-haired man in a dark
suit, which at these lectures is most of the third row.

`maxresdefault` is a hard last resort, not a scoring nudge — in this series it
is usually a designed title card, which is not a 講座截圖, and its large
centred portrait out-scores every real stage shot.

The pool is only the three frames YouTube samples from inside the recording
plus the uploader's pick. Storyboards would give far more but are 320×180, and
the recording itself cannot be reached from this network to cut a frame at an
arbitrary time — same block as the backdrop clips.

Re-run after changing which video a lecture points at. Models live in
`.tools/` (gitignored); the script names where to fetch them.

## The bright museum

The same site in daylight, at `/bright/`. Same routes, same data, same
components — built a second time with `THEME=bright` and a nested
`BASE_PATH`, then copied into `dist/bright` by the deploy workflow. The dark
build is byte-for-byte what it was: nothing about it reads the flag.

- `src/styles/bright.css` is nothing but token overrides scoped to
  `html[data-theme='bright']`. Both builds ship the same stylesheet; only the
  attribute differs. Add a bright rule there, never a fork of a component.
- White ground, near-black text, **red** for anything actionable, **gold** for
  what the museum owns. Category hues stay inside that band — six unrelated
  colours would fight the palette — and each is dark enough to hold on white.
- Gold models: `scripts/normalise-models.mjs` writes a second set to
  `public/assets/models/gold/`. Metalness near 1 with low roughness is what
  makes them read as a statuette; the base colour alone reads as yellow paint.
- `HallBright.astro` is the one component with no dark counterpart. The room is
  **drawn** — perspective computed against a single vanishing point and emitted
  as SVG — because rotated CSS planes fought each other: a ceiling laid back far
  enough to be seen swung across the wall. CSS 3D is kept only for the curve of
  the screens, which it does better than anything else.
- Wall rows translate by `104%` of a panel's own height, not a pixel value. The
  panels are clamped to the viewport, so a fixed gap opened between rows at
  every width but one.
- No embers: they belonged to a vault and read as dirt on marble. Daylight
  shafts, with dust visible only inside them.

## Colour is measured, not eyeballed

Two scripts, both worth running after any palette change:

- `node scripts/check-contrast.mjs [--theme bright]` — reads the tokens out of
  the stylesheet and checks the pairings the site renders.
- `node scripts/audit-contrast.mjs <origin>` — the one that finds real bugs.
  It walks every text node on the built pages, resolves the colour actually
  painted and the nearest opaque background behind it, and reports anything
  under AA. Token-level checking cannot see a safe colour applied over a
  surface it was never measured against, which is how the gold links ended up
  at 3.2:1.

Two traps it took a while to see:

- A computed colour comes back as `rgb()` with 0–255 channels, or — once
  `color-mix()` is involved, which every surface here uses — as
  `color(srgb r g b / a)` with 0–1 channels. Reading the second as the first
  makes every surface look black and every reading a false failure.
- Text over a gradient cannot be sampled this way at all. Skip it and look.

**Never fix a theme problem by out-specifying a component.** Astro's scoped
selectors carry a `[data-astro-cid-…]` on every part, so `.study[cid]
button[cid]` beats `html[data-theme='bright'] .study button`. When a component
hardcodes a colour, give it a token — `--on-accent`, `--kind-guide` — and
restate that token in the theme. The dark values are unchanged, so the dark
site renders exactly as before.

The dark theme has ~42 text styles below AA, nearly all muted greys on the
warm dark ground. Left alone deliberately: the owner asked for that site to
stay as it is.

## Smooth statues

The pieces are smooth-shaded, in `scripts/normalise-models.mjs`. Order matters:

1. `dedup, prune`
2. `smoothNormals()` — per **corner**, not per vertex, and crease-aware at 60°:
   a corner averages only the faces meeting at its position whose own normal
   lies within the threshold. Average everything and the sharp edges soften
   too — the flask's rim rounds off, the balance's beam melts into its pans.
3. `weld()` — worth doing only now. Before smoothing every corner carried its
   own face normal and nothing could merge; afterwards a sphere collapses from
   three vertices a triangle to one a lattice point, and most files shrank.
4. one round of Loop subdivision, for `SUBDIVIDE` only, then smooth and weld
   again. Smooth normals fix the shading but not the outline: an eight-facet
   flask has an eight-sided silhouette however it is lit.
5. `quantize()` — **and the extension must be registered on the `NodeIO`**.
   gltf-transform silently drops an unregistered extension on write, which
   leaves quantised accessors with no `KHR_mesh_quantization` declaration:
   invalid glTF that happens to load in three.js. Check `extensionsRequired`
   in the output before trusting it.

The dove is deliberately **not** subdivided. Its mesh carries split vertices
along the wings and tail, and Loop subdivision pulls those apart into visible
cracks — the wing detaches from the body. Smooth normals alone carry it.

The atom and the balance are generated, so they are simply built at a
resolution that needs no help; raise the segment counts in `build-models.mjs`
rather than subdividing them.

Re-run `scripts/render-posters.mjs` after any geometry change, or the poster
no longer matches the model it stands in for.


## The bright palette's one known exception

`--accent-block` is TED's #e62b1e because the owner asked for the brand red on
filled blocks. White on it measures **4.44:1** against AA's 4.5 — a 1.3%
shortfall, and unfixable while the fill stays that red, since white is already
the lightest ink available. Two small labels are affected: the note panel's
copy button and the browse page's filter chips.

Text red is the darkened `--red-ink` (5.72:1) and passes everywhere. Do not
"fix" the block red by darkening it — that was asked for and reverted once.
If strict AA is wanted later, the lever is the label, not the colour: at
18.66px bold the bar drops to 3:1.

## Type on paper

`scripts/audit-type.mjs <origin>` lists what each page actually renders —
family, size, weight, tracking in em, leading as a ratio — rather than what the
stylesheet intends. Run it before and after any type change; the numbers a
typographer reasons in are not the ones `getComputedStyle` returns.

The bright theme restates the type, because light-on-dark and dark-on-light are
different optical problems. On the dark ground glyphs bloom into the
background, so that museum opens its tracking to keep counters clear and sits
at a light weight. Reverse the ground and both corrections invert: the same
weight reads thin, the same tracking reads loose enough that words stop
holding together.

- Cormorant Garamond goes to **600** everywhere on paper. It is a display
  Garamond — very high stroke contrast, small x-height — and under about 40px
  its hairlines disappear on white. Backlit they held.
- Uppercase Latin labels keep their tracking; that is correct typography. What
  is cut is Chinese that inherited a Latin small-caps measure — the eyebrows
  at 0.16em, the hall hints at 0.18em. CJK is already set on an even body.
- Leading tightens slightly (1.75 → 1.72), because the higher contrast lets the
  eye find the next line with less help.

All of it is scoped to `html[data-theme='bright']`; the dark museum's type is
untouched, and the audit on the dark origin should still report `.lec__who` at
500/0.03em and `.eyebrow` at 0.16em.

## Two museums, two sets of faces

`scripts/subset-fonts.mjs [--theme bright]` runs once per museum and nothing is
shared: separate font list, separate output directory, separate stylesheet,
separate manifest.

- dark: Cormorant Garamond + Noto Sans/Serif TC → `public/assets/fonts/`
- bright: Source Serif 4 + Source Sans 3 + Noto Sans/Serif TC →
  `public/assets/fonts/bright/`

Source Serif and Source Sans are chosen on purpose: Noto Serif TC **is** Source
Han Serif TC and Noto Sans TC **is** Source Han Sans TC, so the Source Latin
faces are their siblings by design and share their proportions and colour.
Cormorant is a display Garamond whose hairlines vanish on white at text size.

Three traps, all of which bit:

- **Bucket by the font that will draw the character, not the head of the
  stack.** The bright body stack names Source Sans 3 first, so reading only
  `fontFamily.split(',')[0]` credited 964 ideographs to a face that has none and
  left the CJK face with nothing at all.
- **Link the stylesheet, do not bundle it.** Both museums name families like
  `Noto Serif TC`. With both stylesheets in one build the browser matched the
  other museum's `@font-face` and fetched a file that was not there. One
  `<link>` per build makes the collision impossible.
- **Derive the URL from the output path.** Hardcoding `assets/fonts/` produced
  a preload pointing at nothing once the bright faces moved to a subdirectory.

`scripts/audit-type.mjs` reports what each page renders. Run the conflict check
against it when a label looks different between a parent and child page — the
same text set in two faces is a defect, but a filter chip set in sans while the
heading is serif is not: those are different roles.


## The bright museum leads with its sans

Every title, and every laureate's name where it heads a block, is set in
Source Sans. Only the one-line hook keeps a serif — it is a pull-quote, the
one place the museum speaks rather than labels, and it has its own token
(`--font-hook`) so a theme can move every heading without dragging the
editorial voice along.

Do this **at the token**, never by out-specifying components. `--font-display`
and `--font-han-serif` are both the sans in the bright theme. A per-selector
list was tried first and lost quietly: Astro scopes every rule with a
`[data-astro-cid-…]`, so `.study[cid] h2[cid]` beats any reasonable theme
selector, and the failure shows up as one heading in the wrong face on one
page.

Re-run `scripts/subset-fonts.mjs --theme bright` after moving text between
faces. Headings moving from the serif to the sans moves their glyphs too:
Noto Serif TC dropped from 350 ideographs to 270 and Noto Sans TC gained them.
Skip it and the headings lose coverage.
