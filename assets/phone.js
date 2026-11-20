// Objek 3D tunggal di hero: ponsel dengan feed Instagram. three.js dimuat malas, hanya bila perlu.
// Aturan 3D: loader sampai bingkai pertama, versi statis untuk perangkat lemah atau gerak dikurangi,
// berhenti merender saat di luar layar, batas DPR, dan jatuh ke versi statis bila WebGL gagal.

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const LOAD_TIMEOUT_MS = 8000;

/** Apakah perangkat ini sebaiknya mendapat ponsel statis (CSS) alih-alih 3D. */
export function shouldUseStatic(env) {
  const { search = '', saveData, deviceMemory, hardwareConcurrency, reducedMotion } = env;
  if (reducedMotion) return true;
  if (/[?&]3d=0(&|$)/.test(search)) return true;
  if (/[?&]3d=1(&|$)/.test(search)) return false;
  return !!saveData
    || (deviceMemory != null && deviceMemory <= 2)
    || (hardwareConcurrency != null && hardwareConcurrency <= 2);
}

const readEnv = () => ({
  search: location.search,
  saveData: navigator.connection?.saveData,
  deviceMemory: navigator.deviceMemory,
  hardwareConcurrency: navigator.hardwareConcurrency,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
});

const toStatic = (stage) => { stage.classList.add('is-static'); stage.classList.remove('is-ready'); return 'static'; };

const whenIdle = () => new Promise((resolve) => {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(resolve, { timeout: 1500 }) : setTimeout(resolve, 300));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
});

function drawScreen(THREE) {
  const w = 512, h = 1056, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const round = (x, y, rw, rh, r) => { g.beginPath(); g.roundRect(x, y, rw, rh, r); };
  round(0, 0, w, h, 56); g.fillStyle = '#FFFFFF'; g.fill(); g.save(); g.clip();
  g.fillStyle = '#0E1714'; g.font = '700 34px system-ui, sans-serif'; g.fillText('menejets', 34, 96);
  g.fillStyle = '#4A5A53'; g.font = '500 22px system-ui, sans-serif'; g.fillText('24 posting terjadwal bulan ini', 34, 136);
  const tiles = ['#9DB5A9', '#0E1714', '#E4EAE6', '#1F3B31', '#C9D6CE', '#9DB5A9'];
  const tw = (w - 34 * 2 - 14) / 2, th = tw;
  tiles.forEach((col, i) => {
    const x = 34 + (i % 2) * (tw + 14), y = 176 + Math.floor(i / 2) * (th + 14);
    round(x, y, tw, th, 18); g.fillStyle = col; g.fill();
  });
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundedShape(THREE, w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Menyalakan ponsel 3D pada `canvas` di dalam `stage`. Mengembalikan '3d' atau 'static'. */
export async function initPhone(stage, canvas) {
  if (shouldUseStatic(readEnv())) return toStatic(stage);
  try {
    await whenIdle();
    const THREE = await Promise.race([
      import(/* @vite-ignore */ THREE_URL),
      new Promise((_, reject) => setTimeout(() => reject(new Error('three.js terlalu lama dimuat')), LOAD_TIMEOUT_MS)),
    ]);
    const small = innerWidth < 760;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.1, 6.2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c4bd, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-2.5, 3, 4); scene.add(key);

    const phone = new THREE.Group();
    const depth = 0.1;
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roundedShape(THREE, 1.04, 2.14, 0.2), { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 18 }),
      new THREE.MeshStandardMaterial({ color: 0x0e1714, roughness: 0.45, metalness: 0.25 }),
    );
    body.position.z = -depth / 2;
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.94, 1.94),
      new THREE.MeshBasicMaterial({ map: drawScreen(THREE), transparent: true }),
    );
    screen.position.z = depth / 2 + 0.025;
    phone.add(body, screen);
    phone.rotation.x = 0.08;
    scene.add(phone);

    let ptr = 0, running = false, visible = true, raf = 0, dead = false;
    if (matchMedia('(hover: hover)').matches) {
      addEventListener('pointermove', (e) => { ptr = (e.clientX / innerWidth - 0.5) * 0.5; }, { passive: true });
    }
    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 7.4 : (w < 420 ? 5.2 : 6.2);
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    const clock = new THREE.Clock();
    const frame = () => {
      raf = 0;
      if (dead || !visible || document.hidden) { running = false; return; }
      const t = clock.getElapsedTime();
      phone.rotation.y = -0.45 + Math.sin(t * 0.55) * 0.22 + ptr;
      phone.position.y = Math.sin(t * 0.8) * 0.04;
      renderer.render(scene, camera);
      if (!stage.classList.contains('is-ready')) stage.classList.add('is-ready');
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!running && !dead) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } };
    new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); if (visible) start(); }, { threshold: 0.05 }).observe(stage);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dead = true; cancelAnimationFrame(raf); toStatic(stage); });
    start();
    return '3d';
  } catch {
    return toStatic(stage);
  }
}
