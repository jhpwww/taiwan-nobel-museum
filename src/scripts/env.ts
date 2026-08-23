/**
 * env.ts — a procedural environment map.
 *
 * Metal only looks like metal when it has something to reflect. Rather than
 * ship an HDRI, we paint a small equirectangular canvas: a bright oculus band
 * overhead, warm wall tones around the horizon, dark floor below. Run through
 * PMREM it gives correct roughness-aware reflections for a few KB of code.
 */
import { EquirectangularReflectionMapping, PMREMGenerator, Texture, WebGLRenderer } from 'three';

export function makeStudioEnv(renderer: WebGLRenderer): Texture {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;

  // vertical band: sky/oculus -> warm wall -> dark floor
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0.00, '#fff0d2');
  grad.addColorStop(0.13, '#ffd9a1');
  grad.addColorStop(0.30, '#8a5a24');
  grad.addColorStop(0.52, '#3d2711');
  grad.addColorStop(0.70, '#20140a');
  grad.addColorStop(1.00, '#0a0603');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // the oculus itself — a hot spot straight overhead
  const ocu = g.createRadialGradient(W * 0.5, H * 0.06, 4, W * 0.5, H * 0.06, W * 0.22);
  ocu.addColorStop(0, '#ffffff');
  ocu.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = ocu;
  g.fillRect(0, 0, W, H * 0.4);

  // window-like warm sources round the drum, so highlights travel as it turns
  for (let i = 0; i < 8; i++) {
    const x = (i + 0.5) * (W / 8);
    const r = g.createRadialGradient(x, H * 0.34, 2, x, H * 0.34, 46);
    r.addColorStop(0, 'rgba(255,206,140,0.85)');
    r.addColorStop(1, 'rgba(255,206,140,0)');
    g.fillStyle = r;
    g.fillRect(x - 50, H * 0.2, 100, H * 0.3);
  }

  const tex = new Texture(c);
  tex.mapping = EquirectangularReflectionMapping;
  tex.needsUpdate = true;

  const pmrem = new PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromEquirectangular(tex);
  tex.dispose();
  pmrem.dispose();
  return rt.texture;
}

/** a soft dark blob, used as a contact shadow under each plinth */
export function makeShadowTexture(): Texture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  r.addColorStop(0, 'rgba(0,0,0,0.85)');
  r.addColorStop(0.45, 'rgba(0,0,0,0.42)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, S, S);
  const t = new Texture(c);
  t.needsUpdate = true;
  return t;
}
