# GioCoffee (concept site)

A Starbucks-style coffee chain concept for Bonifacio Global City and Makati, Metro Manila. Static HTML/CSS/JS, no build step. Fully original brand: own name, badge logo, colours and copy.

**Live:** https://hellogiovanni07-commits.github.io/giocoffee/ · **Brand kit:** https://hellogiovanni07-commits.github.io/giocoffee/brand/

- **Brand:** deep Gio Green `#0E6B4E`, House Green `#14332B`, Crema `#F3EBDD`, Gold `#C9A15B`. Plus Jakarta Sans (titles), Inter (body), Caveat (the barista's handwriting). Tagline: "Brewed for you, by name."
- **Big idea:** every cup gets your name. Type it in the hero, the drink builder or a menu item and it's hand-written on the 3D cup sleeve, the iced cup, your cart lines and the GioStars member card.
- Prices in ₱, 4 stores (5th Ave Reserve, Uptown 24h, Legazpi Village, Rockwell), GioStars rewards (2 ★ per ₱50, Green / Gold / Reserve). The seasonal menu is the Philippine "-ber months" (September–December).

## Pages
- `index.html`
  - **Hero:** pick one of four -ber months drinks and the 3D cup is built in front of you (it lands, the sleeve slides up, the lid presses on, the straw drops in). The cup label ticket marks DECAF / SHOTS / SYRUP / MILK / CUSTOM in marker, and typing your name writes it on the front of the cup, which turns to face you.
  - **Then:**
    - a "now pouring" rail of named orders;
    - -ber months drinks as stacking cards;
    - the drink builder: open cup with latte art, a cross-section of what's in the cup in ml, cup label, true calories and caffeine per size; the lid goes on when you add it;
    - the GioStars calculator and star ladder;
    - a roast slider with bean colour, oil and temperature;
    - a farm-to-Taguig route diagram with travelling beans;
    - the order-ahead phone (the cup fills, the name gets written);
    - a flip-over gift card designer with validation;
    - the stores map;
    - reviews printed on kraft sleeves (drag to scroll);
    - a pick-up shelf of named cups;
    - the newsletter.
- `menu.html`:
  - **Hero:** the four -ber months drinks on stepped plinths (tall House Green for hot, low Crema for iced) in front of a glowing amber arch with slow sun rays, a turning "-ber months" seal, and maple leaves, cinnamon, star anise and beans drifting with the pointer;
  - 41 items in 7 categories, with filters (iced and blended, no coffee, oat-friendly, only in PH), search, and a category bar that highlights where you are;
  - cards rearrange smoothly when you filter, and quick add flies the cup into the bag;
  - the item popup grows out of the card and offers live 3D, size, milk and name.
- `rewards.html`:
  - a member card that shows your real level and stars;
  - how it works, and a redeem catalogue with progress bars that adds rewards to your order for ₱0;
  - a Green / Gold / Reserve comparison table with your column highlighted;
  - Join and Sign in tabs with validation, and an FAQ.
- `stores.html`:
  - **Hero:** "Four stores. One never closes." with the live open/closed status of every store, next to a Blender-rendered 3D storefront at dusk (green sign, scalloped striped awning, glowing windows, bistro tables, an A-frame chalk menu, string lights) as a live 3D model you can drag round (or turn with the arrow keys) and zoom into, a crescent moon and floating feature chips;
  - an illustrated Makati and BGC map (EDSA runs between them) with labelled pins;
  - filters for open now, drive-thru, outdoor seats, pet friendly and quiet room;
  - weekday and weekend hours with today marked, and a Directions link (Google Maps);
  - "Order ahead here" sets your pick-up store.
- `brand/`: the brand kit (22 chapters: identity, colour, type, UI kit, motion, 3D renders, then positioning, the -ber months campaign, always-on campaigns, social, CRM, delivery and merch, launch checklist and downloads). It isn't linked from the header; it is linked in the footer.
- **On every page (`js/common.js`):**
  - a header with a Menu panel, which hides on scroll down;
  - a mobile menu;
  - the cart drawer: pick-up, drive-thru or delivery, then a "see you at 5th Ave, {name}" ending;
  - the "Gio" barista chat;
  - a footer with app badges, payment and delivery partners, and socials.
- **Content truth:** prices, reviews, the stores' details and the member data are samples (the footer says so). Orders, gift cards, sign-up and newsletter are demo only. Name, cart, stars, member status and pick-up store are kept in `localStorage`.

## Design rules used
- **Impeccable craft floor:**
  - no eyebrow labels above headings, no hero stat rows, no emoji icons, no bounce easing;
  - themed selection, scrollbar, caret and focus;
  - contrast-checked text (`--gold-ink` on light, `--gold-l` on green);
  - 44px tap targets;
  - headings in order.
- **Emil Kowalski's motion rules:**
  - custom ease-out `cubic-bezier(.23,1,.32,1)`, with exits faster than entrances;
  - `scale(.97)` on press;
  - hover effects only on devices that hover;
  - interruptible transitions;
  - a `prefers-reduced-motion` path, which the 3D also respects.
- **Motion library:** Motion 11.11.17, vendored in `vendor/motion/` (same build as Pizza Max), handles the scroll-linked hero and the stacking cards, `inView` triggers, and number roll-ups.
- **Brand icons:** the footer's brand icons come from simple-icons 13.21.0 (CC0), stored in `js/icons.js`.

## 3D
- `js/gio3d.js` builds every product in code from the `v` spec in `js/data.js`: paper hot cup (paper texture, order check-boxes, kraft sleeve with the name in marker), clear iced cup (layered drink, ice cubes, condensation drops, printed logo, green straw), frappé (blended texture, whipped-cream swirl, drizzle, dome lid), ceramic cup + saucer with latte art (rosetta, heart, tulip), croissant, ube ensaymada, blueberry muffin, double chocolate cookies, cake slices, coffee bean bags, steel tumblers and a stoneware mug.
- Live 3D (three.js 0.160 from jsDelivr): the home hero, the drink builder and the item popup. Drag to spin; it floats when idle and pauses off screen.
- Everything else uses pre-rendered Cycles images of the same products in `assets/3d/` (`<id>.webp` 640 px + `<id>-sm.webp` 160 px), each on a faint green grid floor with no cast shadow.

### Re-render the 3D images (Blender 5.2, Cycles)
1. `blender -b -P blender/gio_scene.py -- [--only a,b] [--samples 160] [--res 1000]` renders products to `blender/out/` (textures in `blender/tex/`, specs in `blender/items.json`).
2. `python blender/finish.py [id ...]` trims and squares them into `assets/3d/`.
3. Bump `ART_VERSION` in `js/data.js`.
- `--hero` renders the product with no floor into `blender/out_hero/` (the menu hero cups in `assets/3d/hero/`).
- `blender -b -P blender/storefront_bake.py` builds the storefront, bakes its Cycles lighting into three texture atlases and exports `assets/3d/hero/storefront.glb` (Draco + WebP, under 1 MB). The stores hero draws it live with three.js: drag with momentum, arrow keys, pinch / wheel / + − zoom. `blender -b -P blender/storefront.py -- --turn 1` then `python blender/finish_turn.py` renders the matching poster `assets/3d/hero/turn/f00.webp`.
- Clear cups are thin PET (transparent + glossy by Fresnel) in a light mint studio, filled to 95%.

`tools/render.html` is also a 3D viewer: open http://localhost:5240/tools/render.html to browse every model.

Preview: `python -m http.server 5240` then open http://localhost:5240
