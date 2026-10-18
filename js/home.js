/* GioCoffee · home page */
import { boot, $, $$, esc, reduce, cart, store, toast, tilt, IC, MARK, openItem, pickupStore, starsFor } from './common.js?v=13';
import { byId, art, peso, SIZES, MILKS, SYRUPS, STORES, REWARDS } from './data.js?v=13';
import { MAP_SVG, pinsHTML, openNow } from './map.js?v=13';
import { animate, scroll, inView } from '../vendor/motion/motion.esm.js?v=13';

const introDone = boot('index.html');
$('#revL').innerHTML = IC.arrowL; $('#revR').innerHTML = IC.arrowR;
const EASE = [0.23, 1, 0.32, 1];

/* =========================================================
   HERO: pick a drink, the barista builds and labels the cup
   ========================================================= */
const PICKS = [
  { id: 'maple-oat-latte', bg: '#0e6b4e', sub: 'Oat · muscovado', marks: { SHOTS: '2 B', SYRUP: 'MSC', MILK: 'OAT', CUSTOM: 'crumble' } },
  { id: 'pumpkin-cream-cold-brew', bg: '#8f3f15', sub: 'Pumpkin cold foam', marks: { SHOTS: '', SYRUP: 'PMK', MILK: 'CF', CUSTOM: 'cinn' } },
  { id: 'salted-caramel-frappe', bg: '#5a3420', sub: 'Blended, whipped', marks: { SHOTS: '1', SYRUP: 'SC', MILK: 'W', CUSTOM: 'whip' } },
  { id: 'toasted-hazelnut-mocha', bg: '#7d1d26', sub: 'First red cup of the season', marks: { SHOTS: '2', SYRUP: 'HZL', MILK: 'W', CUSTOM: 'whip' } }
];
const BOXES = ['DECAF', 'SHOTS', 'SYRUP', 'MILK', 'CUSTOM'];
let heroName = store.get('name', ''), heroCur = PICKS[0], heroStage = null, ticketNo = 427;
$('#picks').innerHTML = PICKS.map((p, i) => { const it = byId(p.id); return `<button class="pick" type="button" role="radio" data-pick="${i}" aria-checked="${i === 0}" style="--pc:${p.bg}"><img src="${art(p.id, true)}" alt="" width="48" height="48"><span>${esc(it.name)}<small>${p.sub} · ${peso(it.price)}</small></span></button>`; }).join('');
const nameIn = $('#nameIn'); nameIn.value = heroName;
const poss = n => n + (/s$/i.test(n) ? '’' : '’s');
const setHeroText = () => { $('#heroName').textContent = heroName ? `${poss(heroName)} way` : 'your way'; $$('.ph-name').forEach(e => e.textContent = heroName || 'Giovanni'); $('.making__name').textContent = heroName || 'Giovanni'; };
function ticket(p, animateMarks = true) {
  $('#ticketBoxes').innerHTML = BOXES.map((b, i) => { const m = p.marks[b] || ''; return `<li><span>${b}</span><em class="${m ? 'm' : ''}" style="--d:${.15 + i * .09}s">${esc(m)}</em></li>`; }).join('');
  $('#ticketNo').textContent = '#0' + ticketNo++;
  if (!animateMarks || reduce) $$('#ticketBoxes em').forEach(e => e.classList.add('in'));
  else requestAnimationFrame(() => $$('#ticketBoxes em').forEach(e => e.classList.add('in')));
}
$('#heroPoster').setAttribute('aria-hidden', 'true');
function heroShow(p, first = false) {
  heroCur = p; const it = byId(p.id), hero = $('#hero');
  hero.style.setProperty('--hero-bg', p.bg); $('meta[name=theme-color]').content = p.bg;
  $('#heroItem').textContent = it.name; $('#heroDesc').textContent = it.desc; $('#heroPrice').textContent = peso(it.price);
  $('#heroPoster').alt = `${it.name} in a GioCoffee cup`; $('#heroCanvas').setAttribute('aria-label', `${it.name} in 3D. Drag to spin it.`);
  $$('[data-pick]').forEach(b => { const on = PICKS[+b.dataset.pick] === p; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  $('#heroOrder').setAttribute('aria-label', `Order the ${it.name}, ${peso(it.price)}`);
  ticket(p, !first);
  if (heroStage) heroStage.show(it.v, { name: heroName, assemble: !reduce });
  else $('#heroPoster').src = art(p.id);
}
$('#picks').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (b && PICKS[+b.dataset.pick] !== heroCur) heroShow(PICKS[+b.dataset.pick]); });
$('#picks').addEventListener('keydown', e => { // radiogroup arrows
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return; e.preventDefault();
  const i = (PICKS.indexOf(heroCur) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : PICKS.length - 1)) % PICKS.length;
  heroShow(PICKS[i]); $(`[data-pick="${i}"]`).focus();
});
let nt; nameIn.addEventListener('input', () => {
  heroName = nameIn.value.trim().slice(0, 12); store.set('name', heroName); setHeroText(); $('#bName').value = heroName; B.name = heroName;
  clearTimeout(nt); nt = setTimeout(() => { heroStage && heroStage.write(heroName); bStage && bStage.write(heroName); labelStrip(); }, 260);
});
$('#heroOrder').addEventListener('click', () => cart.add(heroCur.id, { name: heroName, note: 'Medio · made the seasonal way' }, $('.hero__stage')));
setHeroText(); heroShow(PICKS[0], true);

/* ---------- NOW POURING: a strip of real-looking orders ---------- */
const POURS = [['Andrea', 'iced-spanish-latte'], ['Paolo', 'americano'], ['Hana', 'flat-white'], ['Marco', 'cold-brew'], ['Bea', 'ube-latte'], ['Josh', 'pumpkin-cream-cold-brew'], ['Tin', 'caramel-macchiato'], ['Rafa', 'java-chip-frappe'], ['Ced', 'maple-oat-latte'], ['Lia', 'iced-matcha-latte'], ['Migs', 'salted-caramel-frappe'], ['Kat', 'chai-latte']];
const pourItem = ([n, id]) => `<span class="pour__item"><img src="${art(id, true)}" alt="" width="34" height="34"><i>${n}</i>${esc(byId(id).name)}</span>`;
$('#pourRow').innerHTML = POURS.slice(0, 7).map(pourItem).join('');
let pourI = 7, pourT;
const pourNext = () => {
  const row = $('#pourRow'), tmp = document.createElement('div'); tmp.innerHTML = pourItem(POURS[pourI++ % POURS.length]);
  const el = tmp.firstChild; el.classList.add('new'); row.prepend(el);
  void el.offsetWidth; el.classList.remove('new');
  while (row.children.length > 9) row.lastChild.remove();
};
if (!reduce) inView('.pour', () => { pourT = setInterval(pourNext, 3200); return () => clearInterval(pourT); });

