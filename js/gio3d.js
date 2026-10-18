/* =========================================================
   GioCoffee 3D: every product is built from code, from the same
   `v` spec as in data.js. Cups (paper hot cup with kraft sleeve,
   clear iced cup, frappé with whip and a dome lid, ceramic cup
   with latte art), bakery (croissant, ensaymada, muffin, cookie,
   cake slice) and merch (bean bag, tumbler, stoneware mug).
   One GioStage = one canvas: drag to spin, it floats when idle,
   pauses when off screen.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;
const MARK = {
  steam: new Path2D('M38.2 10.6a7 7 0 1 0 1.9 7.6H34'),
  lid: new Path2D('M21.3 25h21.4a2.3 2.3 0 0 1 0 4.6H21.3a2.3 2.3 0 0 1 0-4.6z'),
  cup: new Path2D('M21 31h22l-2.6 18.4a3 3 0 0 1-3 2.6H26.6a3 3 0 0 1-3-2.6z'),
  band: new Path2D('M22.1 36.4h19.8l-.9 6.6H23z')
};
const GREEN = '#0e6b4e', HOUSE = '#14332b', GOLD = '#c9a15b';

/* ---------- small helpers ---------- */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const reseed = s => { seed = s || 7; };
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash(xi + a, yi + b, zi + d);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u), x10 = lerp(c(0, 1, 0), c(1, 1, 0), u);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u), x11 = lerp(c(0, 1, 1), c(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 2 - 1;
}
const fbm = (x, y, z) => noise3(x, y, z) * .6 + noise3(x * 2.1, y * 2.1, z * 2.1) * .28 + noise3(x * 4.3, y * 4.3, z * 4.3) * .12;

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', { willReadFrequently: true })]; }
function tex(c, { srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso; t.needsUpdate = true;
  return t;
}
function grain(ctx, w, h, amt, alpha = .06) {
  const d = ctx.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - .5) * amt; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  ctx.putImageData(d, 0, 0);
}
/* the Gio badge, drawn at (cx, cy), `size` px, sx/sy stretch for curved UVs */
function drawMark(ctx, cx, cy, size, { sx = 1, sy = 1, mono = null } = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sx * size / 64, sy * size / 64); ctx.translate(-32, -32);
  ctx.fillStyle = mono || GREEN; ctx.beginPath(); ctx.arc(32, 32, 31, 0, TAU); ctx.fill();
  ctx.strokeStyle = mono ? 'rgba(255,255,255,.9)' : '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(32, 32, 27, 0, TAU); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(MARK.steam);
  ctx.fillStyle = '#fff'; ctx.fill(MARK.lid); ctx.fill(MARK.cup);
  ctx.fillStyle = GOLD; ctx.fill(MARK.band);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(32, 39.7, 2.1, 0, TAU); ctx.fill();
  ctx.restore();
}
function wordmark(ctx, x, y, px, { color = HOUSE, accent = GREEN, align = 'center' } = {}) {
  ctx.save(); ctx.textBaseline = 'middle';
  ctx.font = `800 ${px}px "Plus Jakarta Sans", Arial, sans-serif`;
  const a = ctx.measureText('Gio').width;
  ctx.font = `600 ${px}px "Plus Jakarta Sans", Arial, sans-serif`;
  const b = ctx.measureText('Coffee').width;
  let x0 = align === 'center' ? x - (a + b) / 2 : x;
  ctx.fillStyle = color; ctx.font = `800 ${px}px "Plus Jakarta Sans", Arial, sans-serif`; ctx.fillText('Gio', x0, y);
  ctx.fillStyle = accent; ctx.font = `600 ${px}px "Plus Jakarta Sans", Arial, sans-serif`; ctx.fillText('Coffee', x0 + a, y);
  ctx.restore();
}
function marker(ctx, text, x, y, px, rot = -.06, color = '#1b1f1d') {
  if (!text) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `700 ${px}px Caveat, "Comic Sans MS", cursive`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let s = px; while (ctx.measureText(text).width > px * 2.4 && s > 20) { s -= 4; ctx.font = `700 ${s}px Caveat, cursive`; }
  ctx.fillStyle = color; ctx.globalAlpha = .92; ctx.fillText(text, 0, 0);
  ctx.globalAlpha = .35; ctx.fillText(text, 1.5, .5);
  ctx.restore();
}

/* lathe from [r, y] points, resampled so v runs evenly from bottom to top */
function lathe(pts, segs = 96, { even = true, n = 48 } = {}) {
  let p = pts;
  if (even) {
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    p = []; const tot = L[L.length - 1];
    for (let k = 0; k <= n; k++) {
      const d = tot * k / n; let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const t = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
      p.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]);
    }
  }
  return new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), segs);
}
function colorize(geo, fn) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, col = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i); n.fromBufferAttribute(nor, i); fn(p, n, c);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}
function displace(geo, fn) {
  const pos = geo.attributes.position, p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); fn(p, i); pos.setXYZ(i, p.x, p.y, p.z); }
  geo.computeVertexNormals(); return geo;
}
const mix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);

/* ---------- surface detail: grey bump maps painted once ---------- */
const BUMPS = {};
function bumpMap(kind) {
  if (BUMPS[kind]) return BUMPS[kind];
  const S = 512; const [c, x] = canvas(S, S); const d = x.createImageData(S, S), p = d.data;
  for (let i = 0; i < S * S; i++) {
    const u = i % S, v = (i / S) | 0; let g;
    if (kind === 'kraft') g = 128 + Math.sin(u / S * TAU * 90) * 60 + (Math.random() - .5) * 40;           // corrugated ridges
    else if (kind === 'fibre') g = 128 + (Math.random() - .5) * 70 + Math.sin((u + v * .3) * .9) * 10;       // paper fibre
    else g = 128 + (noise3(u / 18, v / 18, 1) * 60) + (Math.random() - .5) * 50;                              // crumb / cream
    p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = Math.max(0, Math.min(255, g)); p[i * 4 + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  const t = tex(c, { srgb: false }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(kind === 'kraft' ? 1 : 3, kind === 'kraft' ? 1 : 3);
  return (BUMPS[kind] = t);
}

/* ---------- materials ---------- */
const M = {
  paper: map => new THREE.MeshPhysicalMaterial({ map, color: '#ffffff', roughness: .62, clearcoat: .08, clearcoatRoughness: .6, bumpMap: bumpMap('fibre'), bumpScale: .35, sheen: .2, sheenColor: new THREE.Color('#ffffff') }),
  lid: () => new THREE.MeshPhysicalMaterial({ color: '#f4f1ea', roughness: .32, clearcoat: .45, clearcoatRoughness: .25 }),
  clear: (side = THREE.FrontSide, o = .2) => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .04, metalness: 0, clearcoat: 1, clearcoatRoughness: .04, transparent: true, opacity: o, side, depthWrite: false, envMapIntensity: 1.6 }),
  ice: () => new THREE.MeshPhysicalMaterial({ color: '#eef7fb', roughness: .12, clearcoat: 1, transparent: true, opacity: .55, envMapIntensity: 1.8, depthWrite: false }),
  liquid: map => new THREE.MeshPhysicalMaterial({ map, roughness: .22, clearcoat: .6, clearcoatRoughness: .2 }),
  whip: () => new THREE.MeshPhysicalMaterial({ color: '#fbf6ec', roughness: .5, sheen: 1, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: .6, clearcoat: .15, bumpMap: bumpMap('crumb'), bumpScale: .6 }),
  glaze: (color, r = .2) => new THREE.MeshPhysicalMaterial({ color, roughness: r, clearcoat: .9, clearcoatRoughness: .08 }),
  bake: (r = .55, cc = .3) => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: r, clearcoat: cc, clearcoatRoughness: .45, sheen: .4, sheenColor: new THREE.Color('#ffd9a0'), bumpMap: bumpMap('crumb'), bumpScale: .8 }),
  matte: (color, r = .8) => new THREE.MeshStandardMaterial({ color, roughness: r })
};

