/* GioCoffee · stores page */
import { boot, $, $$, esc, MARK, store, toast, reduce } from './common.js?v=11';
import { STORES } from './data.js?v=11';
import { MAP_SVG, pinsHTML, openNow, hoursFor, hoursText } from './map.js?v=11';

boot('stores.html');
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FILTERS = [['open', 'Open now', s => openNow(s)[0]], ['Drive-thru', 'Drive-thru'], ['Outdoor seats', 'Outdoor seats'], ['Pet friendly', 'Pet friendly'], ['Quiet room', 'Quiet room']];
const on = new Set(); let cur = null;
$('#map').insertAdjacentHTML('afterbegin', MAP_SVG + pinsHTML());
$('#filters').innerHTML = FILTERS.map(([id, n]) => `<button class="filter" type="button" data-f="${esc(id)}" aria-pressed="false">${esc(n)}</button>`).join('');
const openCount = STORES.filter(s => openNow(s)[0]).length;
$('#nowLine').textContent = `It's ${new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}: ${openCount} of ${STORES.length} stores are open right now.`;
// hero: the four stores with their live status; picking one opens it in the finder below
$('#sthStores').innerHTML = STORES.map(s => { const [o, t] = openNow(s); return `<button class="sth__store" type="button" data-store="${s.id}" data-hero><span><b>${esc(s.short)}</b><small>${esc(s.area)}</small></span><em class="${o ? 'on' : 'off'}">${esc(t)}</em></button>`; }).join('');
const passes = s => [...on].every(f => f === 'open' ? openNow(s)[0] : s.tags.includes(f));
function list() {
  const ss = STORES.filter(passes);
  $('#list').innerHTML = ss.length ? ss.map(s => { const [o, t] = openNow(s); return `<button class="store" type="button" data-store="${s.id}" id="${s.id}" aria-pressed="${s.id === cur}"><span class="ic">${MARK}</span><span><b>${esc(s.name)}</b><small>${esc(s.addr)}</small><span class="tags">${s.tags.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</span></span><span class="open-badge${o ? '' : ' closed'}">${t}</span></button>`; }).join('')
    : `<p class="no-res" style="padding:20px 0">No store has all of those. Clear a filter to see more.</p>`;
  $$('.pin').forEach(p => { const show = ss.some(s => s.id === p.dataset.store); p.style.opacity = show ? '' : '.25'; p.tabIndex = show ? 0 : -1; });
}
function pick(id, scroll) {
  cur = id; const s = STORES.find(x => x.id === id); const [o, t] = openNow(s), today = new Date().getDay();
  $$('[data-store]:not([data-hero])').forEach(b => b.setAttribute('aria-pressed', b.dataset.store === id));
  const mine = store.get('store', 'bgc') === id;
  $('#detail').innerHTML = `<span class="open-badge${o ? '' : ' closed'}">${t}</span><h2>${esc(s.name)}</h2><small style="color:var(--muted)">${esc(s.addr)} · <a href="tel:${s.phone.replace(/\s/g, '')}">${esc(s.phone)}</a></small>
    <div class="hours">${DAYS.map((d, i) => { const h = (i === 0 || i === 6) ? s.wk : s.open; return `<span class="${i === today ? 'today' : ''}">${d}${i === today ? ' (today)' : ''}</span><span class="${i === today ? 'today' : ''}">${hoursText(h)}</span>`; }).join('')}</div>
    <div class="hero__cta" style="margin-top:0"><button class="btn btn-sm" type="button" data-pickup="${s.id}">${mine ? 'Your pick-up store ✓' : 'Order ahead here'}</button><a class="btn btn-line btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.addr)}" target="_blank" rel="noopener">Directions</a></div>
    <p style="font-size:13px;color:var(--muted);margin-top:10px">${o ? `Order-ahead wait right now: about ${s.wait} minutes.` : `Closed now. Orders placed here are made when it opens.`}</p>`;
  $('#detail').classList.add('on');
  if (scroll && innerWidth < 900) $('#detail').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
}
$('#filters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; const f = b.dataset.f; on.has(f) ? on.delete(f) : on.add(f); b.setAttribute('aria-pressed', on.has(f)); list(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-store]'); if (b) { pick(b.dataset.store, !b.dataset.hero); if (b.dataset.hero) $('#finder').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  const p = e.target.closest('[data-pickup]'); if (p) { store.set('store', p.dataset.pickup); toast(`Orders will be ready at ${STORES.find(s => s.id === p.dataset.pickup).short}`); pick(p.dataset.pickup); }
});
list();
const h = location.hash.slice(1);
pick(STORES.some(s => s.id === h) ? h : store.get('store', 'bgc'));

/* ---------- the storefront turns ----------
   96 Blender views, 3.75° apart (phones and data-saver load every other one). They download six at a time, nearest
   the front first, are decoded once at the canvas's own size, and every frame blends the two views either side of
   the exact drag position, so the store follows the pointer continuously instead of stepping. */
