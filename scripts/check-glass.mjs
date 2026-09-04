/**
 * check-glass.mjs — is the bright museum's home page still readable over its
 * own hall?
 *
 * The home page has no ground. The hall is fixed for the whole document and
 * the page is read in front of it, so what is behind any given word is a
 * photograph of a rotunda — white marble at one end of its range and a wall of
 * thirty-six dark screens at the other. Nothing in check-contrast.mjs can
 * speak to that: those tools compare tokens, and no token describes a room.
 *
 * So this measures the page as rendered. It hides the type and the pictures,
 * walks every element that carries text, and finds the darkest pixel actually
 * underneath each one — its real ground — then reports the worst.
 *
 * It runs at two device pixel ratios on purpose. A backdrop-filter is a GPU
 * texture and a texture may not exceed 8192px: an earlier version of this page
 * frosted its whole 3197px column, which is fine at ratio 2 and 9591px at
 * ratio 3. Chromium does not warn, does not fall back, and simply stops
 * filtering — so the bug was invisible on every desktop and present on most
 * phones. Panes are small now; ratio 3 is here to keep it that way.
 *
 *     node scripts/check-glass.mjs            # needs the bright dev server
 *     URL=https://... node scripts/check-glass.mjs
 *
 * Exits non-zero if any ground falls under WCAG AA for the text on it.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const URL = process.env.URL ?? 'http://localhost:4322/taiwan-nobel-museum/bright/';

/* everything that is not the ground: the type itself, and the pictures whose
   own darkness is not what any word is read against */
const STRIP = `
  .after *, .bh__intro * { color: transparent !important; }
  .after img, .after picture, .after video, .after iframe,
  .after .vf__btn, .after .card__media { visibility: hidden !important; }
  /* fixed chrome stands over the page rather than under it, and each piece of
     it carries its own frosted tablet — it is not ground for anything */
  .topbar, .pn, .bh__lockup { display: none !important; }
  /* an element's own rules and borders are its decoration, not the ground its
     words are read against */
  .after .section-h::after { display: none !important; }
  astro-dev-toolbar { display: none !important; }`;

const lum = (r, g, b) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const VIEWS = [
  { name: 'desktop',  viewport: { width: 1440, height: 900 }, dsf: 2, mobile: false },
  { name: 'phone x2', viewport: { width: 390, height: 844 },  dsf: 2, mobile: true },
  { name: 'phone x3', viewport: { width: 390, height: 844 },  dsf: 3, mobile: true },
];

const browser = await chromium.launch();
let worst = { r: Infinity };

for (const v of VIEWS) {
  const page = await browser.newPage({
    viewport: v.viewport, deviceScaleFactor: v.dsf,
    isMobile: v.mobile, hasTouch: v.mobile,
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: STRIP });

  const doc = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(v.viewport.height * 0.7);

  for (let y = 0; y < doc - v.viewport.height * 0.5; y += step) {
    await page.evaluate((to) => scrollTo(0, to), y);
    await page.waitForTimeout(700);

    /* every box that carries its own words, and the colour it sets for them */
    const boxes = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('.after :is(h1,h2,h3,p,a,span,dt,dd,li)')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        /* Anything STRIP hid, and anything inside it. A badge lying on a
           video still — the kind label, the count — is in the picture the
           strip removed: it has its own opaque fill and is never read against
           the room, but its box survives `visibility: hidden` and would
           sample whatever the strip uncovered behind it. `visibility`
           inherits, so this one test catches the children too. */
        if (getComputedStyle(el).visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        if (b.width < 8 || b.height < 8 || b.bottom < 0 || b.top > innerHeight) continue;
        const c = getComputedStyle(el).getPropertyValue('--check-colour') ||
                  el.dataset.checkColour || '';
        out.push({ x: b.left, y: b.top, w: b.width, h: b.height,
                   colour: c, tag: el.tagName, text: (el.textContent || '').trim().slice(0, 16) });
      }
      return out;
    });
    if (!boxes.length) continue;

    const png = PNG.sync.read(await page.screenshot());
    const s = v.dsf;
    /* the body colour every one of these resolves to in the bright theme; the
       accents on it are all darker still, so this is the generous reading */
    const tl = lum(0x26, 0x22, 0x1e);

    for (const b of boxes) {
      let darkL = 1, dark = null;
      const y0 = Math.max(0, Math.ceil(b.y * s)), y1 = Math.min(png.height - 1, Math.floor((b.y + b.h) * s));
      const x0 = Math.max(0, Math.ceil(b.x * s)), x1 = Math.min(png.width - 1, Math.floor((b.x + b.w) * s));
      for (let py = y0; py <= y1; py += 2)
        for (let px = x0; px <= x1; px += 2) {
          const i = (png.width * py + px) << 2;
          const L = lum(png.data[i], png.data[i + 1], png.data[i + 2]);
          if (L < darkL) { darkL = L; dark = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
        }
      if (!dark) continue;
      const r = ratio(tl, darkL);
      if (r < worst.r) worst = { r, dark, view: v.name, y, text: b.text, tag: b.tag };
    }
  }
  await page.close();
}

await browser.close();

const AA = 4.5;
console.log(`worst ground anywhere on the page:`);
console.log(`  ${worst.view}  at scroll ${worst.y}  <${worst.tag}> "${worst.text}"`);
console.log(`  rgb(${worst.dark.join(',')})  ${worst.r.toFixed(2)}:1  ` +
            `${worst.r >= AA ? 'ok' : 'FAILS AA (needs ' + AA + ':1)'}`);
process.exit(worst.r >= AA ? 0 : 1);