/* ---------- textures ---------- */
function paperTex({ holiday } = {}) {
  const W = 1024, H = 512; const [c, x] = canvas(W, H);
  x.fillStyle = holiday ? '#a51f2d' : '#fbfaf6'; x.fillRect(0, 0, W, H);
  if (holiday) {
    // festive cup: red with gold ribbons and stars
    for (let i = 0; i < 46; i++) {
      const px = rnd() * W, py = rnd() * H, s = 4 + rnd() * 9;
      x.fillStyle = rnd() > .5 ? GOLD : '#f3e3c0'; x.save(); x.translate(px, py); x.rotate(rnd() * TAU); x.beginPath();
      for (let k = 0; k < 10; k++) { const r = k % 2 ? s * .45 : s; x.lineTo(Math.cos(k * TAU / 10) * r, Math.sin(k * TAU / 10) * r); }
      x.fill(); x.restore();
    }
    x.strokeStyle = GOLD; x.lineWidth = 6; x.globalAlpha = .7;
    for (let k = 0; k < 3; k++) { x.beginPath(); for (let u = 0; u <= W; u += 8) x.lineTo(u, 60 + k * 190 + Math.sin(u / 60 + k) * 26); x.stroke(); }
    x.globalAlpha = 1;
  } else {
    // paper fibres
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(120,110,90,${rnd() * .05})`; x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1); }
    // seam
    x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(W * .02, 0, 6, H);
    // order boxes on the side (decaf / shots / syrup / milk / custom)
    x.font = '600 15px Inter, Arial'; x.fillStyle = '#8a8f8c'; x.textBaseline = 'middle';
    ['DECAF', 'SHOTS', 'SYRUP', 'MILK', 'CUSTOM'].forEach((t, i) => {
      const y = 330 + i * 30; x.strokeStyle = '#a7aca9'; x.lineWidth = 1.5; x.strokeRect(300, y - 11, 46, 22); x.fillText(t, 354, y);
    });
    x.strokeStyle = '#1b1f1d'; x.lineWidth = 3; x.lineCap = 'round';
    [[1, 'x'], [2, '2'], [3, 'O']].forEach(([i, m]) => { x.font = '700 26px Caveat, cursive'; x.fillStyle = '#1b1f1d'; x.textAlign = 'center'; x.fillText(m, 323, 330 + i * 30); x.textAlign = 'left'; });
  }
  drawMark(x, W * .5, H * .2, 118, { sx: 1, sy: 1.08, mono: holiday ? GREEN : null });
  grain(x, W, H, 6);
  return tex(c);
}
/* a texture whose hand-written name can be re-written, left to right, like a marker */
function namedTex(W, H, drawBase, [nx, ny, px, rot], name) {
  const [c, x] = canvas(W, H); drawBase(x, W, H);
  const base = x.getImageData(0, 0, W, H), t = tex(c);
  let cacheName = null, ink = null, box = null;
  t.userData.write = (nm, p = 1) => {
    x.putImageData(base, 0, 0);
    if (nm) {
      if (nm !== cacheName) {
        cacheName = nm; [ink] = canvas(W, H); const ix = ink.getContext('2d');
        marker(ix, nm, nx, ny, px, rot, '#14201c');
        ix.font = `700 ${px}px Caveat, cursive`; const w = Math.min(ix.measureText(nm).width, px * 2.6);
        box = [nx - w / 2 - px * .3, ny - px * .75, w + px * .6, px * 1.5];
      }
      const [bx, by, bw, bh] = box, cw = bw * Math.min(1, Math.max(0, p));
      if (cw > 0) x.drawImage(ink, bx, by, cw, bh, bx, by, cw, bh);
      if (p > 0 && p < 1) { // the marker tip
        const tx = bx + cw, ty = ny + Math.sin(p * 40) * px * .18;
        x.fillStyle = 'rgba(20,32,28,.85)'; x.beginPath(); x.arc(tx, ty, px * .07, 0, TAU); x.fill();
      }
    }
    t.needsUpdate = true;
  };
  t.userData.write(name, 1);
  return t;
}
function sleeveTex(name) {
  return namedTex(1024, 256, (x, W, H) => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#b98a57'); g.addColorStop(.5, '#c79a64'); g.addColorStop(1, '#b4844f');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let u = 0; u < W; u += 3) { x.fillStyle = `rgba(80,50,20,${.04 + (u % 6 ? 0 : .05)})`; x.fillRect(u, 0, 1, H); }
    for (let i = 0; i < 3000; i++) { x.fillStyle = rnd() > .5 ? 'rgba(70,40,15,.18)' : 'rgba(255,240,210,.12)'; x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
    [.2, .8].forEach(u => { drawMark(x, W * u - 112, H * .46, 74, { mono: '#14332b' }); wordmark(x, W * u - 66, H * .47, 40, { color: '#14332b', accent: '#14332b', align: 'left' }); });
    x.font = '600 15px Inter, Arial'; x.fillStyle = 'rgba(20,51,43,.75)'; x.textAlign = 'center';
    x.fillText('BREWED FOR YOU, BY NAME', W * .5, H * .88); x.fillText('CAREFUL, CONTENTS HOT', W * .2, H * .82); x.fillText('ROASTED IN TAGUIG', W * .8, H * .82);
    // a dashed write-on line where the barista puts your name
    x.strokeStyle = 'rgba(20,51,43,.35)'; x.setLineDash([6, 6]); x.lineWidth = 2; x.beginPath(); x.moveTo(W * .38, H * .7); x.lineTo(W * .62, H * .7); x.stroke(); x.setLineDash([]);
    grain(x, W, H, 10);
  }, [1024 * .5, 256 * .45, 104, -.05], name);
}
function icedPrintTex(name) {
  return namedTex(1024, 384, (x, W, H) => {
    x.clearRect(0, 0, W, H);
    drawMark(x, W * .5, H * .3, 118, { sy: 1.05 });
    [.25, .75].forEach(u => wordmark(x, W * u, H * .5, 40, { color: GREEN, accent: GREEN }));
    // fill lines on the back
    x.strokeStyle = 'rgba(14,107,78,.75)'; x.lineWidth = 3; x.font = '700 18px Inter, Arial'; x.fillStyle = 'rgba(14,107,78,.8)';
    [['ICE', .2], ['MILK', .5], ['SHOTS', .8]].forEach(([t, v]) => { const y = H * (1 - v); x.beginPath(); x.moveTo(990, y); x.lineTo(1020, y); x.stroke(); x.beginPath(); x.moveTo(0, y); x.lineTo(30, y); x.stroke(); x.fillText(t, 36, y + 6); });
  }, [1024 * .5, 384 * .74, 84, -.06], name);
}
function gradTex(colors, { speck = 0, chips = false, base = null } = {}) {
  const W = speck ? 1024 : 64, H = 512; const [c, x] = canvas(W, H);
  const g = x.createLinearGradient(0, 0, 0, H); // top -> bottom
  const n = colors.length;
  colors.forEach((col, i) => {
    const a = i / n, b = (i + 1) / n;
    g.addColorStop(Math.min(1, a + .015), col); g.addColorStop(Math.max(0, b - .015), col);
  });
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  if (base) { x.fillStyle = base; x.fillRect(0, 0, W, H); }
  for (let i = 0; i < speck * .4; i++) { x.fillStyle = `rgba(255,248,236,${.06 + rnd() * .14})`; x.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
  if (chips) for (let i = 0; i < speck / 2; i++) { x.fillStyle = 'rgba(40,18,8,.85)'; x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1 + rnd() * 3); }
  return tex(c, { aniso: 1 });
}
function latteTex(color, art) {
  const S = 512; const [c, x] = canvas(S, S);
  const g = x.createRadialGradient(S / 2, S / 2, 20, S / 2, S / 2, S / 2);
  const base = new THREE.Color(color), dark = base.clone().multiplyScalar(.62), light = base.clone().lerp(new THREE.Color('#f2dcc0'), .35);
  g.addColorStop(0, '#' + light.getHexString()); g.addColorStop(.75, '#' + base.getHexString()); g.addColorStop(1, '#' + dark.getHexString());
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(255,236,200,${rnd() * .12})`; x.beginPath(); x.arc(rnd() * S, rnd() * S, rnd() * 3, 0, TAU); x.fill(); }
  const foam = '#f6ead6';
  x.fillStyle = foam; x.strokeStyle = foam; x.shadowColor = 'rgba(246,234,214,.8)'; x.shadowBlur = 10;
  const cx = S / 2, cy = S / 2;
  if (art === 'heart' || art === 'tulip') {
    const blobs = art === 'heart' ? [[0, 20, 1]] : [[0, 120, .55], [0, 40, .75], [0, -60, 1]];
    blobs.forEach(([dx, dy, s]) => {
      x.save(); x.translate(cx + dx, cy + dy); x.scale(s, s);
      x.beginPath(); x.moveTo(0, 70); x.bezierCurveTo(-150, -20, -90, -150, 0, -70); x.bezierCurveTo(90, -150, 150, -20, 0, 70); x.fill();
      x.fillStyle = '#' + base.getHexString(); x.shadowBlur = 0;
      x.beginPath(); x.moveTo(0, 40); x.bezierCurveTo(-90, -10, -60, -95, 0, -45); x.bezierCurveTo(60, -95, 90, -10, 0, 40); x.globalAlpha = .55; x.fill(); x.globalAlpha = 1;
      x.fillStyle = foam; x.restore();
    });
    x.lineWidth = 5; x.beginPath(); x.moveTo(cx, cy - 180); x.lineTo(cx, cy + 190); x.stroke();
  } else if (art === 'rosetta') {
    // leaves: a foam crescent, then the crema showing through just above it
    const crema = '#' + base.getHexString();
    for (let i = 0; i < 9; i++) {
      const y = cy + 150 - i * 34, w = 150 - i * 13, h = 30 - i * 1.2;
      x.fillStyle = foam; x.shadowBlur = 8; x.beginPath(); x.ellipse(cx, y, w, h, 0, 0, TAU); x.fill();
      x.fillStyle = crema; x.shadowBlur = 0; x.beginPath(); x.ellipse(cx, y - h * .55, w * .92, h * .85, 0, 0, TAU); x.fill();
    }
    x.fillStyle = foam; x.shadowBlur = 8; x.beginPath(); x.ellipse(cx, cy - 165, 34, 28, 0, 0, TAU); x.fill();
    x.strokeStyle = crema; x.shadowBlur = 0; x.lineWidth = 6; x.beginPath(); x.moveTo(cx, cy - 175); x.quadraticCurveTo(cx + 4, cy, cx, cy + 185); x.stroke();
  } else if (art === 'crosshatch') {
    x.fillStyle = foam; x.shadowBlur = 16; x.beginPath(); x.arc(cx, cy, S * .44, 0, TAU); x.fill(); x.shadowBlur = 0;
    x.fillStyle = 'rgba(90,46,22,.55)'; x.beginPath(); x.arc(cx + 18, cy - 10, 46, 0, TAU); x.fill(); // the espresso mark
    x.strokeStyle = '#b0641c'; x.lineCap = 'round'; x.lineWidth = 9;
    for (let k = -4; k <= 4; k++) { const o = k * 44; x.beginPath(); x.moveTo(cx - 190, cy + o - 20); x.lineTo(cx + 190, cy + o + 20); x.stroke(); x.beginPath(); x.moveTo(cx + o - 20, cy - 190); x.lineTo(cx + o + 20, cy + 190); x.stroke(); }
  } else if (art === 'dust' || art === 'cocoa') {
    x.fillStyle = foam; x.shadowBlur = 16; x.beginPath(); x.arc(cx, cy, S * .42, 0, TAU); x.fill(); x.shadowBlur = 0;
    const col = art === 'dust' ? 'rgba(140,78,30,' : 'rgba(60,30,14,';
    for (let i = 0; i < 2600; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * S * .4; x.fillStyle = col + (.25 + rnd() * .6) + ')'; x.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1 + rnd() * 2.5, 1 + rnd() * 2.5); }
  } else if (art === 'crema') {
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(200,140,80,${rnd() * .25})`; x.beginPath(); x.ellipse(rnd() * S, rnd() * S, 2 + rnd() * 10, 1 + rnd() * 4, rnd() * 3, 0, TAU); x.fill(); }
  }
  x.shadowBlur = 0;
  return tex(c);
}
function citrusTex() {
  const S = 256; const [c, x] = canvas(S, S);
  x.fillStyle = '#5f9a2c'; x.beginPath(); x.arc(128, 128, 128, 0, TAU); x.fill();
  x.fillStyle = '#f4f0c8'; x.beginPath(); x.arc(128, 128, 116, 0, TAU); x.fill();
  for (let i = 0; i < 9; i++) {
    x.save(); x.translate(128, 128); x.rotate(i * TAU / 9);
    x.fillStyle = '#e9d24c'; x.beginPath(); x.moveTo(6, 4); x.quadraticCurveTo(70, 30, 104, 12); x.quadraticCurveTo(108, -14, 70, -26); x.quadraticCurveTo(30, -26, 6, -4); x.fill(); x.restore();
  }
  return tex(c);
}
function decalTex(draw, W = 1024, H = 512) { const [c, x] = canvas(W, H); draw(x, W, H); return tex(c); }
function bagTex(color, label, roast) {
  const W = 512, H = 768; const [c, x] = canvas(W, H);
  x.fillStyle = color; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(0,0,0,${rnd() * .06})`; x.fillRect(rnd() * W, rnd() * H, 2, 2); }
  // label
  x.fillStyle = '#f6efe2'; const lx = 56, ly = 250, lw = W - 112, lh = 400;
  x.beginPath(); x.roundRect(lx, ly, lw, lh, 22); x.fill();
  drawMark(x, W / 2, ly + 82, 104);
  wordmark(x, W / 2, ly + 168, 40);
  x.fillStyle = GOLD; x.fillRect(W / 2 - 60, ly + 200, 120, 3);
  x.fillStyle = HOUSE; x.textAlign = 'center'; x.font = '800 46px "Plus Jakarta Sans", Arial'; x.fillText(label || 'BENGUET', W / 2, ly + 262);
  x.font = '700 20px Inter, Arial'; x.fillStyle = GREEN; x.fillText(roast || 'MEDIUM ROAST', W / 2, ly + 300);
  x.font = '600 18px Inter, Arial'; x.fillStyle = '#5e6b66'; x.fillText('WHOLE BEAN · 250 g', W / 2, ly + 360);
  x.font = '700 30px Caveat, cursive'; x.fillStyle = GOLD; x.fillText('roasted in Manila', W / 2, ly + 112 - 140);
  // valve
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(W / 2, 150, 22, 0, TAU); x.fill();
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(W / 2, 150, 14, 0, TAU); x.fill();
  grain(x, W, H, 8);
  return tex(c);
}

