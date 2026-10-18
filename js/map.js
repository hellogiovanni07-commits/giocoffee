/* Illustrated map of Makati + BGC (not to scale) with labelled store pins. */
import { STORES } from './data.js?v=15';
import { IC } from './common.js?v=15';

export const MAP_SVG = `<svg class="base" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs><pattern id="blk" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e6efe9"/><rect x=".6" y=".6" width="4.8" height="4.8" rx=".8" fill="#dbe8e0"/></pattern></defs>
  <rect width="100" height="70" fill="url(#blk)"/>
  <!-- Pasig River along the north -->
  <path d="M-2 11C10 6 20 13 32 9S52 2 62 8s20 7 40-1V-2H-2z" fill="#b9d8e6"/>
  <path d="M-2 11C10 6 20 13 32 9S52 2 62 8s20 7 40-1" fill="none" stroke="#9cc6da" stroke-width="1"/>
  <text x="6" y="6.5" font-size="2.2" fill="#4f8299" font-family="Inter" font-weight="600" letter-spacing=".3">PASIG RIVER</text>
  <!-- parks -->
  <g fill="#cfe5d4"><path d="M27 33l7-4 3 7z"/><circle cx="70" cy="60" r="3.2"/><rect x="74" y="40" width="7" height="5" rx="1.5"/></g>
  <g font-family="Inter" font-weight="600" fill="#5f8a71" font-size="1.6"><text x="26" y="39.5">Ayala Triangle</text><text x="65" y="65.5">Burgos Circle</text></g>
  <!-- roads: EDSA runs north-south between Makati and BGC -->
  <g fill="none" stroke="#fff" stroke-linecap="round">
    <path d="M52 8C51 26 50 46 47 72" stroke-width="2.8"/>
    <path d="M-2 18L50 16" stroke-width="1.8"/>
    <path d="M14 20L49 48" stroke-width="2.2"/>
    <path d="M22 10L30 70" stroke-width="1.4"/>
    <path d="M52 30C62 30 74 29 92 26" stroke-width="1.8"/>
    <path d="M56 50L90 47" stroke-width="1.4"/>
    <path d="M68 22L71 70" stroke-width="1.4"/>
    <path d="M91 6L95 72" stroke-width="2.2"/>
  </g>
  <g fill="none" stroke="#f3e4c4" stroke-linecap="round"><path d="M52 8C51 26 50 46 47 72" stroke-width=".9"/><path d="M91 6L95 72" stroke-width=".7"/></g>
  <g font-family="Inter" font-weight="700" fill="#6f817a" font-size="1.9" letter-spacing=".25">
    <text transform="translate(53.6 40) rotate(-87)">EDSA</text>
    <text transform="translate(17.6 21.6) rotate(38)">AYALA AVE</text>
    <text x="2" y="16.6">GIL PUYAT AVE</text>
    <text transform="translate(93.4 34) rotate(-86)">C5 ROAD</text>
    <text x="57" y="28.8">MCKINLEY PKWY</text>
  </g>
  <g font-family="Plus Jakarta Sans" font-weight="800" fill="#14332b" opacity=".5"><text x="8" y="62" font-size="3.6">MAKATI</text><text x="74" y="56" font-size="3.6">BGC</text><text x="74.4" y="59" font-size="1.7" font-family="Inter" font-weight="600">TAGUIG</text></g>
</svg>`;

/* today's hours for a store: weekdays use `open`, Sat/Sun use `wk` */
export const hoursFor = (s, d = new Date()) => (d.getDay() === 0 || d.getDay() === 6) ? s.wk : s.open;
const fmt = x => x === 24 || x === 0 ? 'midnight' : `${x % 12 || 12} ${x < 12 ? 'am' : 'pm'}`;
export const hoursText = h => h[0] === 0 && h[1] === 24 ? 'Open 24 hours' : `${fmt(h[0])} – ${fmt(h[1])}`;

export function openNow(s, d = new Date()) {
  const h = hoursFor(s, d), now = d.getHours() + d.getMinutes() / 60;
  if (h[0] === 0 && h[1] === 24) return [true, 'Open 24 hours'];
  const o = now >= h[0] && now < h[1];
  const left = h[1] - now;
  if (o) return [true, left <= 1 ? `Closes soon · ${fmt(h[1])}` : `Open until ${fmt(h[1])}`];
  if (now < h[0]) return [false, `Opens ${fmt(h[0])}`];
  const tmr = new Date(d.getTime() + 864e5); return [false, `Opens ${fmt(hoursFor(s, tmr)[0])} tomorrow`];
}

export function pinsHTML() {
  return STORES.map(s => { const [o, t] = openNow(s); return `<button class="pin${o ? '' : ' shut'}" type="button" data-store="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.name}, ${t}" aria-pressed="false"><i class="pulse"></i><span>${IC.cup}</span><em class="pin__tip"><b>${s.name.replace('GioCoffee ', '')}</b>${t}</em></button>`; }).join('');
}