/* =========================================================
   FALL STACK: cards stack as you scroll
   ========================================================= */
const FEATS = [
  { id: 'pumpkin-cream-cold-brew', fb: '#a4481a', fc: '#c4652f', dark: true, st: 'Back by request', h: 'Pumpkin Cream Cold Brew', p: 'Our 20-hour cold brew under a velvet cap of kalabasa cold foam and a dust of cinnamon. The ‑ber months, poured over ice.', hand: 'the one everyone asks for' },
  { id: 'salted-caramel-frappe', fb: '#f1dcc0', fc: '#e6c497', st: 'New', h: 'Salted Caramel Frappé', p: 'Coffee blended with caramel and ice, piled with whipped cream and a sea-salt caramel drizzle that runs down the inside of the cup.', hand: 'drizzle on the inside, on purpose' },
  { id: 'toasted-hazelnut-mocha', fb: '#7d1d26', fc: '#a3323d', dark: true, st: 'First red cup', h: 'Toasted Hazelnut Mocha', p: 'Espresso, dark Davao cocoa and roasted hazelnut, in the first red cup of the season. Christmas starts in September here, so we’re on time.', hand: 'Pasko na, basically' },
  { id: 'ensaymada', fb: '#14332b', fc: '#24493d', dark: true, st: 'Pair it', h: 'Ube Ensaymada', p: 'A soft brioche coil with ube butter, sugar and grated queso, baked at 5th Ave every morning and at every store from opening. Best next to a hot Spanish Latte.', hand: 'baked this morning' }
];
$('#feats').innerHTML = FEATS.map((f, i) => { const it = byId(f.id); return `<article class="feat${f.dark ? ' dark' : ''}" style="--fb:${f.fb};--fc:${f.fc};--i:${i}">
  <div class="feat__art"><span class="sticker">${esc(f.st)}</span><img src="${art(f.id)}" alt="${esc(it.name)}" loading="lazy" width="440" height="440"></div>
  <div class="feat__copy"><h3>${esc(f.h)}</h3><p>${esc(f.p)}</p>
    <p class="feat__meta"><b>${peso(it.price)}</b><span>${it.kcal} kcal</span>${it.caf != null ? `<span>${it.caf} mg caffeine</span>` : ''}<span>+${starsFor(it.price)} ★</span></p>
    <div class="feat__cta"><button class="btn ${f.dark ? 'btn-white' : 'btn-dark'}" type="button" data-add="${f.id}">Add to order</button><button class="btn ${f.dark ? 'btn-ghost-w' : 'btn-line'}" type="button" data-view="${f.id}">See it in 3D</button></div>
    <span class="feat__hand">${esc(f.hand)}</span></div></article>`; }).join('');
document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a && !a.closest('.chat')) cart.add(a.dataset.add, { name: heroName }, a.closest('.feat, .wall a') || a);
  const v = e.target.closest('[data-view]'); if (v) { e.preventDefault(); openItem(v.dataset.view, v.closest('.feat, a')); }
});
// each card shrinks back a little as the next one slides over it
if (!reduce) $$('.feat').forEach((card, i, all) => {
  if (i === all.length - 1) return;
  scroll(animate(card, { transform: ['scale(1)', `scale(${.94 - (all.length - i) * .006})`], filter: ['brightness(1)', 'brightness(.82)'] }, { ease: 'linear' }), { target: all[i + 1], offset: ['start end', 'start start'] });
});

/* =========================================================
   BUILDER
   ========================================================= */