/* ======================================================
   BUILDERS: each returns a THREE.Group standing on y = 0
   ====================================================== */
function hotCup(v, o) {
  const g = new THREE.Group(), H = 2.6, r0 = .74, r1 = .98, rAt = y => r0 + (r1 - r0) * y / H;
  const side = new THREE.Mesh(lathe([[r0, .03], [r1, H]]), M.paper(paperTex(v)));
  side.rotation.y = Math.PI; g.add(side);
  const inner = new THREE.Mesh(lathe([[r0 - .01, .05], [r1 - .01, H]]), M.matte('#e9e2d4', .9)); inner.material.side = THREE.BackSide; g.add(inner);
  const base = new THREE.Mesh(lathe([[0, .0], [r0 - .03, 0], [r0 + .005, .02], [r0, .06]], 64, { even: false }), M.matte('#f2eee6', .7)); g.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r1, .03, 12, 96), M.paper(null)); rim.rotation.x = Math.PI / 2; rim.position.y = H; g.add(rim);
  // lid with a raised sip ring and a slot
  if (v.sleeve !== false) {
    const y0 = .72, y1 = 1.58, pts = []; for (let i = 0; i <= 24; i++) { const y = lerp(y0, y1, i / 24); pts.push([rAt(y) + .018, y]); }
    const st = sleeveTex(o.name);
    const sl = new THREE.Mesh(lathe(pts, 96, { even: false }), new THREE.MeshStandardMaterial({ map: st, roughness: .9, bumpMap: bumpMap('kraft'), bumpScale: 1.2 }));
    sl.rotation.y = Math.PI; sl.userData.part = 'sleeve'; g.add(sl); g.userData.nameTex = st;
    [y0, y1].forEach(y => { const e = new THREE.Mesh(lathe([[rAt(y) - .001, y], [rAt(y) + .019, y]], 96, { even: false }), M.matte('#a87a48', .95)); e.material.side = THREE.DoubleSide; e.userData.part = 'sleeve'; g.add(e); });
  }
  if (v.open) return openTop(g, v, o, H, rAt);
  const lp = [[0, .21], [.56, .21], [.6, .232], [.8, .236], [.85, .2], [.9, .155], [.97, .14], [1.02, .11], [1.048, .06], [1.045, 0], [1.005, -.03], [.975, -.036]]
    .map(([r, y]) => [r * r1 / .98 * .985, H + y]);
  const lid = new THREE.Mesh(lathe(lp, 96, { even: false }), M.lid());
  lid.userData.part = 'lid'; g.add(lid);
  const slot = new THREE.Mesh(new THREE.CapsuleGeometry(.045, .2, 6, 16), M.matte('#2a1a12', .4));
  slot.rotation.z = Math.PI / 2; slot.scale.set(1, 1, .45); slot.position.set(0, H + .238, .7); slot.userData.part = 'lid'; g.add(slot);
  g.userData = Object.assign(g.userData, { steam: true, steamY: H + .3 });
  return g;
}

