/**
 * plinth.ts — dress every piece standing on a drum.
 *
 * Two things, and both belong to the object rather than to the page it is on:
 * three gold rings round the drum, and the prize's name bent onto its face.
 * The great hall shows six of these and each prize page shows one; the drum,
 * the camera and the light are identical, so the arithmetic is too.
 *
 * Call dressPlinths() once the markup is in. It is idempotent — it splits each
 * line into characters only the first time — and it re-runs itself when the
 * fonts land and when the window changes size.
 */

/* The radius is measured off the model: at the label's height the drum draws
   144px across a 190px frame. */
const DRUM_R = 0.379;
/* No character turns further than this. The type is set with a clamp, so at
   narrow widths its floor binds while the frame goes on shrinking and the line
   takes a larger share of the drum: at 1120px the ends were turning 71° and
   drawing at a third of their width. Where a line would overrun, the curve is
   worked on a wider radius instead — the same shape, opened out. */
const MAX_TURN = (55 * Math.PI) / 180;

export function dressPlinths() {
/**
 * Bend the plinth labels onto the drum.
 *
 * The drum is a cylinder, and flat type laid across it reads as a sticker.
 * So each character is turned to the surface: rotated about Y by the angle
 * its own position subtends, and pushed back by how far the surface falls
 * away there. The browser's perspective does the rest — the foreshortening
 * at the ends and the slight loss of size with depth are what sell it, and
 * neither is drawn by hand.
 *
 * The angle is x / R — arc length — and not asin(x / R). That is the
 * difference between wrapping the label round the cylinder and projecting it
 * onto one, and it is the whole of what was wrong with 生理學或醫學.
 *
 * Projecting leaves each character where the layout put it and shrinks it
 * about its own centre. Two neighbours therefore both pull away from the
 * line between them, and a gap opens — w(1 − (cos θᵢ + cos θᵢ₊₁)/2) wide,
 * which at the ends of a six-character name is a fifth of a character. The
 * label stopped reading as a curve and started reading as squashed letters
 * with holes between them, worst exactly where the name is longest.
 *
 * Wrapping by arc length puts the right-hand edge of one character and the
 * left-hand edge of the next at the same arc position — but only if the
 * character is moved to where that arc position projects. Turning it in
 * place is not enough: the layout puts its centre at the arc length rθ and
 * the cylinder puts it at the chord r·sin θ, and the difference is exactly
 * the gap. So each character is also slid inward by r·sin θ − rθ, which is
 * three pixels at the ends of the longest name and nothing in the middle.
 * The line contracts by that much — 6% at this width, which is what a label
 * wrapped round a drum actually does — and it is continuous.
 *
 * The radius is measured off the model: at the label's height the drum draws
 * 144px across a 190px frame.
 *
 * How much of that depth reads as height is NOT a separate figure, and
 * treating it as one is what bent 生理學或醫學 the wrong amount. It was a
 * guessed 8° of camera tilt, which lifted the outer characters 2.2px while
 * the gold rings — drawn on the very same drum, from measured constants —
 * rise only 1.35px across the same span. The line therefore sat on a tighter
 * cylinder than the drum it is cut into, bowed two thirds too hard, and
 * kinked at the ends where the foreshortening is strongest.
 *
 * So it comes from the rings instead. A horizontal circle at height y draws
 * as an ellipse b deep, and b/R is exactly how much a unit of depth rises on
 * screen. Same two constants, same drum, by construction rather than by
 * agreement.
 *
 * They were briefly set to 0.30 and 18° on the belief that the true figures
 * were invisible. They were not invisible; they were not being applied at all,
 * because the spans this script creates never carry Astro's scope attribute
 * and so never got `display: inline-block` — and transform does nothing to a
 * non-replaced inline element. Tune against the rendered width, never against
 * the style string.
 *
 * Progressive: if this never runs, the labels are simply flat.
 */
const faces = [...document.querySelectorAll<HTMLElement>('.bh__face')];

/** split once, into words that stay whole and characters that can turn */
function split(line: HTMLElement) {
  if (line.dataset.flat !== undefined) return;
  const text = line.textContent ?? '';
  line.dataset.flat = text;
  line.replaceChildren(...text.split(/(\s+)/).map((token) => {
    if (!token.trim()) return document.createTextNode(token);
    const word = document.createElement('span');
    word.className = 'bh__word';
    word.append(...[...token].map((ch) => {
      const c = document.createElement('span');
      c.className = 'bh__ch';
      c.textContent = ch;
      return c;
    }));
    return word;
  }));
}

/**
 * Three gold rings round the drum, set to the logo rather than to the model.
 *
 * They replace the single ring the base model carried, which sat under the
 * cap and had no relation to anything on the plinth. These take their height
 * from the logo itself — one on its centre line and one a quarter of its
 * height above and below — so they cannot drift when the type is resized.
 *
 * Each is a horizontal circle on the drum, so it draws as an ellipse: full
 * width across the drum, and as deep as its distance below the eye.
 *
 * Both constants are solved from two of the drum's own ellipses rather than
 * guessed at one. Its foot is 13.8px deep at 95.7% of the frame; its top
 * circle, four times nearer the eye in the model, is 3.4px deep at 72.4%.
 * Two depths at two heights give the slope, 0.1168, and where the ellipse
 * would close, 0.646. Reading the eye off the foot alone put it at 0.726 and
 * the rings came out half as deep as they should be.
 *
 * And each is broken where the logo crosses it, by 140% of the logo's width,
 * so the mark sits in a clearing rather than on top of a line.
 */
const EYE = 0.646;           // of the frame's height, where the drum is edge-on
const ELLIPSE = 0.1168;      // how fast the ellipse opens below that
const FOOT = 0.957;          // and where the drum's own foot sits

/**
 * How deep the ellipse is at a height on the drum — and it is not the true
 * depth.
 *
 * The true depth is right and reads wrong, for the type and for the rings
 * alike. A ring two thirds of the way up the drum genuinely draws less than
 * half as deep as the foot below it, and the eye does not compare a ring to
 * the ring it would be — it compares it to the deepest ellipse in front of
 * it, which is the foot. So three faint arcs on a drum whose bottom edge
 * swings eleven pixels read as three straight lines that happen to be lying
 * on a cylinder.
 *
 * BOW opens the whole family out; the cap stops it running past the foot,
 * because a ring sagging more than the base it is cut into is a worse error
 * than one sagging too little. Both are here rather than in two places, so
 * the name and the rings cannot disagree about what surface they are on —
 * which is what made this visible twice.
 *
 * The horizontal stays exact: the turn, the foreshortening and the
 * arc-to-chord slide are all still measured. Only the vertical is opened.
 */
const BOW = 2.6;
const CAP = 0.85;            // of the foot's own depth

function depthAt(y: number, frameH: number) {
  const eye = frameH * EYE;
  const here = Math.max(0, (y - eye) * ELLIPSE);
  const foot = Math.max(0.2, (frameH * FOOT - eye) * ELLIPSE);
  return Math.max(0.2, Math.min(here * BOW, foot * CAP));
}
/* the arcs stop just short of the silhouette and fade into it — a ring runs
   out of drum there, and a stroke ending on the edge looks like it overshoots */
const RING_REACH = 0.985;
const RING_GAP = 1.4;        // of the logo's width
/* of the logo's height, between the rings. A quarter to begin with; nine
   tenths of that reads as a set of three rather than as three separate
   lines. */
const RING_STEP = 0.225;

function drawRings(face: HTMLElement, frame: HTMLElement) {
  const svg = frame.querySelector<SVGSVGElement>('.bh__rings');
  const mark = face.querySelector<HTMLElement>('.bh__mark');
  if (!svg || !mark) return;
  const f = frame.getBoundingClientRect();
  const m = mark.getBoundingClientRect();
  if (!f.width || !m.height) return;

  svg.setAttribute('viewBox', `0 0 ${f.width} ${f.height}`);
  const cx = f.width / 2;
  const R = f.width * DRUM_R;
  const half = (m.width * RING_GAP) / 2;
  const mid = m.top + m.height / 2 - f.top;
  const step = m.height * RING_STEP;

  /* where the gap's edge meets the ellipse, as a fraction of its depth */
  const k = half < R ? Math.sqrt(1 - (half / R) ** 2) : 0;

  /* Solve for each ring's height *on the drum*, rather than drawing it at
     the height we want to see it.
     Only the near half of a ring is on the drum's front, so what is drawn
     hangs below the height it belongs to: where the gap cuts it, at x = half,
     it has already sagged by b·k. Setting y to the logo's centre therefore
     put the visible arc a whole b·k under it — six pixels, a fifth of the
     logo — which is the low reading. Inverting it is one line, and b is
     itself a function of y, so it has to be solved rather than subtracted. */
  /* Iterated rather than inverted: the depth is capped now, so it is no
     longer a straight line in y and there is no closed form. Four passes is
     three more than it needs. */
  const solve = (t: number) => {
    let y = t;
    for (let i = 0; i < 4; i++) y = t - depthAt(y, f.height) * k;
    return y;
  };

  const d: string[] = [];
  for (const t of [mid - step, mid, mid + step]) {
    const y = solve(t);
    const b = depthAt(y, f.height);
    const drop = b * k;
    const reach = R * RING_REACH;
    const edge = y + b * Math.sqrt(Math.max(0, 1 - RING_REACH ** 2));
    d.push(`M${(cx - reach).toFixed(1)} ${edge.toFixed(1)}`
         + `A${R.toFixed(1)} ${b.toFixed(2)} 0 0 0 ${(cx - half).toFixed(1)} ${(y + drop).toFixed(1)}`);
    d.push(`M${(cx + half).toFixed(1)} ${(y + drop).toFixed(1)}`
         + `A${R.toFixed(1)} ${b.toFixed(2)} 0 0 0 ${(cx + reach).toFixed(1)} ${edge.toFixed(1)}`);
  }
  svg.replaceChildren(...d.map((path) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', path);
    return el;
  }));
}

