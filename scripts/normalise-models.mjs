/**
 * normalise-models.mjs — make six models from six authors sit alike.
 *
 * The sources arrive at wildly different scales (the flask is 19 units tall,
 * the coin 0.03 across, the dove 96) and with their pivots anywhere. Dropped
 * into identical <model-viewer> frames they would each need hand-tuned camera
 * settings, and any later swap would need them again.
 *
 * So each model is rewritten once, here: pruned, re-centred on its own
 * bounding box, and scaled so its longest axis is exactly 1 unit. After this
 * every icon takes the same camera and the same framing, and swapping a model
 * is a one-line change to PICKS in fetch-models.py.
 *
 * ORIENT holds the only per-model judgement — a rotation where the source's
 * idea of "up" or "front" is not ours. Values were set by looking at the
 * rendered result, not guessed.
 */
import { NodeIO, getBounds } from '@gltf-transform/core';
import { prune, dedup, weld } from '@gltf-transform/functions';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'assets-src/models';
const OUT = 'public/assets/models';

/** radians about X, Y, Z, applied before centring */
/**
 * Each model arrives in its author's own palette — candy pastels on the DNA, a
 * dollar sign on the coin, black-and-chrome on the telescope. Six of those in
 * a row read as clip art borrowed from six places, which is what they are.
 *
 * So every material is re-cast in the hall's own accent, the same colour that
 * hall already uses for its heading and its plinth: the pieces become a set,
 * and the form does the identifying while the colour does the placing. Where a
 * hue is too saturated to hold a large fill, the site's own softened block
 * value is used — the same rule the CSS follows.
 */
const TINT = {
  physics: '#f0c063',
  chemistry: '#ecb98f',
  medicine: '#e5a49f',
  peace: '#ecd9b4',
  economics: '#b39a56',
  literature: '#cf9d7a',
};

/** glTF stores base colour linearly; the palette is written in sRGB */
const linear = (hex) =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

const ORIENT = {
  physics: [0, 0, 0],
  chemistry: [0, 0, 0],
  medicine: [0, 0, 0],
  peace: [0, 0, 0],
  economics: [0, 0, 0],
  literature: [0, 0, 0],
};

const euler = ([x, y, z]) => {
  const [cx, cy, cz] = [Math.cos(x / 2), Math.cos(y / 2), Math.cos(z / 2)];
  const [sx, sy, sz] = [Math.sin(x / 2), Math.sin(y / 2), Math.sin(z / 2)];
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
};

/**
 * The bright museum casts every piece in one gold instead of six hall hues —
 * the look of an award statuette rather than a set of coloured markers.
 * Metalness near 1 with a low roughness is what makes it read as polished
 * metal; the base colour alone, on a rough dielectric, reads as yellow paint.
 */
const GOLD = { hex: '#d4a02a', metallic: 1.0, roughness: 0.22 };
const OUT_GOLD = 'public/assets/models/gold';

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(OUT_GOLD, { recursive: true });
const io = new NodeIO();

for (const file of fs.readdirSync(SRC).sort()) {
  const cat = path.basename(file, '.glb');
  const doc = await io.read(path.join(SRC, file));
  await doc.transform(dedup(), weld(), prune());

  const root = doc.getRoot();
  const scene = root.getDefaultScene() ?? root.listScenes()[0];

  // a wrapper node carries the correction, so the source hierarchy is left
  // exactly as its author built it
  const spin = doc.createNode(`${cat}__orient`).setRotation(euler(ORIENT[cat]));
  for (const child of scene.listChildren()) { scene.removeChild(child); spin.addChild(child); }
  scene.addChild(spin);

  // measure only after the rotation, or the box describes the wrong pose
  const b = getBounds(scene);
  const size = b.max.map((v, i) => v - b.min[i]);
  const longest = Math.max(...size) || 1;
  const s = 1 / longest;
  const centre = b.max.map((v, i) => (v + b.min[i]) / 2);

  // glTF applies T · R · S, so the offset must already be in scaled units
  const fit = doc.createNode(`${cat}__fit`)
    .setScale([s, s, s])
    .setTranslation(centre.map((c) => -c * s));
  scene.removeChild(spin);
  fit.addChild(spin);
  scene.addChild(fit);

  // one hall, one colour. Textures go with it — they only carried the old
  // palette, and the coin's dollar sign with it, which had no business on a
  // Swedish prize.
  const [r, g, bl] = linear(TINT[cat]);
  for (const mat of root.listMaterials()) {
    mat.setBaseColorFactor([r, g, bl, 1])
      .setBaseColorTexture(null)
      .setMetallicFactor(0.25)
      .setRoughnessFactor(0.5)
      .setEmissiveFactor([0, 0, 0])
      .setEmissiveTexture(null);
  }
  await doc.transform(prune());

  await io.write(path.join(OUT, `${cat}.glb`), doc);

  // the same geometry again, cast in gold, for the bright museum
  const [gr, gg, gb] = linear(GOLD.hex);
  for (const mat of root.listMaterials()) {
    mat.setBaseColorFactor([gr, gg, gb, 1])
      .setMetallicFactor(GOLD.metallic)
      .setRoughnessFactor(GOLD.roughness);
  }
  await io.write(path.join(OUT_GOLD, `${cat}.glb`), doc);

  const after = getBounds(scene);
  const outSize = after.max.map((v, i) => v - after.min[i]);
  const kb = fs.statSync(path.join(OUT, `${cat}.glb`)).size / 1024;
  console.log(
    `${cat.padEnd(11)} ${kb.toFixed(0).padStart(4)}KB  ` +
    `${size.map((v) => v.toFixed(2)).join('×').padEnd(22)} → ` +
    `${outSize.map((v) => v.toFixed(2)).join('×')}`,
  );
}
