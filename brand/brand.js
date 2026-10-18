/* GioCoffee brand kit v2: live details, data-driven chapters, downloads, demos.
   Classic script (no modules) so the kit opens straight from the folder (file://).
   DATA below is copied from js/data.js and css/style.css: when the site changes, update it here. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
  const art = (id, sm) => `../assets/3d/${id}${sm ? '-sm' : ''}.webp`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('gio-kit:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('gio-kit:' + k, JSON.stringify(v)); } catch (e) { /* private window: keep in memory only */ } }
  };

  /* =========================================================
     DATA (from js/data.js)
     ========================================================= */
  const CATS = [
    { id: 'seasonal', name: '‑ber months', hand: 'here till December' }, { id: 'hot', name: 'Hot coffee' }, { id: 'cold', name: 'Cold coffee' },
    { id: 'frappe', name: 'Frappés' }, { id: 'tea', name: 'Tea & more' }, { id: 'food', name: 'Bakery' }, { id: 'merch', name: 'Beans & merch' }
  ];
  // [id, cat, name, price, kcal, caffeine, tag, kind, open?, description]
  const ITEMS = [
    ['maple-oat-latte', 'seasonal', 'Muscovado Oat Latte', 215, 230, 150, 'New', 'hot', 0, 'Blonde espresso, steamed oat milk and Antique muscovado syrup, finished with a toasted oat crumble.'],
    ['pumpkin-cream-cold-brew', 'seasonal', 'Pumpkin Cream Cold Brew', 225, 250, 185, 'Fan favourite', 'iced', 0, 'Slow-steeped cold brew under a cap of kalabasa (pumpkin) cold foam and a dust of cinnamon.'],
    ['salted-caramel-frappe', 'seasonal', 'Salted Caramel Frappé', 235, 410, 95, 'New', 'frappe', 0, 'Coffee blended with caramel and ice, whipped cream and a sea-salt caramel drizzle.'],
    ['toasted-hazelnut-mocha', 'seasonal', 'Toasted Hazelnut Mocha', 220, 340, 175, '', 'hot', 0, 'Espresso, dark Davao cocoa and roasted hazelnut, in the first red cup of the season.'],
    ['americano', 'hot', 'Caffè Americano', 140, 15, 225, '', 'hot', 0, 'Espresso shots topped with hot water for a light layer of crema.'],
    ['cafe-latte', 'hot', 'Caffè Latte', 165, 190, 150, '', 'mug', 0, 'Rich espresso and steamed milk with a thin layer of foam.'],
    ['cappuccino', 'hot', 'Cappuccino', 165, 140, 150, '', 'mug', 0, 'Espresso under a deep, airy layer of milk foam.'],
    ['flat-white', 'hot', 'Flat White', 175, 170, 195, 'Barista pick', 'mug', 0, 'Two ristretto shots and silky whole milk, finished with a tulip of latte art.'],
    ['caramel-macchiato', 'hot', 'Caramel Macchiato', 195, 250, 150, 'Best seller', 'hot', 1, 'Vanilla milk marked with espresso and a cross-hatch of buttery caramel.'],
    ['spanish-latte', 'hot', 'Spanish Latte', 185, 260, 150, '', 'hot', 1, 'Espresso and condensed milk, the way Manila likes it: smooth and sweet.'],
    ['caffe-mocha', 'hot', 'Caffè Mocha', 190, 360, 175, '', 'hot', 1, 'Espresso, bittersweet cocoa and steamed milk under whipped cream.'],
    ['hot-chocolate', 'hot', 'Signature Hot Chocolate', 175, 380, 25, '', 'mug', 0, 'Davao cacao, steamed milk and mini marshmallows. No coffee, all comfort.'],
    ['iced-americano', 'cold', 'Iced Americano', 150, 15, 225, '', 'iced', 0, 'Espresso shots over cold water and ice.'],
    ['iced-latte', 'cold', 'Iced Caffè Latte', 175, 130, 150, '', 'iced', 0, 'Espresso poured over milk and ice.'],
    ['iced-spanish-latte', 'cold', 'Iced Spanish Latte', 195, 240, 150, 'Best seller', 'iced', 0, 'Condensed milk, cold milk and espresso, layered over ice.'],
    ['cold-brew', 'cold', 'Cold Brew', 170, 5, 205, '', 'iced', 0, 'Steeped for 20 hours for a super-smooth, chocolatey cup.'],
    ['vanilla-sweet-cream-cold-brew', 'cold', 'Vanilla Sweet Cream Cold Brew', 195, 110, 185, '', 'iced', 0, 'Cold brew with a float of house-made vanilla sweet cream.'],
    ['iced-caramel-macchiato', 'cold', 'Iced Caramel Macchiato', 205, 250, 150, '', 'iced', 0, 'Vanilla milk, ice, espresso shots and a caramel cross-hatch.'],
    ['nitro-cold-brew', 'cold', 'Nitro Cold Brew', 210, 5, 265, '', 'iced', 0, 'Cold brew infused with nitrogen for a velvety, cascading pour.'],
    ['java-chip-frappe', 'frappe', 'Java Chip Frappé', 225, 440, 105, 'Best seller', 'frappe', 0, 'Coffee, mocha sauce and chocolate chips blended with ice, under whipped cream.'],
    ['caramel-frappe', 'frappe', 'Caramel Frappé', 215, 380, 90, '', 'frappe', 0, 'Coffee, caramel syrup, milk and ice, blended and topped with caramel.'],
    ['mocha-frappe', 'frappe', 'Mocha Frappé', 215, 370, 100, '', 'frappe', 0, 'Coffee, cocoa and milk blended with ice.'],
    ['matcha-cream-frappe', 'frappe', 'Matcha Cream Frappé', 220, 390, 70, '', 'frappe', 0, 'Uji matcha blended with milk and ice, whipped cream on top.'],
    ['strawberry-cream-frappe', 'frappe', 'Strawberry Cream Frappé', 215, 360, 0, '', 'frappe', 0, 'Strawberry purée, milk and ice, blended pink and creamy. Coffee-free.'],
    ['mango-graham-frappe', 'frappe', 'Mango Graham Frappé', 225, 400, 0, 'Only in PH', 'frappe', 0, 'Guimaras mango, cream and crushed graham. A Filipino classic, blended.'],
    ['iced-matcha-latte', 'tea', 'Iced Matcha Latte', 195, 200, 80, '', 'iced', 0, 'Stone-ground matcha shaken with milk over ice.'],
    ['ube-latte', 'tea', 'Iced Ube Latte', 195, 230, 0, 'Only in PH', 'iced', 0, 'Purple yam, milk and ice with a swirl of ube halaya. Coffee-free.'],
    ['chai-latte', 'tea', 'Chai Tea Latte', 175, 240, 95, '', 'hot', 1, 'Black tea with cinnamon, clove and cardamom, steamed with milk.'],
    ['calamansi-refresher', 'tea', 'Calamansi Refresher', 165, 90, 45, '', 'iced', 0, 'Green coffee extract, calamansi and honey, shaken with ice.'],
    ['butter-croissant', 'food', 'Butter Croissant', 115, 260, null, '', 'croissant', 0, '27 layers of French butter, baked golden every morning.'],
    ['ensaymada', 'food', 'Ube Ensaymada', 125, 320, null, 'Only in PH', 'ensaymada', 0, 'Soft brioche coil with ube butter, sugar and grated queso.'],
    ['blueberry-muffin', 'food', 'Blueberry Muffin', 120, 360, null, '', 'muffin', 0, 'Buttermilk muffin, full of blueberries, with a crunchy sugar top.'],
    ['choc-chunk-cookie', 'food', 'Double Chocolate Cookie', 95, 340, null, '', 'cookie', 0, 'Dark cocoa dough loaded with 64% chocolate chunks and sea salt.'],
    ['red-velvet-slice', 'food', 'Red Velvet Slice', 165, 420, null, '', 'cake', 0, 'Three layers of red velvet with cream-cheese frosting.'],
    ['tiramisu-slice', 'food', 'Espresso Tiramisu', 175, 390, null, '', 'cake', 0, 'Savoiardi soaked in our espresso, mascarpone and cocoa.'],
    ['benguet-beans', 'merch', 'Benguet Medium Roast 250 g', 590, null, null, 'Single origin', 'beans', 0, 'Highland arabica from Atok, Benguet. Notes of brown sugar, citrus and cocoa.'],
    ['sagada-dark', 'merch', 'Sagada Dark Roast 250 g', 620, null, null, '', 'beans', 0, 'Mountain Province arabica, roasted dark for a bold, smoky cup.'],
    ['blonde-espresso-beans', 'merch', 'Blonde Espresso Roast 250 g', 560, null, null, '', 'beans', 0, 'Lightly roasted for a sweet, mellow espresso.'],
    ['gio-tumbler', 'merch', 'Gio Steel Tumbler 16 oz', 1250, null, null, '+20 ★ bonus', 'tumbler', 0, 'Double-wall steel, keeps drinks hot 6 h or cold 12 h. Bring it in for ₱10 off.'],
    ['gio-tumbler-crema', 'merch', 'Crema Tumbler 16 oz', 1250, null, null, '', 'tumbler', 0, 'The same tumbler, finished in soft crema with a gold badge.'],
    ['gio-mug', 'merch', 'Stoneware Mug 12 oz', 690, null, null, '', 'ceramic', 0, 'Hand-glazed in Laguna, with the Gio badge on the side.']
  ].map(([id, cat, name, price, kcal, caf, tag, kind, open, desc]) => ({ id, cat, name, price, kcal, caf, tag, kind, open, desc }));
  const SIZES = [['Piccolo', '8 oz', -20], ['Medio', '12 oz', 0], ['Grande', '16 oz', 25], ['Gigante', '20 oz', 45]];
  const MILKS = [['Whole', 0, '#f4ebdc'], ['Oat', 35, '#ead6b4'], ['Almond', 35, '#efdcc2'], ['Soy', 30, '#f1e4c8'], ['Skim', 0, '#f7f3ec']];
  const SYRUPS = [['Vanilla', 25, '#f1d9a8'], ['Caramel', 25, '#c9873c'], ['Hazelnut', 25, '#9a6a40'], ['Muscovado', 30, '#8a4f22'], ['Ube', 30, '#9b7bc4']];
  const STORES = [
    { id: 'bgc', name: 'GioCoffee Reserve · 5th Ave', short: 'Reserve · 5th Ave', area: 'Bonifacio Global City', addr: '5th Avenue corner 26th Street, BGC, Taguig', open: [6, 23], wk: [7, 23], tags: ['Reserve slow bar', 'Drive-thru', 'Outdoor seats'], phone: '+63 2 8000 1111', wait: 6 },
    { id: 'uptown', name: 'GioCoffee Uptown', short: 'Uptown', area: 'Bonifacio Global City', addr: 'Uptown Parade, 9th Avenue, BGC, Taguig', open: [0, 24], wk: [0, 24], tags: ['Outdoor seats'], phone: '+63 2 8000 4444', wait: 9 },
    { id: 'legazpi', name: 'GioCoffee Legazpi Village', short: 'Legazpi Village', area: 'Makati', addr: 'Rufino Street, Legazpi Village, Makati', open: [7, 21], wk: [8, 20], tags: ['Quiet room'], phone: '+63 2 8000 2222', wait: 4 },
    { id: 'rockwell', name: 'GioCoffee Rockwell', short: 'Rockwell', area: 'Makati', addr: 'Power Plant Mall, Rockwell Center, Makati', open: [10, 22], wk: [9, 22], tags: ['Pet friendly', 'Outdoor seats'], phone: '+63 2 8000 3333', wait: 5 }
  ];
  const REWARDS = [
    { stars: 25, name: 'Customise it', desc: 'An extra espresso shot or a size upgrade, on us.', item: 'americano' },
    { stars: 100, name: 'Any handcrafted drink', desc: 'Any size, any drink on the menu, made for you.', item: 'iced-spanish-latte' },
    { stars: 150, name: 'Bakery treat + drink', desc: 'A croissant or ensaymada with any drink.', item: 'butter-croissant' },
    { stars: 200, name: 'Beans or merch', desc: 'A 250 g bag of beans or a stoneware mug to take home.', item: 'benguet-beans' }
  ];
  const LEVELS = [
    { id: 'green', name: 'Green', from: 0, to: 999, rate: 2, card: 'linear-gradient(135deg,#0e6b4e,#0a4d38)', perks: ['2 ★ for every ₱50', 'Free birthday drink', 'Free syrup or milk swap, once a day'] },
    { id: 'gold', name: 'Gold', from: 1000, to: 2999, rate: 3, card: 'linear-gradient(135deg,#d9b56f,#a77d34)', perks: ['3 ★ for every ₱50', 'A free size upgrade every month', 'New drinks a week early', 'Double-star Tuesdays'] },
    { id: 'reserve', name: 'Reserve', from: 3000, to: null, rate: 4, card: 'linear-gradient(135deg,#3b2418,#140b06)', perks: ['4 ★ for every ₱50', 'Slow-bar tastings at 5th Ave', 'Your own engraved tumbler', 'Priority order-ahead'] }
  ];
  const fmtH = x => x === 24 || x === 0 ? 'midnight' : `${x % 12 || 12} ${x < 12 ? 'am' : 'pm'}`;
  const hoursText = h => h[0] === 0 && h[1] === 24 ? 'Open 24 hours' : `${fmtH(h[0])} – ${fmtH(h[1])}`;

  /* tokens: css/style.css :root, verbatim */
  const ROOT_CSS = `:root{
  --green:#0e6b4e; --green-d:#0a4d38; --house:#14332b; --house-2:#1d4337; --mint:#d7ebe2; --mint-2:#eaf5f0;
  --crema:#f3ebdd; --paper:#fbf8f2; --gold:#c9a15b; --gold-l:#f2ddb0; --gold-ink:#7f5b1f; --espresso:#3b2418; --caramel:#b8742f;
  --ink:#1b1f1d; --muted:#55625d; --line:rgba(20,51,43,.13); --line-2:rgba(20,51,43,.22); --white:#fff;
  --head:'Plus Jakarta Sans',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif; --hand:'Caveat',cursive;
  --r:22px; --r-sm:14px; --pill:999px;
  --sh-1:0 1px 2px rgba(20,51,43,.06),0 6px 16px -6px rgba(20,51,43,.12);
  --sh-2:0 2px 6px rgba(20,51,43,.06),0 24px 48px -18px rgba(20,51,43,.28);
  --ease-out:cubic-bezier(.23,1,.32,1); --ease-io:cubic-bezier(.77,0,.175,1); --ease-drawer:cubic-bezier(.32,.72,0,1);
  --wrap:1240px; --hdr:76px;
}`;
  const SWATCH = [
    ['green', 'Gio Green', '#0e6b4e', 'Buttons, the badge, links, "Coffee" in the wordmark'],
    ['green-d', 'Deep Green', '#0a4d38', 'Button hover, pill text on Mint'],
    ['house', 'House Green', '#14332b', 'Headings, dark heroes, rewards, footer type'],
    ['house-2', 'House 2', '#1d4337', 'Cards on House Green (the calculator)'],
    ['mint', 'Mint', '#d7ebe2', 'Pills, store icon tiles, steps', '#14332b'],
    ['mint-2', 'Mint 2', '#eaf5f0', 'Mint sections with the leaf print, hovers', '#14332b'],
    ['crema', 'Crema', '#f3ebdd', 'Crema sections with coffee rings', '#14332b'],
    ['paper', 'Paper', '#fbf8f2', 'The page itself, drawers, popups', '#14332b'],
    ['gold', 'Gold', '#c9a15b', 'Graphics only: the steam G, the band, focus ring, progress', '#14332b'],
    ['gold-l', 'Gold Light', '#f2ddb0', 'Gold on green and dark: accents, stars, stickers, Join', '#14332b'],
    ['gold-ink', 'Gold Ink', '#7f5b1f', 'Gold text on light: stars to earn, hand notes'],
    ['espresso', 'Espresso', '#3b2418', 'Shot beans, the roast, Reserve card'],
    ['caramel', 'Caramel', '#b8742f', 'Coffee routes, kraft, marketing chapter numbers'],
    ['ink', 'Ink', '#1b1f1d', 'Body text'],
    ['muted', 'Muted', '#55625d', 'Ledes, captions, labels (5.9:1 on Paper)'],
    ['white', 'White', '#ffffff', 'Cards, type on dark', '#14332b']
  ];

  /* =========================================================
     YOUR DETAILS
     ========================================================= */
  // [key, label, default, isPlaceholder, maxlength]
  const FIELDS = [
    ['name', 'Brand name', 'GioCoffee', 0, 24],
    ['tagline', 'Tagline', 'Brewed for you, by name.', 0, 60],
    ['custName', 'Name on the sample cups', 'Bea', 0, 12],
    ['web', 'Website', 'hellogiovanni07-commits.github.io/giocoffee', 0, 60],
    ['ig', 'Instagram / TikTok handle', '@giocoffee.ph', 1, 40],
    ['email', 'Customer email', 'hello@giocoffee.example', 1, 60],
    ['season', 'Campaign season (year)', '2026', 0, 4]
  ];
  const DEF = Object.fromEntries(FIELDS.map(f => [f[0], f[2]]));
  const PH = new Set(FIELDS.filter(f => f[3]).map(f => f[0]));
  const D = Object.assign({}, DEF, store.get('details', {}));
  const val = k => (String(D[k] ?? '').trim() || DEF[k]);
  const split = () => { const n = val('name'); if (/\s/.test(n)) { const p = n.split(/\s+/); return [p[0], ' ' + p.slice(1).join(' ')]; } const m = n.match(/^(.+?[a-z])([A-Z].*)$/); return m ? [m[1], m[2]] : [n, '']; };
  const isPH = k => PH.has(k) && val(k) === DEF[k];

  function bind() {
    const [a, b] = split();
    $$('[data-b]').forEach(el => {
      const k = el.dataset.b;
      const v = k === 'nameA' ? a : k === 'nameB' ? b : val(k);
      if (el.tagName === 'text' || el.textContent !== v) el.textContent = v;
      el.classList.toggle('is-ph', isPH(k));
    });
    $$('.field').forEach(f => f.classList.toggle('is-ph', isPH(f.dataset.k)));
    $$('[data-logo]').forEach(el => { el.innerHTML = logoSVG(el.dataset.logo === 'dark'); });
    const n = FIELDS.filter(f => isPH(f[0])).length;
    const pc = $('#phCount'); if (pc) pc.textContent = n ? `${n} placeholder${n === 1 ? '' : 's'} still to replace.` : 'Every detail is filled in.';
  }
  function detailsForm() {
    const form = $('#detailsForm'); if (!form) return;
    form.innerHTML = FIELDS.map(([k, label, def, ph, max]) => `<label class="field" data-k="${k}"><span>${esc(label)}${ph ? ' <i class="tag tag--todo">placeholder</i>' : ''}</span><input name="${k}" value="${esc(D[k] ?? def)}" placeholder="${esc(def)}" maxlength="${max}" autocomplete="off" spellcheck="false"></label>`).join('');
    form.addEventListener('input', e => { const i = e.target; if (!i.name) return; D[i.name] = i.value; store.set('details', D); bind(); syncNameInputs(i); });
    form.addEventListener('submit', e => e.preventDefault());
    $('#resetDetails').addEventListener('click', () => { Object.keys(D).forEach(k => delete D[k]); Object.assign(D, DEF); store.set('details', D); $$('input', form).forEach(i => { i.value = D[i.name]; }); bind(); syncNameInputs(); toast('Details reset to the defaults'); });
    $('#showPh').addEventListener('click', e => { const on = !html.classList.contains('ph-on'); html.classList.toggle('ph-on', on); e.currentTarget.setAttribute('aria-pressed', on); });
  }
  function syncNameInputs(from) {
    $$('[data-name-input]').forEach(i => { if (i !== from) i.value = val('custName'); });
    const f = $('#detailsForm [name=custName]'); if (f && f !== from) f.value = D.custName;
  }
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-name-input]')) return;
    D.custName = e.target.value; store.set('details', D); bind(); syncNameInputs(e.target);
  });

  /* =========================================================
     LOGO + MARK (geometry identical to assets/mark.svg)
     ========================================================= */
  const G_PATH = 'M38.2 10.6a7 7 0 1 0 1.9 7.6H34';
  const BODY = 'M21 31h22l-2.6 18.4a3 3 0 0 1-3 2.6H26.6a3 3 0 0 1-3-2.6z';
  const BAND = 'M22.1 36.4h19.8l-.9 6.6H23z';
  const markInner = v => {
    if (v === 'member') return `<circle cx="32" cy="32" r="31" fill="#fff" fill-opacity=".14"/><circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="${G_PATH}" fill="none" stroke="#f2ddb0" stroke-width="2.6" stroke-linecap="round"/><rect x="19" y="25" width="26" height="4.6" rx="2.3" fill="currentColor"/><path d="${BODY}" fill="currentColor"/><path d="${BAND}" fill="#f2ddb0"/>`;
    const [disc, ring, gold, cup, dot] = v === 'mono' ? ['#14332B', '#fff', '#fff', '#fff', '#fff'] : ['#0E6B4E', '#fff', '#C9A15B', '#fff', '#fff'];
    const band = v === 'mono' ? '#14332B' : gold;
    return `<circle cx="32" cy="32" r="31" fill="${disc}"/><circle cx="32" cy="32" r="27" fill="none" stroke="${ring}" stroke-width="1.6"/><path d="${G_PATH}" fill="none" stroke="${gold}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="25" width="26" height="4.6" rx="2.3" fill="${cup}"/><path d="${BODY}" fill="${cup}"/><path d="${BAND}" fill="${band}"/><circle cx="32" cy="39.7" r="2.1" fill="${dot}"/>`;
  };
  const markSVG = (v, attrs = 'aria-hidden="true"') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" ${attrs}>${markInner(v)}</svg>`;
  let measure = null;
  function wordWidth(a, b) {
    try {
      measure = measure || document.createElement('canvas').getContext('2d');
      measure.font = '800 30px "Plus Jakarta Sans"'; let w = measure.measureText(a).width;
      measure.font = '600 30px "Plus Jakarta Sans"'; w += measure.measureText(b).width;
      return w - (a.length + b.length) * .8;
    } catch (e) { return (a.length + b.length) * 17; }
  }
  function logoSVG(dark, standalone) {
    const [a, b] = split(), w = Math.max(160, Math.ceil(76 + wordWidth(a, b) + 4));
    const fa = dark ? '#FFFFFF' : '#14332B', fb = dark ? '#F2DDB0' : '#0E6B4E';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 64" role="img" aria-label="${esc(val('name'))}">${markInner('full')}<text x="76" y="42" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="30" font-weight="800" fill="${fa}" letter-spacing="-0.8">${esc(a)}<tspan fill="${fb}" font-weight="600">${esc(b)}</tspan></text></svg>`;
  }
  function marks() { $$('[data-mark]').forEach(el => { el.innerHTML = markSVG(el.dataset.mark || 'full'); }); }
  function blueprint() {
    const el = $('#blueprint'); if (!el) return;
    let g = ''; for (let i = 0; i <= 64; i += 4) g += `<path d="M${i} 0V64M0 ${i}H64" stroke="#7cd6aa" stroke-opacity="${i % 16 ? .14 : .3}" stroke-width=".25"/>`;
    el.innerHTML = `<svg viewBox="-6 -6 76 76" aria-hidden="true">${g}<g opacity=".95">${markInner('full')}</g>
      <g fill="none" stroke="#f2ddb0" stroke-width=".35" stroke-dasharray="1 1"><circle cx="32" cy="32" r="31"/><circle cx="32" cy="32" r="27"/><path d="M32 -4V68M-4 32H68"/><rect x="19" y="25" width="26" height="4.6"/><path d="M21 31V52M43 31V52"/></g>
      <g font-family="Inter,Arial" font-size="2.6" font-weight="700" fill="#f2ddb0"><text x="50" y="5">r31</text><text x="51" y="13">r27</text><text x="46" y="24">26 × 4.6</text><text x="45" y="41">band 6.6</text><text x="40" y="9">G 2.6</text></g></svg>`;
  }

  /* =========================================================
     RENDERED CHAPTERS
     ========================================================= */
  function swatches() {
    const el = $('#swatches'); if (!el) return;
    el.innerHTML = SWATCH.map(([tok, name, hex, use, t]) => `<button type="button" class="sw-card" data-copy="${hex}" aria-label="Copy ${name} ${hex}"><span class="sw-card__chip" style="--c:${hex};${t ? '--t:' + t : ''}">${hex.toUpperCase()}</span><span class="sw-card__b"><b>${name}</b><code>--${tok}</code><small>${use}</small><small>RGB ${rgb(hex).join(' ')}</small></span></button>`).join('');
  }
  const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
  function contrast() {
    const el = $('#contrast'); if (!el) return;
    const P = [
      ['#1b1f1d', '#fbf8f2', 'Ink on Paper', 'Body text'], ['#14332b', '#fbf8f2', 'House on Paper', 'Headings'], ['#55625d', '#fbf8f2', 'Muted on Paper', 'Ledes, captions'],
      ['#55625d', '#ffffff', 'Muted on White', 'Card descriptions'], ['#55625d', '#f3ebdd', 'Muted on Crema', 'Text in Crema sections'], ['#7f5b1f', '#fbf8f2', 'Gold Ink on Paper', 'Hand notes, "You\'ll earn"'],
      ['#7f5b1f', '#f6ead2', 'Gold Ink on gold pill', 'New, Best seller tags'], ['#0a4d38', '#d7ebe2', 'Deep Green on Mint', 'Pills, step numbers'], ['#ffffff', '#0e6b4e', 'White on Gio Green', 'Buttons, newsletter band'],
      ['#ffffff', '#14332b', 'White on House', 'Dark heroes, rewards'], ['#f2ddb0', '#14332b', 'Gold Light on House', 'Accent word, stars on dark'], ['#f2ddb0', '#0e6b4e', 'Gold Light on Gio Green', 'Hero accent word'],
      ['#14332b', '#f2ddb0', 'House on Gold Light', 'Join GioStars, stickers'], ['#cfe0d8', '#14332b', 'Mist on House', 'Ledes on dark'], ['#9fbcb0', '#1d4337', 'Sage on House 2', 'Calculator fine print'],
      ['#ffffff', '#3b2418', 'White on Espresso', 'Reserve card'], ['#0e6b4e', '#fbf8f2', 'Gio Green on Paper', 'Links, "Coffee"'], ['#a3291c', '#fbf8f2', 'Error red on Paper', 'Form errors'],
      ['#ffffff', '#c8622b', 'White on Kalabasa', 'Pumpkin card'], ['#ffffff', '#7d1d26', 'White on Red cup', 'Hazelnut card, red cup hero'], ['#14332b', '#f1dcc0', 'House on Caramel cream', 'Salted caramel card'],
      ['#c9a15b', '#fbf8f2', 'Gold on Paper', 'Never as text']
    ];
    const verdict = r => r >= 7 ? ['AAA', 'v-aaa'] : r >= 4.5 ? ['AA', 'v-aa'] : r >= 3 ? ['Large text only', 'v-large'] : ['Fails, graphics only', 'v-fail'];
    el.innerHTML = `<thead><tr><th scope="col">Pair</th><th scope="col">Sample</th><th scope="col">Ratio</th><th scope="col">WCAG</th><th scope="col">On the site</th></tr></thead><tbody>${P.map(([f, b, n, w]) => { const r = ratio(f, b), [v, c] = verdict(r); return `<tr><td><b>${n}</b><br><small class="muted">${f} on ${b}</small></td><td><span class="cpair" style="color:${f};background:${b}">Aa ₱215 ★</span></td><td><b>${r.toFixed(2)}:1</b></td><td><span class="verdict ${c}">${v}</span></td><td>${w}</td></tr>`; }).join('')}</tbody>`;
  }
  function drinkCols() {
    const el = $('#drinkCols'); if (!el) return;
    const C = [
      ['#0e6b4e', 'maple-oat-latte', 'Muscovado hero', 'Home hero pick'], ['#a84d1c', 'pumpkin-cream-cold-brew', 'Pumpkin hero', 'Home hero pick'], ['#5a3420', 'salted-caramel-frappe', 'Salted caramel hero', 'Home hero pick'],
      ['#7d1d26', 'toasted-hazelnut-mocha', 'Red cup', 'Hero pick, ‑ber card'], ['#c8622b', 'pumpkin-cream-cold-brew', 'Kalabasa card', '‑ber card, gift card'], ['#f1dcc0', 'salted-caramel-frappe', 'Caramel cream card', '‑ber card (light)'],
      ['#a51f2d', 'toasted-hazelnut-mocha', 'Red cup print', 'Holiday cup texture'], ['#dcb995', 'maple-oat-latte', 'Seasonal stage', 'Menu card, ‑ber'], ['#d3bc9e', 'americano', 'Hot stage', 'Menu card'],
      ['#b3cfc0', 'iced-latte', 'Cold stage', 'Menu card'], ['#d8bfa1', 'java-chip-frappe', 'Frappé stage', 'Menu card'], ['#c6bbdc', 'ube-latte', 'Tea & more stage', 'Menu card'],
      ['#dcc7a0', 'butter-croissant', 'Bakery stage', 'Menu card'], ['#b4cabd', 'benguet-beans', 'Merch stage', 'Menu card'], ['#b07a45', 'blonde-espresso-beans', 'Blonde roast', 'Roast slider'],
      ['#6e4126', 'benguet-beans', 'Medium roast', 'Roast slider'], ['#2e1a10', 'sagada-dark', 'Dark roast', 'Roast slider'], ['#9b7bc4', 'ube-latte', 'Ube night', 'Gift card']
    ];
    el.innerHTML = C.map(([c, id, n, u]) => `<div class="dc"><span class="dc__chip" style="--c:${c}"><img src="${art(id, true)}" alt="" width="72" height="72" loading="lazy"></span><span class="dc__b"><b>${n}</b>${c} · ${u}</span></div>`).join('');
  }
  const ICONS = [
    ['Your order', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'],
    ['Find a store', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'],
    ['Search', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'],
    ['Add', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'],
    ['Close', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'],
    ['GioStars', '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>'],
    ['Send', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>'],
    ['Previous', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>'],
    ['Next', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>'],
    ['Store pin', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1.4 12H7.4z"/><path d="M5 5.5h14V8H5z"/><path d="M7.6 12h8.8"/></svg>'],
    ['Menu panel', '<svg viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'],
    ['Drag the cup', '<svg viewBox="0 0 48 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 22c12 2 26-2 36-16"/><path d="M33 5l7 1-1 7"/></svg>'],
    ['Order-ahead shelf', '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 38h36M10 38V20h28v18"/><path d="M16 20v-4h6v4M26 20v-6h6v6"/><path d="M15 27h18"/></svg>'],
    ['Wi-Fi', '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a23 23 0 0 1 32 0"/><path d="M14 25a14 14 0 0 1 20 0"/><path d="M20 31a6 6 0 0 1 8 0"/><circle cx="24" cy="37" r="1.6" fill="currentColor"/></svg>'],
    ['Tumbler', '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10h18l-2 30a3 3 0 0 1-3 2h-8a3 3 0 0 1-3-2z"/><path d="M14 10h20M19 6h10"/><path d="M17 22h14"/></svg>']
  ];
  function icons() {
    const el = $('#icons'); if (!el) return;
    el.innerHTML = ICONS.map(([n, s], i) => `<div class="ic${i === 9 ? ' ic--dark' : ''}"${i === 9 ? ' style="color:#fff"' : ''}>${i === 9 ? s.replace('<svg', '<svg style="color:#fff"') : s}<small>${n}</small></div>`).join('');
  }
  function angles() {
    const el = $('#angles'); if (!el) return;
    // what each kind of product shows off, in plain words, with one example picture
    const K = [
      ['hot', 'Hot cups', 'The logo and the sleeve, where the name goes'],
      ['iced', 'Iced cups', 'The layers, the ice and the straw'],
      ['frappe', 'Frappés', 'The dome of whip against a bright edge'],
      ['mug', 'Cups with a saucer', 'Seen from a little higher, for the latte art'],
      ['croissant', 'Croissant', 'The flaky layers and the curve'],
      ['ensaymada', 'Ensaymada', 'The coil and the cheese, from above'],
      ['muffin', 'Muffin', 'The crunchy top and the paper case'],
      ['cookie', 'Cookie', 'The chunks and the salt on top'],
      ['cake', 'Cake slices', 'Turned to show all three layers'],
      ['beans', 'Bean bags', 'The label: origin and roast'],
      ['tumbler', 'Tumblers', 'The badge, with the lid in view'],
      ['ceramic', 'Mugs', 'Handle to the right, badge on the side']
    ];
    el.innerHTML = K.map(([k, n, what]) => { const its = ITEMS.filter(i => i.kind === k); if (!its.length) return ''; return `<div class="x-shot"><img src="${art(its[0].id, true)}" alt="" width="160" height="160" loading="lazy"><div><b>${n}</b><span>${what}. ${its.length > 1 ? `${its.length} products` : esc(its[0].name)}.</span></div></div>`; }).join('');
  }
  function gallery() {
    const el = $('#gallery'); if (!el) return;
    el.innerHTML = ITEMS.map(i => `<figure class="gal"><img src="${art(i.id)}" alt="${esc(i.name)}" width="640" height="640" loading="lazy"><b>${esc(i.name)}</b><code>${i.id}.webp</code></figure>`).join('');
  }
  function addons() {
    const el = $('#addons'); if (!el) return;
    el.innerHTML = `<h4>Milk</h4><div class="kchips">${MILKS.map(([n, a, t]) => `<span><i style="background:${t}"></i>${n}${a ? ` +₱${a}` : ''}</span>`).join('')}</div>
      <h4>Syrup</h4><div class="kchips">${SYRUPS.map(([n, a, t]) => `<span><i style="background:${t}"></i>${n} +₱${a}</span>`).join('')}</div>
      <h4>And</h4><div class="kchips"><span>Extra espresso shot +₱30</span><span>Iced, in the builder +₱10</span><span>Your name, free</span></div>
      <p class="note">Ticket codes the barista writes: SHOTS "2" or "2 B" (blonde), SYRUP the first three letters (VAN, CAR, HZL, MSC, UBE), MILK "W" for whole or OAT / ALM / SOY / SKI, CUSTOM a word ("whip", "drz", "crumble", "cinn").</p>`;
  }
  function menuList() {
    const el = $('#menuList'); if (!el) return;
    el.innerHTML = CATS.map(c => { const its = ITEMS.filter(i => i.cat === c.id); return `<section class="mgroup" aria-label="${esc(c.name)}"><h4>${esc(c.name)}${c.hand ? `<small>${esc(c.hand)}</small>` : ''}</h4>${its.map(i => `<div class="mrow"><img src="${art(i.id, true)}" alt="" width="44" height="44" loading="lazy"><span><b>${esc(i.name)}</b>${i.tag ? `<span class="pill gold">${esc(i.tag)}</span>` : ''}<small>${esc(i.desc)}</small></span><span>${peso(i.price)}${i.kcal ? `<small><br>${i.kcal} kcal</small>` : ''}</span></div>`).join('')}</section>`; }).join('');
  }
  function storeCards() {
    const el = $('#storeCards'); if (!el) return;
    el.innerHTML = STORES.map(s => `<article class="scard${s.id === 'uptown' ? ' scard--24' : ''}"><div class="scard__top"><span class="scard__ic" data-mark></span><div><p class="scard__area">${esc(s.area)}</p><h4>${esc(s.name)}</h4></div></div><p class="scard__addr">${esc(s.addr)}</p>
      <div class="hours"><span>Mon–Fri</span><b>${hoursText(s.open)}</b><span>Sat–Sun</span><b>${hoursText(s.wk)}</b></div>
      <div class="tags">${s.tags.map(t => `<span class="pill">${esc(t)}</span>`).join('')}<span class="pill">Wi-Fi</span><span class="pill">Order-ahead shelf</span></div>
      <div class="scard__foot"><span>Order-ahead wait <b>about ${s.wait} min</b></span><span>${esc(s.phone)} <i class="tag tag--todo">sample</i></span></div></article>`).join('');
  }
  function levelsTbl() {
    const el = $('#levelsTbl'); if (!el) return;
    const rows = ['Stars per ₱50', 'Birthday drink', 'Daily syrup or milk swap', 'Monthly size upgrade', 'New drinks a week early', 'Slow-bar tastings', 'Engraved tumbler'];
    const has = { green: [1, 1, 1, 0, 0, 0, 0], gold: [1, 1, 1, 1, 1, 0, 0], reserve: [1, 1, 1, 1, 1, 1, 1] };
    el.innerHTML = `<caption class="sr">GioStars levels compared, as on rewards.html</caption><thead><tr><td></td>${LEVELS.map(l => `<th scope="col"><span class="lv-dot" style="background:${l.card}"></span>${l.name}<small>${l.to ? `${l.from.toLocaleString('en-PH')}–${l.to.toLocaleString('en-PH')}` : `${l.from.toLocaleString('en-PH')}+`} ★ a year</small></th>`).join('')}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr><th scope="row">${r}</th>${LEVELS.map(l => i === 0 ? `<td><b>${l.rate} ★</b></td>` : `<td class="${has[l.id][i] ? 'yes' : 'no'}">${has[l.id][i] ? 'Included' : '—'}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row">Perks as listed</th>${LEVELS.map(l => `<td><small>${l.perks.map(esc).join(' · ')}</small></td>`).join('')}</tr></tbody>`;
  }
  function rewardsGrid() {
    const el = $('#rewardsGrid'); if (!el) return;
    el.innerHTML = REWARDS.map(r => `<article class="reward"><img src="${art(r.item)}" alt="" width="104" height="104" loading="lazy"><b>${r.stars} ★</b><h4>${esc(r.name)}</h4><p>${esc(r.desc)}</p></article>`).join('');
  }

  /* ---------- ‑ber calendar ---------- */
  const PHASES = [['Tease', 0, 0], ['Launch', 1, 2], ['Sustain', 3, 8], ['Red cup', 9, 13], ['Gifting', 14, 17], ['Last call', 18, 18]];
  const CHANNELS = [
    ['Instagram + TikTok', [2, 2, 1, 2, 1, 2]], ['Facebook', [1, 2, 1, 2, 2, 1]], ['Email', [0, 2, 1, 2, 2, 1]], ['Push + app', [1, 2, 1, 2, 1, 2]],
    ['Website hero', [0, 2, 1, 2, 2, 1]], ['In store: boards, tents', [1, 2, 1, 2, 2, 1]], ['OOH: EDSA + BGC', [0, 2, 2, 2, 0, 0]], ['Paid display + social', [1, 2, 1, 2, 2, 1]],
    ['Grab + foodpanda tiles', [0, 2, 1, 1, 2, 1]], ['Gift cards', [0, 0, 0, 1, 2, 1]], ['Creators', [1, 2, 1, 2, 1, 0]]
  ];
  const weeks = () => { const y = +val('season') || 2026; const d0 = new Date(y, 7, 24); while (d0.getDay() !== 1) d0.setDate(d0.getDate() - 1); return Array.from({ length: 19 }, (_, i) => new Date(d0.getTime() + i * 7 * 864e5)); };
  const phaseOf = w => PHASES.findIndex(([, a, b]) => w >= a && w <= b);
  const wkLabel = d => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  function calendar() {
    const el = $('#calendar'); if (!el) return;
    const W = weeks();
    el.innerHTML = `<caption class="sr">‑ber months rollout by week and channel</caption><thead><tr><th scope="col">Week of</th>${W.map(d => `<th scope="col">${wkLabel(d)}</th>`).join('')}</tr></thead><tbody>
      <tr class="ph"><th scope="row">Phase</th>${PHASES.map(([n, a, b]) => `<td colspan="${b - a + 1}">${n}</td>`).join('')}</tr>
      ${CHANNELS.map(([n, lv]) => `<tr><th scope="row">${n}</th>${W.map((_, i) => { const v = lv[phaseOf(i)]; return `<td><i class="c${v}" title="${['Off', 'Always on', 'Heavy'][v]}"></i><span class="sr">${['Off', 'Always on', 'Heavy'][v]}</span></td>`; }).join('')}</tr>`).join('')}</tbody>`;
  }
  function berKpis() {
    const el = $('#berKpis'); if (!el) return;
    const K = [
      ['‑ber share of drink orders', '1 in 4', 'Point of sale + app, Sept–Dec', 'All four ‑ber drinks ÷ handcrafted drinks'],
      ['Order-ahead share', '+5 pts', 'App + web orders ÷ all orders', 'The wait-time hook on OOH and push'],
      ['New GioStars members', '+20%', 'Monthly joins vs Jul–Aug average', 'Table tents, receipts, email capture'],
      ['Green → Gold upgrades', '+10%', 'Members crossing 1,000 ★ a year', 'Double-star Tuesdays pull'],
      ['#SpelledRight + #FirstRedCup', '2×', 'Tagged posts vs Jul–Aug', 'UGC on ‑ber cups'],
      ['Email open rate', '≥ 40%', 'Launch, red cup and gifting sends', 'Subject lines with the name'],
      ['Gift card value sold', '+25%', 'Nov–Dec vs last Nov–Dec', 'Set a baseline if this is year one'],
      ['Delivery via app + web', '+15%', 'Orders with delivery, ₱49 fee', 'Earns stars, unlike in-app partner orders']
    ];
    el.innerHTML = K.map(([n, t, m, w]) => `<div class="kpi"><small>${n}</small><b>${t}</b><p>${m}</p><p>${w}</p><span class="tag tag--todo">proposed target</span></div>`).join('');
  }

  /* ---------- gift cards (designs from js/home.js) ---------- */
  function gcards() {
    const el = $('#gcards'); if (!el) return;
    const PAT = {
      beans: Array.from({ length: 18 }, (_, i) => `<ellipse cx="${(i % 6) * 36 + 14}" cy="${Math.floor(i / 6) * 44 + 18}" rx="8" ry="12" transform="rotate(${30 + i * 13} ${(i % 6) * 36 + 14} ${Math.floor(i / 6) * 44 + 18})" fill="#fff"/>`).join(''),
      leaves: Array.from({ length: 14 }, (_, i) => `<path d="M${(i % 7) * 30 + 10} ${Math.floor(i / 7) * 60 + 30}q12-22 24 0q-12 22-24 0z" fill="#fff" transform="rotate(${i * 25} ${(i % 7) * 30 + 22} ${Math.floor(i / 7) * 60 + 30})"/>`).join(''),
      stars: Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 47) % 200}" cy="${(i * 29) % 126}" r="${.8 + (i % 3) * .7}" fill="#fff"/>`).join(''),
      cups: Array.from({ length: 10 }, (_, i) => `<path d="M${(i % 5) * 42 + 8} ${Math.floor(i / 5) * 62 + 20}h22l-3 26h-16z" fill="#fff"/>`).join('')
    };
    const DS = [
      ['linear-gradient(135deg,#0e6b4e,#14332b)', '#f0d39a', 'beans', 'House green', 500, '#fff'], ['linear-gradient(135deg,#c8622b,#7a2e12)', '#ffe2bd', 'leaves', 'Kalabasa', 1000, '#fff'],
      ['linear-gradient(135deg,#9b7bc4,#4d3577)', '#f3e6ff', 'stars', 'Ube night', 2000, '#fff'], ['linear-gradient(135deg,#d6b26e,#9a7230)', '#14332b', 'cups', 'Gold', 5000, '#14332b']
    ];
    el.innerHTML = DS.map(([g, h, p, n, a, ink]) => `<figure class="fig"><div class="gcard" style="--g:${g};--gh:${h};color:${ink}"><svg class="gpat" viewBox="0 0 200 126" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${PAT[p]}</svg><span class="gcard__k"><span data-b="name">${esc(val('name'))}</span> gift card</span><span class="gcard__mk" data-mark></span><span class="gcard__msg"><small>For <span data-b="custName">${esc(val('custName'))}</span></small><b>Coffee's on me!</b></span><span class="gcard__amt">${peso(a)}</span></div><figcaption><b>${n}</b><span>${['All year', 'Sept–Oct hero', 'Noche Buena', 'Christmas week'][DS.findIndex(d => d[3] === n)]}</span></figcaption></figure>`).join('');
  }

  /* ---------- launch checklist ---------- */
  const CHECK = [
    ['Product & stores', ['‑ber items live in js/data.js, the app and the POS, Medio prices checked', 'Renders current in assets/3d (bump ART_VERSION after any re-render)', 'Red cups, kraft sleeves and markers stocked at all four stores', 'Barista briefing: names on every cup, ticket codes MSC / PMK / SC / HZL', 'Menu boards and table tents installed', 'Grab and foodpanda menus updated with the four drinks']],
    ['Creative', ['Key visual signed off', 'Feed 1:1 and 4:5, stories 9:16, reels covers exported', 'Display 300 × 250, 728 × 90, 1080 × 1080 exported', 'EDSA and BGC artwork sent to the media owner with proofs', 'Email templates built, tested on Gmail and Outlook, dark mode checked', 'Push copy loaded and scheduled (max one marketing push a day)', 'Alt text written for every image']],
    ['Facts & permissions', ['Prices, hours and GioStars rules checked against the live site', 'Every placeholder in chapter 01 replaced', '"Here till December" on every piece', 'Names: samples, or the customer\'s own with written OK', 'Partner logos from Grab and foodpanda partner portals', 'Word check: no "fall", "maple", "PSL", "best in Manila"']],
    ['Tracking', ['UTM links per channel and format', 'July–August baseline pulled for every KPI', 'Order-ahead and sign-up events firing in analytics', 'Hashtag monitoring: #SpelledRight, #FirstRedCup', 'Dashboard shared with store managers']],
    ['Launch week', ['Tease post and stories (week of Aug 24)', 'Gold members: new drinks a week early email', 'Sept 1, 7:30 am launch push', 'Website hero swapped to the ‑ber drinks', 'OOH live, photographed for the record', 'Reply rota set: 2-hour response in store hours']],
    ['After launch', ['Weekly KPI review, Mondays', 'Rotate the hero drink every two weeks', 'Red cup push from Oct 26', 'Gift card push from Nov 30', 'Last call week of Dec 28', 'Wrap report in January: what to keep for next year']]
  ];
  function checklist() {
    const el = $('#checklist'); if (!el) return;
    const done = new Set(store.get('checks', []));
    el.innerHTML = CHECK.map(([g, items], gi) => `<div class="cgroup"><h4>${esc(g)}<small data-gc="${gi}"></small></h4>${items.map((t, ii) => { const k = gi + '-' + ii; return `<label class="citem"><input type="checkbox" data-ck="${k}"${done.has(k) ? ' checked' : ''}><span>${esc(t)}</span></label>`; }).join('')}</div>`).join('');
    const sum = () => {
      const all = $$('[data-ck]', el), n = all.filter(i => i.checked).length;
      $('#checkSum').textContent = `${n} of ${all.length} done`; $('#checkBar').style.transform = `scaleX(${all.length ? n / all.length : 0})`;
      CHECK.forEach((_, gi) => { const g = $$(`[data-ck^="${gi}-"]`, el); $(`[data-gc="${gi}"]`, el).textContent = `${g.filter(i => i.checked).length}/${g.length}`; });
    };
    el.addEventListener('change', () => { store.set('checks', $$('[data-ck]', el).filter(i => i.checked).map(i => i.dataset.ck)); sum(); });
    $('#checkReset').addEventListener('click', () => { $$('[data-ck]', el).forEach(i => { i.checked = false; }); store.set('checks', []); sum(); });
    sum();
  }

  /* ---------- KPI dashboard (sample data, labelled) ---------- */
  function spark(pts) {
    const max = Math.max(...pts), min = Math.min(...pts), w = 120, h = 34;
    const xy = pts.map((v, i) => [i / (pts.length - 1) * w, h - 3 - (v - min) / ((max - min) || 1) * (h - 6)]);
    const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${d}L${w} ${h}L0 ${h}Z"/><path d="${d}"/></svg>`;
  }
  function dash() {
    const el = $('#dash'); if (!el) return;
    const T = [
      ['‑ber share of drink orders', '23%', '+4 pts', 'up', [12, 15, 17, 18, 20, 21, 22, 23]], ['Order-ahead share', '38%', '+3 pts', 'up', [31, 33, 33, 34, 35, 36, 37, 38]],
      ['New GioStars members', '1,284', '+18%', 'up', [120, 140, 150, 160, 158, 170, 182, 204]], ['Gold upgrades', '96', '+9%', 'up', [8, 9, 11, 10, 12, 13, 15, 18]],
      ['#SpelledRight posts', '412', '+2.1×', 'up', [20, 34, 41, 48, 55, 60, 72, 82]], ['Email open rate', '43%', '+2 pts', 'up', [39, 41, 40, 42, 44, 43, 42, 43]],
      ['Delivery orders (app + web)', '2,930', '+12%', 'up', [300, 320, 340, 350, 360, 380, 420, 460]], ['Tumbler discounts', '1,105', '−3%', 'down', [150, 148, 140, 142, 138, 135, 126, 126]]
    ];
    const W = ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'];
    const ber = [820, 960, 1010, 1080, 1120, 1170, 1240, 1300], other = [3100, 3060, 3120, 3040, 3010, 3060, 3020, 2990], mx = Math.max(...ber.map((b, i) => b + other[i]));
    const CH = [['Table tents + receipts', 34], ['Website + app', 27], ['Instagram + TikTok', 18], ['Email', 9], ['Facebook', 7], ['Partners', 5]];
    el.innerHTML = `<div class="dash__top"><div><b>‑ber months · season to date</b><br><span>Sample data for layout only. Plug in POS, app and social numbers.</span></div><div class="dash__seg" aria-hidden="true"><span>7 days</span><span class="on">Season</span><span>Year</span></div></div>
      <div class="dash__tiles">${T.map(([n, v, d, dir, p]) => `<div class="dtl"><small>${n}</small><b>${v}</b><em class="${dir}">${d} vs Jul–Aug</em>${spark(p)}</div>`).join('')}</div>
      <div class="dash__row"><div class="dpanel"><h5>Drink orders by week <small>‑ber vs everything else, all stores</small></h5><div class="bars" role="img" aria-label="Weekly drink orders, sample data: ‑ber drinks rise from 820 to 1,300 a week while other drinks stay near 3,000">${ber.map((b, i) => `<div><i class="a" style="height:${(b / mx * 100).toFixed(1)}%"></i><i class="b" style="height:${(other[i] / mx * 100).toFixed(1)}%"></i></div>`).join('')}</div><div class="bars__x">${W.map(w => `<span>${w}</span>`).join('')}</div><div class="dlegend"><span><i style="background:var(--gold-l)"></i>‑ber drinks</span><span><i style="background:#5fd39b"></i>Other drinks</span></div></div>
      <div class="dpanel"><h5>Where new members join <small>share of sign-ups</small></h5><div class="hbars">${CH.map(([n, p]) => `<div class="hbar"><span>${n}</span><i style="width:${p / 34 * 100}%"></i><b>${p}%</b></div>`).join('')}</div><p class="dash__note" style="margin-top:12px">Stores 4 of 4 reporting · last sync 7:00 am</p></div></div>`;
  }

  /* =========================================================
     INTERACTION
     ========================================================= */
  function toast(t) { const el = $('#ktoast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast(`Copied ${text}`); return; } catch (e) { /* file:// may block the clipboard API */ }
    try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(`Copied ${text}`); } catch (e) { toast(text); }
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) copy(c.dataset.copy);
    const g = e.target.closest('[data-group] button'); if (g && !g.disabled) {
      const grp = g.closest('[data-group]'), type = grp.dataset.group;
      if (type === 'toggle') g.setAttribute('aria-pressed', g.getAttribute('aria-pressed') !== 'true');
      else $$('button', grp).forEach(b => b.setAttribute('aria-pressed', b === g));
      if (type === 'pickup') pickup(g.textContent.trim());
    }
    const seg = e.target.closest('.seg button'); if (seg) $$('button', seg.parentNode).forEach(b => b.setAttribute('aria-selected', b === seg));
  });
  function pickup(mode) {
    const t = 340 + (mode === 'Delivery' ? 49 : 0);
    $('#pickTot').textContent = peso(t);
    const w = mode === 'Delivery' ? 'Delivered by Grab or foodpanda in about 30 minutes, ₱49 delivery fee.' : mode === 'Drive-thru' ? 'Drive-thru at 5th Ave: it will be at the window in about 6 minutes.' : 'Ready in about 6 minutes at Reserve · 5th Ave.';
    $('#pickWhen').innerHTML = `${w} You'll earn <b class="stars-earn">12 ★</b>.`;
  }
  function stepper() {
    const el = $('#stepDemo'); if (!el) return;
    const [m, p] = $$('button', el), out = $('output', el); let n = 2;
    const set = () => { out.textContent = n; $$('.shots i', el).forEach((d, i) => d.classList.toggle('on', i < n)); m.disabled = n <= 0; p.disabled = n >= 4; };
    m.addEventListener('click', () => { if (n > 0) { n--; set(); } }); p.addEventListener('click', () => { if (n < 4) { n++; set(); } }); set();
  }
  function tilt() {
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let cur = null, raf = 0, ev = null;
    const apply = () => { raf = 0; if (!cur || !ev) return; const r = cur.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height, max = +(cur.dataset.tilt || 7);
      cur.style.setProperty('--ry', ((x - .5) * max * 2).toFixed(2) + 'deg'); cur.style.setProperty('--rx', ((.5 - y) * max * 2).toFixed(2) + 'deg'); cur.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); cur.style.setProperty('--my', (y * 100).toFixed(1) + '%'); };
    const leave = el => { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tilt]'); if (t !== cur) { if (cur) leave(cur); cur = t; if (cur) cur.classList.add('tilting'); } }, { passive: true });
    document.addEventListener('pointermove', e => { ev = e; if (cur && !cur.contains(e.target)) { leave(cur); cur = null; } if (!raf) raf = requestAnimationFrame(apply); }, { passive: true });
  }

  /* ---------- motion demos ---------- */
  const replay = el => { el.classList.remove('play', 'done'); void el.offsetWidth; el.classList.add('play'); };
  let routeRaf = 0, priceT = 0;
  const DEMOS = {
    moCup: el => replay(el), moName: el => replay(el), moStack: el => replay(el),
    moFly: el => { replay(el); setTimeout(() => el.classList.add('done'), 1150); },
    moRoute: el => {
      replay(el); cancelAnimationFrame(routeRaf);
      const p = $('.rt3', el), bean = $('.mo-route__bean', el), len = p.getTotalLength(), t0 = performance.now() + 1400;
      const loop = t => { if (html.classList.contains('paused')) { routeRaf = requestAnimationFrame(loop); return; } const k = (t - t0) / 2600; if (k > 2) { bean.style.opacity = 0; el.classList.add('done'); return; } if (k >= 0) { const f = k % 1, pt = p.getPointAtLength(len * f); bean.setAttribute('cx', pt.x); bean.setAttribute('cy', pt.y); bean.style.opacity = Math.sin(f * Math.PI).toFixed(2); } routeRaf = requestAnimationFrame(loop); };
      routeRaf = requestAnimationFrame(loop);
    },
    moPrice: el => {
      clearTimeout(priceT); const n = $('.mo-price__n', el), s = $('.mo-price__s', el);
      const steps = [['Grande', 240], ['Gigante', 260], ['Piccolo', 195], ['Medio', 215]]; let i = 0, from = 215;
      const roll = (to, done) => { const t0 = performance.now(), d = 450; const f = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4); n.textContent = peso(from + (to - from) * e); if (k < 1) requestAnimationFrame(f); else { from = to; done(); } }; requestAnimationFrame(f); };
      const next = () => { if (i >= steps.length) return; const [nm, p] = steps[i++]; s.textContent = nm; roll(p, () => { priceT = setTimeout(next, 650); }); };
      next();
    }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-play]'); if (!b) return;
    const el = document.getElementById(b.dataset.play); if (!el) return;
    if (reduce) { el.classList.add('done'); toast('Reduced motion is on: showing the end state'); return; }
    DEMOS[b.dataset.play] && DEMOS[b.dataset.play](el);
  });
  function motionToggle() {
    const b = $('#motionToggle'), t = $('.kbtn__t', b);
    const set = on => { html.classList.toggle('paused', on); b.setAttribute('aria-pressed', on); t.textContent = on ? 'Play motion' : 'Pause motion'; store.set('paused', on); };
    b.addEventListener('click', () => set(!html.classList.contains('paused')));
    set(!!store.get('paused', false));
  }

  /* ---------- table of contents: scrollspy + progress ---------- */
  function toc() {
    const links = $$('.toc a'), map = new Map(links.map(a => [a.getAttribute('href').slice(1), a])), nav = $('#toc');
    const setCur = id => { links.forEach(a => a.removeAttribute('aria-current')); const a = map.get(id); if (!a) return; a.setAttribute('aria-current', 'true');
      if (nav.scrollWidth > nav.clientWidth + 4) { const r = a.getBoundingClientRect(), nr = nav.getBoundingClientRect(); if (r.left < nr.left || r.right > nr.right) nav.scrollTo({ left: nav.scrollLeft + r.left - nr.left - 16, behavior: reduce ? 'auto' : 'smooth' }); }
      else { const r = a.getBoundingClientRect(), nr = nav.getBoundingClientRect(); if (r.top < nr.top || r.bottom > nr.bottom) nav.scrollTo({ top: nav.scrollTop + r.top - nr.top - 80 }); } };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setCur(e.target.id); }), { rootMargin: '-30% 0px -60% 0px' });
      $$('.chap').forEach(s => io.observe(s));
    }
    const bar = $('#progress'); let tk = false;
    addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; tk = false; }); }, { passive: true });
  }

  /* =========================================================
     DOWNLOADS
     ========================================================= */
  function download(name, text, type) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type }));
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500); toast(`Downloaded ${name}`);
    } catch (e) { toast('This browser blocked the download'); }
  }
  const slug = () => val('name').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
  const tokensJSON = () => {
    const vars = {}; ROOT_CSS.replace(/--([\w-]+):([^;]+);/g, (_, k, v) => { vars[k] = v.trim(); });
    return JSON.stringify({
      source: 'css/style.css :root', color: Object.fromEntries(['green', 'green-d', 'house', 'house-2', 'mint', 'mint-2', 'crema', 'paper', 'gold', 'gold-l', 'gold-ink', 'espresso', 'caramel', 'ink', 'muted', 'line', 'line-2', 'white'].map(k => [k, vars[k]])),
      font: { head: vars.head, body: vars.body, hand: vars.hand, display: { weight: 800, tracking: '-0.038em', lineHeight: .95 } },
      typeScale: { 'h-xl': 'clamp(46px,6.2vw,94px) 800 -0.038em 0.95', 'h-l': 'clamp(34px,4.2vw,58px) 800 -0.032em 1.02', 'h-m': 'clamp(24px,2.6vw,34px) 800 -0.025em', lede: 'clamp(17px,1.35vw,19px) muted', body: '16px/1.6 Inter 400' },
      radius: { r: vars.r, 'r-sm': vars['r-sm'], pill: vars.pill, card: '28px' }, shadow: { 'sh-1': vars['sh-1'], 'sh-2': vars['sh-2'] },
      ease: { out: vars['ease-out'], io: vars['ease-io'], drawer: vars['ease-drawer'] }, motion: { press: 'scale(.97) 160ms', toast: '320ms in / 200ms out', drawer: '460ms in / 300ms out', reveal: '600-700ms, 14px' },
      layout: { wrap: vars.wrap, hdr: vars.hdr, hdrPhone: '64px' }
    }, null, 2);
  };
  const appIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#14332B"/><g transform="translate(152 152) scale(11.25)">${markInner('full')}</g></svg>`;
  const calCSV = () => { const W = weeks(); return ['Channel,' + W.map(wkLabel).join(','), 'Phase,' + W.map((_, i) => PHASES[phaseOf(i)][0]).join(','), ...CHANNELS.map(([n, lv]) => `"${n}",` + W.map((_, i) => ['off', 'always on', 'heavy'][lv[phaseOf(i)]]).join(','))].join('\n'); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dl]'); if (!b) return; const k = b.dataset.dl, s = slug();
    const svg = 'image/svg+xml';
    if (k === 'logo') return download(`${s}-logo.svg`, logoSVG(false), svg);
    if (k === 'logo-dark') return download(`${s}-logo-on-dark.svg`, logoSVG(true), svg);
    if (k === 'mark') return download(`${s}-mark.svg`, markSVG('full', ''), svg);
    if (k === 'mark-mono') return download(`${s}-mark-one-colour.svg`, markSVG('mono', ''), svg);
    if (k === 'app-icon') return download(`${s}-app-icon-1024.svg`, appIcon(), svg);
    if (k === 'tokens-css') return download('tokens.css', `/* ${val('name')} design tokens, identical to css/style.css :root */\n${ROOT_CSS}\n`, 'text/css');
    if (k === 'tokens-json') return download('tokens.json', tokensJSON(), 'application/json');
    if (k === 'details-json') return download(`${s}-details.json`, JSON.stringify(Object.fromEntries(FIELDS.map(f => [f[0], val(f[0])])), null, 2), 'application/json');
    if (k === 'calendar-csv') return download(`${s}-ber-calendar-${val('season')}.csv`, calCSV(), 'text/csv');
  });

  /* =========================================================
     BOOT
     ========================================================= */
  marks(); detailsForm(); swatches(); contrast(); drinkCols(); icons(); angles(); gallery(); addons(); menuList(); storeCards(); levelsTbl(); rewardsGrid();
  calendar(); berKpis(); gcards(); checklist(); dash(); marks(); blueprint(); bind(); syncNameInputs();
  stepper(); tilt(); toc(); motionToggle();
  $('#printBtn')?.addEventListener('click', () => window.print());
  $('#detailsForm [name=season]')?.addEventListener('input', () => calendar());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => bind()).catch(() => { });
})();
