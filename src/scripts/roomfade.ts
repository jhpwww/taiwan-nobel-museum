/**
 * roomfade.ts — the white between two rooms.
 *
 * Every page in the bright museum arrives out of white and leaves into it.
 * The overlay is opaque in the markup and cleared on the first frame, so the
 * fade-in happens even on a page that was already in the cache; a link to
 * another page in the museum paints it back before letting the browser go.
 *
 * Three things this has to survive, and each one has bitten a version of this
 * pattern before:
 *
 *   - the back button. A page restored from the back/forward cache does not
 *     re-run its scripts, so it would come back holding the white sheet it
 *     left under. `pageshow` clears it whether or not the load was fresh.
 *   - a navigation that never happens — a download, a new tab, a modifier
 *     click, a refused beforeunload. The sheet is cleared on a timer as well,
 *     so a page that stays put does not stay white.
 *   - someone who has asked for less motion. Then there is no sheet at all.
 */
import { motionOn } from './motion';

const OUT = 260;      // ms of white on the way out
const HOLD = 1200;    // and how long before we conclude nothing is happening

const sheet = document.querySelector<HTMLElement>('.roomfade');

function clear() { sheet?.removeAttribute('data-on'); }

if (sheet) {
  requestAnimationFrame(clear);
  addEventListener('pageshow', () => requestAnimationFrame(clear));

  addEventListener('click', (e) => {
    if (!motionOn()) return;
    const ev = e as MouseEvent;
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey ||
        ev.shiftKey || ev.altKey) return;

    const a = (ev.target as Element)?.closest?.('a') as HTMLAnchorElement | null;
    if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download')) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    /* an anchor on this very page is a scroll, not a journey */
    if (url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();
    sheet.setAttribute('data-on', '');
    setTimeout(() => { location.href = a.href; }, OUT);
    setTimeout(clear, HOLD);
  });
}
