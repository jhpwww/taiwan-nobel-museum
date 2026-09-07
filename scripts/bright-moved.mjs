// bright-moved.mjs — the bright museum moved to jhpwww/nobel on 2026-09-07.
//
// Static hosting has no server-side redirect, so every address the bright
// museum had under /bright/ is kept alive as a page: after the dark build this
// writes one stub per route under dist/bright/ — the bright museum had exactly
// the dark museum's routes — pointing at the same page at the new address.
// Adding a route to the dark museum adds its stub. Run by the deploy workflow.
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';

const DIST = 'dist';
const NEW = 'https://jhpwww.github.io/nobel/';

async function routes(d, acc = []) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (p !== join(DIST, 'bright')) await routes(p, acc); }
    else if (e.name === 'index.html') acc.push(relative(DIST, dirname(p)).split('\\').join('/'));
  }
  return acc.sort();
}

let n = 0;
for (const route of await routes(DIST)) {
  const rel = route ? `${route}/` : '';
  const to = NEW + rel;
  const en = rel.startsWith('en/');
  const html = `<!doctype html><html lang="${en ? 'en' : 'zh-Hant-TW'}"><head><meta charset="utf-8">` +
    `<meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}">` +
    `<meta name="robots" content="noindex"><title>${en ? 'The bright museum has moved' : '明亮館已搬遷'}</title>` +
    `</head><body><p>${en ? 'The bright museum has moved to' : '明亮館已搬到'} <a href="${to}">${to}</a></p></body></html>\n`;
  const out = join(DIST, 'bright', route, 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, html);
  n++;
}
console.log(`bright-moved: ${n} redirect stubs under dist/bright/ -> ${NEW}`);
