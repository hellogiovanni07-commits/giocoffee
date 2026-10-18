/* =========================================================
   GioCoffee data: the menu, sizes, add-ons, stores, rewards.
   Every item has a `v` (3D spec): the same spec builds the live
   3D model (gio3d.js) and the pre-rendered image in assets/3d/.
   ========================================================= */
export const ART_VERSION = 5;
export const art = (id, sm) => `assets/3d/${id}${sm ? '-sm' : ''}.webp?v=${ART_VERSION}`;

export const CATS = [
  { id: 'seasonal', name: '-ber months', hand: 'here till December' },
  { id: 'hot', name: 'Hot coffee' },
  { id: 'cold', name: 'Cold coffee' },
  { id: 'frappe', name: 'Frappés' },
  { id: 'tea', name: 'Tea & more' },
  { id: 'food', name: 'Bakery' },
  { id: 'merch', name: 'Beans & merch' }
];

// colours used by the 3D liquids
const C = {
  americano: '#2a140a', latte: '#c69a6c', flat: '#a8754a', mocha: '#5a3020',
  milk: '#f4ebdc', cold: '#24120a', matcha: '#8db35a', chai: '#c28b5c', ube: '#9b7bc4',
  calamansi: '#e8c547', choc: '#4a2414', pumpkin: '#e08a3c', maple: '#b06a2c', spanish: '#b88352', hazelnut: '#8a5a36'
};