function openTop(g, v, o, H, rAt) {
  const y = H - .16, r = rAt(y) - .012;
  const liq = new THREE.Mesh(new THREE.CircleGeometry(r, 96), new THREE.MeshPhysicalMaterial({ map: latteTex((v.liquid || ['#c69a6c'])[0], v.top === 'whip' ? 'cocoa' : (v.top || 'heart')), roughness: .38, clearcoat: .5 }));
  liq.rotation.x = -Math.PI / 2; liq.rotation.z = Math.PI; liq.position.y = y; g.add(liq);
  if (v.top === 'whip') { const w = whip({ drizzle: '#3a1a0c' }, y - .14, r + .2); w.scale.set(.82, .7, .82); w.position.y = y * .3 - .1; g.add(w); }
  g.userData = Object.assign(g.userData, { steam: true, steamY: H + .1, elev: .5 });
  return g;
}

function clearCup(v, o, { frappe = false } = {}) {
  const g = new THREE.Group(), H = 2.9, r0 = .7, r1 = 1.0, rAt = y => r0 + (r1 - r0) * y / H;
  const prof = [[r0 - .02, 0], [r0, .03], [r1, H]];
  const back = new THREE.Mesh(lathe(prof), M.clear(THREE.BackSide, .16)); back.renderOrder = 1;
  const front = new THREE.Mesh(lathe(prof), M.clear(THREE.FrontSide, .2)); front.renderOrder = 4;
  g.add(back, front);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(r0 - .02, 64), M.clear(THREE.DoubleSide, .25)); bot.rotation.x = -Math.PI / 2; bot.position.y = .01; g.add(bot);
  { const t = new THREE.Mesh(new THREE.TorusGeometry(r1 + .012, .016, 10, 96), M.clear(THREE.FrontSide, .35)); t.rotation.x = Math.PI / 2; t.position.y = H; t.renderOrder = 5; g.add(t); } // one thin rolled lip
  // printed logo + the barista's handwriting
  const dpts = []; for (let i = 0; i <= 20; i++) { const y = lerp(1.0, 2.3, i / 20); dpts.push([rAt(y) + .006, y]); }
  const pt = icedPrintTex(o.name); g.userData.nameTex = pt;
  const print = new THREE.Mesh(lathe(dpts, 96, { even: false }), new THREE.MeshStandardMaterial({ map: pt, transparent: true, roughness: .4, depthWrite: false }));
  print.rotation.y = Math.PI; print.renderOrder = 6; g.add(print);
  // liquid
  const fill = frappe ? H - .04 : H * .95; // 95% full, the drink touches the wall
  const lpts = []; for (let i = 0; i <= 30; i++) { const y = lerp(.05, fill, i / 30); lpts.push([rAt(y) - .014, y]); }
  const lt = gradTex(v.liquid || ['#2a140a'], { speck: frappe ? 900 : 0, chips: !!v.chips });
  const liq = new THREE.Mesh(lathe(lpts, 64, { even: false }), M.liquid(lt)); liq.renderOrder = 0; g.add(liq);
  const top = new THREE.Mesh(new THREE.CircleGeometry(rAt(fill) - .014, 64), M.liquid(null));
  top.material.color.set((v.liquid || ['#2a140a'])[0]); top.rotation.x = -Math.PI / 2; top.position.y = fill; g.add(top);
  // ice
  reseed(11);
  const nIce = frappe ? 0 : (v.ice ?? 6);
  for (let i = 0; i < nIce; i++) {
    const s = .34 + rnd() * .14, ice = new THREE.Mesh(new RoundedBoxGeometry(s, s, s, 3, .07), M.ice());
    const a = rnd() * TAU, rr = .25 + rnd() * (rAt(fill) - .62);
    ice.position.set(Math.cos(a) * rr, i < 4 ? fill - .1 + rnd() * .12 : fill - .45 - rnd() * .7, Math.sin(a) * rr);
    ice.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); ice.renderOrder = 2; g.add(ice);
  }
  // caramel cross-hatch on top
  if (v.drizzle && !frappe) {
    const mat = M.glaze(v.drizzle, .25), R = rAt(fill) - .1;
    for (let k = -3; k <= 3; k++) for (const dir of [1, -1]) {
      const pts = []; for (let i = 0; i <= 20; i++) { const t = lerp(-1, 1, i / 20); const px = t * R, pz = k * .22 + Math.sin(i) * .02; const rr = Math.hypot(px, pz); if (rr < R) pts.push(new THREE.Vector3(dir > 0 ? px : pz, fill + .03, dir > 0 ? pz : px)); }
      if (pts.length > 2) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .025, 6), mat));
    }
  }
  if (v.lime) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .06, 48), [M.matte('#6aa232', .5), M.glaze('#ffffff', .3), M.glaze('#ffffff', .3)]);
    s.material[1].map = citrusTex(); s.material[2].map = s.material[1].map;
    s.position.set(-.2, fill - .1, .25); s.rotation.set(1.2, .3, .4); g.add(s);
  }
  // inner caramel streaks (frappés)
  if (frappe && v.drizzle) {
    const mat = M.glaze(v.drizzle, .3);
    for (let k = 0; k < 6; k++) {
      const a0 = k / 6 * TAU + .3, pts = [];
      for (let i = 0; i <= 16; i++) { const y = lerp(H - .1, .8 + rnd() * .8, i / 16), a = a0 + Math.sin(i * .7) * .08; pts.push(new THREE.Vector3(Math.cos(a) * (rAt(y) - .035), y, Math.sin(a) * (rAt(y) - .035))); }
      const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .02, 6), mat); t.renderOrder = 1; g.add(t);
    }
  }
  // condensation
  const drops = 120, dg = new THREE.SphereGeometry(1, 10, 8);
  const dm = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0, clearcoat: 1, transparent: true, opacity: .32, envMapIntensity: 2, depthWrite: false });
  const im = new THREE.InstancedMesh(dg, dm, drops), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pp = new THREE.Vector3();
  const slope = (r1 - r0) / H;
  for (let i = 0; i < drops; i++) {
    const y = .15 + rnd() * (H * .82), a = rnd() * TAU, r = rAt(y) + .008;
    pp.set(Math.cos(a) * r, y, Math.sin(a) * r);
    const nrm = new THREE.Vector3(Math.cos(a), -slope, Math.sin(a)).normalize();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
    const s = .008 + Math.pow(rnd(), 3) * .026; sc.set(s, s * (1 + rnd() * .5), s * .4);
    m4.compose(pp, q, sc); im.setMatrixAt(i, m4);
  }
  im.renderOrder = 7; g.add(im);
  // lids + straw
  if (frappe) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r1 + .03, 64, 32, 0, TAU, .16, Math.PI / 2 - .16), M.clear(THREE.DoubleSide, .18));
    dome.scale.y = .9; dome.position.y = H; dome.renderOrder = 8; dome.userData.part = 'lid'; g.add(dome);
    const ring = new THREE.Mesh(new THREE.TorusGeometry((r1 + .03) * Math.sin(.16), .02, 8, 48), M.clear(THREE.FrontSide, .5));
    ring.rotation.x = Math.PI / 2; ring.position.y = H + (r1 + .03) * Math.cos(.16) * .9; ring.userData.part = 'lid'; g.add(ring);
    const rimL = new THREE.Mesh(new THREE.TorusGeometry(r1 + .03, .04, 10, 96), M.clear(THREE.FrontSide, .45)); rimL.rotation.x = Math.PI / 2; rimL.position.y = H; rimL.userData.part = 'lid'; g.add(rimL);
    const wh = whip(v, H, r1); wh.userData.part = 'whip'; wh.userData.pivotY = H; g.add(wh);
  } else {
    const fl = new THREE.Mesh(lathe([[0, H + .05], [r1 - .1, H + .05], [r1 - .04, H + .09], [r1 + .03, H + .06], [r1 + .04, H - .03]], 96, { even: false }), M.clear(THREE.DoubleSide, .3));
    fl.renderOrder = 8; fl.userData.part = 'lid'; g.add(fl);
  }
  const strawR = frappe ? .1 : .075, straw = new THREE.Mesh(new THREE.CylinderGeometry(strawR, strawR, H + 1.6, 24, 1, true), M.glaze(GREEN, .35));
  straw.material.side = THREE.DoubleSide;
  straw.position.set(.22, (H + 1.6) / 2 + .15, -.1); straw.rotation.z = -.12; straw.rotation.x = .05; straw.renderOrder = 3; straw.userData.part = 'straw'; g.add(straw);
  g.userData.steam = false;
  return g;
}