const BASES = [
  { id: 'latte', name: 'Caffè Latte', price: 165, kcal: 190, shots: 2, milk: true, temps: ['hot', 'iced'], foam: true, top: 'heart' },
  { id: 'macchiato', name: 'Caramel Macchiato', price: 195, kcal: 250, shots: 2, milk: true, temps: ['hot', 'iced'], drizzle: '#b0641c', foam: true, top: 'crosshatch' },
  { id: 'americano', name: 'Americano', price: 140, kcal: 15, shots: 3, milk: false, temps: ['hot', 'iced'], water: true },
  { id: 'mocha', name: 'Caffè Mocha', price: 190, kcal: 360, shots: 2, milk: true, temps: ['hot', 'iced'], cocoa: true, caf: 25, top: 'whip' },
  { id: 'coldbrew', name: 'Cold Brew', price: 170, kcal: 5, shots: 0, milk: false, temps: ['iced'], caf: 205, brew: true },
  { id: 'frappe', name: 'Frappé', price: 215, kcal: 380, shots: 1, milk: true, temps: ['blended'], caf: 15 },
  { id: 'matcha', name: 'Matcha Latte', price: 185, kcal: 200, shots: 0, milk: true, temps: ['hot', 'iced'], matcha: true, caf: 80, top: 'heart' }
];
const TEMPS = { hot: 'Hot', iced: 'Iced', blended: 'Blended' };
const B = { base: BASES[0], temp: 'hot', size: 'medio', milk: 'whole', syrup: 'none', shots: 2, name: heroName };
const chip = (g, id, label, extra = '') => `<button class="chip" type="button" data-g="${g}" data-v="${id}" aria-pressed="false">${extra}${label}</button>`;
const cupSvg = h => `<svg viewBox="0 0 24 32" style="--h:${h}px" aria-hidden="true"><path d="M4 7h16l-1.8 22a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8z" fill="currentColor" opacity=".16"/><path d="M4 7h16l-1.8 22a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8z" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="2.5" y="3.5" width="19" height="4" rx="2" fill="currentColor"/></svg>`;
$('[data-g=base]').innerHTML = BASES.map(b => chip('base', b.id, b.name)).join('');
$('[data-g=size]').innerHTML = SIZES.map((s, i) => `<button class="size" type="button" data-g="size" data-v="${s.id}" aria-pressed="false">${cupSvg(24 + i * 6)}<b>${s.name}</b><small>${s.oz}${s.add ? ` · ${s.add > 0 ? '+' : '−'}₱${Math.abs(s.add)}` : ''}</small></button>`).join('');
$('[data-g=milk]').innerHTML = MILKS.map(m => chip('milk', m.id, m.name + (m.add ? ` <small>+₱${m.add}</small>` : ''), `<i class="sw" style="background:${m.tint}"></i>`)).join('');
$('[data-g=syrup]').innerHTML = SYRUPS.map(s => chip('syrup', s.id, s.name + (s.add ? ` <small>+₱${s.add}</small>` : ''), s.tint ? `<i class="sw" style="background:${s.tint}"></i>` : '')).join('');
const hex = (a, b, t) => { const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = p(a), C = p(b); return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const pick = (arr, id) => arr.find(x => x.id === id);
function drinkColor() {
  const b = B.base, milk = pick(MILKS, B.milk), syr = pick(SYRUPS, B.syrup);
  let c = b.milk ? milk.tint : '#2a140a';
  if (b.matcha) c = hex(c, '#7da84a', .55);
  if (b.cocoa) c = hex(c, '#4a2414', .45);
  if (b.brew) c = '#24120a';
  if (b.milk) c = hex(c, '#3a1c0e', Math.min(.75, B.shots * .16));
  if (syr.tint) c = hex(c, syr.tint, .14);
  return c;
}
function spec() {
  const b = B.base, milk = pick(MILKS, B.milk), syr = pick(SYRUPS, B.syrup), c = drinkColor(), esp = hex('#3a1c0e', c, .25);
  if (B.temp === 'hot') return { kind: 'hot', open: true, liquid: [c], top: b.top || (b.water ? 'crema' : b.milk ? 'heart' : 'crema'), sleeve: true };
  if (B.temp === 'blended') return { kind: 'frappe', liquid: [hex(c, '#ffffff', .12), hex(c, '#ffffff', .25)], whip: true, drizzle: syr.tint ? hex(syr.tint, '#000000', .25) : (b.cocoa ? '#3a1a0c' : '#b0641c'), crumbs: b.cocoa ? '#2a120a' : null };
  const layers = b.milk && B.shots ? [esp, c, milk.tint] : [c];
  return { kind: 'iced', liquid: layers, ice: 6, drizzle: b.drizzle || null };
}
function price() {
  const b = B.base, s = pick(SIZES, B.size), m = pick(MILKS, B.milk), y = pick(SYRUPS, B.syrup);
  return b.price + s.add + (b.milk ? m.add : 0) + Math.max(0, B.shots - b.shots) * 30 + y.add + (B.temp === 'iced' && b.temps.length > 1 ? 10 : 0);
}
/* what's physically in the cup, bottom to top, as shares of the cup */
function layers() {
  const b = B.base, s = pick(SIZES, B.size), ml = parseInt(s.oz) * 29.6, out = [];
  const add = (k, c, v) => v > 0 && out.push({ k, c, v });
  const esp = B.shots * 30, syr = B.syrup !== 'none' ? 15 + (parseInt(s.oz) > 12 ? 7 : 0) : 0;
  if (B.temp === 'blended') { add('Ice + milk, blended', hex(drinkColor(), '#ffffff', .2), ml * .72 - esp - syr); add('Espresso', '#3a1c0e', esp); add('Syrup', pick(SYRUPS, B.syrup).tint || '#c9873c', syr); add('Whipped cream', '#fbf6ec', ml * .22); return out; }
  const ice = B.temp === 'iced' ? ml * .3 : 0;
  add('Syrup', pick(SYRUPS, B.syrup).tint || '#c9873c', syr);
  if (b.matcha) add('Matcha', '#7da84a', 45);
  if (b.cocoa) add('Cocoa sauce', '#4a2414', 30);
  if (b.brew) add('Cold brew', '#2a140a', ml - ice - syr - esp - (b.milk ? 0 : 0));
  if (b.water) add(B.temp === 'iced' ? 'Cold water' : 'Hot water', '#cfe3ea', ml * (B.temp === 'iced' ? .45 : .62) - esp);
  if (b.milk) add((B.temp === 'iced' ? 'Cold ' : 'Steamed ') + pick(MILKS, B.milk).name.toLowerCase() + ' milk', pick(MILKS, B.milk).tint, ml - ice - esp - syr - (b.matcha ? 45 : 0) - (b.cocoa ? 30 : 0) - (b.foam && B.temp === 'hot' ? ml * .1 : 0));
  if (ice) add('Ice', '#dcecf2', ice);
  add('Espresso', '#3a1c0e', esp);
  if (b.foam && B.temp === 'hot') add('Milk foam', '#f7f1e6', ml * .1);
  if (b.drizzle) add('Caramel drizzle', '#b0641c', 8);
  return out;
}
const MARKS = () => {
  const b = B.base, m = pick(MILKS, B.milk), y = pick(SYRUPS, B.syrup);
  return { DECAF: '', SHOTS: B.shots ? String(B.shots) : '', SYRUP: y.id === 'none' ? '' : y.name.slice(0, 3).toUpperCase(), MILK: b.milk ? (m.id === 'whole' ? 'W' : m.name.slice(0, 3).toUpperCase()) : '', CUSTOM: B.temp === 'blended' ? 'whip' : (b.drizzle ? 'drz' : '') };
};
let prevMarks = {};
function labelStrip() {
  const mk = MARKS(), s = pick(SIZES, B.size);
  $('#labelStrip').innerHTML = `<ul>${BOXES.map(k => `<li><span>${k}</span><em class="${mk[k] !== prevMarks[k] ? 'new' : ''}">${esc(mk[k])}</em></li>`).join('')}<li class="nm"><span>NAME</span><em>${esc(B.name || '')}</em></li></ul>
    <p class="nut"><span><b>${kcal()}</b> kcal</span><span><b>${caf()}</b> mg caffeine</span><span><b>${s.name}</b> ${s.oz}</span></p>`;
  prevMarks = mk;
}
/* calories scale with the cup (12 oz is the menu reference); shots are counted as chosen */
const ozK = () => parseInt(pick(SIZES, B.size).oz) / 12;
const kcal = () => { const b = B.base, m = pick(MILKS, B.milk), y = pick(SYRUPS, B.syrup); return Math.max(5, Math.round((b.kcal + (b.milk ? m.kcal : 0)) * ozK() + y.kcal)); };
const caf = () => Math.round((B.base.caf || 0) * ozK()) + B.shots * 75;
let bStage = null, bt;
function syncBuilder(rebuild = true) {
  const b = B.base;
  if (!b.temps.includes(B.temp)) B.temp = b.temps[0];
  if (!$('[data-g=temp] .chip')) $('[data-g=temp]').innerHTML = ['hot', 'iced', 'blended'].map(t => `<button class="chip" type="button" data-g="temp" data-v="${t}" aria-pressed="false">${TEMPS[t]}${t === 'iced' ? ' <small>+₱10</small>' : ''}</button>`).join('');
  $$('[data-g=temp] .chip').forEach(c => { const ok = b.temps.includes(c.dataset.v); c.disabled = !ok; c.setAttribute('aria-pressed', c.dataset.v === B.temp); });
  $$('#opts [data-g][data-v]').forEach(el => { const g = el.dataset.g; el.setAttribute('aria-pressed', g === 'base' ? b.id === el.dataset.v : B[g] === el.dataset.v); });
  $('#milkOpt').disabled = !b.milk; $('#milkOpt').classList.toggle('off', !b.milk);
  $('#shotN').textContent = B.shots; $$('#shotDots i').forEach((d, i) => d.classList.toggle('on', i < B.shots));
  $('#shotM').disabled = B.shots <= 0; $('#shotP').disabled = B.shots >= 4;
  const s = pick(SIZES, B.size), m = pick(MILKS, B.milk), y = pick(SYRUPS, B.syrup), p = price();
  countTo($('#bPrice'), p, v => peso(v));
  $('#bDrinkHand').textContent = { latte: 'a classic', macchiato: 'for caramel people', americano: 'bold and simple', mocha: 'the chocolate fix', coldbrew: 'smooth and strong', frappe: 'dessert in a cup', matcha: 'green and calm' }[b.id];
  $('#bSum').textContent = `${s.name} ${TEMPS[B.temp].toLowerCase()} ${b.name.toLowerCase()}${b.milk ? ', ' + m.name.toLowerCase() + ' milk' : ''}${B.shots ? `, ${B.shots} shot${B.shots === 1 ? '' : 's'}` : ''}${y.id !== 'none' ? ', ' + y.name.toLowerCase() : ''} · +${starsFor(p)} ★`;
  // cross-section
  const L = layers(), tot = L.reduce((a, l) => a + l.v, 0);
  $('#layerFill').innerHTML = L.map(l => `<i style="flex-basis:${(l.v / tot * 100).toFixed(1)}%;background:${l.c}" title="${esc(l.k)}"></i>`).join('');
  $('#layerKey').innerHTML = L.slice().reverse().map(l => `<li><i style="background:${l.c}"></i>${esc(l.k)}<span>${Math.round(l.v)} ml</span></li>`).join('');
  labelStrip();
  if (rebuild && bStage) { clearTimeout(bt); bt = setTimeout(() => bStage.show(spec(), { name: B.name, scale: s.scale, pop: false }), 80); }
}
/* numbers roll to their new value instead of jumping */
function countTo(el, to, fmt) {
  const from = +el.dataset.v || to; el.dataset.v = to;
  if (reduce || from === to) { el.textContent = fmt(to); return; }
  animate(from, to, { duration: .45, ease: EASE, onUpdate: v => { el.textContent = fmt(Math.round(v)); } });
}
$('#opts').addEventListener('click', e => {
  const c = e.target.closest('[data-g][data-v]'); if (!c || c.disabled) return;
  const g = c.dataset.g, v = c.dataset.v;
  if (g === 'base') { B.base = BASES.find(b => b.id === v); B.shots = B.base.shots; if (!B.base.milk) B.milk = 'whole'; }
  else B[g] = v;
  syncBuilder();
  bStage && bStage.present(1800);
  if ((g === 'size' || g === 'base' || g === 'temp') && bStage) bStage.spin(.5);
});
$('#shotM').addEventListener('click', () => { if (B.shots > 0) { B.shots--; syncBuilder(); } });
$('#shotP').addEventListener('click', () => { if (B.shots < 4) { B.shots++; syncBuilder(false); bStage && bStage.show(spec(), { name: B.name, scale: pick(SIZES, B.size).scale, pop: false }); } });
$('#bName').value = heroName;
let bnt; $('#bName').addEventListener('input', e => { B.name = e.target.value.trim(); store.set('name', B.name); labelStrip(); clearTimeout(bnt); bnt = setTimeout(() => bStage && bStage.write(B.name), 260); });
$('#bAdd').addEventListener('click', e => {
  const t = B.temp, b = B.base.id;
  const artId = t === 'blended' ? (B.base.cocoa ? 'mocha-frappe' : B.base.matcha ? 'matcha-cream-frappe' : 'caramel-frappe')
    : t === 'iced' ? ({ americano: 'iced-americano', coldbrew: 'cold-brew', matcha: 'iced-matcha-latte', macchiato: 'iced-caramel-macchiato' }[b] || 'iced-latte')
    : ({ mocha: 'caffe-mocha', macchiato: 'caramel-macchiato', latte: 'cafe-latte', matcha: 'cafe-latte' }[b] || 'americano');
  cart.add(artId, { price: price(), title: `${TEMPS[t]} ${B.base.name}, your way`, note: $('#bSum').textContent.split(' · ')[0], name: B.name }, $('#buildCanvas').parentElement);
  // the lid goes on, then the cup opens up again for the next one
  if (bStage && t === 'hot' && !reduce) { bStage.show({ ...spec(), open: false }, { name: B.name, scale: pick(SIZES, B.size).scale, assemble: true }); clearTimeout(bt); bt = setTimeout(() => bStage.show(spec(), { name: B.name, scale: pick(SIZES, B.size).scale, pop: false }), 2600); }
});
syncBuilder(false);

/* ---------- 3D after the intro so it never fights first paint ---------- */
introDone.then(async () => {
  try {
    const { GioStage } = await import('./gio3d.js?v=13');
    heroStage = new GioStage($('#heroCanvas'), { fit: 1.24 });
    await heroStage.show(byId(heroCur.id).v, { name: heroName, assemble: !reduce });
    inView('#buildCanvas', async () => {
      if (bStage) return;
      bStage = new GioStage($('#buildCanvas'), { fit: 1.8 });
      await bStage.show(spec(), { name: B.name, scale: pick(SIZES, B.size).scale, assemble: !reduce });
    }, { margin: '200px' });
  } catch (err) { console.warn('3D unavailable', err); $('#heroPoster').classList.add('fallback'); $('#heroPoster').removeAttribute('aria-hidden'); }
});
// the hero stage sinks and the cup tilts away as you leave the hero
if (!reduce && innerWidth >= 700) {
  scroll(animate('.hero__stage', { transform: ['translateY(0px)', 'translateY(90px)'], opacity: [1, .25] }, { ease: 'linear' }), { target: $('#hero'), offset: ['start start', 'end start'] });
  scroll(animate('.hero__copy', { transform: ['translateY(0px)', 'translateY(-40px)'], opacity: [1, 0] }, { ease: 'linear' }), { target: $('#hero'), offset: ['start start', 'end start'] });
}

/* =========================================================
   REWARDS: the star ladder fills as you slide
   ========================================================= */
$('#ladder').innerHTML = `<div class="ladder__track"><i id="ladderFill"></i></div>` + REWARDS.map(r => `<div class="rung" style="--x:${r.stars / 2}%" data-st="${r.stars}"><img src="${art(r.item, true)}" alt="" width="88" height="88" loading="lazy"><b>${r.stars}<span aria-hidden="true">${IC.star}</span><span class="sr"> stars</span></b><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p></div>`).join('');
function calc() {
  // stars are earned per order (2 per full ₱50), so a ₱190 cup earns 6
  const v = +$('#visits').value, stars = Math.round(Math.floor(190 / 50) * 2 * v * 4.3);
  $('#visitsOut').textContent = v; $('#visits').style.setProperty('--p', ((v - 1) / 13 * 100) + '%');
  countTo($('#rwStars'), stars, x => x);
  const free = stars / 100;
  $('#rwLine').textContent = free >= 1 ? `stars a month, so a free handcrafted drink about every ${Math.round(30 / free)} days` : `stars a month, so your first free drink in about ${Math.ceil(100 / stars * 30)} days`;
  // the track's dots sit at 0, 25, 50 and 75% for 25, 100, 150 and 200 stars
  const T = REWARDS.map(r => r.stars), P = [0, .25, .5, .75];
  let f = 0; for (let i = 0; i < T.length; i++) { if (stars >= T[i]) f = P[i]; else { if (i > 0) f = P[i - 1] + (stars - T[i - 1]) / (T[i] - T[i - 1]) * .25; break; } }
  if (stars >= T[T.length - 1]) f = Math.min(1, .75 + (stars - 200) / 400);
  $('#ladderFill').style.transform = `scaleX(${f})`;
  $$('.rung').forEach(t => t.classList.toggle('on', stars >= +t.dataset.st));
}
$('#visits').addEventListener('input', calc); calc();

/* =========================================================
   ROAST: one slider, continuous
   ========================================================= */
const ROASTS = [
  { at: 0, name: 'Blonde roast', col: '#b07a45', temp: 196, desc: 'Pulled early for a mellow, sweet cup with a bright finish. It makes the smoothest lattes.', taste: 'Citrus, honey, toasted grain', body: 2, acid: 4, sweet: 4, buy: 'blonde-espresso-beans' },
  { at: 50, name: 'Medium roast', col: '#6e4126', temp: 212, desc: 'Balanced and rich. Brown sugar up front, a little orange, a cocoa finish.', taste: 'Brown sugar, orange, cocoa', body: 3, acid: 3, sweet: 3, buy: 'benguet-beans' },
  { at: 100, name: 'Dark roast', col: '#2e1a10', temp: 226, desc: 'Roasted long for smoky, chocolatey depth and a heavy body. Made for espresso and milk.', taste: 'Dark chocolate, smoke, molasses', body: 5, acid: 1, sweet: 2, buy: 'sagada-dark' }
];
function roast(v) {
  const k = v / 100, a = k <= .5 ? ROASTS[0] : ROASTS[1], b = k <= .5 ? ROASTS[1] : ROASTS[2], t = k <= .5 ? k * 2 : (k - .5) * 2;
  const near = ROASTS.reduce((m, r) => Math.abs(r.at - v) < Math.abs(m.at - v) ? r : m);
  $('.bean-fill').setAttribute('fill', hex(a.col, b.col, t));
  $('#beanOil').setAttribute('opacity', (.05 + k * k * .55).toFixed(2));
  $('#beanG').setAttribute('transform', `rotate(${-40 + k * 30} 100 100)`);
  $('#roastTemp').textContent = Math.round(a.temp + (b.temp - a.temp) * t) + ' °C';
  $('#roastIn').style.setProperty('--p', v + '%'); $('#roastIn').setAttribute('aria-valuetext', near.name);
  const dots = n => [1, 2, 3, 4, 5].map(d => `<i class="${d <= n ? 'on' : ''}"></i>`).join('');
  const lerpN = key => Math.round(a[key] + (b[key] - a[key]) * t);
  $('#roastNotes').innerHTML = `<div><dt>Body</dt><dd>${dots(lerpN('body'))}</dd></div><div><dt>Acidity</dt><dd>${dots(lerpN('acid'))}</dd></div><div><dt>Sweetness</dt><dd>${dots(lerpN('sweet'))}</dd></div><div class="wide"><dt>Tastes like</dt><dd>${near.taste}</dd></div>`;
  if ($('#roastName').textContent !== near.name) {
    $('#roastName').textContent = near.name; $('#roastDesc').textContent = near.desc;
    const it = byId(near.buy); $('#roastBuy').textContent = `Get ${it.name.replace(' 250 g', '')} · ${peso(it.price)}`; $('#roastBuy').dataset.item = near.buy;
    if (!reduce) animate('#roastName', { opacity: [0, 1], transform: ['translateY(6px)', 'none'] }, { duration: .3, ease: EASE });
  }
}
$('#roastIn').addEventListener('input', e => roast(+e.target.value));
$('#roastBuy').addEventListener('click', e => openItem(e.currentTarget.dataset.item, $('#bean')));
roast(50);

/* ---------- ORIGINS: green coffee routes to the Taguig roastery ---------- */
const ORIGINS = [
  { id: 'benguet', c: 'Philippines', n: 'Benguet', km: 210, alt: '1,400–1,700 m', proc: 'Washed', notes: 'Brown sugar, orange, cocoa', farm: 'Smallholder farms around Atok, bought through a growers’ cooperative', item: 'benguet-beans', lab: 'below' },
  { id: 'sagada', c: 'Philippines', n: 'Sagada', km: 290, alt: '1,400–1,600 m', proc: 'Natural', notes: 'Dark cherry, cacao, smoke', farm: 'Mountain Province family farms; our dark roast', item: 'sagada-dark', lab: 'above' },
  { id: 'sumatra', c: 'Indonesia', n: 'Sumatra', km: 2900, alt: '1,200–1,500 m', proc: 'Wet-hulled', notes: 'Earth, cedar, molasses', farm: 'Gayo highlands, Aceh, in our dark espresso blend', lab: 'above' },
  { id: 'yirgacheffe', c: 'Ethiopia', n: 'Yirgacheffe', km: 9700, alt: '1,900–2,200 m', proc: 'Washed', notes: 'Jasmine, lemon, bergamot', farm: 'Washing stations in Gedeo; our pour-over at the Reserve', lab: 'above' },
  { id: 'huila', c: 'Colombia', n: 'Huila', km: 17800, alt: '1,600–1,900 m', proc: 'Washed', notes: 'Caramel, red apple, panela', farm: 'Small farms near Pitalito; in the Blonde blend', item: 'blonde-espresso-beans', lab: 'above' }
];
const MX = 940, MY = 232, xOf = km => MX - Math.sqrt(km / 17800) * 860;
$('#routeSvg').innerHTML = `<line x1="40" y1="${MY}" x2="${MX}" y2="${MY}" class="rt-base"/>` + ORIGINS.map(o => {
  const x = xOf(o.km), h = 40 + Math.sqrt(o.km / 17800) * 170;
  return `<path class="rt" id="rt-${o.id}" data-o="${o.id}" d="M${x.toFixed(1)} ${MY} Q ${((x + MX) / 2).toFixed(1)} ${(MY - h * 2).toFixed(1)} ${MX} ${MY}" pathLength="1"/>`;
}).join('') + `<circle cx="${MX}" cy="${MY}" r="9" class="rt-home"/>` + ORIGINS.map(o => `<circle class="rt-bean" id="bean-${o.id}" r="5"/>`).join('');
$('#routePts').innerHTML = ORIGINS.map(o => `<button type="button" class="rpt ${o.lab}" data-o="${o.id}" style="left:${(xOf(o.km) / 10).toFixed(2)}%;top:${(MY / 3).toFixed(2)}%" aria-pressed="false"><i></i><span><b>${o.n}</b>${o.km.toLocaleString('en-PH')} km</span></button>`).join('')
  + `<span class="rpt home" style="left:${MX / 10}%;top:${MY / 3}%"><i></i><span><b>Taguig roastery</b>BGC, Manila</span></span>`;
function origin(id) {
  const o = ORIGINS.find(x => x.id === id);
  $$('.rpt[data-o]').forEach(b => b.setAttribute('aria-pressed', b.dataset.o === id));
  $$('.rt').forEach(p => p.classList.toggle('hl', p.dataset.o === id));
  $('#originCard').innerHTML = `<div><p class="oc-c">${o.c}</p><h4>${o.n}</h4><p>${esc(o.farm)}.</p></div>
    <dl><div><dt>Altitude</dt><dd>${o.alt}</dd></div><div><dt>Process</dt><dd>${o.proc}</dd></div><div><dt>Tastes like</dt><dd>${o.notes}</dd></div><div><dt>To our roaster</dt><dd>${o.km.toLocaleString('en-PH')} km</dd></div></dl>
    ${o.item ? `<button class="btn btn-sm btn-dark" type="button" data-view="${o.item}">Shop these beans</button>` : '<span class="oc-blend">In our blends</span>'}`;
}
$('#routePts').addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b) origin(b.dataset.o); });
origin('benguet');
// on phones the diagram scrolls sideways: start at the Manila end, where the nearest farms are
const rts = $('#routes'); if (rts.scrollWidth > rts.clientWidth) rts.scrollLeft = rts.scrollWidth;
// routes draw in, longer routes take longer; then a bean travels each one
let beansOn = false;
inView('#routes', () => {
  $$('.rt').forEach((p, i) => { p.style.transitionDuration = (.7 + i * .25) + 's'; p.classList.add('drawn'); });
  beansOn = true; if (!reduce) requestAnimationFrame(beanLoop);
  return () => { beansOn = false; };
}, { amount: .4 });
function beanLoop(t) {
  if (!beansOn) return;
  ORIGINS.forEach((o, i) => {
    const p = $('#rt-' + o.id), len = p.getTotalLength(), dur = 3 + i * 1.4, k = ((t / 1000 + i * .7) % dur) / dur;
    const pt = p.getPointAtLength(len * k), c = $('#bean-' + o.id);
    c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.style.opacity = Math.sin(k * Math.PI).toFixed(2);
  });
  requestAnimationFrame(beanLoop);
}