export const ITEMS = [
  // ---------- Ber months (Sept–Dec) ----------
  { id: 'maple-oat-latte', cat: 'seasonal', name: 'Muscovado Oat Latte', price: 215, kcal: 230, caf: 150, tag: 'New', milk: 'oat',
    desc: 'Blonde espresso, steamed oat milk and Antique muscovado syrup, finished with a toasted oat crumble.',
    bg: '#b8742f', v: { kind: 'hot', liquid: [C.latte], sleeve: true } },
  { id: 'pumpkin-cream-cold-brew', cat: 'seasonal', name: 'Pumpkin Cream Cold Brew', price: 225, kcal: 250, caf: 185, tag: 'Fan favourite',
    desc: 'Slow-steeped cold brew under a cap of kalabasa (pumpkin) cold foam and a dust of cinnamon.',
    bg: '#c8622b', v: { kind: 'iced', liquid: [C.pumpkin, C.cold, C.cold], ice: 6 } },
  { id: 'salted-caramel-frappe', cat: 'seasonal', name: 'Salted Caramel Frappé', price: 235, kcal: 410, caf: 95, tag: 'New',
    desc: 'Coffee blended with caramel and ice, whipped cream and a sea-salt caramel drizzle.',
    bg: '#6b3e26', v: { kind: 'frappe', liquid: ['#c99a64', '#d9a36a'], whip: true, drizzle: '#b0641c', crumbs: '#8a4b1a' } },
  { id: 'toasted-hazelnut-mocha', cat: 'seasonal', name: 'Toasted Hazelnut Mocha', price: 220, kcal: 340, caf: 175,
    desc: 'Espresso, dark Davao cocoa and roasted hazelnut, in the first red cup of the season.',
    bg: '#4a2414', v: { kind: 'hot', liquid: [C.hazelnut], sleeve: true, holiday: true } },

  // ---------- Hot coffee ----------
  { id: 'americano', cat: 'hot', name: 'Caffè Americano', price: 140, kcal: 15, caf: 225,
    desc: 'Espresso shots topped with hot water for a light layer of crema.', v: { kind: 'hot', liquid: [C.americano], sleeve: true } },
  { id: 'cafe-latte', cat: 'hot', name: 'Caffè Latte', price: 165, kcal: 190, caf: 150,
    desc: 'Rich espresso and steamed milk with a thin layer of foam.', v: { kind: 'mug', liquid: [C.latte], art: 'rosetta' } },
  { id: 'cappuccino', cat: 'hot', name: 'Cappuccino', price: 165, kcal: 140, caf: 150,
    desc: 'Espresso under a deep, airy layer of milk foam.', v: { kind: 'mug', liquid: [C.flat], art: 'heart', cup: '#ffffff' } },
  { id: 'flat-white', cat: 'hot', name: 'Flat White', price: 175, kcal: 170, caf: 195, tag: 'Barista pick',
    desc: 'Two ristretto shots and silky whole milk, finished with a tulip of latte art.', v: { kind: 'mug', liquid: [C.flat], art: 'tulip', cup: '#14332b' } },
  { id: 'caramel-macchiato', cat: 'hot', name: 'Caramel Macchiato', price: 195, kcal: 250, caf: 150, tag: 'Best seller',
    desc: 'Vanilla milk marked with espresso and a cross-hatch of buttery caramel.', v: { kind: 'hot', open: true, liquid: ['#d9b48a'], top: 'crosshatch', sleeve: true } },
  { id: 'spanish-latte', cat: 'hot', name: 'Spanish Latte', price: 185, kcal: 260, caf: 150,
    desc: 'Espresso and condensed milk, the way Manila likes it: smooth and sweet.', v: { kind: 'hot', open: true, liquid: [C.spanish], top: 'heart', sleeve: true } },
  { id: 'caffe-mocha', cat: 'hot', name: 'Caffè Mocha', price: 190, kcal: 360, caf: 175,
    desc: 'Espresso, bittersweet cocoa and steamed milk under whipped cream.', v: { kind: 'hot', open: true, liquid: [C.mocha], top: 'whip', sleeve: true } },
  { id: 'hot-chocolate', cat: 'hot', name: 'Signature Hot Chocolate', price: 175, kcal: 380, caf: 25,
    desc: 'Davao cacao, steamed milk and mini marshmallows. No coffee, all comfort.', v: { kind: 'mug', liquid: [C.choc], art: 'none', cup: '#c9a15b', marsh: true } },

  // ---------- Cold coffee ----------
  { id: 'iced-americano', cat: 'cold', name: 'Iced Americano', price: 150, kcal: 15, caf: 225,
    desc: 'Espresso shots over cold water and ice.', v: { kind: 'iced', liquid: ['#c08a52', '#5a2f14', '#5a2f14'], ice: 8 } },
  { id: 'iced-latte', cat: 'cold', name: 'Iced Caffè Latte', price: 175, kcal: 130, caf: 150,
    desc: 'Espresso poured over milk and ice.', v: { kind: 'iced', liquid: ['#7a4a2a', C.milk, C.milk], ice: 7 } },
  { id: 'iced-spanish-latte', cat: 'cold', name: 'Iced Spanish Latte', price: 195, kcal: 240, caf: 150, tag: 'Best seller',
    desc: 'Condensed milk, cold milk and espresso, layered over ice.', v: { kind: 'iced', liquid: ['#5a2e16', C.milk, '#e3c48f'], ice: 7 } },
  { id: 'cold-brew', cat: 'cold', name: 'Cold Brew', price: 170, kcal: 5, caf: 205,
    desc: 'Steeped for 20 hours for a super-smooth, chocolatey cup.', v: { kind: 'iced', liquid: [C.cold], ice: 7, lid: 'flat' } },
  { id: 'vanilla-sweet-cream-cold-brew', cat: 'cold', name: 'Vanilla Sweet Cream Cold Brew', price: 195, kcal: 110, caf: 185,
    desc: 'Cold brew with a float of house-made vanilla sweet cream.', v: { kind: 'iced', liquid: ['#c9a27a', C.cold, C.cold], ice: 6, lid: 'flat' } },
  { id: 'iced-caramel-macchiato', cat: 'cold', name: 'Iced Caramel Macchiato', price: 205, kcal: 250, caf: 150,
    desc: 'Vanilla milk, ice, espresso shots and a caramel cross-hatch.', v: { kind: 'iced', liquid: ['#6b3a1c', '#e8d2b0', C.milk], ice: 6, drizzle: '#b0641c' } },
  { id: 'nitro-cold-brew', cat: 'cold', name: 'Nitro Cold Brew', price: 210, kcal: 5, caf: 265,
    desc: 'Cold brew infused with nitrogen for a velvety, cascading pour.', v: { kind: 'iced', liquid: ['#e9dcc4', C.cold, C.cold], ice: 0, lid: 'flat' } },

  // ---------- Frappés ----------
  { id: 'java-chip-frappe', cat: 'frappe', name: 'Java Chip Frappé', price: 225, kcal: 440, caf: 105, tag: 'Best seller',
    desc: 'Coffee, mocha sauce and chocolate chips blended with ice, under whipped cream.', v: { kind: 'frappe', liquid: ['#7a4a30', '#9c6a48'], whip: true, drizzle: '#3a1a0c', chips: true } },
  { id: 'caramel-frappe', cat: 'frappe', name: 'Caramel Frappé', price: 215, kcal: 380, caf: 90,
    desc: 'Coffee, caramel syrup, milk and ice, blended and topped with caramel.', v: { kind: 'frappe', liquid: ['#c99a64', '#d8b080'], whip: true, drizzle: '#b0641c' } },
  { id: 'mocha-frappe', cat: 'frappe', name: 'Mocha Frappé', price: 215, kcal: 370, caf: 100,
    desc: 'Coffee, cocoa and milk blended with ice.', v: { kind: 'frappe', liquid: ['#6a3e28', '#875a3e'], whip: true, drizzle: '#3a1a0c' } },
  { id: 'matcha-cream-frappe', cat: 'frappe', name: 'Matcha Cream Frappé', price: 220, kcal: 390, caf: 70,
    desc: 'Uji matcha blended with milk and ice, whipped cream on top.', v: { kind: 'frappe', liquid: ['#9cc06a', '#b6d38c'], whip: true, crumbs: '#7aa34a' } },
  { id: 'strawberry-cream-frappe', cat: 'frappe', name: 'Strawberry Cream Frappé', price: 215, kcal: 360, caf: 0,
    desc: 'Strawberry purée, milk and ice, blended pink and creamy. Coffee-free.', v: { kind: 'frappe', liquid: ['#f2a7b8', '#e06a86'], whip: true, drizzle: '#c8364f' } },
  { id: 'mango-graham-frappe', cat: 'frappe', name: 'Mango Graham Frappé', price: 225, kcal: 400, caf: 0, tag: 'Only in PH',
    desc: 'Guimaras mango, cream and crushed graham. A Filipino classic, blended.', v: { kind: 'frappe', liquid: ['#f5c242', '#f0a828'], whip: true, crumbs: '#c48a4a' } },

  // ---------- Tea & more ----------
  { id: 'iced-matcha-latte', cat: 'tea', name: 'Iced Matcha Latte', price: 195, kcal: 200, caf: 80,
    desc: 'Stone-ground matcha shaken with milk over ice.', v: { kind: 'iced', liquid: [C.matcha, '#cfe0b4', C.milk], ice: 6 } },
  { id: 'ube-latte', cat: 'tea', name: 'Iced Ube Latte', price: 195, kcal: 230, caf: 0, tag: 'Only in PH',
    desc: 'Purple yam, milk and ice with a swirl of ube halaya. Coffee-free.', v: { kind: 'iced', liquid: [C.ube, '#c9b3e6', C.milk], ice: 6 } },
  { id: 'chai-latte', cat: 'tea', name: 'Chai Tea Latte', price: 175, kcal: 240, caf: 95,
    desc: 'Black tea with cinnamon, clove and cardamom, steamed with milk.', v: { kind: 'hot', open: true, liquid: [C.chai], top: 'dust', sleeve: true } },
  { id: 'calamansi-refresher', cat: 'tea', name: 'Calamansi Refresher', price: 165, kcal: 90, caf: 45,
    desc: 'Green coffee extract, calamansi and honey, shaken with ice.', v: { kind: 'iced', liquid: [C.calamansi, '#f2d86a'], ice: 8, lime: true } },

  // ---------- Bakery ----------
  { id: 'butter-croissant', cat: 'food', name: 'Butter Croissant', price: 115, kcal: 260,
    desc: '27 layers of French butter, baked golden every morning.', v: { kind: 'croissant' } },
  { id: 'ensaymada', cat: 'food', name: 'Ube Ensaymada', price: 125, kcal: 320, tag: 'Only in PH',
    desc: 'Soft brioche coil with ube butter, sugar and grated queso.', v: { kind: 'ensaymada', top: '#c9a6e6' } },
  { id: 'blueberry-muffin', cat: 'food', name: 'Blueberry Muffin', price: 120, kcal: 360,
    desc: 'Buttermilk muffin, full of blueberries, with a crunchy sugar top.', v: { kind: 'muffin' } },
  { id: 'choc-chunk-cookie', cat: 'food', name: 'Double Chocolate Cookie', price: 95, kcal: 340,
    desc: 'Dark cocoa dough loaded with 64% chocolate chunks and sea salt.', v: { kind: 'cookie' } },
  { id: 'red-velvet-slice', cat: 'food', name: 'Red Velvet Slice', price: 165, kcal: 420,
    desc: 'Three layers of red velvet with cream-cheese frosting.', v: { kind: 'cake', sponge: '#a3202e', frost: '#f8f1e6' } },
  { id: 'tiramisu-slice', cat: 'food', name: 'Espresso Tiramisu', price: 175, kcal: 390,
    desc: 'Savoiardi soaked in our espresso, mascarpone and cocoa.', v: { kind: 'cake', sponge: '#b88a5c', frost: '#f4ead8', cocoa: true } },

  // ---------- Beans & merch ----------
  { id: 'benguet-beans', cat: 'merch', name: 'Benguet Medium Roast 250 g', price: 590, tag: 'Single origin',
    desc: 'Highland arabica from Atok, Benguet. Notes of brown sugar, citrus and cocoa.', v: { kind: 'beans', color: '#0e6b4e', label: 'BENGUET', roast: 'MEDIUM ROAST' } },
  { id: 'sagada-dark', cat: 'merch', name: 'Sagada Dark Roast 250 g', price: 620,
    desc: 'Mountain Province arabica, roasted dark for a bold, smoky cup.', v: { kind: 'beans', color: '#3b2418', label: 'SAGADA', roast: 'DARK ROAST' } },
  { id: 'blonde-espresso-beans', cat: 'merch', name: 'Blonde Espresso Roast 250 g', price: 560,
    desc: 'Lightly roasted for a sweet, mellow espresso.', v: { kind: 'beans', color: '#c9a15b', label: 'BLONDE', roast: 'ESPRESSO ROAST' } },
  { id: 'gio-tumbler', cat: 'merch', name: 'Gio Steel Tumbler 16 oz', price: 1250, tag: '+20 ★ bonus',
    desc: 'Double-wall steel, keeps drinks hot 6 h or cold 12 h. Bring it in for ₱10 off.', v: { kind: 'tumbler', color: '#0e6b4e' } },
  { id: 'gio-tumbler-crema', cat: 'merch', name: 'Crema Tumbler 16 oz', price: 1250,
    desc: 'The same tumbler, finished in soft crema with a gold badge.', v: { kind: 'tumbler', color: '#efe4d0' } },
  { id: 'gio-mug', cat: 'merch', name: 'Stoneware Mug 12 oz', price: 690,
    desc: 'Hand-glazed in Laguna, with the Gio badge on the side.', v: { kind: 'ceramic', color: '#14332b' } }
];

