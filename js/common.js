/* =========================================================
   GioCoffee · shared: header, footer, cart, toasts, reveal,
   intro and "Gio", the barista chat. Every page imports this.
   Orders, sign-up and newsletter are demo only.
   ========================================================= */
import { ITEMS, CATS, byId, art, peso, STORES, SIZES, MILKS, LEVELS, isDrink, milkChoice, defaultNote } from './data.js?v=15';
/* stars per ₱50 follow the member's level; orders earn per full ₱50 */
export const lineStars = l => l.reward ? 0 : Math.floor(l.price / 50) * l.q * starRate();
export const starsFor = price => Math.floor(price / 50) * starRate();
export const starRate = () => { const y = store.get('yearStars', 0); return (LEVELS.slice().reverse().find(l => y >= l.from) || LEVELS[0]).rate; };
let fee = 0;
import { hoursFor, hoursText, openNow } from './map.js?v=15';
import { si } from './icons.js?v=15';

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const MARK = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#0E6B4E"/><circle cx="32" cy="32" r="27" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M38.2 10.6a7 7 0 1 0 1.9 7.6H34" fill="none" stroke="#C9A15B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="25" width="26" height="4.6" rx="2.3" fill="#fff"/><path d="M21 31h22l-2.6 18.4a3 3 0 0 1-3 2.6H26.6a3 3 0 0 1-3-2.6z" fill="#fff"/><path d="M22.1 36.4h19.8l-.9 6.6H23z" fill="#C9A15B"/><circle cx="32" cy="39.7" r="2.1" fill="#fff"/></svg>`;
export const IC = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1.4 12H7.4z"/><path d="M5 5.5h14V8H5z"/><path d="M7.6 12h8.8"/></svg>',
};

