/* GioCoffee · menu page */
import { boot, $, $$, esc, cart, store, reveal, openItem, IC, reduce } from './common.js?v=13';
import { ITEMS, CATS, art, peso, milkChoice } from './data.js?v=13';

boot('menu.html');
/* mid-tone stages: calm enough that a white cup still reads against them */
const BG = { seasonal: '#dcb995', hot: '#d3bc9e', cold: '#b3cfc0', frappe: '#d8bfa1', tea: '#c6bbdc', food: '#dcc7a0', merch: '#b4cabd' };
/* deep card colours (white text passes contrast on all of them) */
const DEEP = { seasonal: ['#a8642a', '#6f3c14'], hot: ['#4a2c1c', '#24140b'], cold: ['#0e6b4e', '#08402f'], frappe: ['#7a4b2e', '#46271a'], tea: ['#5b4887', '#33264f'], food: ['#9a5d24', '#5e3410'], merch: ['#1d4337', '#0b1f19'] };
const FILTERS = [
  { id: 'iced', name: 'Iced & blended', test: i => ['iced', 'frappe'].includes(i.v.kind) },
  { id: 'nocaf', name: 'No coffee', test: i => i.caf === 0 || (i.caf != null && i.caf < 30 && i.cat !== 'merch') },
  { id: 'oat', name: 'Oat-friendly', test: i => milkChoice(i) },
  { id: 'ph', name: 'Only in PH', test: i => i.tag === 'Only in PH' || /ube|calamansi|ensaymada|spanish|benguet|sagada/.test(i.id) }
];
const on = new Set();
$('#cats').innerHTML = CATS.map(c => `<button class="cat" type="button" data-cat="${c.id}" aria-pressed="false">${esc(c.name)}</button>`).join('');
$('#filters').innerHTML = FILTERS.map(f => `<button class="filter" type="button" data-f="${f.id}" aria-pressed="false">${esc(f.name)}</button>`).join('');

const card = (it, k, c) => `<article class="card" data-tilt style="--cbg:${BG[c.id]};--d1:${DEEP[c.id][0]};--d2:${DEEP[c.id][1]}" data-id="${it.id}"><span class="sheen" aria-hidden="true"></span>
  ${it.tag ? `<span class="pill gold tagx">${esc(it.tag)}</span>` : ''}
  <button class="card__open" type="button" data-item="${it.id}" aria-label="${esc(it.name)}, ${peso(it.price)}. Open details">
    <span class="card__art"><img class="lift" src="${art(it.id)}" alt="" loading="${k < 8 ? 'eager' : 'lazy'}" width="320" height="320"></span>
    <span class="card__b"><span class="card__t">${esc(it.name)}</span><span class="card__d">${esc(it.desc)}</span></span>
  </button>
  <div class="card__f"><span><b>${peso(it.price)}</b>${it.kcal ? `<small>${it.kcal} kcal</small>` : ''}</span><button class="add" type="button" data-quick="${it.id}" aria-label="Add ${esc(it.name)} to your order">${IC.plus}<span>Add</span></button></div></article>`;

let first = true;
function render() {
  const fold = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/caff/g, 'caf');
  const t = fold($('#q').value.trim());
  const keep = it => (!t || fold(it.name + ' ' + it.desc + ' ' + (it.tag || '')).includes(t)) && [...on].every(f => FILTERS.find(x => x.id === f).test(it));
  // FLIP: remember where each card was before the list changes
  const before = new Map($$('.card').map(c => [c.dataset.id, c.getBoundingClientRect()]));
  let n = 0;
  const html = CATS.map(c => {
    const items = ITEMS.filter(i => i.cat === c.id && keep(i)); n += items.length;
    if (!items.length) return '';
    return `<section class="menu-group" id="${c.id}" aria-labelledby="g-${c.id}"><h2 id="g-${c.id}">${esc(c.name)}${c.hand ? `<small>${esc(c.hand)}</small>` : ''}</h2>
      <div class="grid">${items.map((it, k) => card(it, k, c)).join('')}</div></section>`;
  }).join('');
  $('#groups').innerHTML = html || `<p class="no-res">Nothing matches${t ? ` “${esc(t)}”` : ''}${on.size ? ' with these filters' : ''}. Try “latte”, “ube”, or clear a filter.</p>`;
  $('#count').textContent = `${n} of ${ITEMS.length} items`;
  if (!reduce && !first) $$('.card').forEach(c => {
    const a = before.get(c.dataset.id), b = c.getBoundingClientRect();
    if (a) { const dx = a.left - b.left, dy = a.top - b.top; if (dx || dy) c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.77,0,.175,1)' }); }
    else c.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
  });
  if (first && !reduce) $$('.card').forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: Math.min(i, 8) * 40, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }));
  first = false; watch();
}

let qt; $('#q').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(render, 120); });
$('#filters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; const f = b.dataset.f; on.has(f) ? on.delete(f) : on.add(f); b.setAttribute('aria-pressed', on.has(f)); render(); });
$('#cats').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  const target = $('#' + b.dataset.cat);
  if (!target) { on.clear(); $$('[data-f]').forEach(x => x.setAttribute('aria-pressed', false)); $('#q').value = ''; render(); }
  ($('#' + b.dataset.cat) || $('#groups')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
});
// the chip of the category in view lights up
let spy;
function watch() {
  spy && spy.disconnect();
  spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', x.dataset.cat === e.target.id)); const c = $(`#cats [data-cat="${e.target.id}"]`), bar = $('#cats'); if (c && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: c.offsetLeft - (bar.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); } }), { rootMargin: '-35% 0px -60% 0px' });
  $$('.menu-group').forEach(g => spy.observe(g));
}

$('#groups').addEventListener('click', e => {
  const q = e.target.closest('[data-quick]'); if (q) { cart.add(q.dataset.quick, { name: store.get('name', '') }, q.closest('.card')); return; }
  const c = e.target.closest('[data-item]'); if (c) openItem(c.dataset.item, c.querySelector('img'));
});
$('#askGio').addEventListener('click', () => $('.chat-fab').click());
// hero: the four ‑ber months cups on the stand open in 3D
$('.mh').addEventListener('click', e => { const b = e.target.closest('[data-item]'); if (b) openItem(b.dataset.item, b.querySelector('img')); });
render();
if (location.hash) setTimeout(() => $(location.hash)?.scrollIntoView(), 250);
reveal();