function whip(v, H, r1) {
  const g = new THREE.Group(), pts = [], turns = 3.2, n = 260;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * turns * TAU, r = lerp(r1 - .26, .05, Math.pow(t, .9));
    pts.push(new THREE.Vector3(Math.cos(a) * r, H + .12 + t * .62, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 360, .21, 18);
  displace(geo, p => { const k = 1 + fbm(p.x * 6, p.y * 6, p.z * 6) * .04; p.x *= k; p.z *= k; });
  g.add(new THREE.Mesh(geo, M.whip()));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), M.whip()); tip.position.copy(pts[n]).add(new THREE.Vector3(0, .02, 0)); tip.scale.y = 1.3; g.add(tip);
  if (v.drizzle) {
    const dp = []; for (let i = 0; i <= 200; i++) { const t = i / 200, a = t * 3 * TAU + .4, r = lerp(r1 - .2, .1, t) + .02; dp.push(new THREE.Vector3(Math.cos(a) * r, H + .28 + t * .62 + Math.sin(i * .9) * .03, Math.sin(a) * r)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dp), 400, .032, 6), M.glaze(v.drizzle, .2)));
  }
  if (v.crumbs || v.chips) {
    const col = v.chips ? '#2a120a' : v.crumbs, mat = M.matte(col, .7);
    for (let i = 0; i < 70; i++) {
      const t = rnd() * .95, p = curve.getPoint(t), s = .03 + rnd() * .05;
      const c = new THREE.Mesh(new THREE.BoxGeometry(s, s * .7, s), mat);
      c.position.copy(p).add(new THREE.Vector3(0, .2, 0).applyAxisAngle(new THREE.Vector3(rnd() - .5, 0, rnd() - .5).normalize(), rnd() * 1.2));
      c.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); g.add(c);
    }
  }
  return g;
}

function ceramicCup(v, o) {
  const g = new THREE.Group(), color = v.cup || '#ffffff';
  const prof = [[0, 0], [.42, 0], [.47, .03], [.5, .08], [.62, .22], [.76, .48], [.88, .82], [.95, 1.12], [.965, 1.24], [.955, 1.275], [.935, 1.275], [.92, 1.25], [.9, 1.1], [.82, .82], [.68, .5], [.52, .26], [.3, .16], [0, .14]];
  const cup = new THREE.Mesh(lathe(prof, 96, { even: false }), M.glaze(color, .18)); cup.position.y = .1; g.add(cup);
  // badge decal on the front
  const dp = []; for (let i = 0; i <= 16; i++) { const t = i / 16, y = lerp(.5, .98, t); const r = y < .82 ? lerp(.76, .88, (y - .48) / .34) : lerp(.88, .95, (y - .82) / .3); dp.push([r + .006, y + .1]); }
  const dec = new THREE.Mesh(lathe(dp, 96, { even: false }), new THREE.MeshPhysicalMaterial({ transparent: true, roughness: .2, clearcoat: .9, depthWrite: false,
    map: decalTex((x, W, H) => { drawMark(x, W / 2, H / 2, H * .82, { sx: .55, mono: color === '#ffffff' ? null : (color === '#c9a15b' ? HOUSE : GOLD) }); }, 1024, 256) }));
  dec.rotation.y = Math.PI; g.add(dec);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.3, .07, 18, 48, Math.PI * 1.15), M.glaze(color, .18));
  handle.rotation.z = -Math.PI * .575; handle.position.set(.86, .82, 0); handle.scale.set(1, 1.1, 1.3); g.add(handle);
  const sp = [[0, 0], [.7, 0], [.76, .03], [1.25, .06], [1.5, .15], [1.53, .18], [1.49, .19], [1.22, .12], [.62, .1], [.57, .115], [0, .115]];
  const saucer = new THREE.Mesh(lathe(sp, 128, { even: false }), M.glaze(color, .18)); g.add(saucer);
  const liq = new THREE.Mesh(new THREE.CircleGeometry(.905, 96), new THREE.MeshPhysicalMaterial({ map: latteTex(v.liquid[0], v.art), roughness: .35, clearcoat: .5 }));
  liq.rotation.x = -Math.PI / 2; liq.position.y = 1.2; g.add(liq);
  if (v.marsh) for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(.18, .14, .18, 2, .05), M.matte('#fbf7f0', .6)); const a = rnd() * TAU, r = rnd() * .55;
    m.position.set(Math.cos(a) * r, 1.24, Math.sin(a) * r); m.rotation.set(rnd(), rnd() * 3, rnd()); g.add(m);
  }
  g.userData = { steam: true, steamY: 1.5, elev: .62 };
  return g;
}