/* =========================================================
   ORDER AHEAD: the phone walks through an order
   ========================================================= */
const hr = new Date().getHours();
// times in the phone follow the clock: ready in 6 minutes, slots either side
const tf = m => new Date(Date.now() + m * 60000).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
$$('.t-ready').forEach(e => e.textContent = tf(6)); $('.t-a').textContent = tf(0); $('.t-b').textContent = tf(14);
$('.scr__hi').firstChild.textContent = (hr < 12 ? 'Good morning,' : hr < 18 ? 'Good afternoon,' : 'Good evening,');
$('#phRows').innerHTML = [['iced-spanish-latte', 'Medio · oat milk', 195 + 35], ['butter-croissant', 'Warmed', 115], ['cold-brew', 'Grande', 170 + 25]].map(([id, n, p]) => `<div class="row"><img src="${art(id, true)}" alt="" width="44" height="44"><span>${esc(byId(id).name)}<small>${n}</small></span><b>${peso(p)}</b></div>`).join('');
let step = 0, stepT, makeT;
const STEP_MS = 4600;
function setStep(i, auto = false) {
  step = i;
  $$('.step').forEach(s => { const on = +s.dataset.step === i; s.setAttribute('aria-selected', on); s.classList.toggle('auto', on && auto && !reduce); });
  $$('.scr').forEach(s => s.classList.toggle('on', +s.dataset.scr === i));
  clearInterval(makeT);
  const ph = $('#phone');
  ph.classList.toggle('making-on', i === 2);
  if (i === 2) {
    const msgs = ['Mika is pulling your shots', 'Pouring the oat milk over ice', `Writing ${heroName || 'Giovanni'} on the cup`, 'On the pick-up shelf'];
    let s = 360; $('#makeEta').textContent = '6:00'; $('#makeT').textContent = msgs[0];
    makeT = setInterval(() => { s = Math.max(0, s - 24); $('#makeEta').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; $('#makeT').textContent = msgs[Math.min(3, Math.floor((360 - s) / 96))]; if (!s) clearInterval(makeT); }, 250);
  }
}
const runSteps = () => { clearInterval(stepT); if (reduce) return; setStep(step, true); stepT = setInterval(() => setStep((step + 1) % 3, true), STEP_MS); };
$('#steps').addEventListener('click', e => { const s = e.target.closest('.step'); if (s) { clearInterval(stepT); setStep(+s.dataset.step); } });
$('#steps').addEventListener('keydown', e => { if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return; e.preventDefault(); clearInterval(stepT); const i = (step + (e.key === 'ArrowDown' ? 1 : 2)) % 3; setStep(i); $(`.step[data-step="${i}"]`).focus(); });
inView('#phone', () => { runSteps(); return () => clearInterval(stepT); }, { amount: .5 });
setStep(0);

