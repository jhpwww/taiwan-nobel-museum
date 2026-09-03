/**
 * check-glass.mjs — is the bright museum's home page still readable through
 * its own glass?
 *
 * The home page is a sheet of frosted glass over a photograph of a rotunda.
 * Nothing in check-contrast.mjs can speak to that: those tools compare tokens,
 * and the ground under this type is not a token, it is a hall — white marble
 * at one end of its range and a wall of dark screens at the other.
 *
 * So this measures the page as rendered. It strips the type and the pictures
 * out of the sheet, leaving exactly what every word is read against, finds the
 * darkest pixel of it, and reports the ratio against the body colour.
 *
 * It runs at two device pixel ratios on purpose. A backdrop-filter is a GPU
 * texture, and a texture may not exceed 8192px: the first version of this
 * sheet blurred the whole 3197px-tall column, which is 6394px at ratio 2 and
 * 9591px at ratio 3. Chromium does not warn, does not fall back, and simply
 * stops filtering — so the bug was invisible on every desktop and present on
 * most phones. The sheet is a viewport-sized sticky pane now; ratio 3 is here
 * to keep it that way.
 *
 *     node scripts/check-glass.mjs            # needs the bright dev server
 *
 * Exits non-zero if any ground falls under WCAG AA for body text.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const URL = process.env.URL ?? 'http://localhost:4322/taiwan-nobel-museum/bright/';
const BODY = [0x26, 0x22, 0x1e];      // --text in the bright theme
const AA = 4.5;

/** everything that is not the sheet itself */
const STRIP = `
  .after * { color: transparent !important; }
  .after img, .after picture, .after video, .after iframe,
  .after .vf, .after .card > * { visibility: hidden !important; }
  .after .card { visibility: visible !important; }
  .topbar, .pn, astro-dev-toolbar { display: none !important; }`;

const lum = (r, g, b) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const VIEWS = [
  { name: 'desktop',  viewport: { width: 1440, height: 900 }, dsf: 2, mobile: false },
  { name: 'phone ×2', viewport: { width: 390, height: 844 },  dsf: 2, mobile: true },
  { name: 'phone ×3', viewport: { width: 390, height: 844 },  dsf: 3, mobile: true },
];

const browser = await chromium.launch();
let worst = Infinity;

for (const v of VIEWS) {
  const page = await browser.newPage({
    viewport: v.viewport, deviceScaleFactor: v.dsf,
    isMobile: v.mobile, hasTouch: v.mobile,
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: STRIP });

  /* 關於這座獎 reaching the top is where the pieces withdraw, so the stations
     are placed around it: before, after, and well down the page */
  const cue = await page.evaluate(() => {
    const intro = document.querySelector('.bh__intro');
    const bar = document.querySelector('.topbar');
    return intro.getBoundingClientRect().top + scrollY - (bar?.offsetHeight ?? 0);
  });

  for (const [where, y] of [['before the cue', cue - 40], ['after it', cue + 40],
                            ['mid page', cue + 600], ['deep', cue + 1400]]) {
    await page.evaluate((to) => scrollTo(0, to), y);
    await page.waitForTimeout(1200);
    const top = await page.evaluate(() =>
      Math.max(0, document.querySelector('.after').getBoundingClientRect().top));
    const png = PNG.sync.read(await page.screenshot());
    const s = v.dsf;

    let dark = null, darkL = 1;
    for (let py = Math.ceil((top + 4) * s); py < (v.viewport.height - 4) * s; py += 2 * s)
      for (let px = 40 * s; px < (v.viewport.width - 40) * s; px += 2 * s) {
        const i = (png.width * py + px) << 2;
        const L = lum(png.data[i], png.data[i + 1], png.data[i + 2]);
        if (L < darkL) { darkL = L; dark = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
      }
    if (!dark) continue;

    const r = ratio(lum(...BODY), darkL);
    worst = Math.min(worst, r);
    console.log(
      `${v.name.padEnd(9)} ${where.padEnd(15)} darkest ground rgb(${dark.join(',')})`.padEnd(62) +
      `${r.toFixed(2)}:1 ${r >= AA ? 'ok' : 'FAILS AA'}`);
  }
  await page.close();
}

await browser.close();
console.log(`\nworst ground: ${worst.toFixed(2)}:1 (AA needs ${AA}:1)`);
process.exit(worst >= AA ? 0 : 1);
