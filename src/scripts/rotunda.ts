/**
 * rotunda.ts — the great hall as a real WebGL room.
 *
 * Everything is generated procedurally: there are no model files to download,
 * so the only payload is three.js itself. Six sculptures are built from
 * primitives that echo what each prize is actually for.
 *
 * Budget discipline (this runs on a student's phone):
 *   · renderer DPR capped at 1.5
 *   · no shadow maps — the floor gets a cheap fake reflection instead
 *   · the loop stops entirely when the canvas scrolls out of view or the tab hides
 *   · low-power GPU hint, antialias only above a coarse-pointer threshold
 *   · one shared material per colour, geometry reused across instances
 */
import {
  ACESFilmicToneMapping, AdditiveBlending, BackSide, BoxGeometry, BufferGeometry,
  CanvasTexture, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute,
  Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PerspectiveCamera, PlaneGeometry, PointLight, Points, PointsMaterial, RingGeometry,
  Scene, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3, WebGLRenderer, Fog,
} from 'three';

export interface RotundaOptions {
  canvas: HTMLCanvasElement;
  /** category key -> accent colour, in document order round the room */
  cats: { key: string; color: string; href: string; label: string }[];
  stills: string[];
  onPick?: (key: string) => void;
  onHover?: (key: string | null) => void;
}

const TAU = Math.PI * 2;