/* =========================================================
   GIFT CARDS
   ========================================================= */
const DESIGNS = [
  { b: 'linear-gradient(135deg,#0e6b4e,#14332b)', hand: '#f0d39a', pat: 'beans', name: 'House green' },
  { b: 'linear-gradient(135deg,#c8622b,#7a2e12)', hand: '#ffe2bd', pat: 'leaves', name: 'Kalabasa' },
  { b: 'linear-gradient(135deg,#9b7bc4,#4d3577)', hand: '#f3e6ff', pat: 'stars', name: 'Ube night' },
  { b: 'linear-gradient(135deg,#d6b26e,#9a7230)', hand: '#14332b', pat: 'cups', name: 'Gold', ink: '#14332b' }
];
const PAT = {
  beans: Array.from({ length: 18 }, (_, i) => `<ellipse cx="${(i % 6) * 36 + 14}" cy="${Math.floor(i / 6) * 44 + 18}" rx="8" ry="12" transform="rotate(${30 + i * 13} ${(i % 6) * 36 + 14} ${Math.floor(i / 6) * 44 + 18})" fill="#fff"/>`).join(''),
  leaves: Array.from({ length: 14 }, (_, i) => `<path d="M${(i % 7) * 30 + 10} ${Math.floor(i / 7) * 60 + 30}q12-22 24 0q-12 22-24 0z" fill="#fff" transform="rotate(${i * 25} ${(i % 7) * 30 + 22} ${Math.floor(i / 7) * 60 + 30})"/>`).join(''),
  stars: Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 47) % 200}" cy="${(i * 29) % 126}" r="${.8 + (i % 3) * .7}" fill="#fff"/>`).join(''),
  cups: Array.from({ length: 10 }, (_, i) => `<path d="M${(i % 5) * 42 + 8} ${Math.floor(i / 5) * 62 + 20}h22l-3 26h-16z" fill="#fff"/>`).join('')
};
const G = { d: 0, amt: 500 };
$('#gcDesigns').innerHTML = DESIGNS.map((d, i) => `<button type="button" style="--b:${d.b}" data-gd="${i}" aria-pressed="${i === 0}" aria-label="${d.name} design"></button>`).join('');
$('#gcAmts').innerHTML = [300, 500, 1000, 2000, 5000].map(a => `<button class="chip" type="button" data-amt="${a}" aria-pressed="${a === 500}">${peso(a)}</button>`).join('');
$('#gcMark').innerHTML = MARK;
$('#gcBars').innerHTML = Array.from({ length: 46 }, (_, i) => `<rect x="${i * 2.6}" y="0" width="${1 + (i * 7 % 3) * .6}" height="30" fill="#14332b"/>`).join('');
function gift() {
  const d = DESIGNS[G.d], c = $('#gcard');
  c.style.setProperty('--gc', d.b); c.style.setProperty('--gc-hand', d.hand); c.style.color = d.ink || '#fff'; $('#gcPat').innerHTML = PAT[d.pat];
  $('#gcAmt').textContent = peso(G.amt);
  const to = $('#gcToIn').value.trim(), msg = $('#gcMsgIn').value.trim() || "Coffee's on me!";
  $('#gcTo').textContent = 'For ' + (to || 'you'); $('#gcMsg').textContent = msg; $('#gcBackMsg').textContent = msg; $('#gcFrom').textContent = 'from ' + (heroName || 'a friend');
}
const flip = $('#gflip');
flip.addEventListener('click', () => flip.classList.toggle('flipped'));
$('#gcDesigns').addEventListener('click', e => { const b = e.target.closest('[data-gd]'); if (!b) return; G.d = +b.dataset.gd; $$('[data-gd]').forEach(x => x.setAttribute('aria-pressed', x === b)); flip.classList.remove('flipped'); gift(); });
$('#gcAmts').addEventListener('click', e => { const b = e.target.closest('[data-amt]'); if (!b) return; G.amt = +b.dataset.amt; $$('[data-amt]').forEach(x => x.setAttribute('aria-pressed', x === b)); gift(); if (!reduce) animate('#gcAmt', { transform: ['scale(1.12)', 'scale(1)'] }, { duration: .3, ease: EASE }); });
['#gcToIn', '#gcMsgIn'].forEach(s => $(s).addEventListener('input', gift));
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
$('#gcForm').addEventListener('submit', e => {
  e.preventDefault(); const em = $('#gcEmail'), err = $('#gcErr');
  if (!okEmail(em.value.trim())) { err.textContent = 'Add their email so the card has somewhere to go, like name@email.com.'; em.setAttribute('aria-invalid', 'true'); em.focus(); return; }
  err.textContent = ''; em.removeAttribute('aria-invalid');
  toast(`${peso(G.amt)} gift card sent to ${$('#gcToIn').value.trim() || em.value.trim()} (demo)`);
  e.target.reset(); gift();
});
if (matchMedia('(hover: hover) and (pointer: fine)').matches) tilt(flip, 8, (x, y) => { $('#gcard').style.setProperty('--gx', x * 100 + '%'); $('#gcard').style.setProperty('--gy', y * 100 + '%'); });
gift();