function croissant() {
  const g = new THREE.Group(); const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - .5, a = t * 2.3, R = 1.25;
    const fat = 1 - Math.pow(Math.abs(t) * 2, 1.6) * .72;
    const geo = new THREE.SphereGeometry(1, 48, 32);
    geo.scale(.34, .52 * fat, .62 * fat);
    displace(geo, p => { const k = 1 + fbm(p.x * 5 + i, p.y * 5, p.z * 5) * .05; p.multiplyScalar(k); });
    colorize(geo, (p, nr, c) => {
      const top = smooth(-.2, .4, nr.y), streak = .5 + .5 * Math.sin(p.z * 22 + p.y * 6 + i);
      c.copy(mix('#e2a24f', '#97460f', .25 + top * .75)).lerp(new THREE.Color('#6e300a'), top * streak * .35);
      if (nr.y < -.3) c.lerp(new THREE.Color('#d9984a'), .6);
    });
    const m = new THREE.Mesh(geo, M.bake(.42, .55));
    m.position.set(Math.sin(a) * R, .4 * fat + .05, Math.cos(a) * R - R); m.rotation.y = a; m.rotation.z = .25 * Math.sign(t) * Math.abs(t);
    g.add(m);
  }
  g.add(paperSheet(2.2, '#f4efe6'));
  g.userData = { food: true };
  return g;
}
function paperSheet(s, col) {
  const geo = new THREE.PlaneGeometry(s, s * .8, 30, 24); displace(geo, p => { p.z = fbm(p.x * 1.4, p.y * 1.4, 3) * .05; });
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .95, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.rotation.z = .3; m.position.y = .005;
  return m;
}
function ensaymada(v) {
  const g = new THREE.Group(), pts = [], turns = 2.3, n = 200;
  for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * TAU, r = lerp(.15, 1.05, t); pts.push(new THREE.Vector3(Math.cos(a) * r, .42 + (1 - t) * .3 - t * t * .15, Math.sin(a) * r)); }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, .3, 24);
  displace(geo, p => { const k = 1 + fbm(p.x * 4, p.y * 4, p.z * 4) * .03; p.x *= k; p.z *= k; if (p.y < .12) p.y = .12 + (p.y - .12) * .3; });
  const topC = new THREE.Color(v.top || '#f6e7b8');
  colorize(geo, (p, nr, c) => { const t = smooth(.15, .7, nr.y); c.copy(mix('#e6a85c', '#b8692a', .5 + fbm(p.x * 3, 1, p.z * 3) * .4)).lerp(topC, t * .92); });
  g.add(new THREE.Mesh(geo, M.bake(.6, .25)));
  // sugar + grated queso
  const sugar = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, .03, .03), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .1, clearcoat: 1 }), 500);
  const cheese = new THREE.InstancedMesh(new THREE.BoxGeometry(.025, .025, .22), M.matte('#f2cf5b', .55), 160);
  const m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion();
  const place = (im, cnt, lift) => { for (let i = 0; i < cnt; i++) { const t = rnd(), a = t * turns * TAU, r = lerp(.15, 1.05, t) + (rnd() - .5) * .3, y = .42 + (1 - t) * .3 - t * t * .15 + .26 + lift; e.set(rnd() * 3, rnd() * 3, rnd() * 3); q.setFromEuler(e); m4.compose(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4); } g.add(im); };
  place(sugar, 500, 0); place(cheese, 160, .02);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, .02, 96), M.matte('#fbf8f2', .9)); g.add(liner);
  g.userData = { food: true };
  return g;
}
function muffin() {
  const g = new THREE.Group();
  const liner = new THREE.CylinderGeometry(.98, .74, .9, 160, 6, true);
  displace(liner, p => { const a = Math.atan2(p.z, p.x), k = 1 + .035 * Math.sign(Math.sin(a * 24)) * Math.abs(Math.sin(a * 24)) ** .5; p.x *= k; p.z *= k; });
  const lm = new THREE.Mesh(liner, new THREE.MeshStandardMaterial({ color: '#0e6b4e', roughness: .75, side: THREE.DoubleSide })); lm.position.y = .45; g.add(lm);
  const base = new THREE.Mesh(new THREE.CircleGeometry(.74, 64), M.matte('#0a4d38')); base.rotation.x = -Math.PI / 2; base.position.y = .002; g.add(base);
  const top = new THREE.SphereGeometry(1.14, 96, 64, 0, TAU, 0, Math.PI * .62);
  displace(top, p => { const k = 1 + fbm(p.x * 2.6, p.y * 2.6, p.z * 2.6) * .09 + fbm(p.x * 9, p.y * 9, p.z * 9) * .02; p.multiplyScalar(k); });
  colorize(top, (p, n, c) => { const h = smooth(.2, 1.1, p.y); c.copy(mix('#d99a4e', '#8e4614', .35 + h * .65 + fbm(p.x * 5, p.y * 5, p.z * 5) * .25)); });
  const tm = new THREE.Mesh(top, M.bake(.7, .1)); tm.scale.y = .7; tm.position.y = .55; g.add(tm);
  const berry = M.glaze('#2b2d5c', .3);
  for (let i = 0; i < 16; i++) {
    const th = rnd() * Math.PI * .55, ph = rnd() * TAU, r = 1.14 * 1.02;
    const b = new THREE.Mesh(new THREE.SphereGeometry(.09 + rnd() * .04, 16, 12), berry);
    b.position.set(Math.sin(th) * Math.cos(ph) * r, .55 + Math.cos(th) * r * .7, Math.sin(th) * Math.sin(ph) * r); g.add(b);
  }
  const sugar = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, .035, .035), new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: .15, clearcoat: 1 }), 140), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < 140; i++) { const th = Math.sqrt(rnd()) * Math.PI * .5, ph = rnd() * TAU, r = 1.17; q.setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, 0)); m4.compose(new THREE.Vector3(Math.sin(th) * Math.cos(ph) * r, .55 + Math.cos(th) * r * .7, Math.sin(th) * Math.sin(ph) * r), q, new THREE.Vector3(1, 1, 1)); sugar.setMatrixAt(i, m4); }
  g.add(sugar);
  g.userData = { food: true, elev: .28 };
  return g;
}
function cookie() {
  const g = new THREE.Group();
  const one = (sd, rad) => {
    reseed(sd);
    const geo = new THREE.SphereGeometry(rad, 96, 48);
    displace(geo, p => {
      const a = Math.atan2(p.z, p.x), k = 1 + fbm(Math.cos(a) * 2 + sd, Math.sin(a) * 2, 1) * .08;
      p.x *= k; p.z *= k;
      p.y = p.y > 0 ? p.y * .2 + fbm(p.x * 4, sd, p.z * 4) * .035 + fbm(p.x * 12, 2, p.z * 12) * .012 : p.y * .08;
    });
    colorize(geo, (p, n, c) => { c.copy(mix('#2a1309', '#160904', .5 + fbm(p.x * 6, p.y * 6, p.z * 6) * .7)); if (n.y > .6) c.lerp(new THREE.Color('#3a1d0e'), .3); });
    const cg = new THREE.Group(), m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 })); cg.add(m);
    const choc = M.glaze('#1e0d06', .32);
    for (let i = 0; i < 16; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * rad * .82, s = .11 + rnd() * .09;
      const c = new THREE.Mesh(new RoundedBoxGeometry(s, s * .55, s * 1.25, 2, .03), choc);
      c.position.set(Math.cos(a) * r, rad * .2 * (1 - (r / rad) ** 2) + .02, Math.sin(a) * r); c.rotation.set(rnd() - .5, rnd() * 3, rnd() - .5); cg.add(c);
    }
    const salt = new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: .1, clearcoat: 1 });
    for (let i = 0; i < 18; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * rad * .8, f = new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .04), salt); f.position.set(Math.cos(a) * r, rad * .2 * (1 - (r / rad) ** 2) + .035, Math.sin(a) * r); f.rotation.set(rnd(), rnd() * 3, rnd()); cg.add(f); }
    return cg;
  };
  const back = one(5, 1); back.position.set(-.55, .14, -.75); back.rotation.set(-.12, .4, .08); g.add(back);
  const front = one(9, 1.05); front.position.set(.25, .1, .25); g.add(front);
  g.userData = { food: true, elev: .42 };
  return g;
}
function cake(v) {
  const g = new THREE.Group(), R = 1.75, ang = .62;
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(R * Math.sin(-ang / 2), R * Math.cos(-ang / 2)); shape.absarc(0, 0, R, Math.PI / 2 + ang / 2, Math.PI / 2 - ang / 2, true); shape.lineTo(0, 0);
  const layers = [[v.sponge, .36], [v.frost, .09], [v.sponge, .36], [v.frost, .09], [v.sponge, .36]];
  let y = 0;
  layers.forEach(([col, h], i) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 32 }); geo.rotateX(-Math.PI / 2);
    const mat = col === v.sponge ? new THREE.MeshStandardMaterial({ color: col, roughness: .95 }) : new THREE.MeshPhysicalMaterial({ color: col, roughness: .5, sheen: .5 });
    if (col === v.sponge) { displace(geo, p => { p.x += fbm(p.x * 8, p.y * 8, p.z * 8) * .01; }); }
    const m = new THREE.Mesh(geo, mat); m.position.y = y; g.add(m); y += h;
  });
  // frosting top + back
  const tgeo = new THREE.ExtrudeGeometry(shape, { depth: .14, bevelEnabled: true, bevelThickness: .05, bevelSize: .04, bevelSegments: 4, curveSegments: 32 }); tgeo.rotateX(-Math.PI / 2);
  const topMat = new THREE.MeshPhysicalMaterial({ color: v.cocoa ? '#6b3e22' : v.frost, roughness: v.cocoa ? .95 : .45, sheen: .6 });
  const tm = new THREE.Mesh(tgeo, topMat); tm.position.y = y; g.add(tm);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(R + .04, R + .04, y + .1, 48, 1, true, Math.PI - ang / 2, ang), new THREE.MeshPhysicalMaterial({ color: v.cocoa ? '#efe2c8' : v.frost, roughness: .5, side: THREE.DoubleSide }));
  back.position.y = (y + .1) / 2; g.add(back);
  // rosette
  const pts = []; for (let i = 0; i <= 120; i++) { const t = i / 120, a = t * 2.4 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * .2 * (1 - t), y + .2 + t * .25, Math.sin(a) * .2 * (1 - t) - R * .72)); }
  const ro = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, .09, 12), new THREE.MeshPhysicalMaterial({ color: v.cocoa ? '#efe2c8' : v.frost, roughness: .45, sheen: .6 })); g.add(ro);
  if (!v.cocoa) for (let i = 0; i < 40; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.05, .04, .05), M.matte(v.sponge)); const t = rnd(); c.position.set((rnd() - .5) * t * 1.2, y + .2, -t * R * .9); c.rotation.set(rnd(), rnd(), rnd()); g.add(c); }
  else { const bean = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), M.glaze('#2a140a', .3)); bean.scale.set(1, .6, 1.4); bean.position.set(0, y + .52, -R * .72); g.add(bean); }
  const plate = new THREE.Mesh(lathe([[0, -.06], [1.3, -.06], [1.7, .03], [1.75, .06], [1.69, .06], [1.25, -.01], [0, -.01]], 128, { even: false }), M.glaze('#fbfaf6', .15)); plate.material.side = THREE.DoubleSide;
  g.children.forEach(c => { c.position.z += R * .5; });
  g.add(plate);
  g.rotation.y = -.55;
  const wrap = new THREE.Group(); wrap.add(g); wrap.userData = { food: true, elev: .38 };
  return wrap;
}
function beans(v) {
  const g = new THREE.Group(), W = 1.5, H = 2.5, D = .9;
  const geo = new THREE.BoxGeometry(W, H, D, 24, 48, 12);
  displace(geo, p => {
    const t = (p.y + H / 2) / H;
    const pinch = 1 - smooth(.62, 1, t) * .9, bulge = 1 + Math.sin(t * Math.PI) * .06;
    p.z *= pinch * bulge; p.x *= bulge * (1 - smooth(.85, 1, t) * .04);
    p.z += fbm(p.x * 3, p.y * 3, 2) * .02 * smooth(.3, 1, t);
    p.y += H / 2;
  });
  const side = new THREE.MeshPhysicalMaterial({ color: v.color, roughness: .78, sheen: .3 });
  const front = new THREE.MeshPhysicalMaterial({ map: bagTex(v.color, v.label, v.roast), roughness: .75, sheen: .3 });
  const bag = new THREE.Mesh(geo, [side, side, side, side, front, side]); g.add(bag);
  // tin tie + fold
  const fold = new THREE.Mesh(new RoundedBoxGeometry(W * 1.02, .32, .12, 3, .05), side); fold.position.set(0, H - .12, 0); g.add(fold);
  const tie = new THREE.Mesh(new RoundedBoxGeometry(W * 1.14, .07, .15, 2, .02), new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: .9, roughness: .3 })); tie.position.set(0, H - .14, 0); g.add(tie);
  // spilled beans
  const bm = M.glaze(v.color === '#c9a15b' ? '#8a5530' : '#3a1f10', .35);
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), bm); b.scale.set(1, .62, 1.35);
    b.position.set(.6 + rnd() * 1.1, .055, .5 + rnd() * .9); b.rotation.y = rnd() * 3; g.add(b);
  }
  g.userData = { food: false };
  return g;
}
function tumbler(v) {
  const g = new THREE.Group();
  const body = [[0, 0], [.7, 0], [.77, .04], [.8, .14], [.88, 2.55], [.885, 2.62]];
  const powder = new THREE.MeshPhysicalMaterial({ color: v.color, roughness: .42, metalness: .2, clearcoat: .7, clearcoatRoughness: .3 });
  g.add(new THREE.Mesh(lathe(body, 128, { even: false }), powder));
  const steel = new THREE.MeshPhysicalMaterial({ color: '#d8dadb', metalness: 1, roughness: .16 });
  g.add(new THREE.Mesh(lathe([[.885, 2.6], [.89, 2.62], [.892, 2.86], [.88, 2.9]], 128, { even: false }), steel));
  const lid = new THREE.Mesh(lathe([[0, 3.12], [.6, 3.12], [.78, 3.08], [.87, 3.0], [.89, 2.88], [.86, 2.84]], 128, { even: false }), new THREE.MeshPhysicalMaterial({ color: '#1b1f1d', roughness: .35, clearcoat: .6 }));
  g.add(lid);
  const slider = new THREE.Mesh(new RoundedBoxGeometry(.5, .06, .26, 3, .03), new THREE.MeshPhysicalMaterial({ color: '#2a2f2c', roughness: .3 })); slider.position.set(0, 3.13, .38); g.add(slider);
  const dp = []; for (let i = 0; i <= 12; i++) { const y = lerp(.9, 2.2, i / 12); dp.push([lerp(.8, .88, (y - .14) / 2.41) + .004, y]); }
  const dec = new THREE.Mesh(lathe(dp, 128, { even: false }), new THREE.MeshPhysicalMaterial({ transparent: true, depthWrite: false, roughness: .3, metalness: .6,
    map: decalTex((x, W, H) => { drawMark(x, W / 2, H * .42, H * .5, { sx: .58, mono: v.color === '#0e6b4e' ? GOLD : GREEN }); wordmark(x, W / 2, H * .86, 46, { color: v.color === '#0e6b4e' ? '#f3ebdd' : HOUSE, accent: v.color === '#0e6b4e' ? GOLD : GREEN }); }, 1024, 512) }));
  dec.rotation.y = Math.PI; g.add(dec);
  g.userData = { food: false };
  return g;
}
function stoneMug(v) {
  const g = new THREE.Group();
  const prof = [[0, 0], [.7, 0], [.78, .04], [.82, .14], [.84, 1.8], [.83, 1.88], [.8, 1.9], [.77, 1.86], [.76, 1.7], [.74, .2], [0, .18]];
  const glaze = M.glaze(v.color, .22);
  g.add(new THREE.Mesh(lathe(prof, 128, { even: false }), glaze));
  const clay = new THREE.Mesh(lathe([[.7, 0], [.78, .04], [.8, .1]], 128, { even: false }), M.matte('#c9a27a', .9)); g.add(clay);
  const inside = new THREE.Mesh(new THREE.CircleGeometry(.74, 64), M.glaze('#f3ebdd', .2)); inside.rotation.x = -Math.PI / 2; inside.position.y = .2; g.add(inside);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.42, .1, 18, 48, Math.PI * 1.1), glaze); handle.rotation.z = -Math.PI * .55; handle.position.set(.8, 1.0, 0); handle.scale.set(1, 1.15, 1); g.add(handle);
  const dp = []; for (let i = 0; i <= 10; i++) dp.push([.846, lerp(.55, 1.45, i / 10)]);
  const dec = new THREE.Mesh(lathe(dp, 128, { even: false }), new THREE.MeshPhysicalMaterial({ transparent: true, depthWrite: false, roughness: .25, clearcoat: .9,
    map: decalTex((x, W, H) => { drawMark(x, W / 2, H * .38, H * .56, { sx: .62, mono: GOLD }); wordmark(x, W / 2, H * .86, 52, { color: '#f3ebdd', accent: GOLD }); }, 1024, 512) }));
  dec.rotation.y = Math.PI; g.add(dec);
  g.userData = { steam: false };
  return g;
}

