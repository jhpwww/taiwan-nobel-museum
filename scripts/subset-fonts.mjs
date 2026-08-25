/**
 * subset-fonts.mjs — cut the three web fonts to the glyphs this site renders.
 *
 * Google Fonts splits CJK into ~100 unicode-range chunks and the browser takes
 * the ones a page touches. Clever, but this site's Chinese reaches across most
 * of them, so most came down: measured live, every hall pulled 2.1–3.6 MB of
 * third-party font data — more than the gap between any two of the four hall
 * designs put together. Self-hosting also takes Google out of the request path,
 * which the About page's privacy claim is the better for.
 *
 * The subset is not one corpus but three. A character is only needed in the
 * font that actually draws it, and the serif draws headings while the sans
 * draws body text — so the page is opened in a browser and every text node is
 * bucketed by its *resolved* font, rather than guessed at from selectors.
 *
 * Licence: all three are SIL OFL 1.1, which permits subsetting and
 * redistribution. The licence ships beside the fonts.
 *
 * Two-pass by nature, since the corpus comes from the rendered site:
 *
 *     npm run build && node scripts/subset-fonts.mjs && npm run build
 *
 * The second build picks up the new file hashes. Re-run whenever visible text
 * changes. A glyph that is missing falls back to the next family in the stack
 * (PingFang TC, Microsoft JhengHei …) — a slight change of typeface, not tofu.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PY = '.venv-fonts/bin/python';
const SUBSET = '.venv-fonts/bin/pyftsubset';
const SRC = 'assets-src/fonts';
const OUT = 'public/assets/fonts';
const BASE = '/taiwan-nobel-museum';

/** css family name → source file, output name, the axis range the CSS asks for */
const FONTS = {
  'Noto Sans TC': ['NotoSansTC-VF.ttf', 'noto-sans-tc', '300:500'],
  'Noto Serif TC': ['NotoSerifTC-VF.ttf', 'noto-serif-tc', '400:600'],
  'Cormorant Garamond': ['CormorantGaramond-VF.ttf', 'cormorant-garamond', '400:600'],
};

/* Kept whatever the current build happens to show: the ranges a visitor's own
   typing and any future copy reach for first. Cheap — these are Latin and
   punctuation, not ideographs. */
const ALWAYS = [
  'U+0020-007E', 'U+00A0-00FF', 'U+2010-2027', 'U+2030-205E',
  'U+3000-303F', 'U+FE30-FE4F', 'U+FF00-FFEF',
].join(',');

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };

/* The upstream variable fonts are 29 MB and are not kept in the repo — they
   are inputs, not artefacts. Fetched on demand so the script runs from a clean
   checkout. All three are SIL OFL 1.1; the licences ship in public/assets/fonts. */
const UPSTREAM = {
  'NotoSansTC-VF.ttf': 'ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf',
  'NotoSerifTC-VF.ttf': 'ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf',
  'CormorantGaramond-VF.ttf': 'ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf',
};
fs.mkdirSync(SRC, { recursive: true });
for (const [name, rel] of Object.entries(UPSTREAM)) {
  const dest = path.join(SRC, name);
  if (fs.existsSync(dest)) continue;
  console.log(`fetching ${name} …`);
  execFileSync('curl', ['-sL', '--max-time', '180',
    `https://github.com/google/fonts/raw/main/${rel}`, '-o', dest]);
}

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]).replace(BASE, '');
  let file = path.join('dist', rel);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const origin = `http://127.0.0.1:${server.address().port}${BASE}`;

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p.replace(/^dist/, '').replace(/index\.html$/, ''));
  }
})('dist');
console.log(`${pages.length} pages to read\n`);

const buckets = Object.fromEntries(Object.keys(FONTS).map((k) => [k, new Set()]));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

for (const rel of pages) {
  await page.goto(origin + rel, { waitUntil: 'domcontentloaded' });
  // The resolved family is the authority: a heading may inherit the serif from
  // :lang(zh), and no selector reading would catch that reliably.
  const found = await page.evaluate(() => {
    const out = {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.nodeValue;
      if (!text.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest('script, style')) continue;
      const fam = getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      (out[fam] ??= []).push(text);
    }
    // placeholders and values are drawn too, and live outside the text tree
    for (const f of document.querySelectorAll('input, textarea')) {
      const fam = getComputedStyle(f).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      (out[fam] ??= []).push((f.placeholder ?? '') + (f.value ?? ''));
    }
    return out;
  });
  for (const [fam, chunks] of Object.entries(found)) {
    if (!buckets[fam]) continue;
    for (const c of chunks.join('')) if (c.trim()) buckets[fam].add(c);
  }
}
await browser.close();
server.close();

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
const faces = [];
const manifest = {};
for (const [family, [src, name, axis]] of Object.entries(FONTS)) {
  const chars = [...buckets[family]].sort().join('');
  const corpus = `.${name}-corpus.txt`;
  fs.writeFileSync(corpus, chars, 'utf8');

  // Two tools, in this order. instancer narrows the weight axis to what the CSS
  // asks for — carrying wght 100–900 when the site uses 300–500 is dead weight
  // in gvar. pyftsubset then drops the ~19,700 ideographs never shown.
  const trimmed = `.${name}-axis.ttf`;
  execFileSync(PY, ['-m', 'fontTools.varLib.instancer', '-q',
    path.join(SRC, src), `wght=${axis}`, '-o', trimmed]);
  execFileSync(SUBSET, [trimmed,
    `--text-file=${corpus}`, `--unicodes=${ALWAYS}`,
    `--output-file=${path.join(OUT, `${name}.woff2`)}`, '--flavor=woff2',
    '--layout-features=kern,liga,clig,ccmp,locl,palt,vert,vrt2',
    '--no-hinting', '--desubroutinize', '--name-IDs=1,2,3,4,6,13,14']);
  fs.unlinkSync(trimmed); fs.unlinkSync(corpus);

  const file = path.join(OUT, `${name}.woff2`);
  // hashed, for the same reason the models are: files under public/ keep their
  // URL across deploys and GitHub Pages serves them with max-age, so a resubset
  // would otherwise never reach anyone who already had the old one
  const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  const href = `${BASE}/assets/fonts/${name}.woff2?v=${hash}`;
  manifest[name] = href;
  faces.push(`@font-face {
  font-family: '${family}';
  src: url('${href}') format('woff2-variations');
  font-weight: ${axis.replace(':', ' ')};
  font-style: normal;
  font-display: swap;
}`);

  const kb = fs.statSync(file).size / 1024;
  total += kb;
  const cjk = [...chars].filter((c) => c >= '一' && c <= '鿿').length;
  console.log(`${family.padEnd(20)} ${String(chars.length).padStart(5)} chars ` +
    `(${String(cjk).padStart(4)} ideographs) → ${kb.toFixed(1).padStart(7)}KB`);
}
console.log(`\n${'total'.padEnd(20)} ${total.toFixed(1).padStart(31)}KB self-hosted`);

/* Generated, not hand-kept: the hashes have to change with the files, and the
   preload in Base.astro has to name the same URL the CSS asks for or the font
   is fetched twice. */
fs.writeFileSync('src/styles/fonts.css',
  `/* Generated by scripts/subset-fonts.mjs — do not edit.\n` +
  `   Noto Sans TC, Noto Serif TC, Cormorant Garamond: SIL OFL 1.1,\n` +
  `   subset to the glyphs this site renders. Licence in public/assets/fonts/. */\n\n` +
  `${faces.join('\n\n')}\n`);
fs.writeFileSync('src/data/font-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log('\n→ src/styles/fonts.css, src/data/font-manifest.json');
