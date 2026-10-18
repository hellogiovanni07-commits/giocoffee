/* GioCoffee · the storefront as a live 3D model (stores hero)
   assets/3d/hero/storefront.glb comes from blender/storefront_bake.py: the Cycles lighting is baked into its textures,
   so every surface is drawn unlit and looks like the render from any angle. The camera stays put; the model turns. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* the Blender turntable camera (blender/storefront.py shoot()): 50 mm on a 36 mm square frame, 18.4 m from the
   point 1.2 m above the plaza centre, 0.36 rad up and 0.55 rad round from the front; the poster is the crop below
   of its 1500 px frame, so the live model lines up with the poster exactly */
const CAM = { fov: 2 * Math.atan(18 / 50) * 180 / Math.PI, d: 18.4, el: .36, az: -.55, y: 1.2 };
const CROP = { full: 1500, x: 140, y: 388, w: 1220, h: 853 };

export async function mountStorefront(host, { reduce = false, src, onTurn } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  const cv = renderer.domElement; cv.className = 'sth__cv'; cv.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(CAM.fov, 1, .1, 200);
  const turn = new THREE.Group(); scene.add(turn);

  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(src);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    const map = o.material.map; if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = Math.min(8, maxAniso); }
    if (o.name.startsWith('sf_glass')) o.material = new THREE.MeshBasicMaterial({ color: 0xdcefe7, transparent: true, opacity: .14, depthWrite: false });
    else if (o.name.startsWith('sf_decal')) o.material = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .04, depthWrite: false });
    else o.material = new THREE.MeshBasicMaterial({ map });
    if (o.name.startsWith('sf_glass') || o.name.startsWith('sf_decal')) o.renderOrder = 2;
  });
  turn.add(gltf.scene);

  // frame it exactly like the poster: the Blender camera, cropped the same way
  const T = new THREE.Vector3(0, CAM.y, 0);
  camera.position.set(Math.sin(CAM.az) * Math.cos(CAM.el) * CAM.d, CAM.y + Math.sin(CAM.el) * CAM.d, Math.cos(CAM.az) * Math.cos(CAM.el) * CAM.d);
  camera.lookAt(T); camera.setViewOffset(CROP.full, CROP.full, CROP.x, CROP.y, CROP.w, CROP.h); camera.updateProjectionMatrix();
  let W = 0, H = 0;
  // the canvas bleeds past the box (CSS) so a zoomed-in store is never cut at the box edge; the view offset widens
  // with it, so at normal zoom the store sits exactly where the poster is
  const back = host.closest('.page-hero') || host.parentElement;
  const fit = () => {
    // the canvas is laid across the whole hero, behind everything in it (the hero clips it)
    const r = host.getBoundingClientRect(), hr = back.getBoundingClientRect();
    Object.assign(cv.style, { left: (hr.left - r.left) + 'px', top: (hr.top - r.top) + 'px', width: hr.width + 'px', height: hr.height + 'px' });
    const c = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    const k = CROP.w / W, cw = Math.max(1, Math.round(c.width)), ch = Math.max(1, Math.round(c.height));
    camera.setViewOffset(CROP.full, CROP.full, CROP.x + (c.left - r.left) * k, CROP.y + (c.top - r.top) * k, cw * k, ch * k);
    camera.updateProjectionMatrix(); renderer.setSize(cw, ch, false); draw();
  };

  // render only when something changes (drag, coast, zoom, keys, resize)
  const ZMIN = 1, ZMAX = 2.8;
  let angle = 0, vel = 0, raf = 0, drag = null, visible = true, aim = null, zoom = 1, zAim = 1, wheelOn = false;
  const pts = new Map(); let pinch = null;
  function draw() { turn.rotation.y = angle; if (camera.zoom !== zoom) { camera.zoom = zoom; camera.updateProjectionMatrix(); } renderer.render(scene, camera); }
  function loop() {
    raf = 0; if (!visible) return;
    let moving = false;
    if (!drag && aim !== null) { const d = aim - angle; if (Math.abs(d) < .0005) { angle = aim; aim = null; } else { angle += d * (reduce ? 1 : .16); moving = true; } }
    else if (!drag && Math.abs(vel) > .00005 && !reduce) { angle += vel; vel *= .93; moving = true; }
    if (zoom !== zAim) { const d = zAim - zoom; if (Math.abs(d) < .002 || reduce) zoom = zAim; else { zoom += d * .2; moving = true; } }
    draw(); if (onTurn) onTurn(angle, zoom);
    if (moving || drag) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const zoomTo = z => { zAim = Math.min(ZMAX, Math.max(ZMIN, z)); host.classList.toggle('zoomed', zAim > 1.02); kick(); };
  const two = () => [...pts.values()];

  // one pointer turns the store; two pointers (pinch) zoom it
  host.addEventListener('pointerdown', e => {
    host.setPointerCapture?.(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); wheelOn = true;
    if (pts.size === 2) { const [a, b] = two(); pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: zAim }; drag = null; return; }
    vel = 0; aim = null; drag = { x: e.clientX, a: angle, lx: e.clientX, t: performance.now() }; host.classList.add('drag'); kick();
  });
  host.addEventListener('pointermove', e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pts.size === 2) { const [a, b] = two(); zoomTo(pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d); return; }
    if (!drag) return;
    const k = Math.PI * 2 / (W * 1.25 * zoom), now = performance.now(), dt = Math.max(8, now - drag.t);
    angle = drag.a + (e.clientX - drag.x) * k;
    vel = vel * .5 + (e.clientX - drag.lx) * k * (16 / dt) * .5; drag.lx = e.clientX; drag.t = now; kick();
  }, { passive: true });
  const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!drag) return; drag = null; host.classList.remove('drag'); kick(); };
  host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
  // the wheel zooms only once you've picked the store up (so it never hijacks scrolling the page); ctrl+wheel = trackpad pinch
  host.addEventListener('pointerleave', () => { wheelOn = false; });
  host.addEventListener('wheel', e => { if (!wheelOn && !e.ctrlKey) return; e.preventDefault(); zoomTo(zAim * Math.exp(-e.deltaY * .0015)); }, { passive: false });
  host.addEventListener('dblclick', () => zoomTo(zAim > 1.4 ? 1 : 2));

  const ro = new ResizeObserver(fit); ro.observe(host); ro.observe(back);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
  host.append(cv); fit();
  return {
    turnBy(rad) { aim = (aim ?? angle) + rad; kick(); },
    turnTo(rad) { aim = rad; kick(); },
    zoomBy(f) { zoomTo(zAim * f); },
    reset() { zoomTo(1); aim = Math.round(angle / (Math.PI * 2)) * Math.PI * 2; kick(); },
    get angle() { return angle; },
    get zoom() { return zAim; }
  };
}
