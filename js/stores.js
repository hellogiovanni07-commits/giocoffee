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

/* ---------- the storefront turns: 48 Blender views, drag (with a little momentum), arrow keys ----------
   Views are decoded up front and drawn onto one canvas, at most once per frame, so turning never waits on a decode. */
(() => {
  const spin = $('#spin'), img = $('#spinImg'); if (!spin) return;
  const N = 48, src = i => `assets/3d/hero/turn/f${String(i).padStart(2, '0')}.webp?v=1`;
  const cv = document.createElement('canvas'); cv.className = 'sth__cv'; cv.setAttribute('aria-hidden', 'true');
  const ctx = cv.getContext('2d', { alpha: true });
  const frames = new Array(N), ready = new Array(N).fill(false);
  let pos = 0, drawn = -1, want = 0, drag = null, vel = 0, coastRaf = 0, drawRaf = 0, touched = false, live = false;
  const side = d => d < 30 || d > 330 ? 'Front of the store' : d < 150 ? 'Right side, the blade sign and side window' : d < 210 ? 'Back of the store, staff door and bench' : 'Left side, the street lamp and side window';
  const size = () => { const r = spin.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.width * d * img.naturalHeight / img.naturalWidth || r.height * d); drawn = -1; paint(); };
  const nearestReady = i => { for (let k = 0; k < N / 2; k++) { if (ready[(i + k) % N]) return (i + k) % N; if (ready[(i - k + N) % N]) return (i - k + N) % N; } return -1; };
  function paint() {
    drawRaf = 0; if (!live) return;
    const i = ready[want] ? want : nearestReady(want); if (i < 0 || i === drawn) return;
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(frames[i], 0, 0, cv.width, cv.height); drawn = i;
  }
  const show = () => {
    want = ((Math.round(pos) % N) + N) % N;
    const deg = Math.round(want * 360 / N);
    if (spin.getAttribute('aria-valuenow') != deg) { spin.setAttribute('aria-valuenow', deg); spin.setAttribute('aria-valuetext', side(deg)); }
    if (!drawRaf) drawRaf = requestAnimationFrame(paint);
  };
  // decode every view ahead of time (nearest the front first); swap the <img> for the canvas once the front is ready
  const get = async i => {
    const im = new Image(); im.decoding = 'async'; im.src = src(i);
    try { await im.decode(); } catch (e) { return; }
    frames[i] = 'createImageBitmap' in window ? await createImageBitmap(im).catch(() => im) : im; ready[i] = true;
    if (i === 0 && !live) { live = true; spin.append(cv); size(); spin.classList.add('live'); }
    if (i === want && drawn !== i && !drawRaf) drawRaf = requestAnimationFrame(paint);
  };
  const load = async () => { await get(0); const order = []; for (let k = 1; k < N; k++) order.push(k % 2 ? (k + 1) / 2 : N - k / 2); for (const i of order) await get(i); };
  if (img.complete) setTimeout(load, 150); else img.addEventListener('load', () => setTimeout(load, 150), { once: true });
  addEventListener('resize', () => { if (live) size(); }, { passive: true });

  const coast = () => { coastRaf = 0; if (Math.abs(vel) < .03 || reduce) return; pos += vel; vel *= .9; show(); coastRaf = requestAnimationFrame(coast); };
  spin.addEventListener('pointerdown', e => {
    touched = true; cancelAnimationFrame(coastRaf); vel = 0; spin.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, p: pos, t: performance.now(), lx: e.clientX, per: spin.clientWidth / 30 }; spin.classList.add('drag');
  });
  spin.addEventListener('pointermove', e => {
    if (!drag) return;
    pos = drag.p - (e.clientX - drag.x) / drag.per;
    const now = performance.now(), dt = Math.max(8, now - drag.t);
    vel = vel * .5 + (-(e.clientX - drag.lx) / drag.per) * (16 / dt) * .5; drag.t = now; drag.lx = e.clientX;
    show();
  }, { passive: true });
  const end = () => { if (!drag) return; drag = null; spin.classList.remove('drag'); if (!reduce) coastRaf = requestAnimationFrame(coast); };
  spin.addEventListener('pointerup', end); spin.addEventListener('pointercancel', end);
  spin.addEventListener('keydown', e => {
    const k = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); touched = true; pos = Math.round(pos) + k; show(); }
    else if (e.key === 'Home') { e.preventDefault(); pos = 0; show(); }
  });
  // once every view is decoded, a small turn and back so it's clear the store moves
  if (!reduce) setTimeout(function peek() {
    if (touched) return; if (ready.some(r => !r)) return setTimeout(peek, 400);
    const start = performance.now();
    const step = now => { if (touched) return; const k = Math.min(1, (now - start) / 2400); pos = Math.sin(k * Math.PI) * 6; show(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, 1200);
})();