export const byId = id => ITEMS.find(i => i.id === id);
export const isDrink = it => ['hot', 'iced', 'frappe', 'mug'].includes(it.v.kind);

export const SIZES = [
  { id: 'piccolo', name: 'Piccolo', oz: '8 oz', add: -20, scale: 0.86 },
  { id: 'medio', name: 'Medio', oz: '12 oz', add: 0, scale: 0.94 },
  { id: 'grande', name: 'Grande', oz: '16 oz', add: 25, scale: 1.02 },
  { id: 'gigante', name: 'Gigante', oz: '20 oz', add: 45, scale: 1.1 }
];

export const MILKS = [
  { id: 'whole', name: 'Whole', add: 0, tint: '#f4ebdc', kcal: 0 },
  { id: 'oat', name: 'Oat', add: 35, tint: '#ead6b4', kcal: 20 },
  { id: 'almond', name: 'Almond', add: 35, tint: '#efdcc2', kcal: -40 },
  { id: 'soy', name: 'Soy', add: 30, tint: '#f1e4c8', kcal: -20 },
  { id: 'skim', name: 'Skim', add: 0, tint: '#f7f3ec', kcal: -50 }
];

export const SYRUPS = [
  { id: 'none', name: 'None', add: 0, tint: null, kcal: 0 },
  { id: 'vanilla', name: 'Vanilla', add: 25, tint: '#f1d9a8', kcal: 60 },
  { id: 'caramel', name: 'Caramel', add: 25, tint: '#c9873c', kcal: 70 },
  { id: 'hazelnut', name: 'Hazelnut', add: 25, tint: '#9a6a40', kcal: 60 },
  { id: 'muscovado', name: 'Muscovado', add: 30, tint: '#8a4f22', kcal: 70 },
  { id: 'ube', name: 'Ube', add: 30, tint: '#9b7bc4', kcal: 80 }
];