/* =========================================================
   STORES
   ========================================================= */
$('#homeMap').innerHTML = MAP_SVG + pinsHTML();
$('#homeStores').innerHTML = STORES.map(s => { const [o, t] = openNow(s); return `<button class="store" type="button" data-store="${s.id}" aria-pressed="false"><span class="ic">${MARK}</span><span><b>${esc(s.name)}</b><small>${esc(s.addr)}</small></span><span class="open-badge${o ? '' : ' closed'}">${t}</span></button>`; }).join('');
const pickStore = (id, save) => { $$('#homeMap [data-store], #homeStores [data-store]').forEach(b => b.setAttribute('aria-pressed', b.dataset.store === id)); if (save) { store.set('store', id); toast(`Pick-up store set to ${STORES.find(s => s.id === id).short}`); } };
document.addEventListener('click', e => { const b = e.target.closest('[data-store]'); if (b && b.closest('#homeMap, #homeStores')) pickStore(b.dataset.store, true); });
pickStore(pickupStore().id);

/* =========================================================
   REVIEWS on cup sleeves (drag to scroll, with momentum)
   ========================================================= */
const REV = [
  ['Andrea M.', 'Reserve · 5th Ave', 'Andreya', 'They asked my name, wrote “Andreya” and I have never felt more seen. Best iced Spanish latte in the city.', 'iced-spanish-latte'],
  ['Paolo R.', 'Legazpi Village', 'Paulo', 'Order-ahead is scary fast. I walked from Ayala and it was already on the shelf, still cold, my name facing out.', 'cold-brew'],
  ['Hana K.', 'Rockwell', 'Hana ♡', 'The ube ensaymada with a flat white is my whole Saturday. The baristas remember my order.', 'ensaymada'],
  ['Marco D.', 'Uptown', 'Marco', 'Open 24 hours, good Wi-Fi, outlets everywhere. The cold brew got me through deadline week.', 'cold-brew'],
  ['Bea L.', 'Legazpi Village', 'Bea!!', 'The quiet room is a gem. GioStars got me a free drink in my first month.', 'ube-latte'],
  ['Josh T.', 'Reserve · 5th Ave', 'Josh', 'Pumpkin cream cold brew is back and so am I. The drive-thru saved me on a rainy Monday.', 'pumpkin-cream-cold-brew']
];
const rv = $('#reviews');
rv.innerHTML = `<div class="sleeves__row">${REV.map(([n, a, cup, t, id], i) => `<figure class="sleeve" style="--r:${[-1.5, 1, -.5, 1.5, -1, .5][i]}deg"><span class="sleeve__paper" aria-hidden="true"></span><span class="sleeve__stamp" aria-hidden="true">${MARK}</span><span class="sleeve__name" aria-hidden="true">${esc(cup)}</span><blockquote>“${esc(t)}”</blockquote><figcaption><img src="${art(id, true)}" alt="" width="44" height="44"><span><b>${esc(n)}</b>${esc(a)}</span><span class="sleeve__stars" role="img" aria-label="5 out of 5 stars">★★★★★</span></figcaption></figure>`).join('')}</div>`;
const by = d => rv.scrollBy({ left: d * Math.min(420, rv.clientWidth * .8), behavior: reduce ? 'auto' : 'smooth' });
$('#revL').addEventListener('click', () => by(-1)); $('#revR').addEventListener('click', () => by(1));
(() => { // pointer drag with momentum (mouse only; touch scrolls natively)
  let down = false, x0 = 0, s0 = 0, v = 0, lx = 0, lt = 0, raf;
  rv.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; x0 = lx = e.clientX; s0 = rv.scrollLeft; lt = performance.now(); v = 0; cancelAnimationFrame(raf); rv.setPointerCapture(e.pointerId); rv.classList.add('drag'); });
  rv.addEventListener('pointermove', e => { if (!down) return; const now = performance.now(); v = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now; rv.scrollLeft = s0 - (e.clientX - x0); });
  const up = () => { if (!down) return; down = false; rv.classList.remove('drag'); let vel = v * 16; const glide = () => { if (Math.abs(vel) < .5) return; rv.scrollLeft -= vel; vel *= .93; raf = requestAnimationFrame(glide); }; if (!reduce) glide(); };
  rv.addEventListener('pointerup', up); rv.addEventListener('pointercancel', up);
})();