(() => {
  const spin = $('#spin'), img = $('#spinImg'); if (!spin) return;
  const ALL = 96, lite = matchMedia('(max-width: 700px)').matches || navigator.connection?.saveData;
  const STEP = lite ? 2 : 1, N = ALL / STEP;                      // views in use; positions are in view units
  const src = k => `assets/3d/hero/turn/f${String(k * STEP).padStart(2, '0')}.webp?v=2`;
  const cv = document.createElement('canvas'); cv.className = 'sth__cv'; cv.setAttribute('aria-hidden', 'true');
  const ctx = cv.getContext('2d');
  const views = new Array(N), ready = new Array(N).fill(false);
  let pos = 0, drag = null, vel = 0, raf = 0, touched = false, live = false, lastKey = '', W = 0, H = 0;
  const wrap = i => ((i % N) + N) % N;
  const side = d => d < 30 || d > 330 ? 'Front of the store' : d < 150 ? 'Right side, the blade sign and side window' : d < 210 ? 'Back of the store, staff door and bench' : 'Left side, the street lamp and side window';
  const size = () => {
    const r = spin.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    W = Math.min(img.naturalWidth || 960, Math.round(r.width * d)); H = Math.round(W * (img.naturalHeight || 671) / (img.naturalWidth || 960));
    cv.width = W; cv.height = H; lastKey = ''; frame();
  };
  const near = i => { for (let k = 0; k <= N / 2; k++) { if (ready[wrap(i + k)]) return wrap(i + k); if (ready[wrap(i - k)]) return wrap(i - k); } return -1; };
  // draw the two views either side of pos, blended by how far between them we are
  function frame() {
    raf = 0; if (!live) return;
    const a = Math.floor(pos), t = pos - a, i = wrap(a), j = wrap(a + 1);
    const A = ready[i] ? i : near(i), B = ready[j] ? j : -1;
    const key = A + ':' + (B >= 0 && t > .02 ? B + ':' + t.toFixed(2) : '');
    if (A < 0 || key === lastKey) return; lastKey = key;
    ctx.clearRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.drawImage(views[A], 0, 0, W, H);
    if (B >= 0 && t > .02 && A === i) { ctx.globalAlpha = t; ctx.drawImage(views[B], 0, 0, W, H); ctx.globalAlpha = 1; }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const announce = () => {
    const deg = Math.round(wrap(Math.round(pos)) * 360 / N) % 360;
    if (+spin.getAttribute('aria-valuenow') !== deg) { spin.setAttribute('aria-valuenow', deg); spin.setAttribute('aria-valuetext', side(deg)); }
  };
  const set = p => { pos = p; kick(); };
  // load: six at a time, nearest the front first (both ways), each decoded once at canvas size
  const order = [0]; for (let k = 1; k < N; k++) order.push(k % 2 ? (k + 1) / 2 : N - k / 2);
  const getOne = async i => {
    const im = new Image(); im.decoding = 'async'; im.src = src(i);
    try { await im.decode(); } catch (e) { return; }
    if (!W) size();
    views[i] = 'createImageBitmap' in window ? await createImageBitmap(im, { resizeWidth: W, resizeHeight: H, resizeQuality: 'high' }).catch(() => im) : im;
    ready[i] = true;
    if (i === 0 && !live) { live = true; spin.append(cv); spin.classList.add('live'); }
    lastKey = ''; kick();
  };
  const load = async () => { await getOne(0); let n = 1; const worker = async () => { while (n < order.length) await getOne(order[n++]); }; await Promise.all(Array.from({ length: 6 }, worker)); };
  const start = () => { size(); load(); };
  if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
  // on resize the canvas follows; the decoded views are simply scaled when drawn
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (live) size(); }, 200); }, { passive: true });

  // drag: one full width turns it about 300°; on release it coasts and settles exactly on a view
  const settle = () => {
    const tick = () => {
      if (drag) return;
      if (!reduce && Math.abs(vel) > .02) { vel *= .9; set(pos + vel); }
      else { const target = Math.round(pos), d = target - pos; if (Math.abs(d) < .01) { set(target); announce(); return; } set(pos + d * (reduce ? 1 : .25)); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  spin.addEventListener('pointerdown', e => {
    touched = true; vel = 0; spin.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, p: pos, lx: e.clientX, t: performance.now(), per: spin.clientWidth / (N * 300 / 360) };
    spin.classList.add('drag');
  });
  spin.addEventListener('pointermove', e => {
    if (!drag) return;
    const now = performance.now(), dt = Math.max(8, now - drag.t), dp = -(e.clientX - drag.lx) / drag.per;
    vel = vel * .6 + dp * (16 / dt) * .4; drag.t = now; drag.lx = e.clientX;
    set(drag.p - (e.clientX - drag.x) / drag.per); announce();
  }, { passive: true });
  const end = () => { if (!drag) return; drag = null; spin.classList.remove('drag'); settle(); };
  spin.addEventListener('pointerup', end); spin.addEventListener('pointercancel', end);
  spin.addEventListener('keydown', e => {
    const k = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); touched = true; set(Math.round(pos) + k * Math.max(1, N / 48)); announce(); }
    else if (e.key === 'Home') { e.preventDefault(); set(0); announce(); }
  });
  // once the views near the front are in, a small turn and back so it's clear the store moves
  if (!reduce) setTimeout(function peek() {
    if (touched) return; if (order.slice(0, 16).some(i => !ready[i])) return setTimeout(peek, 300);
    const t0 = performance.now(), amp = N / 8;
    const step = now => { if (touched) return; const k = Math.min(1, (now - t0) / 2600); set(Math.sin(k * Math.PI) * amp); if (k < 1) requestAnimationFrame(step); else set(0); };
    requestAnimationFrame(step);
  }, 900);
})();
