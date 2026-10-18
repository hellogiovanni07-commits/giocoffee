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