const SHELF = [['Andrea', 'iced-spanish-latte', 2], ['Rafa', 'java-chip-frappe', 3], ['Bea', 'ube-latte', 4], ['Hana', 'spanish-latte', 6], ['Ced', 'maple-oat-latte', 7], ['Marco', 'cold-brew', 9], ['Tin', 'caramel-macchiato', 11]];
$('#wall').innerHTML = SHELF.map(([n, id, m], i) => `<button type="button" class="cupslot" data-tilt style="--i:${i}" data-view="${id}" aria-label="${esc(byId(id).name)} for ${n}, ready ${m} minutes ago"><img src="${art(id)}" alt="" loading="lazy" width="200" height="200"><span class="cupslot__tag"><b>${n}</b>${esc(byId(id).name)}</span><small>${m} min ago</small></button>`).join('');
inView('#wall', () => { $('#wall').classList.add('in'); }, { amount: .3 });

$('#newsForm').addEventListener('submit', e => {
  e.preventDefault(); const em = $('#newsEmail'), err = $('#newsErr');
  if (!okEmail(em.value.trim())) { err.textContent = 'That email looks incomplete. Try name@email.com.'; em.setAttribute('aria-invalid', 'true'); em.focus(); return; }
  err.textContent = ''; em.removeAttribute('aria-invalid'); toast('You’re in. First email lands in two weeks (demo).'); e.target.reset();
});