export function createRotunda(opts: RotundaOptions) {
  const { canvas, cats, stills } = opts;

  const renderer = new WebGLRenderer({
    canvas, antialias: window.devicePixelRatio < 2, alpha: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new Scene();
  scene.background = new Color('#0d0803');
  scene.fog = new Fog('#0d0803', 26, 78);

  const camera = new PerspectiveCamera(46, 1, 0.1, 200);
  camera.position.set(0, 4.6, 19.5);
  camera.lookAt(0, 2.1, 0);

  /* ---------------- room ---------------- */
  const warm = (hex: string, rough = 0.55, metal = 0.65) =>
    new MeshStandardMaterial({ color: new Color(hex), roughness: rough, metalness: metal });

  const stone = warm('#4a2f13', 0.85, 0.15);
  const stoneDark = warm('#2a1a0a', 0.9, 0.1);

  // floor — polished, with a faint radial pool of light
  const floor = new Mesh(new CylinderGeometry(30, 30, 0.3, 64), warm('#241708', 0.35, 0.5));
  floor.position.y = -0.15;
  scene.add(floor);

  const pool = new Mesh(
    new RingGeometry(0.1, 15, 48),
    new MeshBasicMaterial({ color: new Color('#7a4a16'), transparent: true, opacity: 0.16, blending: AdditiveBlending }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.02;
  scene.add(pool);

  // rotunda wall + dome
  const wall = new Mesh(new CylinderGeometry(24, 24, 22, 64, 1, true), warm('#3a2410', 0.95, 0.05));
  wall.material.side = BackSide;
  wall.position.y = 10;
  scene.add(wall);

  const dome = new Mesh(new SphereGeometry(24, 48, 24, 0, TAU, 0, Math.PI / 2), warm('#43290f', 0.95, 0.06));
  dome.material.side = BackSide;
  dome.position.y = 21;
  scene.add(dome);

  // colonnade
  const colGeo = new CylinderGeometry(0.62, 0.7, 13, 14);
  const capGeo = new BoxGeometry(2, 0.5, 2);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * TAU;
    const x = Math.cos(a) * 20.5, z = Math.sin(a) * 20.5;
    const col = new Mesh(colGeo, stone);
    col.position.set(x, 6.5, z);
    scene.add(col);
    for (const y of [0.35, 12.8]) {
      const cap = new Mesh(capGeo, stoneDark);
      cap.position.set(x, y, z);
      cap.rotation.y = -a;
      scene.add(cap);
    }
  }

  /* ---------------- the wall of lecture stills ---------------- */
  const wallGroup = new Group();
  const panelGeo = new PlaneGeometry(3.1, 1.75);
  const panels: { mesh: Mesh; mat: MeshBasicMaterial }[] = [];
  const N = Math.min(11, Math.max(5, stills.length));
  for (let i = 0; i < N; i++) {
    const a = -0.95 + (i / (N - 1)) * 1.9;
    const mat = new MeshBasicMaterial({ color: new Color('#2a1c0d'), toneMapped: false });
    const m = new Mesh(panelGeo, mat);
    m.position.set(Math.sin(a) * 17, 6.2, -Math.cos(a) * 17);
    m.rotation.y = a;
    wallGroup.add(m);
    panels.push({ mesh: m, mat });
    const frame = new Mesh(new PlaneGeometry(3.3, 1.95), warm('#6b4318', 0.6, 0.7));
    frame.position.copy(m.position).multiplyScalar(1.004);
    frame.rotation.y = a;
    wallGroup.add(frame);
  }
  scene.add(wallGroup);

  // load stills lazily into the panels
  let loaded = 0;
  stills.slice(0, N).forEach((url, i) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 144;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 256, 144);
      const tex = new CanvasTexture(c);
      tex.colorSpace = SRGBColorSpace;
      panels[i].mat.map = tex;
      panels[i].mat.color.setHex(0x8a7860);
      panels[i].mat.needsUpdate = true;
      loaded++;
      render();
    };
    img.src = url;
  });

  /* ---------------- lighting ---------------- */
  const key = new PointLight('#ffcf8a', 260, 60, 2);
  key.position.set(0, 14, 6);
  scene.add(key);
  const rim = new PointLight('#ff9a3c', 90, 44, 2);
  rim.position.set(-12, 5, -10);
  scene.add(rim);
  const fill = new PointLight('#ffe6bd', 70, 40, 2);
  fill.position.set(11, 4, 9);
  scene.add(fill);

  /* ---------------- sculptures ---------------- */
  const sphereGeo = new IcosahedronGeometry(1, 2);
  const rodGeo = new CylinderGeometry(1, 1, 1, 10);

  function rod(mat: MeshStandardMaterial, from: Vector3, to: Vector3, r: number) {
    const m = new Mesh(rodGeo, mat);
    const dir = new Vector3().subVectors(to, from);
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.scale.set(r, dir.length(), r);
    m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
    return m;
  }
  const ball = (mat: MeshStandardMaterial, x: number, y: number, z: number, r: number) => {
    const m = new Mesh(sphereGeo, mat);
    m.position.set(x, y, z); m.scale.setScalar(r);
    return m;
  };

  function buildSculpture(key: string, mat: MeshStandardMaterial): Group {
    const g = new Group();
    switch (key) {
      case 'physics': {
        g.add(ball(mat, 0, 1.5, 0, 0.3));
        for (let i = 0; i < 3; i++) {
          const t = new Mesh(new TorusGeometry(1.15, 0.045, 8, 64), mat);
          t.position.y = 1.5;
          t.rotation.set(Math.PI / 2.6, (i * TAU) / 3, 0);
          g.add(t);
        }
        g.add(rod(mat, new Vector3(0, 0, 0), new Vector3(0, 1.2, 0), 0.045));
        break;
      }
      case 'chemistry': {
        const pts: Vector3[] = [];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU;
          pts.push(new Vector3(Math.cos(a) * 0.85, 1.6 + Math.sin(a) * 0.85, 0));
        }
        pts.forEach((p, i) => {
          g.add(ball(mat, p.x, p.y, p.z, 0.17));
          g.add(rod(mat, p, pts[(i + 1) % 6], 0.05));
        });
        g.add(ball(mat, 0, 2.75, 0, 0.13));
        g.add(rod(mat, new Vector3(0, 2.45, 0), new Vector3(0, 2.72, 0), 0.04));
        g.add(rod(mat, new Vector3(0, 0, 0), new Vector3(0, 0.78, 0), 0.05));
        break;
      }
      case 'medicine': {
        for (let s = 0; s < 2; s++) {
          let prev: Vector3 | null = null;
          for (let i = 0; i <= 26; i++) {
            const t = i / 26;
            const a = t * Math.PI * 3 + s * Math.PI;
            const p = new Vector3(Math.cos(a) * 0.5, 0.35 + t * 2.5, Math.sin(a) * 0.5);
            g.add(ball(mat, p.x, p.y, p.z, 0.1));
            if (prev) g.add(rod(mat, prev, p, 0.035));
            prev = p;
            if (s === 0 && i % 5 === 0) {
              const o = new Vector3(-p.x, p.y, -p.z);
              g.add(rod(mat, p, o, 0.028));
            }
          }
        }
        break;
      }
      case 'peace': {
        const dove = new Group();
        const body = new Mesh(new SphereGeometry(1, 18, 12), mat);
        body.scale.set(0.78, 0.27, 0.27);
        body.rotation.z = 0.16;
        dove.add(body);
        // swept tail
        const tail = new Mesh(new SphereGeometry(1, 12, 8), mat);
        tail.position.set(-0.88, -0.14, 0);
        tail.scale.set(0.4, 0.14, 0.05);
        tail.rotation.z = 0.42;
        dove.add(tail);
        // two spread wings — this is what makes it read as a dove at a glance
        for (const side of [-1, 1]) {
          const wing = new Mesh(new SphereGeometry(1, 16, 12), mat);
          wing.position.set(-0.06, 0.34, side * 0.2);
          wing.scale.set(0.2, 0.72, 0.045);
          wing.rotation.set(side * 0.5, 0, -0.26);
          dove.add(wing);
        }
        const head = new Mesh(sphereGeo, mat);
        head.position.set(0.78, 0.2, 0);
        head.scale.setScalar(0.19);
        dove.add(head);
        const beak = new Mesh(new CylinderGeometry(0.008, 0.06, 0.26, 6), mat);
        beak.position.set(1.0, 0.18, 0);
        beak.rotation.z = -Math.PI / 2;
        dove.add(beak);
        dove.position.set(0, 1.95, 0);
        dove.rotation.y = -0.35;
        g.add(dove);
        // an olive sprig at the foot, so the symbol is unambiguous
        for (const side of [-1, 1]) {
          for (let i = 0; i < 4; i++) {
            const leaf = new Mesh(new SphereGeometry(1, 8, 6), mat);
            leaf.position.set(side * (0.24 + i * 0.16), 0.34 + i * 0.11, 0);
            leaf.scale.set(0.15, 0.055, 0.04);
            leaf.rotation.z = side * -0.5;
            g.add(leaf);
          }
        }
        g.add(rod(mat, new Vector3(0, 0, 0), new Vector3(0, 1.75, 0), 0.05));
        break;
      }
      case 'economics': {
        g.add(rod(mat, new Vector3(0, 0, 0), new Vector3(0, 2.35, 0), 0.055));
        g.add(rod(mat, new Vector3(-1.25, 2.3, 0), new Vector3(1.25, 2.3, 0), 0.045));
        g.add(ball(mat, 0, 2.42, 0, 0.13));
        for (const s of [-1, 1]) {
          g.add(rod(mat, new Vector3(s * 1.2, 2.28, 0), new Vector3(s * 1.2, 1.78, 0), 0.02));
          const dish = new Mesh(new CylinderGeometry(0.42, 0.3, 0.12, 20), mat);
          dish.position.set(s * 1.2, 1.72, 0);
          g.add(dish);
        }
        const base = new Mesh(new CylinderGeometry(0.62, 0.72, 0.14, 22), mat);
        base.position.y = 0.07; g.add(base);
        break;
      }
      case 'literature': {
        const book = new Group();
        for (const side of [-1, 1]) {
          const page = new Mesh(new BoxGeometry(1.3, 0.09, 1.55), mat);
          page.position.set(side * 0.63, 0, 0);
          page.rotation.z = side * 0.3;
          book.add(page);
        }
        const spine = new Mesh(new BoxGeometry(0.12, 0.1, 1.45), mat);
        book.add(spine);
        book.position.y = 1.62;
        book.rotation.x = -0.22;      // camera is already above; only a slight lift is needed
        g.add(book);

        const quill = new Mesh(new CylinderGeometry(0.012, 0.04, 1.05, 8), mat);
        quill.position.set(0.5, 2.2, 0.3);
        quill.rotation.set(0.22, 0, -0.3);
        g.add(quill);
        const feather = new Mesh(new SphereGeometry(1, 12, 8), mat);
        feather.position.set(0.66, 2.6, 0.24);
        feather.scale.set(0.1, 0.34, 0.04);
        feather.rotation.z = -0.3;
        g.add(feather);
        g.add(rod(mat, new Vector3(0, 0, 0), new Vector3(0, 1.45, 0), 0.055));
        break;
      }
    }
    return g;
  }

  const plinthGeo = new CylinderGeometry(1.15, 1.3, 0.75, 28);
  const picks: { group: Group; key: string; base: number }[] = [];

  cats.forEach((c, i) => {
    const a = -1.02 + (i / (cats.length - 1)) * 2.04;
    const R = 8.8;
    const x = Math.sin(a) * R, z = -Math.cos(a) * R + 6.5;

    const holder = new Group();
    holder.position.set(x, 0, z);
    holder.rotation.y = a * 0.55;

    const plinth = new Mesh(plinthGeo, warm('#33200d', 0.8, 0.2));
    plinth.position.y = 0.37;
    holder.add(plinth);

    const mat = new MeshStandardMaterial({
      color: new Color(c.color), roughness: 0.28, metalness: 0.9,
      emissive: new Color(c.color), emissiveIntensity: 0.16,
    });
    const s = buildSculpture(c.key, mat);
    s.position.y = 0.78;
    holder.add(s);

    const halo = new PointLight(c.color, 9, 5.5, 2);
    halo.position.set(0, 2, 0.8);
    holder.add(halo);

    scene.add(holder);
    picks.push({ group: s, key: c.key, base: 0.75 });
  });

  /* ---------------- dust ---------------- */
  const dustGeo = new BufferGeometry();
  const dn = 260, dp = new Float32Array(dn * 3);
  for (let i = 0; i < dn; i++) {
    const a = Math.random() * TAU, r = 3 + Math.random() * 16;
    dp[i * 3] = Math.cos(a) * r;
    dp[i * 3 + 1] = Math.random() * 13;
    dp[i * 3 + 2] = Math.sin(a) * r;
  }
  dustGeo.setAttribute('position', new Float32BufferAttribute(dp, 3));
  const dust = new Points(dustGeo, new PointsMaterial({
    color: new Color('#ffd79a'), size: 0.055, transparent: true, opacity: 0.5,
    blending: AdditiveBlending, depthWrite: false,
  }));
  scene.add(dust);

  /* ---------------- loop ---------------- */
  let raf = 0, t = 0, running = false;
  let px = 0, py = 0, cx = 0, cy = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render() { renderer.render(scene, camera); }

  function frame() {
    t += 0.006;
    cx += (px - cx) * 0.04;
    cy += (py - cy) * 0.04;
    camera.position.x = cx * 2.6;
    camera.position.y = 4.6 + cy * 1.1;
    camera.lookAt(0, 2.1, 0);
    for (const p of picks) {
      p.group.rotation.y = Math.sin(t * 0.5 + p.base) * 0.42;
      p.group.position.y = p.base + Math.sin(t + p.base * 6) * 0.035;
    }
    dust.rotation.y = t * 0.02;
    render();
    raf = running ? requestAnimationFrame(frame) : 0;
  }

  function start() {
    if (running) return;
    running = true;
    if (reduce.matches) { render(); running = false; return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  resize();
  render();

  // only run while actually on screen
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('resize', () => { resize(); render(); }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      px = e.clientX / innerWidth - 0.5;
      py = 0.5 - e.clientY / innerHeight;
    }, { passive: true });
  }

  return { stop, start, renderer };
}