/* open = Mon–Fri hours, wk = Sat–Sun hours (24h clock). Every store has
   Wi-Fi, an order-ahead shelf and the tumbler discount; tags are the extras. */
export const STORES = [
  { id: 'bgc', name: 'GioCoffee Reserve · 5th Ave', short: 'Reserve · 5th Ave', area: 'Bonifacio Global City', addr: '5th Avenue corner 26th Street, BGC, Taguig', open: [6, 23], wk: [7, 23], tags: ['Reserve slow bar', 'Drive-thru', 'Outdoor seats'], x: 71, y: 55, phone: '+63 2 8000 1111', wait: 6 },
  { id: 'uptown', name: 'GioCoffee Uptown', short: 'Uptown', area: 'Bonifacio Global City', addr: 'Uptown Parade, 9th Avenue, BGC, Taguig', open: [0, 24], wk: [0, 24], tags: ['Outdoor seats'], x: 67, y: 30, phone: '+63 2 8000 4444', wait: 9 },
  { id: 'legazpi', name: 'GioCoffee Legazpi Village', short: 'Legazpi Village', area: 'Makati', addr: 'Rufino Street, Legazpi Village, Makati', open: [7, 21], wk: [8, 20], tags: ['Quiet room'], x: 25, y: 47, phone: '+63 2 8000 2222', wait: 4 },
  { id: 'rockwell', name: 'GioCoffee Rockwell', short: 'Rockwell', area: 'Makati', addr: 'Power Plant Mall, Rockwell Center, Makati', open: [10, 22], wk: [9, 22], tags: ['Pet friendly', 'Outdoor seats'], x: 37, y: 20, phone: '+63 2 8000 3333', wait: 5 }
];