/* ---------- storage (try/catch: private windows) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('gio:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('gio:' + k, JSON.stringify(v)); } catch (e) { } }
};
export { store };

/* ---------- header / footer ---------- */
const PAGES = [['menu.html', 'Menu'], ['rewards.html', 'Rewards'], ['index.html#gifts', 'Gift cards'], ['stores.html', 'Stores']];
function megaPanel() {
  const feat = byId('pumpkin-cream-cold-brew');
  const pop = ['iced-spanish-latte', 'caramel-macchiato', 'java-chip-frappe', 'ensaymada'];
  return `<div class="mega" id="mega" role="region" aria-label="Menu preview"><div class="wrap mega__in">
    <div class="mega__cats">${CATS.map(c => { const n = ITEMS.filter(i => i.cat === c.id).length, first = ITEMS.find(i => i.cat === c.id); return `<a href="menu.html#${c.id}"><img src="${art(first.id, true)}" alt="" width="44" height="44" loading="lazy"><span>${esc(c.name)}</span><small>${n}</small></a>`; }).join('')}</div>
    <div class="mega__pop"><p class="mega__h">Ordered most this week</p>${pop.map(id => { const it = byId(id); return `<a href="menu.html#${it.cat}" data-open-item="${id}"><img src="${art(id, true)}" alt="" width="56" height="56" loading="lazy"><span>${esc(it.name)}<small>${peso(it.price)}</small></span></a>`; }).join('')}</div>
    <a class="mega__feat" href="menu.html#seasonal" style="--fb:${feat.bg}"><img src="${art(feat.id)}" alt="" width="180" height="180" loading="lazy"><span><small>Back for the ‑ber months</small><b>${esc(feat.name)}</b><i>Order it ahead</i></span></a>
  </div></div>`;
}
/* the header's member corner: sign in / join, or your stars once you're in */
function memberHTML(mobile) {
  const st = store.get('stars', 0), nm = esc(store.get('name', '') || 'Member');
  if (store.get('member', false)) return mobile ? `<a class="btn btn-gold" style="--i:4" href="rewards.html">${IC.star} ${st} ★ · ${nm}</a>`
    : `<a class="btn btn-gold btn-sm" href="rewards.html" aria-label="Your GioStars: ${st} stars">${IC.star}<span>${st} ★ · ${nm}</span></a>`;
  return mobile ? `<a href="rewards.html#signin" style="--i:4">Sign in</a><a class="btn btn-dark" style="--i:5" href="rewards.html#join">Join GioStars</a>`
    : `<a class="btn btn-line btn-sm" href="rewards.html#signin" data-signin>Sign in</a> <a class="btn btn-dark btn-sm" href="rewards.html#join">Join now</a>`;
}
export function refreshMember() { const a = $('#hdrMember'), b = $('#mnavMember'); if (a) a.innerHTML = memberHTML(); if (b) b.innerHTML = memberHTML(true); }
function header(page) {
  const h = document.createElement('header'); h.className = 'hdr'; h.id = 'hdr';
  h.innerHTML = `<div class="wrap">
    <a class="logo" href="index.html" aria-label="GioCoffee home">${MARK}<b>Gio<span>Coffee</span></b></a>
    <nav class="nav" aria-label="Main">${PAGES.map(([u, t], i) => `<a href="${u}"${u === page ? ' aria-current="page"' : ''}${i === 0 ? ' data-mega aria-expanded="false" aria-controls="mega"' : ''}>${t}${i === 0 ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' : ''}</a>`).join('')}</nav>
    <div class="hdr-right">
      <a class="find" href="stores.html" aria-label="Find a store">${IC.pin}<span>Find a store</span></a>
      <span class="hdr-member" id="hdrMember">${memberHTML()}</span>
      <button class="cart-btn" id="cartBtn" type="button" aria-label="Your order, 0 items">${IC.bag}<span class="n" id="cartN" aria-hidden="true">0</span></button>
      <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i><i></i></button>
    </div></div>${megaPanel()}`;
  const m = document.createElement('nav'); m.className = 'mnav'; m.id = 'mnav'; m.setAttribute('aria-label', 'Mobile');
  m.innerHTML = PAGES.map(([u, t], i) => `<a href="${u}" style="--i:${i}">${t}</a>`).join('') + `<span class="mnav__member" id="mnavMember">${memberHTML(true)}</span>`;
  const bar = document.createElement('div'); bar.className = 'progress'; bar.id = 'progress'; bar.setAttribute('aria-hidden', 'true');
  const skip = $('.skip'); if (skip) skip.after(bar, h, m); else document.body.prepend(bar, h, m);
  const bur = $('#burger');
  const setM = o => { m.classList.toggle('open', o); bur.setAttribute('aria-expanded', o); bur.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.body.style.overflow = o ? 'hidden' : ''; $$('main, .ftr, .skip, .chat-fab, .chat').forEach(el => el.inert = o); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) { setM(false); bur.focus(); } });
  bur.addEventListener('click', () => setM(!m.classList.contains('open')));
  m.addEventListener('click', e => { if (e.target.closest('a')) setM(false); });
  // mega panel: opens on hover intent or focus, closes on leave / Escape
  const trig = $('[data-mega]', h), mega = $('#mega', h); let mt;
  const setMega = o => { clearTimeout(mt); mt = setTimeout(() => { h.classList.toggle('mega-on', o); trig.setAttribute('aria-expanded', o); }, o ? 90 : 160); };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    trig.addEventListener('pointerenter', () => setMega(true));
    trig.addEventListener('pointerleave', () => setMega(false));
    mega.addEventListener('pointerenter', () => setMega(true));
    mega.addEventListener('pointerleave', () => setMega(false));
  }
  // keyboard: ArrowDown opens the panel and moves into it; Tab simply carries on along the nav
  const inMega = el => el && (el === trig || mega.contains(el));
  [trig, mega].forEach(el => el.addEventListener('focusout', e => { if (!inMega(e.relatedTarget)) setMega(false); }));
  const megaLinks = () => $$('a, button', mega).filter(x => x.offsetParent);
  trig.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { const f = megaLinks()[0]; if (f) { e.preventDefault(); clearTimeout(mt); h.classList.add('mega-on'); trig.setAttribute('aria-expanded', 'true'); f.focus(); } }
  });
  mega.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return; const L = megaLinks(), i = L.indexOf(document.activeElement);
    if (e.shiftKey && i === 0) { e.preventDefault(); trig.focus(); }
    else if (!e.shiftKey && i === L.length - 1) { e.preventDefault(); setMega(false); (trig.nextElementSibling || $('.find', h)).focus(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && h.classList.contains('mega-on')) { const back = mega.contains(document.activeElement); clearTimeout(mt); h.classList.remove('mega-on'); trig.setAttribute('aria-expanded', 'false'); if (back) trig.focus(); } });
  mega.addEventListener('click', e => { const a = e.target.closest('[data-open-item]'); if (a && page === 'menu.html') { e.preventDefault(); setMega(false); openItem(a.dataset.openItem, a.querySelector('img')); } });
  // hide on scroll down, show on scroll up; progress bar
  let ly = scrollY, tk = false;
  addEventListener('scroll', () => {
    if (tk) return; tk = true;
    requestAnimationFrame(() => {
      const y = scrollY; h.classList.toggle('hide', y > 240 && y > ly && !m.classList.contains('open') && !h.classList.contains('mega-on')); h.classList.toggle('scrolled', y > 8); ly = y; tk = false;
      const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    });
  }, { passive: true });
}
function footer() {
  const f = document.createElement('footer'); f.className = 'ftr';
  f.innerHTML = `<div class="wrap">
  <div class="ftr__app">
    <div><b>Order ahead in the GioCoffee app</b><span>Your usual in two taps, your name already on the cup. Pay with stars, cards or GCash.</span></div>
    <div class="ftr__badges"><a class="badge" href="#" aria-label="Download on the App Store">${si('appstore')}<span><small>Download on the</small>App Store</span></a><a class="badge" href="#" aria-label="Get it on Google Play">${si('googleplay')}<span><small>Get it on</small>Google Play</span></a></div>
  </div>
  <div class="ftr__grid">
    <div><a class="logo" href="index.html">${MARK}<b>Gio<span>Coffee</span></b></a>
      <p class="ftr__about">Handcrafted coffee from the Philippine highlands and three farms abroad, roasted in Taguig. Brewed for you, by name.</p>
      <div class="ftr__social"><a href="#" aria-label="Instagram">${si('instagram')}</a><a href="#" aria-label="Facebook">${si('facebook')}</a><a href="#" aria-label="TikTok">${si('tiktok')}</a><a href="#" aria-label="YouTube">${si('youtube')}</a><a href="#" aria-label="In-store playlist on Spotify">${si('spotify')}</a></div></div>
    <div><h2 class="ftr__h">Menu</h2><ul><li><a href="menu.html#seasonal">‑ber months</a></li><li><a href="menu.html#hot">Hot coffee</a></li><li><a href="menu.html#cold">Cold coffee</a></li><li><a href="menu.html#frappe">Frappés</a></li><li><a href="menu.html#food">Bakery</a></li><li><a href="menu.html#merch">Beans &amp; merch</a></li></ul></div>
    <div><h2 class="ftr__h">GioStars</h2><ul><li><a href="rewards.html">How it works</a></li><li><a href="rewards.html#levels">Levels</a></li><li><a href="index.html#gifts">Gift cards</a></li><li><a href="rewards.html#faq">Rewards FAQ</a></li></ul></div>
    <div><h2 class="ftr__h">Stores</h2><ul>${STORES.map(s => `<li><a href="stores.html#${s.id}">${esc(s.name.replace('GioCoffee ', ''))}</a></li>`).join('')}</ul></div>
    <div><h2 class="ftr__h">Our coffee</h2><ul><li><a href="index.html#roast">Roasts &amp; origins</a></li><li><a href="index.html#origins">The farms we buy from</a></li><li><a href="brand/">Brand kit</a></li></ul></div>
  </div>
  <div class="ftr__pay"><span>We accept</span>${['visa', 'mastercard', 'applepay', 'googlepay'].map(n => si(n)).join('')}<span class="txt">GCash</span><span class="txt">Maya</span><span class="sep"></span><span>Delivery by</span>${si('grab')}${si('foodpanda')}</div>
  <div class="ftr__bottom"><span>© 2026 GioCoffee · Bonifacio Global City, Taguig</span><span>Concept site: names, reviews and prices are samples. Design &amp; build by <a href="https://hellogiovanni07-commits.github.io/portfolio/">Hello Giovanni</a></span></div></div>`;
  document.body.append(f);
}

/* ---------- toast ---------- */
let toastWrap;
export function toast(text, img) {
  if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toasts'; toastWrap.setAttribute('role', 'status'); document.body.append(toastWrap); }
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = (img ? `<img src="${img}" alt="">` : '') + `<span>${esc(text)}</span>`;
  toastWrap.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
}

/* ---------- cart ---------- */
export const cart = {
  lines: store.get('cart', []),
  save() { store.set('cart', this.lines); this.render(); },
  add(id, opts = {}, from = null) {
    const it = byId(id); if (!it) return;
    const drink = isDrink(it), name = drink ? (opts.name || '') : '';
    const title = opts.title || it.name, note = opts.note || defaultNote(it);
    const price = opts.price ?? it.price, reward = !!opts.reward, cost = opts.cost || 0;
    const key = [id, title, note, name, price].join('|');
    const ex = this.lines.find(l => l.key === key);
    if (ex) ex.q += opts.q || 1; else this.lines.push({ key, id, title, q: opts.q || 1, price, note, name, reward, cost });
    store.set('cart', this.lines);
    const done = () => { this.render(); const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); };
    if (from && !reduce) flyToBag(from, art(id, true), done); else done();
    toast(`${title} added${name ? ' for ' + name : ''}`, art(id, true));
  },
  count() { return this.lines.reduce((a, l) => a + l.q, 0); },
  total() { return this.lines.reduce((a, l) => a + l.q * l.price, 0); },
  render(keepList = false) {
    const n = $('#cartN'); if (!n) return;
    const c = this.count(); n.textContent = c; n.classList.toggle('on', c > 0); $('#cartBtn').setAttribute('aria-label', `Your order, ${c} item${c === 1 ? '' : 's'}`);
    const list = $('#cartList'); if (!list || keepList || $('#drawer')?.classList.contains('done')) return;
    list.innerHTML = this.lines.length ? this.lines.map((l, i) => {
      return `<div class="line"><img src="${art(l.id, true)}" alt="" loading="lazy"><div><h3>${esc(l.title || byId(l.id).name)}</h3><small>${esc(l.note)}${l.name ? ' · for <b style="font-family:var(--hand);font-size:17px;color:var(--green)">' + esc(l.name) + '</b>' : ''}</small>
        <div class="q">${l.reward ? `<button type="button" data-q="${i}" data-d="-1" aria-label="Remove this reward and get the stars back">−</button><span>${l.q}</span>` : `<button type="button" data-q="${i}" data-d="-1" aria-label="One less">−</button><span>${l.q}</span><button type="button" data-q="${i}" data-d="1" aria-label="One more">+</button>`}</div></div><b>${peso(l.q * l.price)}</b></div>`;
    }).join('') : `<div class="empty"><img src="${art('iced-spanish-latte')}" alt=""><p><b>Your order is empty</b><br>Pick a drink and we'll write your name on it.</p><a class="btn btn-sm mt-s" href="menu.html">See the menu</a></div>`;
    const t = this.total();
    $('#cartTot').textContent = peso(t + (t ? fee : 0));
    $('#cartStars').textContent = this.lines.reduce((a, l) => a + lineStars(l), 0);
    $('#checkout').disabled = !this.lines.length;
  }
};
/* the product image arcs from where you tapped into the bag */
function flyToBag(from, src, done) {
  const a = (from.querySelector && from.querySelector('img')) || from, r = a.getBoundingClientRect(), bag = $('#cartBtn');
  if ($('#hdr').classList.contains('hide')) $('#hdr').classList.remove('hide');
  const t = bag.getBoundingClientRect(), s = Math.min(96, Math.max(48, r.width));
  const img = document.createElement('img'); img.src = src; img.alt = ''; img.className = 'fly';
  img.style.cssText = `left:${r.left + r.width / 2 - s / 2}px;top:${r.top + r.height / 2 - s / 2}px;width:${s}px;height:${s}px`;
  document.body.append(img);
  const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
  const an = img.animate([
    { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * .5}px,${Math.min(dy, 0) - 90}px) scale(.8) rotate(-12deg)`, opacity: 1, offset: .45 },
    { transform: `translate(${dx}px,${dy}px) scale(.22) rotate(8deg)`, opacity: .4 }
  ], { duration: 720, easing: 'cubic-bezier(.5,0,.3,1)' });
  an.onfinish = () => { img.remove(); done(); };
}
/* lock page scroll without the page jumping sideways */
function lockScroll(on) { const d = document.documentElement; if (on) d.style.setProperty('--sbw', (innerWidth - d.clientWidth) + 'px'); d.classList.toggle('locked', on); }
/* everything outside an open sheet goes inert, so focus and screen readers stay inside */
function inertAll(on, keep) {
  ['.skip', 'main', '.hdr', '.mnav', '.ftr', '.chat-fab', '.chat'].forEach(sel => $$(sel).forEach(el => { if (el !== keep && !el.contains(keep)) el.inert = on; }));
}
export const pickupStore = () => STORES.find(s => s.id === store.get('store', 'bgc')) || STORES[0];
function whenText(mode) {
  const st = pickupStore(), [o, t] = openNow(st);
  if (!o) return `${st.short} is closed right now (${t.toLowerCase()}). ${mode === 'Delivery' ? 'Delivery starts when it opens, ₱49 delivery fee.' : mode === 'Drive-thru' ? 'The drive-thru window opens with the store.' : 'Your order will be ready when it opens.'}`;
  if (mode === 'Delivery') return `Delivered from ${st.short} by Grab or foodpanda in about 30 minutes, ₱49 delivery fee.`;
  if (mode === 'Drive-thru' && st.id === 'bgc') return 'Drive-thru at 5th Ave: it will be at the window in about 6 minutes.';
  return `Ready in about ${st.wait} minutes at ${st.short}.`;
}
function drawer() {
  const s = document.createElement('div'); s.className = 'scrim'; s.id = 'scrim';
  const d = document.createElement('aside'); d.className = 'drawer'; d.id = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'drawerT'); d.inert = true;
  d.innerHTML = `<div class="drawer__h"><h2 id="drawerT">Your order</h2><button class="x" type="button" id="cartX" aria-label="Close your order">${IC.x}</button></div>
    <div class="drawer__list" id="cartList"></div>
    <div class="drawer__f" id="drawerF">
      <div class="pickup" role="group" aria-label="How do you want it"><button type="button" aria-pressed="true">Pick up</button><button type="button" aria-pressed="false">Drive-thru</button><button type="button" aria-pressed="false">Delivery</button></div>
      <div class="tot"><span>Total</span><span id="cartTot">₱0</span></div>
      <p class="when"><span id="cartWhen">${whenText('Pick up')}</span> You'll earn <b class="stars-earn"><span id="cartStars">0</span> ★</b>.</p>
      <button class="btn btn-lg btn-block" type="button" id="checkout">Place order</button>
    </div>`;
  document.body.append(s, d);
  let opener = null, mode = 'Pick up';
  const open = o => {
    if (o) opener = document.activeElement;
    d.classList.toggle('on', o); s.classList.toggle('on', o); d.inert = !o; inertAll(o, d);
    lockScroll(o);
    if (o) { cart.render(); $('#cartWhen').textContent = whenText(mode); setTimeout(() => $('#cartX').focus(), 60); }
    else { d.classList.remove('done'); if (opener && opener.focus) opener.focus(); }
  };
  const setMode = m => { mode = m; fee = mode === 'Delivery' ? 49 : 0; $$('.pickup button', d).forEach(x => x.setAttribute('aria-pressed', x.textContent === m)); $('#cartWhen').textContent = whenText(mode); };
  $('#cartBtn').addEventListener('click', () => { const dt = $$('.pickup button', d)[1]; dt.disabled = pickupStore().id !== 'bgc'; dt.title = dt.disabled ? 'Drive-thru is only at the 5th Ave Reserve' : ''; if (dt.disabled && mode === 'Drive-thru') setMode('Pick up'); open(true); });
  $('#cartX').addEventListener('click', () => open(false));
  s.addEventListener('click', () => { if (d.classList.contains('on')) open(false); closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (d.classList.contains('on')) open(false); closeModal(); } });
  d.addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (b) { const i = +b.dataset.q, dd = b.dataset.d, l = cart.lines[i]; if (l.reward && +dd > 0) return; l.q += +dd; const gone = l.q < 1; if (gone) { cart.lines.splice(i, 1); if (l.reward && l.cost) { store.set('stars', store.get('stars', 0) + l.cost); refreshMember(); dispatchEvent(new Event('gio:stars')); toast(`${l.cost} ★ back on your card`); } } cart.save(); (gone ? $('#cartX') : $(`[data-q="${i}"][data-d="${dd}"]`, d))?.focus(); }
    const p = e.target.closest('.pickup button'); if (p && !p.disabled) { setMode(p.textContent); cart.render(); }
    if (e.target.closest('#doneBtn')) open(false);
  });
  $('#checkout').addEventListener('click', () => {
    if (mode === 'Drive-thru' && pickupStore().id !== 'bgc') setMode('Pick up');
    const stars = cart.lines.reduce((a, l) => a + lineStars(l), 0), first = cart.lines.find(l => isDrink(byId(l.id))) || cart.lines[0], name = (cart.lines.find(l => l.name) || {}).name || store.get('name', '');
    const st = pickupStore(), [isOpen, hrs] = openNow(st), at = new Date(Date.now() + (mode === 'Delivery' ? 30 : st.wait) * 60000);
    const when = !isOpen ? `when ${esc(st.short)} opens (${esc(hrs.replace(/^Opens /, '').toLowerCase())})` : `at about <b>${at.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</b>`;
    const member = store.get('member', false);
    if (member) { store.set('stars', store.get('stars', 0) + stars); store.set('yearStars', store.get('yearStars', 0) + stars); refreshMember(); dispatchEvent(new Event('gio:stars')); }
    const no = 400 + Math.floor(Math.random() * 500);
    $('#cartList').innerHTML = `<div class="done-card">
      <div class="done-card__cup"><img src="${art(first.id)}" alt="" width="220" height="220">${isDrink(byId(first.id)) ? `<span class="done-card__name">${esc(name || 'your cup')}</span>` : ''}</div>
      <p class="done-card__no">Order #0${no}</p>
      <h3>${mode === 'Delivery' ? (isOpen ? 'On its way' : 'Booked for opening') : `See you at ${esc(st.short).replace(' · ', '\u00a0·\u00a0')}`}${name ? ', ' + esc(name) : ''}.</h3>
      <p>${mode === 'Delivery' ? `Your rider picks it up from ${esc(st.short)}` : mode === 'Drive-thru' ? 'It will be at the drive-thru window' : 'It will be on the pick-up shelf, name facing out,'} ${when}.</p>
      <p class="done-card__stars">${member ? `+${stars} ★ added to your GioStars` : `<a href="rewards.html#join">Join GioStars</a> to keep the ${stars} ★ from orders like this`}</p>
      <button class="btn btn-lg btn-block" type="button" id="doneBtn">Done</button>
      <small class="demo">Demo order: nothing was charged or sent.</small></div>`;
    d.classList.add('done'); cart.lines = []; store.set('cart', []); cart.render(true);
    $('#doneBtn').focus();
  });
  cart.render();
}

/* ---------- item modal (used by menu + home) ---------- */
let modal, modalStage = null;
let modalOpener = null;
export function closeModal() {
  if (!modal || !modal.classList.contains('on')) return;
  modal.classList.remove('on'); $('#scrim').classList.remove('on'); modal.inert = true; if (modalStage) modalStage.pause(); inertAll(false, modal); lockScroll(false);
  if (modalOpener && modalOpener.focus) modalOpener.focus();
}
export async function openItem(id, fromEl = null) {
  const it = byId(id); if (!it) return;
  if (!modal) {
    modal = document.createElement('div'); modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'mTitle');
    modal.innerHTML = `<div class="modal__box"><div class="modal__art"><img alt=""><canvas aria-label="3D view, drag to spin"></canvas></div><div class="modal__body"></div></div>`;
    document.body.append(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modal.addEventListener('keydown', e => { // keep Tab inside the dialog
      if (e.key !== 'Tab') return;
      const f = $$('button:not([disabled]), input, a[href]', modal).filter(x => x.offsetParent); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }
  const drink = isDrink(it), milky = milkChoice(it);
  let size = 'medio', milk = it.milk || 'whole', name = store.get('name', '');
  modalOpener = document.activeElement;
  const body = $('.modal__body', modal), img = $('.modal__art img', modal), cv = $('.modal__art canvas', modal);
  $('.modal__art', modal).style.setProperty('--mb', it.bg ? it.bg + '33' : 'var(--mint-2)');
  img.src = art(id); img.style.opacity = 1;
  const milkAdd = id => MILKS.find(m => m.id === id).add;
  const price = () => it.price + (drink ? SIZES.find(s => s.id === size).add : 0) + (milky ? Math.max(0, milkAdd(milk) - milkAdd(it.milk || 'whole')) : 0);
  const note = () => drink ? `${SIZES.find(s => s.id === size).name}${milky ? ' · ' + MILKS.find(m => m.id === milk).name.toLowerCase() + ' milk' : ''}` : '';
  body.innerHTML = `<button class="x" type="button" aria-label="Close">${IC.x}</button>
    ${it.tag ? `<span class="pill gold" style="align-self:flex-start">${esc(it.tag)}</span>` : ''}
    <h2 id="mTitle">${esc(it.name)}</h2><p style="color:var(--muted)">${esc(it.desc)}</p>
    <div class="nutri">${it.kcal ? `<span><b>${it.kcal}</b>kcal</span>` : ''}${it.caf != null ? `<span><b>${it.caf} mg</b>caffeine</span>` : ''}<span><b id="mStars">+${starsFor(it.price)} ★</b>GioStars</span></div>
    ${drink ? `<fieldset class="mopt"><legend>Size</legend><div class="chips" id="mSize">${SIZES.map(s => `<button class="chip" type="button" data-s="${s.id}" aria-pressed="${s.id === size}">${s.name} <small>${s.oz}</small></button>`).join('')}</div></fieldset>
    ${milky ? `<fieldset class="mopt"><legend>Milk</legend><div class="chips" id="mMilk">${MILKS.map(m => `<button class="chip" type="button" data-m="${m.id}" aria-pressed="${m.id === milk}"><i class="sw" style="background:${m.tint}"></i>${m.name}${milkAdd(m.id) - milkAdd(it.milk || 'whole') > 0 ? ` <small>+₱${milkAdd(m.id) - milkAdd(it.milk || 'whole')}</small>` : ''}</button>`).join('')}</div></fieldset>` : ''}
    <label class="mopt"><span class="legend">Name on the cup</span><input class="field-name" id="mName" maxlength="12" placeholder="Your name" value="${esc(name)}" autocomplete="given-name"></label>` : ''}
    <div class="builder__total" style="margin-top:auto"><div><b id="mPrice">${peso(price())}</b><small>${drink ? 'Hand-written name, free' : it.cat === 'food' ? 'Baked at 5th Ave this morning' : 'Ready to take home'}</small></div><button class="btn" type="button" id="mAdd">${IC.plus} Add to order</button></div>`;
  modal.inert = false; modal.classList.add('on'); $('#scrim').classList.add('on'); inertAll(true, modal); lockScroll(true);
  // shared-element continuity: the picture travels from the card into the popup
  const src = fromEl && (fromEl.tagName === 'IMG' ? fromEl : fromEl.querySelector('img'));
  if (src && !reduce) {
    const a = src.getBoundingClientRect(), bx = img.getBoundingClientRect();
    if (a.width && bx.width) {
      const sc = Math.min(bx.width / a.width, bx.height / a.height) * .78;
      const dx = (a.left + a.width / 2) - (bx.left + bx.width / 2), dy = (a.top + a.height / 2) - (bx.top + bx.height / 2);
      img.animate([{ transform: `translate(${dx}px,${dy}px) scale(${1 / sc * .78})` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  }
  $('.x', body).addEventListener('click', closeModal); $('.x', body).focus();
  const sz = $('#mSize', body);
  const sc = () => SIZES.find(s => s.id === size).scale;
  if (sz) sz.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; size = b.dataset.s; $$('[data-s]', sz).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#mPrice').textContent = peso(price()); $('#mStars').textContent = `+${starsFor(price())} ★`; if (modalStage) modalStage.show(it.v, { name, scale: sc(), pop: false }); });
  const mm = $('#mMilk', body);
  if (mm) mm.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; milk = b.dataset.m; $$('[data-m]', mm).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#mPrice').textContent = peso(price()); $('#mStars').textContent = `+${starsFor(price())} ★`; });
  const nm = $('#mName', body); let wt;
  if (nm) nm.addEventListener('input', () => { name = nm.value.trim(); store.set('name', name); clearTimeout(wt); wt = setTimeout(() => modalStage && modalStage.write(name), 300); });
  $('#mAdd').addEventListener('click', e => { cart.add(id, { price: price(), note: note(), name: drink ? name : '' }, img); closeModal(); });
  // live 3D replaces the still once loaded
  try {
    const { GioStage } = await import('./gio3d.js?v=15');
    if (!modalStage) modalStage = new GioStage(cv, { fit: 1.3 });
    modalStage.resume(); await modalStage.show(it.v, { name, assemble: !reduce });
    img.style.opacity = 0;
  } catch (e) { /* keep the image */ }
}

/* ---------- reveal + small motion ---------- */
export function reveal(root = document) {
  const els = $$('.rv, .split-line', root);
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(e => io.observe(e));
}
function btnGlow() {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
}
export function tilt(el, max = 10, onMove) {
  if (reduce) return;
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(x - .5) * max * 2}deg) rotateX(${(.5 - y) * max * 2}deg)`;
    onMove && onMove(x, y);
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

/* ---------- 3D tilt + pointer parallax (mouse/trackpad only) ---------- */
function depth() {
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let cur = null, raf = 0, ev = null;
  const apply = () => {
    raf = 0; if (!cur || !ev) return;
    const r = cur.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    const max = +(cur.dataset.tilt || 7);
    cur.style.setProperty('--ry', ((x - .5) * max * 2).toFixed(2) + 'deg'); cur.style.setProperty('--rx', ((.5 - y) * max * 2).toFixed(2) + 'deg');
    cur.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); cur.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  };
  const leave = el => { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tilt]'); if (t !== cur) { if (cur) leave(cur); cur = t; if (cur) cur.classList.add('tilting'); } }, { passive: true });
  document.addEventListener('pointermove', e => {
    ev = e; if (cur && !cur.contains(e.target)) { leave(cur); cur = null; }
    if (!raf) raf = requestAnimationFrame(apply);
    // parallax layers in the first screen drift against the pointer
    // (not while a button is held: dragging the storefront or a cup should not shake the scene around it)
    const hero = !e.buttons && e.target.closest && e.target.closest('.hero, .page-hero, .rw-hero');
    if (hero) { const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      $$('[data-depth]', hero).forEach(el => { const d = +el.dataset.depth; el.style.translate = `${(dx * d).toFixed(1)}px ${(dy * d).toFixed(1)}px`; }); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (cur) leave(cur); cur = null; });
}

/* ---------- intro (first visit per session) ---------- */
function intro() {
  const seen = (() => { try { return sessionStorage.getItem('gio:intro'); } catch (e) { return 1; } })();
  if (seen || reduce) { document.body.classList.remove('is-loading'); return Promise.resolve(); }
  try { sessionStorage.setItem('gio:intro', 1); } catch (e) { }
  const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('aria-hidden', 'true');
  // background: rows of hand-written names drifting (the names baristas write on cups), ripples, a crema glow, beans
  const NAMES = ['Andrea', 'Paolo', 'Hana', 'Bea', 'Marco', 'Josh', 'Tin', 'Gio', 'Mika', 'Carlo', 'Lia', 'Rafa', 'Nina', 'Jun'];
  const row = k => { const n = NAMES.slice(k * 3 % NAMES.length).concat(NAMES).slice(0, 9).join(' · '); return `<div class="intro__row" style="--k:${k}"><span>${n} · ${n} ·&nbsp;</span><span>${n} · ${n} ·&nbsp;</span></div>`; };
  const bg = `<div class="intro__bg"><i class="intro__beans"></i><div class="intro__names">${[0, 1, 2, 3, 4, 5, 6].map(row).join('')}</div><i class="intro__glow"></i><i class="intro__ring"></i><i class="intro__ring"></i><i class="intro__ring"></i><i class="intro__vig"></i></div>`;
  el.innerHTML = bg + `<div class="intro__mid"><div class="intro__cup"><svg viewBox="0 0 120 150">
      <g class="intro__steam" fill="none" stroke="#c9a15b" stroke-width="4" stroke-linecap="round"><path d="M45 34c-8-8 8-14 0-24"/><path d="M60 30c-8-8 8-14 0-24"/><path d="M75 34c-8-8 8-14 0-24"/></g>
      <defs><clipPath id="icup"><path d="M22 52h76l-8 86a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7z"/></clipPath></defs>
      <path d="M22 52h76l-8 86a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7z" fill="#fbf8f2"/>
      <g clip-path="url(#icup)"><rect class="intro__fill" x="0" y="52" width="120" height="100" fill="#c69a6c"/></g>
      <rect x="16" y="42" width="88" height="13" rx="6.5" fill="#fff"/>
      <path d="M26 84h68l-2.4 26H28.6z" fill="#c9a15b"/><circle cx="60" cy="97" r="7" fill="#0e6b4e"/>
    </svg></div><div class="intro__word"><span>Gio</span><span>Coffee</span></div><span class="intro__hand">brewed for you, by name</span></div>`;
  document.body.append(el);
  return new Promise(res => setTimeout(() => { el.classList.add('done'); document.body.classList.remove('is-loading'); res(); setTimeout(() => el.remove(), 1200); }, 1350));
}

/* ======================================================
   "Gio", the barista chat: knows the menu, stores, rewards.
   Typo tolerant (bigrams), can add drinks to the order.
   ====================================================== */
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const bi = s => { const a = new Set(); const t = ' ' + s + ' '; for (let i = 0; i < t.length - 1; i++) a.add(t.slice(i, i + 2)); return a; };
const sim = (a, b) => { const A = bi(a), B = bi(b); let n = 0; A.forEach(x => B.has(x) && n++); return 2 * n / (A.size + B.size || 1); };
const STOP = new Set(['the', 'and', 'for', 'with', 'please', 'pls', 'some', 'more', 'cup', 'cups', 'drink', 'drinks', 'one', 'two', 'three', 'want', 'have', 'get', 'can', 'a', 'an', 'of', 'me', 'my', 'po']);
const wordHit = (w, nm) => nm.includes(w) || nm.split(' ').some(x => sim(w, x) > .62 || sim(w.replace(/s$/, ''), x) > .7);
function scoreItems(q) {
  const t = norm(q), words = t.split(' ').filter(w => w.length > 2 && !STOP.has(w));
  return ITEMS.map(it => {
    const nm = norm(it.name); let s = sim(t, nm), all = words.length > 0;
    words.forEach(w => { if (nm.includes(w)) s += .35; else if (wordHit(w, nm)) s += .25; else all = false; });
    return { it, s, all };
  }).filter(x => x.s > .5).sort((a, b) => b.s - a.s);
}
const NUM = { a: 1, an: 1, one: 1, isang: 1, two: 2, dalawang: 2, three: 3, tatlong: 3 };
/* "add 2 cold brews" → { q: 2, it }. Only when every word names the same drink; otherwise no add. */
function parseAdd(t) {
  const m = t.match(/^(?:add|order|i ll have|i ll take|give me|can i (?:get|have)|i want|pa ?order) (?:(\d+|a|an|one|two|three|isang|dalawang|tatlong) )?(.+)$/); if (!m) return null;
  const [best, next] = scoreItems(m[2]);
  if (!best || !best.all || best.s < .9 || (next && next.all && next.s > best.s - .1)) return null;
  return { it: best.it, q: Math.min(9, +(m[1] && (NUM[m[1]] || m[1])) || 1) };
}
const INTENTS = [
  [/\bdecaf\w*\b/, () => ({ text: 'No decaf espresso yet, sorry. These have no coffee at all:', items: ['ube-latte', 'strawberry-cream-frappe', 'mango-graham-frappe'] })],
  [/\b(no coffee|caffeine ?free|for kids|without coffee|walang kape)\b/, () => ({ text: 'No coffee at all in these:', items: ['ube-latte', 'strawberry-cream-frappe', 'mango-graham-frappe'] })],
  [/\b(not (too |so )?sweet|less sweet|unsweet\w*|no sugar|walang asukal|hindi matamis)\b/, () => ({ text: 'Iced and not too sweet:', items: ['cold-brew', 'iced-americano', 'iced-matcha-latte'] })],
  [/\b(iced|cold)\b.*\bsweet\b|\bsweet\b.*\b(iced|cold)\b/, () => ({ text: 'Iced and on the sweet side:', items: ['iced-spanish-latte', 'iced-caramel-macchiato', 'ube-latte'] })],
  [/\b(deliver\w*|delivery|grab|foodpanda|rider)\b/, () => `Yes. Pick Delivery in your order and Grab or foodpanda brings it in about 30 minutes, for a ₱49 fee.`],
  [/\b(pets?|dogs?|cats?|outdoor|outside|al fresco|garden|view)\b/, () => `Rockwell is pet friendly with outdoor seats; Uptown and the 5th Ave Reserve also have seats outside, the Reserve's under the acacias. <a href="stores.html">See the stores</a>.`],
  [/\b(gift ?cards?|gifts?|present|regalo)\b/, () => `You can send a GioCoffee gift card from ₱300 to ₱5,000 with a message. <a href="index.html#gifts">Design one here</a>.`],
  [/\b(gcash|maya|cards?|visa|mastercard|pay|payment|cash|apple pay|google pay)\b/, () => `We take cash, Visa, Mastercard, Apple Pay, Google Pay, GCash and Maya, in store and in the app.`],
  [/\b(vegan|oat|almond|soy|dairy|lactose)\b/, () => `Any milk drink can be made with oat, almond or soy (+₱30–35). The <b>Muscovado Oat Latte</b> comes with oat milk already.`],
  [/\b(hours?|open|close|closing|bukas|sarado)\b/, () => `Today: ${STORES.map(s => `<b>${esc(s.short)}</b> ${hoursText(hoursFor(s)).replace('Open 24 hours', 'open 24 hours')}`).join(' · ')}. <a href="stores.html">See the map</a>.`],
  [/\b(where|locations?|stores?|address|near|branch\w*|saan)\b/, () => `Four stores: two in BGC (5th Ave Reserve with a drive-thru, and Uptown, open 24 hours) and two in Makati (Legazpi Village and Rockwell). <a href="stores.html">Open the store finder</a>.`],
  [/\b(gio ?stars?|stars?|rewards?|points?|loyal\w*|members?)\b/, () => `GioStars: <b>2 ★ for every ₱50</b> (3 ★ at Gold, 4 ★ at Reserve). 25 ★ = an extra shot or a size upgrade, 100 ★ = any handcrafted drink, 150 ★ = a pastry and a drink, 200 ★ = beans or a mug. <a href="rewards.html">Join, it's free</a>.`],
  [/\b(re?c+o?m+e?n+d\w*|suggest\w*|best|popular|what should|bestsellers?|favou?rites?)\b/, () => ({ text: 'Most ordered this week:', items: ['iced-spanish-latte', 'caramel-macchiato', 'java-chip-frappe'] })],
  [/\b(seasonal|season|ber|christmas|pasko|new|pumpkin|kalabasa|maple)\b/, () => ({ text: 'The ‑ber months menu, here till December:', items: ['maple-oat-latte', 'pumpkin-cream-cold-brew', 'salted-caramel-frappe', 'toasted-hazelnut-mocha'] })],
  [/\b(cheap|budget|price|prices|how much|magkano)\b/, () => ({ text: 'Drinks start at ₱120 for a piccolo. Good-value picks:', items: ['americano', 'iced-americano', 'calamansi-refresher'] })],
  [/\b(wi ?fi|internet|work|study|laptop|socket|outlet)\b/, () => `Every store has free Wi-Fi. Legazpi Village has a quiet room, and Uptown is open 24 hours for late study sessions.`],
  [/\b(name|spell|write)\b/, () => `Yes, your barista writes your name on every cup. Type it in the hero or the drink builder and watch it go on the 3D cup.`],
  [/\b(order|cart|checkout|buy|bag)\b/, () => `Tap the bag at the top right to see your order. Pick-up at ${pickupStore().short} is ready in about ${pickupStore().wait} minutes.`],
  [/^(hi|hello|hey|kumusta|good (morning|afternoon|evening)|yo)\b/, () => `Hi! I'm Gio. Ask me for a drink, today's hours or how GioStars work.`],
  [/\b(thanks?|thank you|salamat|ty)\b/, () => `Anytime! Enjoy your coffee.`]
];
function chat() {
  const fab = document.createElement('button'); fab.className = 'chat-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Chat with Gio, our barista');
  fab.innerHTML = `${MARK}<span class="bub" aria-hidden="true">ask Gio, our barista</span>`;
  setTimeout(() => fab.classList.add('seen'), 5000);
  const box = document.createElement('section'); box.className = 'chat'; box.setAttribute('aria-label', 'Chat with Gio');
  box.innerHTML = `<div class="chat__h"><span class="av">${MARK}</span><div><b>Gio</b><small>Barista bot · replies instantly</small></div><button class="x" type="button" aria-label="Close chat">${IC.x}</button></div>
    <div class="chat__log" id="chatLog" aria-live="polite"></div>
    <div class="chat__quick">${['Recommend a drink', '‑ber months menu', 'Hours today', 'How do stars work?', 'No coffee please'].map(q => `<button type="button">${q}</button>`).join('')}</div>
    <form class="chat__f"><input id="chatIn" placeholder="Ask about drinks, stores, stars…" autocomplete="off" aria-label="Message"><button type="submit" aria-label="Send">${IC.send}</button></form>`;
  document.body.append(fab, box);
  const log = $('#chatLog', box);
  const say = (html, who = 'bot', items) => {
    const m = document.createElement('div'); m.className = 'msg ' + who; m.innerHTML = html;
    if (items) m.innerHTML += `<div class="cards">${items.map(id => { const it = byId(id); return `<div class="mini"><img src="${art(id, true)}" alt=""><span>${esc(it.name)}<br><small style="color:var(--muted)">${peso(it.price)}</small></span><button type="button" data-add="${id}">Add</button></div>`; }).join('')}</div>`;
    log.append(m); log.scrollTop = log.scrollHeight;
  };
  const reply = q => {
    say(esc(q), 'me');
    const ty = document.createElement('div'); ty.className = 'msg bot typing'; ty.innerHTML = '<i></i><i></i><i></i>'; log.append(ty); log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      ty.remove();
      const t = norm(q), add = parseAdd(t), sc = scoreItems(q), found = sc.map(x => x.it);
      if (add) { cart.add(add.it.id, { q: add.q, name: store.get('name', '') }); say(`Done! ${add.q === 1 ? 'One' : add.q} <b>${esc(add.q === 1 || /s$/.test(add.it.name) ? add.it.name : add.it.name + 's')}</b> ${add.q === 1 ? 'is' : 'are'} in your order.`); return; }
      const ps = /\b(how much|price|magkano)\b/.test(t) && scoreItems(t.replace(/\b(how much|price of|price|magkano|is|are|the|a|an|ang|ba|for)\b/g, ' '))[0];
      if (ps && ps.all) { const it = ps.it; say(`A ${isDrink(it) ? 'medio ' : ''}<b>${esc(it.name)}</b> is ${peso(it.price)}.`, 'bot', [it.id]); return; }
      for (const [re, fn] of INTENTS) if (re.test(t)) { const r = fn(); if (typeof r === 'string') say(r); else say(r.text, 'bot', r.items); return; }
      if (found.length) { say(found.length > 1 ? 'Is it one of these?' : 'Here you go:', 'bot', found.slice(0, 3).map(i => i.id)); return; }
      say(`I'm not sure about that one. I can help with drinks, food, stores, hours and GioStars. Try “something iced and sweet” or “add a flat white”.`);
    }, 650 + Math.random() * 400);
  };
  let first = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'false'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'gioChat'); box.id = 'gioChat';
  const toggle = o => { box.classList.toggle('on', o); fab.classList.add('seen'); fab.setAttribute('aria-expanded', o); if (o) { $('#chatIn').focus(); if (first) { first = false; say(`Hi, I'm <b>Gio</b>. What can I make for you today?`); } } else fab.focus(); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('on')) toggle(false); });
  fab.addEventListener('click', () => toggle(!box.classList.contains('on')));
  $('.x', box).addEventListener('click', () => toggle(false));
  $('form', box).addEventListener('submit', e => { e.preventDefault(); const v = $('#chatIn').value.trim(); if (v) { reply(v); $('#chatIn').value = ''; } });
  box.addEventListener('click', e => {
    const q = e.target.closest('.chat__quick button'); if (q) reply(q.textContent);
    const a = e.target.closest('[data-add]'); if (a) { cart.add(a.dataset.add, { name: store.get('name', '') }); a.textContent = 'Added ✓'; a.disabled = true; }
  });
}

/* ---------- boot ---------- */
export async function boot(page) {
  header(page); footer(); drawer(); chat(); btnGlow(); depth();
  if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toasts'; toastWrap.setAttribute('role', 'status'); document.body.append(toastWrap); }
  if ($('main > .hero, main > .page-hero, main > .rw-hero')) document.body.classList.add('dark-top');
  const done = intro();
  // the first screen never waits on a scroll observer
  const top = $('.hero, .page-hero, .rw-hero, main > section:first-child');
  done.then(() => requestAnimationFrame(() => top && $$('.rv, .split-line', top).forEach(e => e.classList.add('in'))));
  reveal();
  return done;
}
