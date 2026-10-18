/* GioCold brand kit (the GioCoffee cold bar): mark builder, live "your details", artwork, downloads, demos.
   Same engine as ../brand.js, own artwork. Classic script so it also opens straight from the folder (file://). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let uid = 0;

  // ---------- your details ----------
  // [key, label, default, isPlaceholder, input type]
  const FIELDS = [
    ['name', 'Cold line name', 'GioCold'],
    ['parent', 'Parent brand', 'GioCoffee'],
    ['tagline', 'Tagline', 'Steeped slow. Served by name.'],
    ['steep', 'Steep time (hours)', '20'],
    ['promo', 'Weekly cold moment', 'Nitro Fridays: +25★ on any nitro'],
    ['custName', 'Name on the sample cups', 'Bea'],
    ['batch', 'Sample batch number', '118'],
    ['flagship', 'Flagship cold bar', 'GioCoffee Reserve, 5th Ave BGC'],
    ['store2', 'Second nitro bar', 'Uptown, 9th Ave BGC'],
    ['hours', 'Cold bar hours', 'Cold bar 7 AM - 10 PM daily', 1],
    ['bottle', 'Bottle price, 330 ml', '190', 1],
    ['growler', 'Growler refill price, 1 L', '480', 1],
    ['phone', 'Phone', '+63 2 8000 0000', 1, 'tel'],
    ['web', 'Website', 'www.giocoffee.example/cold', 1, 'url'],
    ['ig', 'Instagram', '@giocoffee.ph', 1],
    ['owner', 'Cold bar lead', 'Your Name', 1],
    ['role', 'Job title', 'Cold Bar Lead', 1],
    ['est', 'Year launched', '2026', 1],
    ['cur', 'Currency symbol', '₱'],
  ];
  const DEF = Object.fromEntries(FIELDS.map((f) => [f[0], f[2]]));
  const PH = new Set(FIELDS.filter((f) => f[3]).map((f) => f[0]));
  const LABEL = Object.fromEntries(FIELDS.map((f) => [f[0], f[1]]));
  const KEY = 'gio-cold-details';
  const D = { ...DEF };
  try { Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private mode: defaults only */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } };
  const raw = (k) => String(D[k] ?? '').trim() || DEF[k];
  const words = () => {
    const n = raw('name');
    if (/\s/.test(n)) { const p = n.split(/\s+/); return [p[0], p.slice(1).join(' ')]; }
    const m = n.match(/^(.+?[a-z])([A-Z].*)$/);
    return m ? [m[1], m[2]] : [n, ''];
  };
  const val = (k) => raw(k);
  const isPH = (k) => PH.has(k) && raw(k) === DEF[k];
  const nameUp = () => raw('name').toUpperCase();
  const hrs = () => Math.max(1, Math.min(24, parseInt(raw('steep'), 10) || 20));
  const tag = () => val('tagline').replace(/[.!]$/, '');
  // these keys feed prices and artwork everywhere, so they redraw the whole kit
  const GLOBAL_KEYS = new Set(['steep', 'bottle', 'growler', 'cur', 'batch', 'tagline', 'parent']);

  // ---------- colours ----------
  const C = { night: '#14332B', green: '#0E6B4E', deep: '#0A4D38', frost: '#D7EBE2', glass: '#F4F7F5', foam: '#EFE4D2', steep: '#2B1A12', cascade: '#B9824C', gold: '#C9A15B', goldInk: '#8A6A2E', ice: '#B7D3CD', ink: '#161B1A', muted: '#56635F', brew: '#8A5530', white: '#FFFFFF' };
  const FT = 'Plus Jakarta Sans, Arial, sans-serif', FB = 'Inter, Arial, sans-serif', FH = 'Caveat, Segoe Print, cursive';

  // ---------- the mark: Night Green badge, a dotted condensation ring, a clear iced cup, and a gold straw that bends into a G ----------
  // d disc, r ring, c cup, s straw, b brew, f foam, i ice + label
  const MARK = {
    color: { d: C.night, r: C.frost, c: '#fff', s: C.gold, b: C.brew, f: C.foam, i: '#fff' },
    night: { d: C.green, r: '#fff', c: '#fff', s: C.gold, b: C.brew, f: C.foam, i: '#fff' },
    frost: { d: C.frost, r: C.night, c: C.night, s: C.goldInk, b: C.steep, f: C.foam, i: '#fff' },
    mono: { d: C.night, r: '#fff', c: '#fff', s: '#fff', b: C.night, f: '#fff', i: '#fff' },
    white: { d: '#fff', r: C.night, c: C.night, s: C.night, b: '#fff', f: C.night, i: C.night },
    etch: { d: '#dfe6e1', r: C.night, c: C.night, s: C.night, b: '#dfe6e1', f: C.night, i: C.night },
  };
  const markInner = (v = 'color') => {
    const m = MARK[v] || MARK.color;
    return `<circle cx="32" cy="32" r="31" fill="${m.d}"/>
      <circle class="drops" cx="32" cy="32" r="27" fill="none" stroke="${m.r}" stroke-width="1.9" stroke-linecap="round" stroke-dasharray="0.01 3.42"/>
      <path d="M21.5 27.5H42.5L39.8 50.2a2.6 2.6 0 0 1-2.6 2.3H26.8a2.6 2.6 0 0 1-2.6-2.3Z" fill="${m.c}" fill-opacity=".16"/>
      <path d="M21.9 31H42.1L41.7 34.5H22.3Z" fill="${m.f}"/>
      <path d="M22.3 34.5H41.7L39.65 50a2.4 2.4 0 0 1-2.4 2.1H26.75a2.4 2.4 0 0 1-2.4-2.1Z" fill="${m.b}"/>
      <rect class="cube" x="25" y="36.6" width="5.6" height="5.6" rx="1.3" transform="rotate(-12 27.8 39.4)" fill="${m.i}" fill-opacity=".5"/>
      <rect class="cube" x="33.4" y="37.8" width="5.4" height="5.4" rx="1.3" transform="rotate(10 36.1 40.5)" fill="${m.i}" fill-opacity=".5"/>
      <path class="straw" pathLength="1" d="M29.2 46L34.2 18.2H40.1A7 7 0 1 1 38.2 10.6" fill="none" stroke="${m.s}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="20" y="24.2" width="24" height="3.6" rx="1.8" fill="${m.c}"/>
      <path d="M21.5 27.5H42.5L39.8 50.2a2.6 2.6 0 0 1-2.6 2.3H26.8a2.6 2.6 0 0 1-2.6-2.3Z" fill="none" stroke="${m.c}" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="27" y="45" width="10" height="3.6" rx="1.8" fill="${m.i}"/>`;
  };
  const markSVG = (v = 'color', cls = 'lg-mark') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${markInner(v)}</svg>`;
  const markAt = (x, y, s, v) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 64 64">${markInner(v)}</svg>`;
  // which mark goes with which surface: on Night Green the badge turns Gio Green so it still reads
  const LV = { color: 'color', green: 'color', night: 'night', house: 'night', steep: 'color', frost: 'color' };
  // the parent's mark, unchanged, for side-by-side comparisons only
  const PARENT_MARK = `<svg class="lg-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="31" fill="#0E6B4E"/><circle cx="32" cy="32" r="27" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M38.2 10.6a7 7 0 1 0 1.9 7.6H34" fill="none" stroke="#C9A15B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="25" width="26" height="4.6" rx="2.3" fill="#fff"/><path d="M21 31h22l-2.6 18.4a3 3 0 0 1-3 2.6H26.6a3 3 0 0 1-3-2.6z" fill="#fff"/><path d="M22.1 36.4h19.8l-.9 6.6H23z" fill="#C9A15B"/><circle cx="32" cy="39.7" r="2.1" fill="#fff"/></svg>`;
  const lockup = (kind, v = 'color') => {
    if (kind === 'parent') { const p = raw('parent'), m = p.match(/^(.+?[a-z])([A-Z].*)$/) || [p, p, '']; return `<span class="lockup lockup--${v}">${PARENT_MARK}<span class="lw"><span class="w1">${esc(m[1])}</span><span class="w2">${esc(m[2])}</span></span></span>`; }
    const [a, b] = words();
    const txt = `<span class="lw"><span class="w1">${esc(a)}</span><span class="w2">${esc(b)}</span></span>`;
    if (kind === 'icon') return markSVG(LV[v] || 'color');
    if (kind === 'word') return `<span class="lockup lockup--${v}">${txt}</span>`;
    if (kind === 'stamp') return `<span class="stamp-word">${esc(nameUp())}</span>`;
    if (kind === 'endorse') return `<span class="lockup lockup--${v} lockup--endorse">${markSVG(LV[v] || 'color')}<span class="lw-wrap">${txt}<span class="by">by ${esc(val('parent'))}</span></span></span>`;
    return `<span class="lockup lockup--${v}${kind === 'stack' ? ' lockup--stack' : ''}">${markSVG(LV[v] || 'color')}${txt}</span>`;
  };
  const wordSVG = (x, y, s, c1, c2, anchor = 'start', extra = '') => {
    const [a, b] = words();
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FT}" font-weight="800" font-size="${s}" letter-spacing="${(-s * 0.027).toFixed(2)}" fill="${c1}" ${extra}>${esc(a)}<tspan fill="${c2}" font-weight="600">${esc(b)}</tspan></text>`;
  };
  const stampSVG = (x, y, s, c, anchor = 'middle', txt) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FT}" font-weight="800" font-size="${s}" letter-spacing="${(s * 0.22).toFixed(2)}" fill="${c}">${esc(txt || nameUp())}</text>`;
  const T = (x, y, s, c, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-family="${o.f || FB}" font-weight="${o.w || 600}" font-size="${s}" fill="${c}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}>${esc(t)}</text>`;
  const hand = (x, y, s, c, t, o = {}) => T(x, y, s, c, t, { ...o, f: FH, w: o.w || 700 });
  const sv = (vb, body, label) => `<svg viewBox="${vb}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} focusable="false">${body}</svg>`;
  const nest = (x, y, w, h, vb, body) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}" overflow="visible">${body}</svg>`;
  const star = (cx, cy, R, r = R * 0.45) => { let p = ''; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r : R; p += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`; } return p + 'Z'; };
  const pt = (cx, cy, r, deg) => { const t = (deg * Math.PI) / 180; return [+(cx + r * Math.sin(t)).toFixed(2), +(cy - r * Math.cos(t)).toFixed(2)]; };
  const arcPath = (cx, cy, r, a, b) => { const [x1, y1] = pt(cx, cy, r, a), [x2, y2] = pt(cx, cy, r, b); return `M${x1} ${y1}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
  const cube = (x, y, s, r, op = .34) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${(s * 0.22).toFixed(1)}" transform="rotate(${r} ${x + s / 2} ${y + s / 2})" fill="#fff" fill-opacity="${op}" stroke="#fff" stroke-opacity=".75" stroke-width="1.2"/>`;

  // ---------- the cold seven (prices from the website menu, Medio 12 oz) ----------
  // layers top to bottom: [colour, share]
  const DRINKS = {
    'cold-brew': { n: 'Cold Brew', p: 170, kcal: 5, caf: 205, l: [['#3a1d0f', 1]], ice: 7, lid: 'flat', note: 'black · less ice' },
    'vanilla-sweet-cream': { n: 'Vanilla Sweet Cream Cold Brew', short: 'Sweet Cream', p: 195, kcal: 110, caf: 185, l: [['#d8b892', 0.22], ['#3a1d0f', 0.78]], ice: 6, lid: 'flat', note: 'sweet cream' },
    nitro: { n: 'Nitro Cold Brew', short: 'Nitro', p: 210, kcal: 5, caf: 265, l: [['#eadcc3', 0.16], ['#2a140a', 0.84]], ice: 0, lid: 'flat', straw: false, note: 'no ice · sip lid' },
    'iced-americano': { n: 'Iced Americano', short: 'Americano', p: 150, kcal: 15, caf: 225, l: [['#4a2615', 1]], ice: 8, note: 'double shot' },
    'iced-latte': { n: 'Iced Caffè Latte', short: 'Latte', p: 175, kcal: 130, caf: 150, l: [['#7a4a2a', 0.3], ['#efe2cc', 0.7]], ice: 7, note: 'oat · less ice' },
    'iced-spanish-latte': { n: 'Iced Spanish Latte', short: 'Spanish', p: 195, kcal: 240, caf: 150, l: [['#5a2e16', 0.3], ['#efe2cc', 0.4], ['#e3c48f', 0.3]], ice: 7, note: 'best seller' },
    'iced-caramel-macchiato': { n: 'Iced Caramel Macchiato', short: 'Macchiato', p: 205, kcal: 250, caf: 150, l: [['#6b3a1c', 0.26], ['#e8d2b0', 0.34], ['#f2e8d8', 0.4]], ice: 6, drizzle: '#b0641c', note: 'extra drizzle' },
  };
  const DK = Object.keys(DRINKS);
  // size add-ons from the website: Medio 12 oz +0, Grande 16 oz +25, Gigante 20 oz +45
  const SIZES = [['Medio', '12 oz', 0, 0.86], ['Grande', '16 oz', 25, 0.96], ['Gigante', '20 oz', 45, 1.06]];
  const money = (n) => val('cur') + Number(n).toLocaleString('en-PH');

  // ---------- packaging art ----------
  // clear iced cup on a 200 x 260 board, base at y 240: layered drink, ice, Gio Green straw, frosted name label
  function cupInner(name = val('custName'), dk = 'vanilla-sweet-cream', o = {}) {
    const dr = DRINKS[dk] || DRINKS['cold-brew'];
    const u = 'cc' + (++uid);
    let acc = 0;
    const stops = dr.l.map(([c, sh]) => { const a = acc; acc += sh; return `<stop offset="${a.toFixed(3)}" stop-color="${c}"/><stop offset="${Math.min(1, acc).toFixed(3)}" stop-color="${c}"/>`; }).join('');
    let ice = '';
    [[62, 104, 18, -12], [88, 99, 20, 8], [114, 106, 18, -4], [134, 101, 16, 14], [70, 128, 17, 20], [100, 125, 19, -10], [124, 132, 17, 6], [84, 150, 16, 12]].slice(0, dr.ice).forEach(([x, y, s, r]) => { ice += cube(x, y, s, r); });
    const flat = dr.lid === 'flat';
    const drizzle = dr.drizzle ? `<path d="M58 104L80 98L74 112L98 104L92 118L118 108L112 120L140 110" fill="none" stroke="${dr.drizzle}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>` : '';
    const nitro = dk === 'nitro' ? `<g stroke="#eadcc3" stroke-width="1.3" stroke-linecap="round" opacity=".35"><path d="M70 130v26M86 124v34M102 132v22M118 126v30M132 136v18"/></g>` : '';
    const drops = `<g fill="#fff" fill-opacity=".75">${[[58, 112, 2.2], [146, 124, 2.6], [64, 168, 1.8], [140, 176, 2.1], [70, 222, 2.4], [132, 214, 1.7], [150, 150, 1.5], [54, 140, 1.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 1.35).toFixed(1)}"/>`).join('')}</g>`;
    const sy = flat ? 4 : -6;
    const straw = dr.straw === false ? '' : `<g transform="rotate(5 104 120)"><rect x="99" y="${sy}" width="10" height="200" rx="3" fill="${C.green}"/><rect x="101" y="${sy}" width="2.5" height="200" fill="#fff" opacity=".35"/></g>`;
    const lid = flat
      ? `<path d="M40 70Q40 66 44 66H156Q160 66 160 70V78Q160 82 156 82H44Q40 82 40 78Z" fill="#fff" fill-opacity=".5" stroke="#14332b" stroke-opacity=".3" stroke-width="1.5"/>${dr.straw === false ? `<rect x="112" y="68" width="22" height="5" rx="2.5" fill="#14332b" opacity=".35"/>` : ''}<path d="M48 70H120" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round"/>`
      : `<path d="M42 78Q44 40 100 38Q156 40 158 78Z" fill="#fff" fill-opacity=".25" stroke="#14332b" stroke-opacity=".3" stroke-width="1.5"/><path d="M60 64Q66 48 92 44" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/><ellipse cx="100" cy="78" rx="60" ry="5.5" fill="#fff" fill-opacity=".5" stroke="#14332b" stroke-opacity=".32" stroke-width="1.5"/>`;
    return `<defs>
      <linearGradient id="${u}d" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
      <linearGradient id="${u}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".25" stop-color="#fff" stop-opacity=".06"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".32"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="241" rx="62" ry="7" fill="#0a4d38" opacity=".2"/>
    <ellipse cx="100" cy="242" rx="46" ry="4" fill="#bfd9d6" opacity=".55"/>
    ${straw}
    <path d="M45.8 96Q100 103 154.2 96L140 238Q100 244 60 238Z" fill="url(#${u}d)" opacity=".95"/>
    <path d="M45.8 96Q100 103 154.2 96" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
    ${nitro}${ice}${drizzle}
    ${markAt(83, 140, 34, 'color')}
    <rect x="58" y="182" width="84" height="38" rx="10" fill="#fff" fill-opacity=".94"/>
    ${hand(100, 203, 21, C.night, name, { tr: 'rotate(-4 100 196)' })}
    ${T(100, 214.5, 6.4, C.muted, o.sub || `${hrs()} h steep · #${val('batch')}`, { w: 600 })}
    ${stampSVG(100, 231, 7, '#fff')}
    <path d="M44 ${flat ? 82 : 78}H156L140 238Q100 244 60 238Z" fill="url(#${u}g)" stroke="#14332b" stroke-opacity=".28" stroke-width="1.6"/>
    ${drops}
    <path d="M53 96L66 226" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
    ${lid}`;
  }
  const cup = (name, dk, o) => sv('0 0 200 260', cupInner(name, dk, o), `Clear iced cup of ${(DRINKS[dk] || DRINKS['vanilla-sweet-cream']).n} with the name ${name || val('custName')} on the label`);

  // take-home bottle, 330 ml: clear PET, Night Green wrap label, batch and name in marker
  function bottleInner(name = val('custName'), kind = 'black') {
    const u = 'bt' + (++uid), liquid = kind === 'cream' ? ['#d8b892', '#3a1d0f'] : ['#4a2615', '#2a140a'];
    return `<defs><linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquid[0]}"/><stop offset="${kind === 'cream' ? .2 : .1}" stop-color="${liquid[1]}"/><stop offset="1" stop-color="#1c0d06"/></linearGradient>
      <linearGradient id="${u}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".2" stop-color="#fff" stop-opacity=".05"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient></defs>
      <ellipse cx="100" cy="241" rx="46" ry="6" fill="#0a4d38" opacity=".2"/>
      <rect x="84" y="14" width="32" height="18" rx="4" fill="${C.night}"/><path d="M86 20h28M86 25h28" stroke="#fff" stroke-opacity=".18" stroke-width="1.4"/>
      <path d="M88 32H112V46Q140 58 140 86V226Q140 240 126 240H74Q60 240 60 226V86Q60 58 88 46Z" fill="url(#${u}l)"/>
      <rect x="60" y="112" width="80" height="92" fill="${C.night}"/>
      <path d="M60 118H140M60 198H140" stroke="${C.gold}" stroke-width="1.2"/>
      ${markAt(86, 124, 28, 'night')}
      ${wordSVG(100, 168, 15, '#fff', C.frost, 'middle')}
      ${T(100, 180, 5.6, C.frost, kind === 'cream' ? 'SWEET CREAM · 330 ML' : 'COLD BREW · 330 ML', { f: FT, w: 800, ls: .4 })}
      ${hand(100, 194, 12, C.gold, `for ${name} · #${val('batch')}`)}
      <path d="M88 32H112V46Q140 58 140 86V226Q140 240 126 240H74Q60 240 60 226V86Q60 58 88 46Z" fill="url(#${u}g)" stroke="#14332b" stroke-opacity=".3" stroke-width="1.4"/>
      <path d="M68 80V224" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>`;
  }
  const bottle = (name, kind) => sv('0 0 200 260', bottleInner(name, kind), 'Take-home cold brew bottle, 330 ml, with a Night Green label');

  // growler, 1 L: amber glass, swing top, frost hang tag with the fill time
  function growlerInner() {
    const u = 'gr' + (++uid);
    return `<defs><linearGradient id="${u}" x1="0" x2="1"><stop offset="0" stop-color="#3b1d0c"/><stop offset=".22" stop-color="#7a4318"/><stop offset=".55" stop-color="#5c2f12"/><stop offset="1" stop-color="#2a1408"/></linearGradient></defs>
      <ellipse cx="100" cy="242" rx="60" ry="7" fill="#0a4d38" opacity=".2"/>
      <path d="M150 104c18 2 22 52 2 60" fill="none" stroke="#4a250e" stroke-width="9" stroke-linecap="round"/>
      <path d="M84 30h32v8H84z" fill="#cfd5d2"/><path d="M80 30c0-10 40-10 40 0" fill="none" stroke="#a9b1ad" stroke-width="3"/><path d="M78 40L70 58M122 40L130 58" stroke="#a9b1ad" stroke-width="2.4"/>
      <path d="M86 38H114V62Q156 78 156 118V224Q156 240 140 240H60Q44 240 44 224V118Q44 78 86 62Z" fill="url(#${u})"/>
      <rect x="54" y="120" width="92" height="74" rx="8" fill="${C.foam}"/>
      ${markAt(62, 128, 26, 'color')}${wordSVG(94, 147, 14, C.night, C.green, 'start')}
      <path d="M64 162H136" stroke="${C.gold}" stroke-width="1.2"/>
      ${T(100, 174, 6.8, C.night, `1 L COLD BREW · ${hrs()} H STEEP`, { f: FT, w: 800, ls: .5 })}
      ${hand(100, 188, 12, C.green, 'refill me, ' + money(val('growler')))}
      <path d="M58 82C54 100 52 140 54 220" stroke="#fff" stroke-opacity=".22" stroke-width="5" stroke-linecap="round" fill="none"/>
      <g transform="rotate(-10 78 74)"><path d="M70 60h16l4 10-12 22-12-22z" fill="${C.frost}" stroke="${C.night}" stroke-width="1"/>${T(78, 75, 5.4, C.night, 'FILLED', { f: FT, w: 800 })}${hand(78, 84, 7, C.night, 'Tue 8:10')}</g>`;
  }
  const growler = () => sv('0 0 200 260', growlerInner(), 'Amber glass growler, 1 litre, with a swing top and refill tag');

  // nitro can, 250 ml
  function canInner() {
    const u = 'cn' + (++uid);
    return `<defs><linearGradient id="${u}" x1="0" x2="1"><stop offset="0" stop-color="#0b241e"/><stop offset=".28" stop-color="#245245"/><stop offset=".55" stop-color="${C.night}"/><stop offset="1" stop-color="#0b241e"/></linearGradient>
      <linearGradient id="${u}m" x1="0" x2="1"><stop offset="0" stop-color="#9aa29e"/><stop offset=".35" stop-color="#eef1ef"/><stop offset="1" stop-color="#8e9692"/></linearGradient></defs>
      <ellipse cx="100" cy="242" rx="44" ry="6" fill="#0a4d38" opacity=".2"/>
      <path d="M64 44H136V228Q136 238 126 238H74Q64 238 64 228Z" fill="url(#${u})"/>
      <path d="M66 34H134L136 44H64Z" fill="url(#${u}m)"/><ellipse cx="100" cy="34" rx="34" ry="4" fill="#dfe4e1"/><rect x="88" y="30" width="22" height="5" rx="2.5" fill="#a9b1ad"/>
      <path d="M64 226H136V230Q136 238 126 238H74Q64 238 64 230Z" fill="url(#${u}m)"/>
      <path d="M64 70H136" stroke="${C.gold}" stroke-width="1.6"/>
      ${T(100, 62, 6.4, C.gold, 'NITRO COLD BREW', { f: FT, w: 800, ls: .5 })}
      ${markAt(76, 84, 48, 'night')}
      ${wordSVG(100, 156, 17, '#fff', C.frost, 'middle')}
      <g stroke="${C.frost}" stroke-width="1.2" stroke-linecap="round" opacity=".45"><path d="M76 170v30M86 166v40M96 172v26M106 166v38M116 170v30M126 168v34"/></g>
      ${T(100, 216, 6, C.frost, '250 ML · POUR HARD', { w: 600 })}
      <path d="M72 50V220" stroke="#fff" stroke-opacity=".14" stroke-width="5" stroke-linecap="round"/>`;
  }
  const can = () => sv('0 0 200 260', canInner(), 'Nitro cold brew can, 250 ml, Night Green with gold lettering');

  // steep clock: the signature graphic. A 24-hour dial with the steep time drawn as a gold arc.
  function clockInner(cx, cy, R, h = hrs(), o = {}) {
    let ticks = '';
    for (let i = 0; i < 24; i++) { const [x1, y1] = pt(cx, cy, R - (i % 6 ? R * .06 : R * .12), i * 15), [x2, y2] = pt(cx, cy, R - R * .02, i * 15); ticks += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${o.tick || C.frost}" stroke-width="${(i % 6 ? R * .012 : R * .022).toFixed(2)}" stroke-linecap="round" opacity="${i % 6 ? .55 : .9}"/>`; }
    const end = (h / 24) * 360;
    const [ex, ey] = pt(cx, cy, R * .78, end);
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${o.bg || C.night}"/>${ticks}
      <circle cx="${cx}" cy="${cy}" r="${R * .78}" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="${R * .09}"/>
      <path class="clock-arc" pathLength="1" d="${arcPath(cx, cy, R * .78, 0, Math.min(end, 359.9))}" fill="none" stroke="${C.gold}" stroke-width="${R * .09}" stroke-linecap="round"/>
      <circle class="clock-dot" cx="${ex}" cy="${ey}" r="${R * .07}" fill="${o.dot || '#fff'}"/>
      <text x="${cx}" y="${cy + R * .14}" text-anchor="middle" font-family="${FT}" font-weight="800" font-size="${R * .44}" letter-spacing="${(-R * .015).toFixed(2)}" fill="${o.fg || '#fff'}">${h}<tspan font-size="${R * .22}" font-weight="700" dx="${R * .03}">h</tspan></text>
      ${hand(cx, cy + R * .42, R * .2, o.hand || C.gold, o.label || 'steeped')}`;
  }
  const steepClock = () => sv('0 0 200 200', clockInner(100, 100, 92), `Steep clock: ${hrs()} hours on a 24-hour dial`);

  function coaster() {
    const u = 'co' + (++uid);
    const t = `${nameUp()} ✦ ${tag().toUpperCase()} ✦ ${hrs()} HOURS IN THE MAKING ✦ `;
    return sv('0 0 220 220', `<defs><path id="${u}" d="M110 30A80 80 0 1 1 109.9 30"/></defs>
      <circle cx="113" cy="116" r="100" fill="#0a4d38" opacity=".14"/><circle cx="110" cy="110" r="100" fill="${C.foam}"/>
      <circle cx="110" cy="110" r="100" fill="none" stroke="#d9c9ab" stroke-width="5" stroke-dasharray="1 4"/>
      <circle cx="110" cy="110" r="93" fill="none" stroke="${C.gold}" stroke-width="1.4"/>
      <text font-family="${FT}" font-weight="800" font-size="10.4" fill="${C.night}" letter-spacing="1"><textPath href="#${u}" textLength="498" lengthAdjust="spacing">${esc(t)}</textPath></text>
      ${clockInner(110, 110, 58)}
      <circle cx="152" cy="152" r="20" fill="#b9a27c" opacity=".16"/><circle cx="72" cy="62" r="12" fill="#b9a27c" opacity=".12"/>`, 'Pulp board coaster with the steep clock and a text ring');
  }

  function sealSticker() {
    return sv('0 0 200 200', `<circle cx="66" cy="72" r="50" fill="#0a4d38" opacity=".1" transform="translate(2 4)"/>
      <circle cx="66" cy="72" r="50" fill="${C.night}"/><circle cx="66" cy="72" r="43" fill="none" stroke="${C.frost}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0.01 4.2"/>
      ${T(66, 56, 7.5, C.frost, 'SEALED COLD', { f: FT, w: 800, ls: 1.6 })}
      ${hand(66, 84, 26, '#fff', val('custName'))}
      ${T(66, 101, 7, C.gold, `BATCH ${val('batch')}`, { f: FT, w: 800, ls: 1.4 })}
      <g transform="rotate(5 136 142)"><rect x="82" y="110" width="108" height="64" rx="6" fill="#0a4d38" opacity=".1" transform="translate(2 3)"/><rect x="82" y="110" width="108" height="64" rx="6" fill="#fff"/>
      ${hand(92, 130, 13, C.green, 'for', { a: 'start' })}${hand(110, 131, 20, C.night, val('custName'), { a: 'start' })}
      ${T(92, 146, 7.2, C.ink, 'Sweet Cream Cold Brew · G', { a: 'start' })}${T(92, 157, 7, C.muted, 'less ice · extra cream', { a: 'start', w: 500 })}${T(92, 167, 6.6, C.muted, `#${val('batch')} · 12:20 PM · app`, { a: 'start', w: 500 })}
      ${markAt(166, 116, 18, 'color')}</g>`, 'Round lid seal for delivery and a name label for app orders');
  }

  function carrier() {
    return sv('0 0 220 200', `<ellipse cx="110" cy="186" rx="86" ry="7" fill="#0a4d38" opacity=".16"/>
      ${nest(12, 6, 74, 96, '0 0 200 260', cupInner('Migs', 'iced-spanish-latte'))}
      ${nest(134, 6, 74, 96, '0 0 200 260', cupInner('Paolo', 'iced-caramel-macchiato'))}
      ${nest(70, 0, 80, 104, '0 0 200 260', cupInner(val('custName'), 'cold-brew'))}
      <path d="M20 96H200L193 186H27Z" fill="#cfd8d3"/><path d="M20 96H200" stroke="#a9b8b0" stroke-width="2"/>
      <path d="M21.2 112H198.8L196.6 140H23.4Z" fill="${C.night}"/>
      ${wordSVG(110, 132, 16, '#fff', C.frost, 'middle')}
      ${hand(110, 164, 13, C.night, 'cold all the way to your desk', { op: .85 })}
      <path d="M27 186L20 96" stroke="#a9b8b0" stroke-width="1" opacity=".6"/>`, 'Insulated four-cup carrier in Night Green holding three iced cups');
  }

  function cupFamily() {
    const names = [val('custName'), 'Migs', 'Joaquin'];
    const set = ['nitro', 'vanilla-sweet-cream', 'iced-spanish-latte'];
    let x = 70, out = '';
    SIZES.forEach(([n, oz, , s], i) => {
      const w = 200 * s, h = 260 * s, y = 262 - 240 * s;
      out += nest(x.toFixed(1), y.toFixed(1), w.toFixed(1), h.toFixed(1), '0 0 200 260', cupInner(names[i], set[i]));
      out += T((x + w / 2).toFixed(1), 290, 13, C.night, `${n} · ${oz}`, { f: FT, w: 700 });
      x += w * 0.98;
    });
    return sv('0 0 760 300', `<path d="M10 264H750" stroke="${C.gold}" stroke-width="1.5"/>${out}${hand(690, 120, 22, C.green, 'same cup,', { tr: 'rotate(-6 690 110)' })}${hand(690, 146, 22, C.green, 'three sizes', { tr: 'rotate(-6 690 136)' })}`, 'Iced cup family to scale: Medio 12 oz, Grande 16 oz, Gigante 20 oz');
  }
  function lineup() {
    let out = '';
    DK.forEach((k, i) => {
      const x = 14 + i * 104;
      out += nest(x, 18, 118, 153, '0 0 200 260', cupInner(['Bea', 'Migs', 'Joaquin', 'Ate Lyn', 'Paolo', 'Kim', 'Rafa'][i], k, { sub: DRINKS[k].note }));
      out += T(x + 59, 196, 11, C.night, DRINKS[k].short || DRINKS[k].n, { f: FT, w: 800 });
      out += T(x + 59, 211, 10, C.muted, money(DRINKS[k].p), { w: 600 });
    });
    return sv('0 0 760 230', `<path d="M10 176H750" stroke="${C.gold}" stroke-width="1.5"/>${out}`, 'The cold seven: every cold drink in its own cup');
  }

  // name label dieline: the frosted wrap label every iced cup gets
  function labelDie() {
    return sv('0 0 1000 340', `${T(30, 40, 12, C.frost, 'ICED CUP NAME LABEL · 90 × 40 MM · DIELINE', { a: 'start', f: FT, w: 800, ls: 2 })}
      <rect x="110" y="70" width="780" height="200" rx="36" fill="#fff"/>
      <rect x="128" y="88" width="744" height="164" rx="26" fill="none" stroke="${C.ice}" stroke-width="1.6" stroke-dasharray="7 6"/>
      ${markAt(150, 112, 116, 'color')}
      <rect x="300" y="104" width="380" height="88" rx="14" fill="${C.glass}" stroke="${C.ice}" stroke-width="1.5"/>
      ${T(316, 124, 12, C.muted, 'NAME (MARKER)', { a: 'start', f: FT, w: 800, ls: 1.6 })}
      ${hand(490, 178, 56, C.night, val('custName'), { tr: 'rotate(-4 490 160)' })}
      ${T(300, 222, 16, C.night, `steeped ${hrs()} h · batch ${val('batch')} · ☐ less ice  ☐ no ice  ☐ extra cream`, { a: 'start', w: 600 })}
      ${stampSVG(300, 246, 12, C.green, 'start', `${nameUp()} · ${tag().toUpperCase()}`)}
      ${nest(714, 104, 136, 136, '0 0 200 200', clockInner(100, 100, 92))}
      <rect x="110" y="70" width="780" height="200" rx="36" fill="none" stroke="#fff" stroke-width="2"/>
      ${T(500, 316, 13, C.frost, 'Cut line (white) · safe area (dashed) · matte frost film · 2 inks: Night Green, Gio Green · gold only in the clock', { w: 600 })}`, 'Flat name label artwork with cut line and safe area');
  }

  // ---------- marks & seals ----------
  function roundel(bg = C.night) {
    const u = 'rd' + (++uid);
    const t = `${nameUp()} · ${tag().toUpperCase()} · BY ${val('parent').toUpperCase()} · EST. ${val('est')} · `;
    return sv('0 0 200 200', `<defs><path id="${u}" d="M100 22A78 78 0 1 1 99.9 22"/></defs><circle cx="100" cy="100" r="97" fill="${bg}"/><circle cx="100" cy="100" r="92" fill="none" stroke="${C.gold}" stroke-width="1.6"/><circle cx="100" cy="100" r="63" fill="none" stroke="${C.gold}" stroke-width="1.6"/>
      <text font-family="${FT}" font-weight="800" font-size="10" fill="#fff" letter-spacing="1"><textPath href="#${u}" textLength="486" lengthAdjust="spacing">${esc(t)}</textPath></text>${markAt(56, 56, 88, 'night')}`, `${raw('name')} roundel`);
  }
  const nitroSeal = () => { const u = 'ns' + (++uid); return sv('0 0 200 200', `<defs><path id="${u}" d="M100 30A70 70 0 1 1 99.9 30"/></defs><circle cx="100" cy="100" r="96" fill="${C.steep}"/><circle cx="100" cy="100" r="90" fill="none" stroke="${C.gold}" stroke-width="2"/><circle cx="100" cy="100" r="54" fill="none" stroke="${C.gold}" stroke-width="1"/>
      <text font-family="${FT}" font-weight="800" font-size="12" fill="${C.gold}"><textPath href="#${u}" textLength="436" lengthAdjust="spacing">ON NITRO ✦ POURED FROM THE TAP ✦ NO ICE ✦ </textPath></text>
      <g stroke="${C.foam}" stroke-width="3" stroke-linecap="round"><path d="M80 76v34M92 70v46M104 74v38M116 70v46"/></g><path d="M74 124h52" stroke="${C.gold}" stroke-width="2"/>${T(100, 142, 9.5, C.gold, 'N I T R O', { f: FT, w: 800 })}`, 'Nitro seal'); };
  const starBadge = () => sv('0 0 200 200', `<circle cx="100" cy="100" r="96" fill="${C.gold}"/><circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round"/><path d="${star(100, 86, 44)}" fill="${C.night}"/>${T(100, 150, 22, C.night, 'GioStars', { f: FT, w: 800, ls: -0.5 })}`, 'GioStars badge');
  function construction() {
    const s = 2.5, X = (v) => (72 + v * s).toFixed(1), Y = (v) => (62 + v * s).toFixed(1);
    let grid = '';
    for (let i = 0; i <= 64; i += 4) grid += `<path d="M${X(i)} ${Y(0)}V${Y(64)}M${X(0)} ${Y(i)}H${X(64)}" stroke="${C.green}" stroke-width="${i % 16 ? .3 : .7}" opacity=".35"/>`;
    const dim = (y, t) => `<path d="M${X(66)} ${Y(y)}H${X(78)}" stroke="${C.cascade}" stroke-width="1"/>${T(X(79), +Y(y) + 3.5, 9.5, C.steep, t, { a: 'start', w: 600 })}`;
    return sv('0 0 400 300', `<rect width="400" height="300" fill="${C.glass}"/>${grid}
      ${nest(X(0), Y(0), 64 * s, 64 * s, '0 0 64 64', markInner('color'))}
      <g fill="none" stroke="${C.cascade}" stroke-width="1" stroke-dasharray="4 3"><circle cx="${X(32)}" cy="${Y(32)}" r="${31 * s}"/><circle cx="${X(33.3)}" cy="${Y(15.4)}" r="${7 * s}"/></g>
      <path d="M${X(32)} ${Y(-2)}V${Y(66)}M${X(-2)} ${Y(32)}H${X(66)}" stroke="${C.cascade}" stroke-width=".8"/>
      ${dim(12, 'straw G · stroke 2.6')}${dim(26, 'flat lid · 24 × 3.6')}${dim(32.7, 'foam cap · 3.5')}${dim(46.8, 'name label · 10 × 3.6')}
      ${T(X(-1), +Y(32) - 6, 9.5, C.steep, 'r27 drops', { a: 'end', w: 600 })}${T(X(-1), +Y(4) + 4, 9.5, C.steep, 'r31 badge', { a: 'end', w: 600 })}
      ${T(20, 290, 9, C.muted, '64-unit grid · 1 square = 4 units · drop ring: 0 dash, 3.42 gap', { a: 'start', w: 600 })}`, 'Construction drawing of the GioCold mark on a grid');
  }
  const markStraw = () => sv('0 0 64 64', markInner('color'), 'The mark with the straw G');

  // ---------- graphic elements ----------
  const icePattern = (c = '#ffffff', op = .16) => { let s = ''; [[10, 12, 14, 12], [52, 8, 12, -16], [32, 42, 15, 24], [70, 56, 11, 8], [8, 64, 12, -22]].forEach(([x, y, w, r]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="3" transform="rotate(${r} ${x + w / 2} ${y + w / 2})" fill="none" stroke="${c}" stroke-width="1.6"/>`; }); [[44, 26], [22, 36], [62, 38], [40, 74]].forEach(([x, y]) => { s += `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.2" fill="${c}"/>`; }); return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84"><g opacity="${op}">${s}</g></svg>`)}")`; };
  function cascadeLine() {
    let lines = '';
    for (let i = 0; i < 14; i++) { const x = 40 + i * 52; lines += `<path d="M${x} ${20 + (i % 3) * 14}V${120 + (i % 4) * 8}" stroke="${C.foam}" stroke-width="2" stroke-linecap="round" opacity="${(.25 + (i % 3) * .12).toFixed(2)}"/>`; }
    return sv('0 0 800 200', `${lines}<path d="M20 150C130 140 200 170 320 156S540 134 660 152 760 160 780 156" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>
      <path d="M20 168C140 160 220 186 330 174S560 152 780 172" fill="none" stroke="${C.frost}" stroke-width="1.5" opacity=".45"/>${hand(40, 194, 24, C.frost, 'fall slowly, settle into foam', { a: 'start', op: .9 })}`, 'Cascade line: falling nitro lines settling onto a gold foam line');
  }
  function scrawl(anim) {
    return sv('0 0 300 200', `${hand(70, 78, 30, C.green, 'for', { tr: 'rotate(-6 70 70)' })}
      <g class="sc-text">${hand(160, 130, 78, C.night, val('custName'), { tr: 'rotate(-6 160 110)' })}</g>
      <path class="sc-line" pathLength="1" d="M70 158C120 150 190 144 250 128" fill="none" stroke="${C.night}" stroke-width="4" stroke-linecap="round"/>
      ${anim ? '' : T(250, 182, 13, C.muted, `batch ${val('batch')}`, { a: 'end', w: 600 })}`, `The name ${val('custName')} written in Caveat`);
  }
  function frostPanel() {
    const u = 'fp' + (++uid);
    let drops = '';
    for (let i = 0; i < 46; i++) { const x = (i * 73) % 400, y = (i * 47) % 300, r = 1.5 + (i % 5) * .9; drops += `<ellipse cx="${x}" cy="${y}" rx="${r.toFixed(1)}" ry="${(r * 1.35).toFixed(1)}" fill="#fff" opacity="${(.35 + (i % 3) * .2).toFixed(2)}"/>`; }
    return sv('0 0 400 300', `<defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe3dc"/><stop offset=".5" stop-color="#eef6f3"/><stop offset="1" stop-color="#bcd8cc"/></linearGradient></defs><rect width="400" height="300" fill="url(#${u})"/>${drops}
      <path d="M150 0C142 60 170 110 158 170S170 260 162 300" stroke="#fff" stroke-width="10" opacity=".5" fill="none" stroke-linecap="round"/><path d="M240 0C250 50 232 90 244 140" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>
      ${hand(286, 250, 30, C.night, 'wipe & write', { op: .7, tr: 'rotate(-6 286 240)' })}`, 'Frost: condensation drops on glass with two wiped trails');
  }

  // ---------- cover ----------
  function coverArt() {
    let cubes = '';
    [[56, 120, 34, 18], [440, 96, 40, -14], [454, 380, 30, 30], [40, 372, 28, -24], [300, 46, 26, 8]].forEach(([x, y, s, r]) => { cubes += cube(x, y, s, r, .1); });
    return sv('0 0 520 520', `${nest(130, 18, 270, 270, '0 0 200 200', clockInner(100, 100, 92, hrs(), { bg: '#0a4d38' }))}
      ${cubes}
      <ellipse cx="260" cy="500" rx="210" ry="16" fill="#000" opacity=".22"/>
      ${nest(56, 196, 236, 307, '0 0 200 260', bottleInner(val('custName'), 'cream'))}
      ${nest(206, 156, 262, 341, '0 0 200 260', cupInner(val('custName'), 'vanilla-sweet-cream'))}`);
  }

  // ---------- imagery stand-ins ----------
  function shotIce() {
    const u = 'si' + (++uid);
    return sv('0 0 240 180', `<defs><radialGradient id="${u}" cx=".7" cy=".2" r=".9"><stop offset="0" stop-color="#f7fbf9"/><stop offset=".6" stop-color="#d7ebe2"/><stop offset="1" stop-color="#a9cbbd"/></radialGradient></defs>
      <rect width="240" height="180" fill="url(#${u})"/>
      <path d="M70 40H170L160 176H80Z" fill="#fff" fill-opacity=".35" stroke="#14332b" stroke-opacity=".25" stroke-width="2"/>
      <path d="M74 96H166L160 176H80Z" fill="#3a1d0f"/>${cube(92, 104, 22, -14, .3)}${cube(124, 112, 20, 12, .3)}${cube(104, 136, 18, 20, .3)}
      <g transform="translate(118 20) rotate(24)">${cube(0, 0, 26, 0, .55)}</g>
      <path d="M128 60c-4 8-6 18-4 30" stroke="#fff" stroke-width="2" stroke-dasharray="2 5" fill="none" stroke-linecap="round"/>
      <g fill="#fff">${[[96, 62], [150, 70], [88, 120], [156, 140], [100, 160]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="3.2" opacity=".8"/>`).join('')}</g>
      <path d="M78 46L90 170" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>`, 'Illustration: an ice cube dropping into a glass of cold brew');
  }
  function shotCascade() {
    return sv('0 0 240 180', `<rect width="240" height="180" fill="#2b1a12"/><path d="M0 0H240V50L0 110Z" fill="#3a2418"/>
      <rect x="94" y="0" width="52" height="34" rx="4" fill="#9aa29e"/><rect x="112" y="30" width="16" height="22" rx="3" fill="#cfd5d2"/>
      <path d="M120 52V100" stroke="#3a1d0f" stroke-width="5"/>
      <path d="M80 84H160L152 176H88Z" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      <path d="M82 110H158L152 176H88Z" fill="#1c0d06"/><path d="M82 100H158L157 110H82Z" fill="#eadcc3"/>
      <g stroke="#eadcc3" stroke-width="1.4" stroke-linecap="round" opacity=".5"><path d="M96 120v40M108 116v50M120 122v36M132 116v46M144 124v34"/></g>`, 'Illustration: nitro cold brew cascading from the tap into a glass');
  }
  function shotTower() {
    return sv('0 0 240 180', `<rect width="240" height="180" fill="#e6efe9"/><rect x="0" y="146" width="240" height="34" fill="#c7a77d"/><rect x="0" y="146" width="240" height="5" fill="#a98757"/>
      <path d="M70 10V146M170 10V146M70 10H170" stroke="#7a5534" stroke-width="7"/>
      <circle cx="120" cy="38" r="22" fill="#fff" fill-opacity=".5" stroke="#14332b" stroke-opacity=".35" stroke-width="2"/><path d="M104 46a18 10 0 0 0 32 0" fill="#cfe3ea" opacity=".9"/>
      <path d="M120 60v8" stroke="#9aa29e" stroke-width="3"/><circle cx="120" cy="74" r="2.4" fill="#5c3820"/>
      <path d="M104 80H136L132 100H108Z" fill="#fff" fill-opacity=".5" stroke="#14332b" stroke-opacity=".35" stroke-width="2"/><path d="M106 88H134L132 100H108Z" fill="#5c3820"/>
      <path d="M120 100c-12 6 12 10 0 16s12 10 0 16" fill="none" stroke="#14332b" stroke-opacity=".4" stroke-width="2"/>
      <path d="M100 124H140L136 146H104Z" fill="#fff" fill-opacity=".5" stroke="#14332b" stroke-opacity=".35" stroke-width="2"/><path d="M102 134H138L136 146H104Z" fill="#2a140a"/>
      ${T(232, 20, 9, C.night, 'Reserve, 5th Ave', { a: 'end', f: FT, w: 800 })}`, 'Illustration: the slow-drip tower at the Reserve, drop by drop');
  }
  function shotStreet() {
    return sv('0 0 240 180', `<rect width="240" height="180" fill="#f6d79a"/><circle cx="196" cy="34" r="22" fill="#fff3cf"/>
      <rect x="0" y="40" width="44" height="140" fill="#cfe2d9"/><rect x="52" y="10" width="40" height="170" fill="#bfd6cb"/><rect x="180" y="60" width="60" height="120" fill="#c9ddd3"/>
      <path d="M58 24h28M58 40h28M58 56h28M58 72h28M186 76h48M186 92h48" stroke="#fff" stroke-width="2" opacity=".6"/>
      <path d="M0 160H240V180H0Z" fill="#d9cfc0"/>
      ${nest(96, 52, 92, 120, '0 0 200 260', cupInner(val('custName'), 'iced-spanish-latte'))}
      <path d="M112 140c-10-2-18 4-20 16l-6 24h56l4-22c2-10-6-18-16-18z" fill="#c68e64"/><path d="M106 146c12 2 26 2 38 0" stroke="#a46f48" stroke-width="2" fill="none"/>`, 'Illustration: an iced Spanish latte held up on a sunny BGC street');
  }

  // ---------- the cold bar ----------
  function coldBar() {
    const u = 'cb' + (++uid);
    let tiles = '';
    for (let r = 0, y = 34; y < 420; y += 26, r++) for (let x = r % 2 ? -30 : 0; x < 1200; x += 60) tiles += `<rect x="${x + 2}" y="${y + 2}" width="56" height="22" rx="3" fill="#1b4237"/>`;
    const tap = (x) => `<g transform="translate(${x} 0)"><rect x="-8" y="300" width="16" height="30" rx="4" fill="#cfd5d2"/><path d="M-4 330v16" stroke="#9aa29e" stroke-width="6" stroke-linecap="round"/>
      <rect x="-15" y="222" width="30" height="82" rx="11" fill="${C.night}" stroke="${C.gold}" stroke-width="2"/>${markAt(-11, 232, 22, 'night')}${T(0, 284, 7.5, C.gold, 'NITRO', { f: FT, w: 800, ls: .6 })}</g>`;
    const shelf = (y) => `<rect x="896" y="${y}" width="208" height="6" fill="#cfd5d2"/>${[0, 1, 2, 3, 4].map((i) => nest(900 + i * 40, y - 66, 50, 65, '0 0 200 260', bottleInner(['Bea', 'Migs', 'Kim', 'Rafa', 'Lyn'][i], i % 2 ? 'cream' : 'black'))).join('')}`;
    return sv('0 0 1200 560', `<defs>
        <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8d2ad"/><stop offset="1" stop-color="#c7a77d"/></linearGradient>
        <linearGradient id="${u}f" x1="0" x2="1"><stop offset="0" stop-color="#9aa29e"/><stop offset=".5" stop-color="#eef1ef"/><stop offset="1" stop-color="#8e9692"/></linearGradient>
        <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <rect width="1200" height="560" fill="${C.night}"/>${tiles}
      <rect x="300" y="52" width="600" height="110" rx="10" fill="#0b241e"/><rect x="310" y="62" width="580" height="90" rx="6" fill="none" stroke="${C.gold}" stroke-width="2"/>
      ${markAt(398, 70, 74, 'night')}${wordSVG(486, 128, 56, '#fff', C.frost)}
      ${hand(600, 194, 26, C.gold, tag().toLowerCase())}
      <path d="M60 206H1140" stroke="${C.gold}" stroke-width="2" opacity=".7"/>
      <g transform="translate(110 226)"><path d="M0 0V194M100 0V194M0 0H100" stroke="#a87b4b" stroke-width="8"/>
        <circle cx="50" cy="34" r="24" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M33 42a17 10 0 0 0 34 0" fill="#cfe3ea" opacity=".6"/>
        <path d="M50 58v10" stroke="#cfd5d2" stroke-width="3"/><circle class="drip" cx="50" cy="76" r="3" fill="#b9824c"/>
        <path d="M32 84H68L64 106H36Z" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M34 94H66L64 106H36Z" fill="#5c3820"/>
        <path d="M50 106c-12 7 12 11 0 18s12 11 0 18" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
        <path d="M28 150H72L68 194H32Z" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M30 166H70L68 194H32Z" fill="#2a140a"/></g>
      ${hand(160, 222, 17, C.frost, 'drip tower', { op: .9 })}
      <rect x="360" y="290" width="240" height="40" rx="8" fill="url(#${u}f)"/>${tap(430)}${tap(530)}
      ${hand(480, 222, 17, C.frost, 'two nitro taps', { op: .9 })}
      <g transform="translate(640 232)"><rect x="0" y="0" width="200" height="110" rx="6" fill="#22322d" stroke="#a87b4b" stroke-width="5"/>${hand(100, 28, 19, '#fff', "today's batch")}${T(100, 56, 24, C.gold, `#${val('batch')}`, { f: FT, w: 800 })}${T(100, 76, 9.5, C.frost, `started 10:40 AM yesterday · ${hrs()} h`, { w: 600 })}${hand(100, 98, 15, C.frost, 'ready at 6:40 AM')}</g>
      <rect x="884" y="226" width="232" height="190" rx="10" fill="#0b241e" stroke="#cfd5d2" stroke-width="5"/>${shelf(310)}${shelf(398)}<rect x="884" y="226" width="232" height="190" rx="10" fill="url(#${u}g)"/>
      ${hand(1000, 222, 17, C.frost, 'grab and go', { op: .9 })}
      <rect x="0" y="420" width="1200" height="140" fill="url(#${u}w)"/><rect x="0" y="420" width="1200" height="12" fill="#a87b4b"/>
      <path d="M0 476H1200" stroke="#b8956a" stroke-width="2" opacity=".5"/>
      ${[[316, 'Migs', 'iced-latte'], [396, val('custName'), 'vanilla-sweet-cream'], [476, 'Joaquin', 'nitro'], [556, 'Paolo', 'iced-americano']].map(([x, n, k]) => nest(x, 332, 74, 96, '0 0 200 260', cupInner(n, k))).join('')}
      ${T(480, 460, 12, C.night, 'COLD ORDERS · PICK UP HERE', { f: FT, w: 800, ls: 2 })}
      ${hand(900, 510, 30, C.night, "your name is on it, and it's cold", { op: .85 })}`, `The cold bar at ${val('flagship')}: drip tower, nitro taps, batch board and a bottle fridge`);
  }
  const tapHandle = () => sv('0 0 200 220', `<ellipse cx="100" cy="210" rx="40" ry="5" fill="#0a4d38" opacity=".18"/>
    <rect x="60" y="150" width="80" height="20" rx="6" fill="#cfd5d2"/><rect x="88" y="170" width="24" height="30" rx="4" fill="#9aa29e"/>
    <rect x="70" y="10" width="60" height="144" rx="22" fill="${C.night}" stroke="${C.gold}" stroke-width="3"/>
    ${markAt(76, 22, 48, 'night')}<path d="M80 82H120" stroke="${C.gold}" stroke-width="1.4"/>
    ${T(100, 100, 10, C.gold, 'NITRO', { f: FT, w: 800, ls: 2 })}${hand(100, 124, 15, C.frost, 'pour hard')}
    <path d="M80 26V140" stroke="#fff" stroke-opacity=".14" stroke-width="5" stroke-linecap="round"/>`, 'Nitro tap handle in Night Green with a gold edge');
  const batchBoard = () => sv('0 0 200 200', `<ellipse cx="100" cy="190" rx="70" ry="5" fill="#0a4d38" opacity=".15"/>
    <rect x="22" y="20" width="156" height="160" rx="8" fill="#22322d" stroke="#a87b4b" stroke-width="6"/>
    ${hand(100, 52, 20, '#fff', "today's batch")}
    ${T(100, 86, 32, C.gold, `#${val('batch')}`, { f: FT, w: 800 })}
    <path d="M44 98H156" stroke="${C.gold}" stroke-width="1.2" stroke-dasharray="3 3"/>
    ${T(100, 116, 9.5, C.frost, 'started 10:40 AM yesterday', { w: 600 })}${T(100, 130, 9.5, C.frost, `steeped ${hrs()} h · Benguet Medium`, { w: 600 })}
    ${hand(100, 158, 17, C.frost, 'ready at 6:40 AM')}`, 'Batch chalkboard: batch number, start time and steep time');
  const fridgeTalker = () => sv('0 0 200 200', `<rect x="10" y="130" width="180" height="8" fill="#cfd5d2"/>
    ${[0, 1, 2].map((i) => nest(24 + i * 54, 52, 60, 78, '0 0 200 260', bottleInner(['Bea', 'Migs', 'Kim'][i], i === 1 ? 'cream' : 'black'))).join('')}
    <path d="M20 138H180V170Q180 176 174 176H26Q20 176 20 170Z" fill="${C.frost}"/>
    ${T(100, 154, 10, C.night, `TAKE IT HOME · ${money(homePrice('bottle'))}`, { f: FT, w: 800, ls: 1 })}${hand(100, 170, 13, C.green, 'best in 7 days, kept cold')}`, 'Fridge shelf talker under the take-home bottles');

  // ---------- merch ----------
  const ART_MERCH = {
    tumbler: () => { const g = 'tb' + (++uid); return sv('0 0 200 220', `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#b9c4bf"/><stop offset=".3" stop-color="#eef3f1"/><stop offset=".6" stop-color="${C.frost}"/><stop offset="1" stop-color="#a9b8b0"/></linearGradient></defs>
      <ellipse cx="100" cy="208" rx="46" ry="6" fill="#0a4d38" opacity=".18"/>
      <g transform="rotate(8 120 40)"><rect x="112" y="0" width="9" height="80" rx="4" fill="#9aa29e"/></g>
      <path d="M58 46H142L134 204Q100 210 66 204Z" fill="url(#${g})"/>
      <rect x="54" y="32" width="92" height="18" rx="6" fill="${C.night}"/><circle cx="118" cy="38" r="5" fill="#0b241e"/>
      <path d="M59.5 74H140.5" stroke="${C.gold}" stroke-width="2"/>${markAt(76, 92, 48, 'color')}${stampSVG(100, 164, 8, C.night)}<path d="M64 186H136" stroke="${C.gold}" stroke-width="1"/>
      <path d="M70 54L74 196" stroke="#fff" stroke-width="5" opacity=".4" stroke-linecap="round"/>`, 'Frost steel straw tumbler, 20 oz, Night Green lid'); },
    glass: () => sv('0 0 200 220', `<ellipse cx="100" cy="206" rx="46" ry="6" fill="#0a4d38" opacity=".18"/>
      <path d="M58 30Q58 22 66 22H134Q142 22 142 30V196Q142 204 134 204H66Q58 204 58 196Z" fill="#fff" fill-opacity=".35" stroke="#14332b" stroke-opacity=".3" stroke-width="1.6"/>
      <path d="M60 60H140V196Q140 202 134 202H66Q60 202 60 196Z" fill="#2a140a"/><path d="M60 52H140V60H60Z" fill="#eadcc3"/>
      ${cube(70, 70, 22, -10)}${cube(104, 80, 20, 12)}
      ${markAt(78, 118, 44, 'white')}${wordSVG(100, 182, 15, '#fff', C.frost, 'middle')}
      <path d="M66 30V196" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`, 'Can-shaped glass, 16 oz, white print'),
    tote: () => sv('0 0 200 220', `<path d="M70 72c0-56 60-56 60 0" fill="none" stroke="${C.night}" stroke-width="8"/><rect x="38" y="66" width="124" height="146" rx="8" fill="${C.night}"/>
      <path d="M38 80h124" stroke="${C.gold}" stroke-width="2"/><path d="M50 66v146M150 66v146" stroke="#0b241e" stroke-width="2"/>
      ${markAt(72, 94, 56, 'night')}${wordSVG(100, 172, 20, '#fff', C.frost, 'middle')}${hand(100, 196, 14, C.gold, 'keeps four cold')}`, 'Insulated Night Green tote that holds a four-cup carrier'),
    straws: () => sv('0 0 200 200', `<ellipse cx="100" cy="178" rx="76" ry="6" fill="#0a4d38" opacity=".15"/>
      <rect x="28" y="80" width="144" height="96" rx="12" fill="${C.frost}"/><path d="M28 98H172" stroke="${C.night}" stroke-width="2" opacity=".2"/>
      ${[0, 1, 2, 3].map((i) => `<g transform="rotate(${-12 + i * 3} 100 120)"><rect x="40" y="${102 + i * 14}" width="150" height="7" rx="3.5" fill="${i === 3 ? C.gold : '#b9c4bf'}"/><rect x="40" y="${103 + i * 14}" width="150" height="2" fill="#fff" opacity=".6"/></g>`).join('')}
      ${markAt(36, 86, 30, 'color')}${T(164, 168, 8.5, C.night, '4 STEEL STRAWS + BRUSH', { a: 'end', f: FT, w: 800, ls: .6 })}`, 'Steel straw set in a Frost pouch'),
    apron: () => sv('0 0 200 220', `<path d="M76 8c0 22 48 22 48 0" fill="none" stroke="#0b241e" stroke-width="5"/><path d="M68 10h64v34l34 22v148H34V66l34-22z" fill="${C.night}"/><path d="M34 66l34-22h64l34 22" fill="none" stroke="#0b241e" stroke-width="2"/>
      <path d="M34 92H8M166 92h26" stroke="#0b241e" stroke-width="5" stroke-linecap="round"/>${markAt(76, 48, 48, 'night')}${wordSVG(100, 122, 19, '#fff', C.frost, 'middle')}
      <rect x="58" y="146" width="84" height="46" rx="6" fill="none" stroke="#0b241e" stroke-width="2.5"/><path d="M100 146v46" stroke="#0b241e" stroke-width="2"/>${hand(79, 174, 18, C.gold, 'Kim')}<path d="M64 182h30" stroke="${C.gold}" stroke-width="1" stroke-dasharray="2 2"/>`, 'Night Green cold bar apron with a gold stitched name'),
  };

  // ---------- menu boards ----------
  const MENU = {
    brew: { t: 'Cold brew', s: () => `steeped ${hrs()} hours`, sized: 1, items: [['Cold Brew', 170], ['Vanilla Sweet Cream', 195, 'house sweet cream'], ['Nitro Cold Brew', 210, 'on tap, no ice'], ['Pumpkin Cream Cold Brew', 225, '-ber months']] },
    iced: { t: 'Iced espresso', s: () => 'pulled to order, over ice', sized: 1, items: [['Iced Americano', 150], ['Iced Caffè Latte', 175], ['Iced Spanish Latte', 195, 'best seller'], ['Iced Caramel Macchiato', 205]] },
    home: { t: 'Take it home', s: () => 'from the fridge', sized: 0, items: [['Cold Brew, 330 ml', 'bottle'], ['Sweet Cream, 330 ml', 'bottle+20'], ['Growler refill, 1 L', 'growler', 'bring the growler'], ['Nitro can, 250 ml', 160]] },
  };
  function homePrice(p) {
    const b = parseInt(val('bottle'), 10) || 190, g = parseInt(val('growler'), 10) || 480;
    return p === 'bottle' ? b : p === 'bottle+20' ? b + 20 : p === 'growler' ? g : +p;
  }
  function renderBoards() {
    const el = $('#boards'); if (!el) return;
    const art = { brew: cup('Migs', 'cold-brew'), iced: cup(val('custName'), 'iced-spanish-latte'), home: bottle(val('custName'), 'black') };
    el.innerHTML = Object.entries(MENU).map(([k, m]) => `<div class="board board--${k}"><div class="board__head"><p class="board__h">${esc(m.t)}</p><p class="board__s">${esc(m.s())}</p></div><i class="gold-rule"></i>
      ${m.sized ? `<div class="board__cols" style="--n:3"><span></span>${SIZES.map((s) => `<b>${s[1].replace(' oz', '')}</b>`).join('')}</div>` : ''}
      <ul style="--n:${m.sized ? 3 : 1}">${m.items.map(([n, p, note]) => `<li><span>${esc(n)}${note ? `<small>${esc(note)}</small>` : ''}</span>${m.sized ? SIZES.map((s) => `<b>${money(p + s[2])}</b>`).join('') : `<b>${money(homePrice(p))}</b>`}</li>`).join('')}</ul>
      <div class="board__art">${art[k]}</div></div>`).join('');
  }
  function renderMenuPrint() {
    const el = $('#menuPrint'); if (!el) return;
    const sec = (m) => `<div class="mp__sec"><p class="mp__h">${esc(m.t)}</p><i class="gold-rule"></i><ul>${m.items.map(([nm, p]) => `<li><span>${esc(nm)}</span><b>${money(homePrice(p))}</b></li>`).join('')}</ul></div>`;
    el.innerHTML = `<div class="mp__band">${lockup('', 'house')}<p class="mp__hand">cold menu</p></div>
      <div class="mp__body"><div>${sec(MENU.brew)}${sec(MENU.home)}</div><div>${sec(MENU.iced)}<div class="mp__clock">${steepClock()}</div><p class="mp__note">Prices for Medio 12 oz. Grande +${esc(val('cur'))}25, Gigante +${esc(val('cur'))}45.</p></div></div>
      <div class="mp__stars"><span class="mp__star">★</span><p><b>GioStars count here too.</b> 2★ for every ${esc(val('cur'))}50 · ${esc(val('promo'))}</p></div>
      <div class="mp__foot"><span>${esc(val('flagship'))}</span><span>${esc(val('hours'))}</span><span>${esc(val('web'))}</span></div>`;
  }

  // ---------- line icons (24 px grid, 1.8 px stroke; the star is the only filled icon) ----------
  const ICONS = {
    'iced cup': '<path d="M5.5 9h13l-1.6 11.2a1.8 1.8 0 0 1-1.8 1.6H8.9a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M4.8 9c.4-3.2 3.4-5 7.2-5s6.8 1.8 7.2 5"/><path d="M13 4l2.4-2.5"/><path d="M9 12.5h2.6v2.6H9zM12.6 15.4h2.6V18h-2.6z"/>',
    'cold brew': '<path d="M6 6.5h12l-1.4 13.7a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M5 4h14v2.5H5z"/><path d="M6.5 10.5h11"/><path d="M14 4V2"/>',
    nitro: '<path d="M6 8h12l-1.4 12.2a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M6.4 11.5h11.2"/><path d="M10 14.5v4M12 14v5M14 14.5v4"/><path d="M9 2.5h6v3H9zM12 5.5V8"/>',
    ice: '<rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(-10 12 12)"/><path d="M8.5 9.5l3-1"/>',
    'less ice': '<path d="M5.5 9h13l-1.6 11.2a1.8 1.8 0 0 1-1.8 1.6H8.9a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M10 16h3v3h-3z"/><path d="M6.4 13h11.2"/>',
    'no ice': '<rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(-10 12 12)"/><path d="M4 4l16 16"/>',
    'drip tower': '<path d="M5 3v18M19 3v18M5 3h14"/><circle cx="12" cy="7" r="2.5"/><path d="M12 9.5v2"/><path d="M9.5 13.5h5l-.6 2.5h-3.8zM12 16v1.5"/><path d="M9 18.5h6v2.5H9z"/>',
    tap: '<path d="M9 2.5h6l-1 9h-4z"/><path d="M6 13h12v3H6zM12 16v3"/><path d="M10.5 21h3"/>',
    bottle: '<path d="M10 2.5h4v3.5c2 1 3.5 2.5 3.5 5V20a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20v-9c0-2.5 1.5-4 3.5-5z"/><path d="M6.5 12h11M6.5 17h11"/>',
    growler: '<path d="M10 3h4v3.5c3 1 4.5 3 4.5 6V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20v-7.5c0-3 1.5-5 4.5-6z"/><path d="M18.5 11.5h1a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-1"/><path d="M9 2h6"/>',
    can: '<path d="M7 5h10v15a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20z"/><path d="M8 2.5h8L17 5H7z"/><path d="M7 9h10"/><path d="M10 12.5v5M12 12v6M14 12.5v5"/>',
    straw: '<path d="M8 21l4.5-15h4"/><path d="M15 3.5l3 2.5"/>',
    'sweet cream': '<path d="M7 8.5l2-4.5h6l2 4.5V21H7z"/><path d="M7 8.5h10"/><path d="M12 12c-1.6 2-2.2 3.2-2.2 4.2a2.2 2.2 0 0 0 4.4 0c0-1-.6-2.2-2.2-4.2z"/>',
    'steep clock': '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 1 1-7.8 13.5" stroke-width="2.6"/><path d="M12 8v4l2.5 1.5"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18 6.5l1.5-1.5"/>',
    drop: '<path d="M12 3c-3.6 4.6-5.5 7.7-5.5 10.3a5.5 5.5 0 0 0 11 0C17.5 10.7 15.6 7.6 12 3z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>',
    frost: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M10 4.5l2 2 2-2M10 19.5l2-2 2 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    beans: '<ellipse cx="8.8" cy="9.5" rx="4" ry="6" transform="rotate(-25 8.8 9.5)"/><path d="M11.2 4.6c-2.6 2-1 6-3.8 9.6"/><ellipse cx="16" cy="15" rx="3.6" ry="5.2" transform="rotate(30 16 15)"/><path d="M13.6 11.1c2.4 1.4 1.8 5 4.6 7.6"/>',
    milk: '<path d="M7 8.5l2-4.5h6l2 4.5V21H7z"/><path d="M7 8.5h10"/><path d="M10 13.5c1.2 1 2.8 1 4 0"/>',
    oat: '<path d="M12 21V8"/><path d="M12 9.5C9 8.5 8 6.5 8 4.5c2 0 4 1.5 4 5zM12 9.5c3-1 4-3 4-5-2 0-4 1.5-4 5zM12 14.5c-3-1-4-3-4-5 2 0 4 1.5 4 5zM12 14.5c3-1 4-3 4-5-2 0-4 1.5-4 5z"/>',
    caramel: '<path d="M4 7c3 0 3 3 6 3s3-3 6-3 3 3 4 3"/><path d="M4 12c3 0 3 3 6 3s3-3 6-3 3 3 4 3"/><path d="M8 18c2 0 2 2 4 2s2-2 4-2"/>',
    vanilla: '<path d="M6 19C9 12 14 7 19 4.5c-1 5.5-5 11-12 14.5z"/><path d="M8 17c3-3.5 6.5-7 10-11"/><circle cx="6" cy="19.5" r="1.2"/>',
    carrier: '<path d="M3 11h18l-1.5 9.5h-15z"/><path d="M6 11V8h4v3M14 11V8h4v3"/><path d="M3 14h18"/>',
    'pick-up': '<path d="M3 20.5h18"/><path d="M5.5 10h7l-.9 8H6.4z"/><path d="M5 7.5h8V10H5z"/><path d="M15 12h5l-.6 6h-3.8z"/><path d="M17.5 12V8.5L19 7"/>',
    delivery: '<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.5 17h7M14 6h3l2 8.5"/><path d="M4 13h7V8H4z"/>',
    location: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
    reusable: '<path d="M20 12a8 8 0 0 1-13.7 5.7M4 12a8 8 0 0 1 13.7-5.7"/><path d="M18 2.5v4h-4M6 21.5v-4h4"/>',
    QR: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h2M20 14v2"/>',
    pen: '<path d="M15 4l5 5-10 10H5v-5z"/><path d="M13 6l5 5"/><path d="M4 22h8"/>',
    star: '<path class="fill" d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/>',
  };
  const lineIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[k] || ''}</svg>`;

  // ---------- materials checklist ----------
  // [group, item, section id, keys used, special status]
  const CHECK = [
    ['Identity', 'Lock-up, horizontal + endorsed', 'logo'], ['Identity', 'Stacked lock-up', 'logo'], ['Identity', 'Mark (badge, iced cup, straw G)', 'logo'], ['Identity', 'Construction drawing', 'logo'],
    ['Identity', 'Naming rules with the parent brand', 'logo'], ['Identity', 'Roundel', 'logo', ['est']], ['Identity', 'Nitro seal + GioStars badge', 'logo'], ['Identity', 'Clear space, minimum size, misuse', 'logo'],
    ['Identity', 'Cold palette with print builds', 'color'], ['Identity', 'Drink layer colours', 'color'], ['Identity', 'Typography + cold type scale', 'type'], ['Identity', 'Cold icon set', 'icons-ch'],
    ['Identity', 'Graphic elements: steep clock, frost, ice, cascade', 'elements'], ['Identity', 'Badges, stamps, sticker sheet', 'elements'], ['Identity', 'Real cold bar + drink photos', 'imagery', [], 'shoot'],
    ['Voice', 'Line promise, story, personality', 'essence'], ['Voice', 'Taglines, CTAs, hashtags', 'voice'], ['Voice', 'Offer rules (GioStars + cold moment)', 'voice'], ['Voice', 'Line copy + bios', 'voice', ['web', 'hours']], ['Voice', 'Words we use / avoid', 'voice'],
    ['Packaging', 'Iced cup, flat + dome lid', 'packaging'], ['Packaging', 'Cup family 12 / 16 / 20 oz', 'packaging'], ['Packaging', 'The cold seven line-up', 'packaging'], ['Packaging', 'Name label + dieline', 'packaging'],
    ['Packaging', 'Take-home bottle 330 ml', 'packaging', ['bottle']], ['Packaging', 'Growler 1 L + refill tag', 'packaging', ['growler']], ['Packaging', 'Nitro can 250 ml', 'packaging'], ['Packaging', '4-cup insulated carrier', 'packaging'], ['Packaging', 'Lid seal + app label', 'packaging'], ['Packaging', 'Pulp coaster', 'packaging'],
    ['Cold bar', 'Back bar: tower, taps, batch board, fridge', 'store'], ['Cold bar', 'Where the cold bar lives', 'store', ['hours']], ['Cold bar', 'Menu boards (3 panels)', 'store', ['bottle', 'growler']], ['Cold bar', 'Nitro tap handle', 'store'], ['Cold bar', 'Batch chalkboard', 'store'], ['Cold bar', 'Fridge shelf talker', 'store', ['bottle']], ['Cold bar', 'Counter card: how cold brew is made', 'store'],
    ['Print', 'Cold menu (A4)', 'print', ['hours', 'web', 'bottle', 'growler']], ['Print', 'A5 launch flyer', 'print', ['web']], ['Print', 'Bottle neck tag', 'print'], ['Print', 'Growler refill card', 'print', ['growler']], ['Print', 'Receipt', 'print'], ['Print', 'Steep note (thank-you card)', 'print', ['ig']],
    ['Digital', '4 post templates', 'digital'], ['Digital', 'Stories (9:16) with safe zones', 'digital'], ['Digital', 'App cold menu', 'digital'], ['Digital', 'Cold category tile + highlight icon', 'digital'], ['Digital', 'Email', 'digital', ['web']], ['Digital', 'Link share image (OG)', 'digital', ['web']],
    ['Website', 'Cold UI kit (cards, badges, size picker)', 'ui'],
    ['Merch', 'Straw tumbler', 'merch'], ['Merch', 'Can glass', 'merch'], ['Merch', 'Insulated tote', 'merch'], ['Merch', 'Steel straw set', 'merch'], ['Merch', 'Cold bar apron', 'merch'], ['Merch', 'Staff name badge', 'merch', ['owner', 'role']],
    ['Motion', 'Ice drop, nitro cascade, steep clock', 'motion'], ['Motion', 'Timing tokens', 'motion'],
    ['Toolkit', 'CSS + JSON design tokens', 'toolkit'], ['Toolkit', 'SVG logo + artwork files', 'toolkit'],
  ];
  function renderCheck() {
    const t = $('#checkBody'); if (!t) return;
    let ready = 0, need = 0, other = 0;
    t.innerHTML = CHECK.map(([grp, item, sec, keys = [], kind]) => {
      const miss = keys.filter(isPH);
      let st;
      if (kind === 'shoot') { other++; st = '<span class="tag tag--todo">Shoot photos</span>'; }
      else if (miss.length) { need++; st = `<span class="tag tag--todo">Needs: ${miss.map((k) => esc(LABEL[k].toLowerCase())).join(', ')}</span>`; }
      else { ready++; st = '<span class="tag tag--ok">Design ready</span>'; }
      return `<tr><td>${esc(item)}</td><td>${grp}</td><td><a href="#${sec}" aria-label="View ${esc(item)}">View</a></td><td>${st}</td></tr>`;
    }).join('');
    const mc = $('#matCount'); if (mc) mc.textContent = CHECK.length;
    const s = $('#checkSum');
    if (s) s.innerHTML = `<div><b>${CHECK.length}</b>materials</div><div><b>${ready}</b>design ready</div><div><b>${need}</b>waiting on details</div><div><b>${other}</b>need photos</div>`;
  }

  // ---------- colour maths ----------
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cmyk = (h) => { const [r, g, b] = rgb(h).map((x) => x / 255), k = 1 - Math.max(r, g, b); if (k >= 1) return '0 0 0 100'; return [r, g, b].map((x) => Math.round(((1 - x - k) / (1 - k)) * 100)).concat(Math.round(k * 100)).join(' '); };
  const lum = (h) => { const c = rgb(h).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // [name, hex, use, print note, big, label colour, shared with the parent]
  const CORE = [
    ['Night Green', '#14332B', 'The cold bar colour: the badge, taps, boards, bottle labels', 'Pantone 5535 C (proof)', 1, '', 1],
    ['Frost', '#D7EBE2', 'Panels, menu cards, the dotted ring, ice light', '', 1, '#14332B', 1],
    ['Gio Green', '#0E6B4E', 'Straws, buttons, links: the thread back to the parent brand', 'Pantone 7726 C', 0, '', 1],
    ['Glass', '#F4F7F5', 'Page background, labels, receipts', '', 0, '#14332B'],
    ['Steep', '#2B1A12', 'Cold brew itself: nitro panels, dark posts, the nitro seal', ''],
    ['Cold Foam', '#EFE4D2', 'Sweet cream, coasters, warm panels next to Frost', '', 0, '#14332B'],
    ['Gold', '#C9A15B', 'The straw G, the steep clock arc, thin rules, stars', 'Flat ink, not foil', 0, '#14332B', 1],
    ['Cascade', '#B9824C', 'The nitro pour and caramel, small accents only', ''],
    ['Ice', '#B7D3CD', 'Ice edges, dashed safe lines, decoration only', '', 0, '#14332B'],
    ['Ink', '#161B1A', 'Body text on light', ''],
    ['Muted', '#56635F', 'Captions, notes and fine print', ''],
    ['Gold Ink', '#8A6A2E', 'When gold must be text: small labels on light', ''],
  ];
  function renderColors() {
    const s = $('#swatches');
    if (s) s.innerHTML = CORE.map(([n, h, use, pms, big, t, shared]) => `<button type="button" class="sw${big ? ' sw--big' : ''}" data-copy="${h}" style="--c:${h}${t ? ';--t:' + t : ''}" title="Copy ${h}">
      <span class="sw__chip">${n}${shared ? `<small class="sw__shared">shared with ${esc(val('parent'))}</small>` : ''}</span><span class="sw__info"><b>${h} <i>copy</i></b><code>RGB ${rgb(h).join(' ')}</code><code>CMYK ${cmyk(h)}</code>${pms ? `<code class="sw__print">${pms}</code>` : ''}<span>${use}</span></span></button>`).join('');
    const PAIRS = [['#FFFFFF', '#14332B', 'White on Night Green', 'Boards, labels, posts'], ['#D7EBE2', '#14332B', 'Frost on Night Green', '"Cold" in the reversed logo, notes'], ['#14332B', '#D7EBE2', 'Night Green on Frost', 'Menu cards, panels'], ['#14332B', '#F4F7F5', 'Night Green on Glass', 'Headlines and body'], ['#C9A15B', '#14332B', 'Gold on Night Green', 'Batch numbers, big labels'], ['#EFE4D2', '#2B1A12', 'Cold Foam on Steep', 'Nitro posts and the seal'], ['#FFFFFF', '#0E6B4E', 'White on Gio Green', 'Buttons'], ['#C9A15B', '#F4F7F5', 'Gold on Glass', 'Rules and the clock arc only'], ['#B7D3CD', '#F4F7F5', 'Ice on Glass', 'Decoration only, never text'], ['#56635F', '#F4F7F5', 'Muted on Glass', 'Captions and fine print']];
    const c = $('#contrast');
    if (c) c.innerHTML = `<thead><tr><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">Use it for</th></tr></thead><tbody>${PAIRS.map(([fg, bg, n, use]) => { const r = ratio(fg, bg); return `<tr><td><span class="pv" style="color:${fg};background:${bg}">Aa ${n}</span></td><td><b>${r.toFixed(1)}:1</b> ${r >= 4.5 ? '<span class="tag tag--ok">AA text</span>' : r >= 3 ? '<span class="tag">AA large</span>' : '<span class="tag tag--no">decoration only</span>'}</td><td>${use}</td></tr>`; }).join('')}</tbody>`;
    const ly = $('#layers');
    if (ly) ly.innerHTML = DK.map((k) => { const d = DRINKS[k]; return `<button type="button" class="layer" data-copy="${d.l.map((x) => x[0]).join(', ')}" title="Copy the layer colours"><i>${d.l.map(([h, sh]) => `<span style="flex:${sh};background:${h}"></span>`).join('')}</i><b>${esc(d.short || d.n)}</b><code>${d.l.map((x) => x[0]).join(' · ')}</code></button>`; }).join('');
  }

  // ---------- art registry ----------
  const ART = {
    cover: coverArt, cup: (el) => cup(el && el.dataset.name, (el && el.dataset.drink) || 'vanilla-sweet-cream'), bottle: (el) => bottle(undefined, el && el.dataset.kind), growler, can, coaster, stickers: sealSticker, carrier, cupFamily, lineup, labelDie,
    roundel: () => roundel(), nitroSeal, starBadge, construction, markStraw, steepClock, cascadeLine, scrawl: () => scrawl(false), scrawlAnim: () => scrawl(true), frostPanel,
    shotIce, shotCascade, shotTower, shotStreet, coldBar, tapHandle, batchBoard, fridgeTalker, ...ART_MERCH,
  };
  function renderArt() {
    $$('[data-art]').forEach((el) => {
      const fn = ART[el.dataset.art]; if (!fn) return;
      let target = el;
      if (el.classList.contains('stage')) { target = $(':scope > .art', el); if (!target) { target = document.createElement('div'); target.className = 'art'; el.prepend(target); } }
      target.innerHTML = fn(el);
    });
    const tiles = [['t-mint', cup('Migs', 'iced-spanish-latte')], ['t-house', steepClock()], ['t-esp', can()], ['t-crema', coaster()], ['t-house', markSVG('night')], ['t-mint', bottle()], ['t-paper', scrawl(false)], ['t-esp', nitroSeal()], ['t-mint', cup(val('custName'), 'nitro')]];
    $$('.ig__grid i').forEach((t, i) => { const [cls, art] = tiles[i] || tiles[0]; t.className = `g${i + 1} ${cls}`; t.innerHTML = art; });
    const app = $('#appList');
    if (app) app.innerHTML = ['cold-brew', 'vanilla-sweet-cream', 'nitro', 'iced-spanish-latte'].map((k) => `<div class="app__row"><span>${cup(val('custName'), k)}</span><div><b>${esc(DRINKS[k].n)}</b><small>${money(DRINKS[k].p)} · ${DRINKS[k].kcal} kcal</small></div><span class="app__plus" aria-hidden="true">+</span></div>`).join('');
  }

  // ---------- render ----------
  const listeners = [];
  function render(changed) {
    const sel = changed ? `[data-b="${changed}"]` : '[data-b]';
    $$(sel).forEach((el) => { const k = el.dataset.b; el.textContent = val(k); el.classList.toggle('is-ph', isPH(k)); });
    $$('[data-money]').forEach((el) => { const k = el.dataset.money; el.textContent = money(homePrice(k)); el.classList.toggle('is-ph', isPH(k.replace('+20', ''))); });
    if (!changed || changed === 'name' || changed === 'parent') $$('[data-lockup]').forEach((el) => { el.innerHTML = lockup(el.dataset.lockup, el.dataset.v); });
    renderArt();
    renderBoards();
    renderMenuPrint();
    renderCheck();
    if (!changed || PH.has(changed)) {
      const n = [...PH].filter(isPH).length;
      const c = $('#phCount'); if (c) c.textContent = n ? `${n} details are still placeholders. Replace them when you have them; every mockup updates.` : 'All details filled in. Every mockup uses your real details.';
      $$('.field').forEach((f) => { const tg = $('.tag', f); if (tg) tg.hidden = !isPH(f.dataset.k); });
    }
    if (!changed || changed === 'name') document.title = `${val('name')} Brand Kit`;
    if (!changed || changed === 'parent') renderColors();
    listeners.forEach((f) => f(changed));
  }
  function renderStatic() {
    $$('[data-mark]').forEach((el) => { el.innerHTML = markSVG(el.dataset.mark || 'color'); });
    $$('[data-li]').forEach((el) => { el.innerHTML = lineIcon(el.dataset.li); });
    root.style.setProperty('--ice-pat', icePattern());
    root.style.setProperty('--ice-pat-d', icePattern('#14332B', .14));
    // the shared stylesheet uses --beans / --beans-w for its pattern backgrounds: here they become ice
    root.style.setProperty('--beans', icePattern('#C9A15B', .32));
    root.style.setProperty('--beans-w', icePattern('#ffffff', .14));
    const icons = $('#icons');
    if (icons) icons.innerHTML = Object.keys(ICONS).map((k) => `<div class="ico${k === 'star' ? ' ico--star' : ''}">${lineIcon(k)}<span>${k}</span></div>`).join('');
    $$('[data-icon-count]').forEach((el) => { el.textContent = Object.keys(ICONS).length; });
    renderColors();
  }

  const form = $('#detailsForm');
  if (form) {
    const NUM = new Set(['steep', 'bottle', 'growler', 'batch']);
    form.innerHTML = FIELDS.map(([k, label, def, ph, type]) => `<label class="field" data-k="${k}"><span>${esc(label)}${ph ? ' <i class="tag tag--todo">placeholder</i>' : ''}</span><input name="${k}" type="${type || 'text'}" value="${esc(D[k] ?? def)}" placeholder="${esc(def)}" autocomplete="off" spellcheck="false"${type === 'tel' ? ' inputmode="tel"' : ''}${NUM.has(k) ? ' inputmode="numeric"' : ''}></label>`).join('');
    const timers = {};
    form.addEventListener('input', (e) => { const k = e.target.name; if (!k) return; D[k] = e.target.value; save(); clearTimeout(timers[k]); timers[k] = setTimeout(() => { render(GLOBAL_KEYS.has(k) ? undefined : k); }, 160); });
    form.addEventListener('submit', (e) => e.preventDefault());
  }
  $('#resetDetails')?.addEventListener('click', () => { Object.assign(D, DEF); save(); $$('input', form).forEach((i) => { i.value = DEF[i.name]; }); render(); toast('Details reset to the defaults'); });
  $('#showPh')?.addEventListener('click', (e) => { const on = document.body.classList.toggle('show-ph'); e.currentTarget.setAttribute('aria-pressed', on); });

  // ---------- downloads ----------
  function download(name, text, type = 'image/svg+xml') {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type }));
      a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      toast(`Saved ${name}`);
    } catch (e) { toast('This browser blocked the download'); }
  }
  const svgDoc = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
  const asDoc = (svg, w, h) => svg.replace(/^<svg /, `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
  const slugName = () => raw('name').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cold';
  const lockW = () => Math.round(84 + raw('name').length * 19.5);
  const LOGO_FILES = {
    'logo-horizontal': () => svgDoc(lockW(), 64, markAt(0, 0, 64, 'color') + wordSVG(76, 42, 30, C.night, C.green)),
    'logo-endorsed': () => { const w = Math.max(lockW(), 96 + val('parent').length * 9); return svgDoc(w, 72, markAt(0, 0, 64, 'color') + wordSVG(76, 36, 30, C.night, C.green) + T(77, 62, 18, C.green, `by ${val('parent')}`, { a: 'start', f: FH, w: 700 })); },
    'logo-on-night': () => svgDoc(lockW() + 24, 88, `<rect width="${lockW() + 24}" height="88" fill="${C.night}"/>` + markAt(12, 12, 64, 'night') + wordSVG(88, 54, 30, '#fff', C.frost)),
    'logo-stacked': () => { const w = Math.max(220, raw('name').length * 22); return svgDoc(w, 170, markAt(w / 2 - 48, 0, 96, 'color') + wordSVG(w / 2, 152, 36, C.night, C.green, 'middle')); },
    mark: () => svgDoc(64, 64, markInner('color')),
    'mark-mono': () => svgDoc(64, 64, markInner('mono')),
    'cold-tile': () => svgDoc(1024, 1024, `<rect width="1024" height="1024" rx="228" fill="${C.frost}"/>${markAt(152, 152, 720, 'color')}`),
    roundel: () => asDoc(roundel(), 400, 400),
    'nitro-seal': () => asDoc(nitroSeal(), 400, 400),
    'steep-clock': () => asDoc(steepClock(), 400, 400),
    coaster: () => asDoc(coaster(), 900, 900),
    'name-label-dieline': () => asDoc(labelDie(), 2000, 680),
  };
  const TOKENS = {
    color: { night: '#14332B', frost: '#D7EBE2', green: '#0E6B4E', glass: '#F4F7F5', steep: '#2B1A12', foam: '#EFE4D2', gold: '#C9A15B', cascade: '#B9824C', ice: '#B7D3CD', ink: '#161B1A', muted: '#56635F', 'gold-ink': '#8A6A2E', white: '#FFFFFF' },
    font: { title: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif", hand: "'Caveat', cursive" },
    radius: { pill: '999px', card: '24px', label: '10px', input: '14px' },
    space: { 1: '4px', 2: '8px', 3: '16px', 4: '24px', 5: '40px', 6: '64px' },
    motion: { ease: 'cubic-bezier(.22, 1, .36, 1)', 'ease-drop': 'cubic-bezier(.3, 0, .2, 1)', 'ease-pour': 'cubic-bezier(.45, 0, .55, 1)', fast: '180ms', base: '320ms', slow: '900ms', cascade: '2400ms' },
  };
  const tokensCSS = () => `/* ${val('name')} design tokens (the cold line of ${val('parent')}) */\n:root {\n${Object.entries(TOKENS).map(([g, o]) => Object.entries(o).map(([k, v]) => `  --${g === 'color' ? 'cold-' : g + '-'}${k}: ${v};`).join('\n')).join('\n')}\n}\n`;
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dl]');
    if (d) {
      const k = d.dataset.dl, s = slugName();
      if (k === 'tokens-css') return download(`${s}-tokens.css`, tokensCSS(), 'text/css');
      if (k === 'tokens-json') return download(`${s}-tokens.json`, JSON.stringify({ brand: val('name'), parent: val('parent'), tagline: val('tagline'), ...TOKENS }, null, 2), 'application/json');
      if (k === 'details-json') return download(`${s}-details.json`, JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f[0], raw(f[0])])), null, 2), 'application/json');
      if (k === 'all-logos') { Object.keys(LOGO_FILES).forEach((n, i) => setTimeout(() => download(`${s}-${n}.svg`, LOGO_FILES[n]()), i * 260)); return; }
      if (LOGO_FILES[k]) return download(`${s}-${k}.svg`, LOGO_FILES[k]());
    }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const txt = cp.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(`Copied ${txt}`), () => toast(txt));
    }
    const pl = e.target.closest('[data-play]');
    if (pl) play($(pl.dataset.play));
    const z = e.target.closest('.zoom-btn');
    if (z) openZoom(z.closest('figure'));
  });

  let tt;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = ''; t.classList.add('on');
    requestAnimationFrame(() => { t.textContent = msg; });
    clearTimeout(tt); tt = setTimeout(() => { t.classList.remove('on'); }, 2400);
  }

  // ---------- motion: demos, a page-wide pause, nothing loops offscreen ----------
  function play(el) { if (!el) return; el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); }
  const motionBtn = $('#motionToggle');
  function setStill(on) {
    document.body.classList.toggle('is-still', on);
    if (motionBtn) { motionBtn.setAttribute('aria-pressed', on); const t = $('.btn__t', motionBtn); if (t) t.textContent = on ? 'Play motion' : 'Pause motion'; motionBtn.setAttribute('aria-label', on ? 'Play motion' : 'Pause motion'); }
    try { localStorage.setItem('gio-brand-still', on ? '1' : '0'); } catch (e) { /* ignore */ }
  }
  motionBtn?.addEventListener('click', () => setStill(!document.body.classList.contains('is-still')));
  try { if (localStorage.getItem('gio-brand-still') === '1') setStill(true); } catch (e) { /* ignore */ }
  if ('IntersectionObserver' in window) {
    const offIO = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting)), { rootMargin: '200px 0px' });
    $$('.chap, .cover').forEach((s) => offIO.observe(s));
  }

  // ---------- enlarge a mockup ----------
  const zoomDlg = $('#zoom');
  function openZoom(fig) {
    if (!zoomDlg || !fig || !zoomDlg.showModal) return;
    const stage = $('.stage', fig), cap = $('figcaption', fig);
    const body = $('.zoom__body', zoomDlg);
    body.innerHTML = '';
    const clone = stage.cloneNode(true);
    $$('.zoom-btn', clone).forEach((b) => b.remove());
    $$('[id]', clone).forEach((n) => n.removeAttribute('id'));
    const r = stage.offsetWidth / Math.max(1, stage.offsetHeight);
    const fit = Math.min(innerWidth * 0.9, 1200, innerHeight * 0.74 * r);
    zoomDlg.setAttribute('aria-label', `Enlarged: ${$('figcaption b', fig)?.textContent || 'mockup'}`);
    Object.assign(clone.style, { width: `${fit}px`, height: `${fit / r}px`, aspectRatio: 'auto' });
    body.appendChild(clone);
    $('.zoom__cap', zoomDlg).innerHTML = cap ? cap.innerHTML : '';
    zoomDlg.showModal();
  }
  zoomDlg?.addEventListener('click', (e) => { if (e.target === zoomDlg || e.target.closest('.zoom__x')) zoomDlg.close(); });

  // ---------- contents: highlight the chapter on screen + reading progress ----------
  const links = $$('.toc a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          const on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('is-on', on);
          if (on) { a.setAttribute('aria-current', 'true'); const toc = a.closest('.toc'); if (toc && toc.scrollWidth > toc.clientWidth) toc.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' }); } else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.chap, #top').forEach((s) => io.observe(s));
  }
  const bar = $('.progress i');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking || !bar) return; ticking = true;
    requestAnimationFrame(() => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; ticking = false; });
  }, { passive: true });
  const topBar = $('.top');
  if (topBar && 'ResizeObserver' in window) new ResizeObserver(() => root.style.setProperty('--top-h', `${topBar.offsetHeight}px`)).observe(topBar);

  window.gioCold = { val, words, DRINKS, money, toast, onChange: (fn) => listeners.push(fn) };

  renderStatic();
  render();
  // zoom buttons go on after the first render so art redraws never remove them
  $$('.stage').forEach((st) => {
    const fig = st.closest('figure'); if (!fig) return;
    const title = $('figcaption b', fig)?.textContent || 'mockup';
    st.insertAdjacentHTML('beforeend', `<button type="button" class="zoom-btn" aria-label="Enlarge ${esc(title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>`);
  });
})();
