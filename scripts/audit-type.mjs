/**
 * audit-type.mjs — list the type each page actually renders.
 *
 * Not what the stylesheet intends: what survives cascade, inheritance and
 * component scoping. Tracking is reported in em and leading as a ratio,
 * because those are the numbers a typographer reasons in and neither is what
 * getComputedStyle returns.
 *
 *   node scripts/audit-type.mjs <origin>
 */
import { chromium } from 'playwright';
const ORIGIN = process.argv[2];
const PAGES = ['/', '/gallery/physics/', '/lecture/geim/', '/lectures/', '/learn/', '/about/'];
const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const seen = new Map();
for (const path of PAGES) {
  await p.goto(ORIGIN + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const rows = await p.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      const s = t.nodeValue.trim();
      if (!s) continue;
      const el = t.parentElement;
      if (!el || el.closest('script,style,.visually-hidden,.bh__scene,.ls')) continue;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const fam = c.fontFamily.split(',')[0].replace(/['"]/g,'');
      out.push({
        k: [fam, c.fontSize, c.fontWeight, c.letterSpacing, c.lineHeight].join(' | '),
        cls: String(el.className).slice(0,26), sample: s.slice(0,14),
        cjk: /[一-鿿]/.test(s),
      });
    }
    return out;
  });
  for (const r of rows) if (!seen.has(r.k)) seen.set(r.k, r);
}
await b.close();
const rows=[...seen.values()].sort((a,b)=>parseFloat(b.k.split('|')[1])-parseFloat(a.k.split('|')[1]));
console.log('family                | size   | wt  | tracking | leading | where');
for (const r of rows) {
  const [fam,size,wt,ls,lh]=r.k.split(' | ');
  const em = ls==='normal' ? 'normal' : (parseFloat(ls)/parseFloat(size)).toFixed(3)+'em';
  const ratio = (parseFloat(lh)/parseFloat(size)).toFixed(2);
  console.log(`${fam.padEnd(21)} | ${size.padStart(6)} | ${wt.padStart(3)} | ${em.padStart(8)} | ${ratio.padStart(7)} | ${r.cjk?'zh ':'   '}.${r.cls}`);
}