export function buildModel(v, o = {}) {
  reseed(v.seed || 3);
  switch (v.kind) {
    case 'hot': return hotCup(v, o);
    case 'iced': return clearCup(v, o);
    case 'frappe': return clearCup(v, o, { frappe: true });
    case 'mug': return ceramicCup(v, o);
    case 'croissant': return croissant(v);
    case 'ensaymada': return ensaymada(v);
    case 'muffin': return muffin(v);
    case 'cookie': return cookie(v);
    case 'cake': return cake(v);
    case 'beans': return beans(v);
    case 'tumbler': return tumbler(v);
    case 'ceramic': return stoneMug(v);
  }
  return hotCup(v, o);
}

/* ---------- the product floor: a faint grid that fades out round the product (no shadow) ---------- */
function gridTex(color) {
  const S = 1024, n = 14; const [c, x] = canvas(S, S);
  x.strokeStyle = color; x.lineWidth = 2.2;
  for (let i = 0; i <= n; i++) { const p = i / n * S; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, S); x.stroke(); x.beginPath(); x.moveTo(0, p); x.lineTo(S, p); x.stroke(); }
  x.globalCompositeOperation = 'destination-in';
  const g = x.createRadialGradient(S / 2, S / 2, S * .12, S / 2, S / 2, S / 2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const t = tex(c); t.anisotropy = 8; return t;
}

/* ---------- soft textures for steam ---------- */
function radialTex(inner, outer) {
  const [c, x] = canvas(128, 128), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return tex(c, { srgb: false });
}

/* ======================================================
   STAGE
   ====================================================== */