function curve() {
  for (const face of faces) {
    const frame = face.parentElement;
    if (!frame) continue;
    const fr = frame.getBoundingClientRect();
    const R = fr.width * DRUM_R;
    if (!(R > 0)) continue;
    drawRings(face, frame);
    for (const line of face.querySelectorAll<HTMLElement>('.bh__name, .bh__name-en')) {
      split(line);
      const chars = [...line.querySelectorAll<HTMLElement>('.bh__ch')];
      if (!chars.length) continue;

      /* Clear every one before measuring any. A transformed element reports
         its transformed box, so measuring as we go made each character's
         angle depend on the ones already turned — wrong the second time this
         runs, which is after the fonts land. */
      for (const ch of chars) ch.style.transform = '';
      const mid = line.getBoundingClientRect();
      const cx = mid.left + mid.width / 2;
      const dx = chars.map((ch) => {
        const b = ch.getBoundingClientRect();
        return b.left + b.width / 2 - cx;
      });

      const reach = Math.max(...dx.map(Math.abs), 1);
      const r = Math.max(R, reach / MAX_TURN);

      /* How steeply this line's own circle opens, in the ring's own terms:
         b at this height, over the radius it is worked on.
         BOW is on top of it, and it is an exaggeration, deliberately.
         The measured bow is right and reads as wrong: the label spans 63% of
         the drum, so the true rise at its ends is two pixels, while the gold
         rings beside it span the whole drum and rise five. Side by side the
         eye compares total bow, not bow per unit of width, and concludes the
         type is flat on a curved drum. So the vertical is opened out until
         the two arcs look like they belong to one surface. The horizontal
         stays exact — the turn, the foreshortening and the arc-to-chord
         slide are all still measured, so the line stays closed and the
         characters still turn by the angle they actually subtend. */
      const b = depthAt(mid.top + mid.height / 2 - fr.top, fr.height);
      const rise = b / r;

      chars.forEach((ch, i) => {
        const th = dx[i] / r;          // arc length, not projection
        /* how far the surface falls away behind the label's own plane */
        const back = r * (1 - Math.cos(th));
        /* and that depth reads on screen as exactly the sag the rings have */
        const lift = back * rise;
        /* arc length in, chord out — the slide that keeps the line closed */
        const slide = r * Math.sin(th) - dx[i];
        ch.style.transform =
          `translate3d(${slide.toFixed(2)}px, ${-lift.toFixed(2)}px, ${-back.toFixed(2)}px) ` +
          `rotateY(${((th * 180) / Math.PI).toFixed(2)}deg)`;
      });
    }
  }
}

if (faces.length) {
  const run = () => requestAnimationFrame(curve);
  document.fonts?.ready.then(run) ?? run();
  run();
  /* the row carries a scale once the page moves, and getBoundingClientRect
     reports it — so the labels are measured at the top of the page and left
     alone after that */
  /* the labels are sized in container units, so they move with the row */
  let t: ReturnType<typeof setTimeout>;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 120); });
}

}