export const REWARDS = [
  { stars: 25, name: 'Customise it', desc: 'An extra espresso shot or a size upgrade, on us.', item: 'americano', line: 'Extra shot or size upgrade', note: 'Added to any drink in this order' },
  { stars: 100, name: 'Any handcrafted drink', desc: 'Any size, any drink on the menu, made for you.', item: 'iced-spanish-latte', line: 'Any handcrafted drink', note: 'Tell the barista which one at pick-up' },
  { stars: 150, name: 'Bakery treat + drink', desc: 'A croissant or ensaymada with any drink.', item: 'butter-croissant', line: 'Bakery treat + any drink', note: 'Croissant or ensaymada, plus a drink of your choice' },
  { stars: 200, name: 'Beans or merch', desc: 'A 250 g bag of beans or a stoneware mug to take home.', item: 'benguet-beans', line: 'Beans or a stoneware mug', note: 'Pick the bag or mug at the counter' }
];

export const LEVELS = [
  { id: 'green', name: 'Green', from: 0, to: 999, rate: 2, perks: ['2 ★ for every ₱50', 'Free birthday drink', 'Free syrup or milk swap, once a day'] },
  { id: 'gold', name: 'Gold', from: 1000, to: 2999, rate: 3, perks: ['3 ★ for every ₱50', 'A free size upgrade every month', 'New drinks a week early', 'Double-star Tuesdays'] },
  { id: 'reserve', name: 'Reserve', from: 3000, to: null, rate: 4, perks: ['4 ★ for every ₱50', 'Slow-bar tastings at 5th Ave', 'Your own engraved tumbler', 'Priority order-ahead'] }
];

/* drinks you can choose the milk for, and the milk each one comes with */
const NO_MILK = ['americano', 'iced-americano', 'cold-brew', 'nitro-cold-brew', 'calamansi-refresher'];
export const milkChoice = it => isDrink(it) && !NO_MILK.includes(it.id) && it.v.kind !== 'frappe';
export const defaultNote = it => !isDrink(it) ? (it.cat === 'food' ? 'Warmed on request' : 'Boxed to take home') : `Medio${milkChoice(it) ? ' · ' + (it.milk || 'whole') + ' milk' : ''}`;

/* combos: a drink and a bake (or a few), priced below the sum of the parts */
export const COMBOS = [
  { id: 'solo', name: 'Solo Merienda', note: 'the 3 pm fix', bg: ['#b8742f', '#7d4719'], items: [['iced-spanish-latte', 1], ['ensaymada', 1]], price: 295 },
  { id: 'date', name: 'Kape Date', note: 'one for you, one for them', bg: ['#1d4337', '#0b1f19'], items: [['maple-oat-latte', 2], ['butter-croissant', 1]], price: 499 },
  { id: 'barkada', name: 'Barkada Box', note: 'for the whole table', bg: ['#0e6b4e', '#08402f'], items: [['java-chip-frappe', 1], ['cold-brew', 2], ['choc-chunk-cookie', 2]], price: 690 }
];

export const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