export class GioStage {
  constructor(canvasEl, opts = {}) {
    this.o = Object.assign({ interactive: true, autoRotate: true, float: true, steam: true, view: 'front', exposure: 1.05, fit: 1.18, still: false }, opts);
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduce) { this.o.autoRotate = false; this.o.float = false; }
    this.canvas = canvasEl; canvasEl.setAttribute('role', 'img');
    this.target = null; this.holdUntil = 0;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, preserveDrawingBuffer: !!this.o.still, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, this.o.still ? 2 : 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = this.o.exposure;
    r.setClearColor(0x000000, 0);
    const s = this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r); s.environment = pm.fromScene(new RoomEnvironment(r), .04).texture; pm.dispose();
    this.cam = new THREE.PerspectiveCamera(26, 1, .1, 100);
    const key = new THREE.DirectionalLight('#fff3e2', 2.1); key.position.set(-4, 7, 6); s.add(key);
    const rim = new THREE.DirectionalLight('#ffe2b8', 1.6); rim.position.set(5, 4, -6); s.add(rim);
    const fill = new THREE.DirectionalLight('#dff3ea', .6); fill.position.set(4, 1, 5); s.add(fill);
    s.add(new THREE.HemisphereLight('#fffaf0', '#3b2418', .35));
    this.pivot = new THREE.Group(); s.add(this.pivot);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: gridTex(this.o.grid || 'rgba(42,154,112,.62)'), transparent: true, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; s.add(this.shadow);
    // steam
    this.steam = new THREE.Group(); s.add(this.steam);
    const st = radialTex('rgba(255,255,255,.55)', 'rgba(255,255,255,0)');
    for (let i = 0; i < 9; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, transparent: true, depthWrite: false, opacity: 0 })); sp.userData.t = i / 9; this.steam.add(sp); }
    this.rotY = 0; this.vel = 0; this.tilt = { x: 0, y: 0 }; this.t0 = performance.now(); this.visible = true; this.popT0 = -1e9;
    this.resize();
    if (!this.o.still) {
      new ResizeObserver(() => this.resize()).observe(canvasEl);
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }, { rootMargin: '80px' }).observe(canvasEl);
      if (this.o.interactive) this.bind();
      this.loop();
    }
  }
  resize() {
    const w = this.canvas.clientWidth || this.canvas.width, h = this.canvas.clientHeight || this.canvas.height;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.frame();
  }
  bind() {
    const c = this.canvas; let down = false, lx = 0, last = 0;
    c.style.touchAction = 'pan-y'; c.style.cursor = 'grab';
    c.addEventListener('pointerdown', e => { down = true; lx = e.clientX; last = performance.now(); c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; this.vel = 0; });
    c.addEventListener('pointermove', e => {
      const b = c.getBoundingClientRect(); this.tilt.x = ((e.clientY - b.top) / b.height - .5); this.tilt.y = ((e.clientX - b.left) / b.width - .5);
      if (!down) return; const dx = e.clientX - lx; lx = e.clientX; this.rotY += dx * .011; this.vel = dx * .011; last = performance.now();
    });
    const up = () => { down = false; c.style.cursor = 'grab'; if (performance.now() - last > 80) this.vel = 0; };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', () => { this.tilt.x = 0; this.tilt.y = 0; });
    this.dragging = () => down;
  }
  async show(v, o = {}) {
    if (o.name) { try { await document.fonts.load('700 80px Caveat'); } catch (e) { } }
    try { await document.fonts.load('800 40px "Plus Jakarta Sans"'); } catch (e) { }
    const model = buildModel(v, o);
    const old = this.model; this.model = model; this.spec = v; this.opts = o;
    model.scale.setScalar(o.scale || 1);
    this.pivot.add(model);
    this.box = new THREE.Box3().setFromObject(model);
    if (old) { this.pivot.remove(old); this.disposeObj(old); }
    this.frame();
    if (this.reduce) o.assemble = false;
    this.popT0 = this.o.still || this.reduce || o.pop === false || o.assemble ? -1e9 : performance.now();
    this.asm = null; this.ink = null;
    if (o.assemble && !this.o.still) {
      const parts = []; model.traverse(n => { if (n.userData.part) parts.push([n, n.position.clone(), n.scale.clone()]); });
      this.asm = { t0: performance.now(), parts };
      this.present(1800);
      if (o.name && model.userData.nameTex) { model.userData.nameTex.userData.write('', 0); this.write(o.name, 1150); }
    }
    if (this.o.still) this.renderer.render(this.scene, this.cam);
    return model;
  }
  /* the barista writes (or re-writes) the name on the cup */
  /* turn the cup so its front (logo + name) faces you, then hold it there a moment */
  present(hold = 2600) {
    this.target = Math.round(this.rotY / TAU) * TAU; this.vel = 0; this.holdUntil = performance.now() + hold;
  }
  write(name, delay = 0) {
    const t = this.model && this.model.userData.nameTex; if (!t) return false;
    this.present(delay + 2800);
    if (this.reduce) { t.userData.write(name, 1); if (this.opts) this.opts.name = name; return true; }
    if (this.opts) this.opts.name = name;
    if (!name) { t.userData.write('', 0); this.ink = null; return true; }
    this.ink = { t, name, t0: performance.now() + delay, dur: 380 + Math.min(14, name.length) * 70 };
    return true;
  }
  frame() {
    if (!this.model) return;
    const box = this.box, size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const ud0 = this.model.userData, food = ud0.food, elev = ud0.elev ?? (food ? .5 : (this.o.view === 'top' ? .45 : .14));
    const radius = Math.max(size.y * .55, Math.hypot(size.x, size.z) * .5);
    const fov = this.cam.fov * Math.PI / 180, fitH = radius / Math.sin(fov / 2), fitW = radius / Math.sin(Math.atan(Math.tan(fov / 2) * this.cam.aspect));
    const d = Math.max(fitH, fitW) * this.o.fit;
    this.cam.position.set(0, ctr.y + Math.sin(elev) * d, Math.cos(elev) * d);
    this.cam.lookAt(0, ctr.y - (food ? .05 : 0), 0);
    this.base = ctr.y;
    const sw = Math.max(5.6, Math.hypot(size.x, size.z) * 2.6); this.shadow.scale.set(sw, sw, 1); this.shadow.position.y = .002;
    const ud = this.model.userData; this.steamOn = this.o.steam && ud.steam && !this.reduce; this.steamY = (ud.steamY || 3) * (this.opts?.scale || 1);
  }
  spin(n = 1) { if (!this.reduce) this.vel = .25 * n; }
  pause() { this.paused = true; cancelAnimationFrame(this.raf); this.raf = 0; }
  resume() { this.paused = false; this.loop(); }
  loop() {
    if (this.raf || this.paused || !this.visible || document.hidden) return;
    const tick = () => {
      this.raf = 0;
      if (this.paused || !this.visible || document.hidden) return;
      this.update(); this.renderer.render(this.scene, this.cam);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  update() {
    const t = (performance.now() - this.t0) / 1000;
    const drag = this.dragging && this.dragging();
    const now = performance.now();
    if (drag) this.target = null;
    if (!drag && this.target != null) { this.rotY += (this.target - this.rotY) * .1; if (Math.abs(this.target - this.rotY) < .002 && now > this.holdUntil) this.target = null; }
    else if (!drag) { this.rotY += this.vel; this.vel *= .94; if (this.o.autoRotate && Math.abs(this.vel) < .002 && now > this.holdUntil) { const home = Math.round(this.rotY / TAU) * TAU + Math.sin(t * .42) * .5; this.rotY += (home - this.rotY) * .02; } }
    const p = Math.min(1, (performance.now() - this.popT0) / 750), back = 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
    if (this.model) {
      const s = (this.opts?.scale || 1) * Math.max(.001, back);
      if (!this.asm) this.model.scale.setScalar(s);
      this.pivot.rotation.y = this.rotY + (1 - p) * -1.2;
      this.pivot.rotation.x = lerp(this.pivot.rotation.x, this.tilt.x * .18, .06);
      this.pivot.rotation.z = lerp(this.pivot.rotation.z, -this.tilt.y * .08, .06);
      this.pivot.position.y = this.o.float ? Math.sin(t * 1.4) * .05 + .05 : 0;
      if (this.asm) this.assembleStep();
      if (this.ink) { const k = (performance.now() - this.ink.t0) / this.ink.dur; if (k >= 0) { this.ink.t.userData.write(this.ink.name, k); if (k >= 1) this.ink = null; } }
    }
    this.steam.visible = !!this.steamOn;
    if (this.steamOn) this.steam.children.forEach((sp, i) => {
      const k = (t * .22 + sp.userData.t) % 1;
      sp.position.set(Math.sin(t * .9 + i * 2.1) * .18 * (1 + k), this.steamY + k * 1.1 + this.pivot.position.y, Math.cos(i * 1.3) * .15);
      const sc = .5 + k * 1.3; sp.scale.set(sc, sc * 1.3, 1); sp.material.opacity = Math.sin(k * Math.PI) * .2 * (1 - k * .6);
    });
  }
  assembleStep() {
    const k = (performance.now() - this.asm.t0) / 1000, sc = this.opts?.scale || 1;
    const ease = (a, d) => { const x = Math.min(1, Math.max(0, (k - a) / d)); return 1 - Math.pow(1 - x, 4); };
    // the cup lands on the counter, squashes a touch, then each part goes on
    const drop = ease(0, .5); this.model.position.y = (1 - drop) * 1.8;
    const sq = Math.sin(Math.min(1, Math.max(0, (k - .42) / .24)) * Math.PI) * .06;
    this.model.scale.set(sc * (1 + sq * .5), sc * (1 - sq), sc * (1 + sq * .5));
    this.asm.parts.forEach(([n, p0, s0]) => {
      const part = n.userData.part;
      if (part === 'sleeve') n.position.y = p0.y - (1 - ease(.3, .5)) * .9;
      else if (part === 'lid') n.position.y = p0.y + (1 - ease(.62, .42)) * 1.6;
      else if (part === 'straw') n.position.y = p0.y + (1 - ease(.9, .5)) * 3;
      else if (part === 'whip') { const e = ease(.6, .65); n.scale.set(s0.x * (.3 + .7 * e), s0.y * (.05 + .95 * e), s0.z * (.3 + .7 * e)); n.position.y = (n.userData.pivotY || 0) * (1 - n.scale.y / s0.y); }
    });
    if (k > 1.7) { this.asm.parts.forEach(([n, p0, s0]) => { n.position.copy(p0); n.scale.copy(s0); }); this.model.position.y = 0; this.model.scale.setScalar(sc); this.asm = null; }
  }
  renderStill(rot = -.35) {
    this.pivot.rotation.set(0, rot, 0); this.pivot.position.y = 0; this.steam.visible = false;
    this.renderer.render(this.scene, this.cam);
  }
  disposeObj(o) {
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      const ms = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [];
      ms.forEach(m => { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); });
    });
  }
}

/* texture painters, exported for tools/textures.html (Blender product renders use the same artwork) */
export const PAINT = { paperTex, sleeveTex, icedPrintTex, bagTex, latteTex, citrusTex, gradTex, decalTex, drawMark, wordmark, GREEN, HOUSE, GOLD };
