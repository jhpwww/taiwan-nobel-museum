/**
 * check-contrast.mjs — hold the palette to WCAG, not to taste.
 *
 * The bright theme's first palettes were picked by eye and several pairings
 * were unreadable: a gold that looked warm on its own fell to 3:1 as body
 * text, and TED's red is a large-text colour, not a small-text one. This reads
 * the tokens straight out of the stylesheet and measures every pairing the
 * site actually renders.
 *
 * AA wants 4.5:1 for body text, 3:1 for large text (>= 24px, or 19px bold)
 * and for the boundary of a control. Anything below its target is a failure
 * here, and the number says how far.
 *
 *   node scripts/check-contrast.mjs [--theme bright|dark]
 */
import fs from 'node:fs';

const THEME = process.argv.includes('--theme')
  ? process.argv[process.argv.indexOf('--theme') + 1]
  : 'bright';

const css = fs.readFileSync(
  THEME === 'bright' ? 'src/styles/bright.css' : 'src/styles/global.css', 'utf8');

/** every `--name: #hex` in the file, last definition winning */
const tokens = {};
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  tokens[m[1]] = m[2];
}

const hex = (h) => {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const T = (name) => tokens[name] ?? name;

/** what the site actually puts on what, and the bar each has to clear */
const PAIRS = [
  ['body text',            '--text',       '--bg-0', 4.5],
  ['headings',             '--cream',      '--bg-0', 4.5],
  ['secondary text',       '--muted',      '--bg-0', 4.5],
  ['faintest text',        '--muted-dim',  '--bg-0', 4.5],
  ['body text on surface', '--text',       '--bg-1', 4.5],
  ['secondary on surface', '--muted',      '--bg-1', 4.5],
  ['body text on panel',   '--text',       '--bg-2', 4.5],
  ['links / eyebrows',     '--red-ink',    '--bg-0', 4.5],
  ['link hover',           '--red-deep',   '--bg-0', 4.5],
  ['big red numerals',     '--red',        '--bg-0', 3.0],
  ['gold as small text',   '--gold-ink',       '--bg-0', 4.5],
  ['gold rules & marks',   '--gold',       '--bg-0', 3.0],
  ['white on red button',  '#ffffff',      '--red-deep', 4.5],
  ['white on gold button', '#ffffff',      '--gold-ink', 4.5],
  ['card border',          '--line-hi',    '--bg-0', 3.0],
];

console.log(`\n${THEME} theme — contrast against WCAG AA\n`);
let bad = 0;
for (const [what, fg, bg, need] of PAIRS) {
  const f = T(fg), b = T(bg);
  if (!f.startsWith('#') || !b.startsWith('#')) {
    console.log(`  ${what.padEnd(22)} — skipped, ${!f.startsWith('#') ? fg : bg} is not a literal`);
    continue;
  }
  const r = ratio(f, b);
  const ok = r >= need;
  if (!ok) bad++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${what.padEnd(22)} ${f} on ${b}  ` +
    `${r.toFixed(2)}:1  (needs ${need.toFixed(1)})`,
  );
}
console.log(bad ? `\n${bad} pairing(s) below target\n` : '\nall pairings pass\n');
process.exitCode = bad ? 1 : 0;
