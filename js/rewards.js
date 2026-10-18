/* GioCoffee · rewards page */
import { boot, $, $$, esc, store, toast, tilt, IC, reduce, cart, refreshMember } from './common.js?v=11';
import { REWARDS, LEVELS, art, byId } from './data.js?v=11';

boot('rewards.html');
const S = { member: store.get('member', false), name: store.get('name', ''), stars: store.get('stars', 0), year: store.get('yearStars', 0) };
const levelOf = y => LEVELS.slice().reverse().find(l => y >= l.from) || LEVELS[0];
const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function card() {
  const lv = levelOf(S.year), next = LEVELS[LEVELS.indexOf(lv) + 1], m = $('#member');
  m.classList.toggle('gold', lv.id === 'gold'); m.classList.toggle('reserve', lv.id === 'reserve');
  $('#mLvl').textContent = S.member ? `${lv.name} member` : 'Not a member yet';
  $('#mName').textContent = S.name || 'Your name';
  $('#mStars').textContent = S.stars;
  $('#mNext').textContent = !S.member ? 'join to start' : next ? `${(next.from - S.year).toLocaleString('en-PH')} ★ to ${next.name}` : 'top level';
}
function rewards() {
  $('#redeemLede').textContent = S.member ? `You have ${S.stars} ★. Redeem a reward and it goes into your order for ₱0.` : 'Join to start collecting. The bars fill as your stars add up.';
  $('#rewardsList').innerHTML = REWARDS.map(r => {
    const can = S.member && S.stars >= r.stars, p = Math.min(1, S.stars / r.stars);
    return `<article class="reward" data-tilt><span class="sheen" aria-hidden="true"></span><img class="lift" src="${art(r.item)}" alt="" width="110" height="110" loading="lazy"><b>${r.stars}${IC.star}<span class="sr"> stars</span></b><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p>
      <div class="meter" role="progressbar" aria-label="Progress to ${esc(r.name)}" aria-valuemin="0" aria-valuemax="${r.stars}" aria-valuenow="${Math.min(S.stars, r.stars)}"><i style="transform:scaleX(${p})"></i></div>
      <button class="btn btn-sm ${can ? '' : 'btn-line'}" type="button" data-redeem="${r.stars}" ${can ? '' : 'disabled'}>${can ? 'Redeem' : S.member ? `${r.stars - S.stars} ★ to go` : 'Join to redeem'}</button></article>`;
  }).join('');
}
function levels() {
  const cur = S.member ? levelOf(S.year).id : null, rows = ['Stars per ₱50', 'Birthday drink', 'Daily syrup or milk swap', 'Monthly size upgrade', 'New drinks a week early', 'Slow-bar tastings', 'Engraved tumbler'];
  const has = { green: [1, 1, 1, 0, 0, 0, 0], gold: [1, 1, 1, 1, 1, 0, 0], reserve: [1, 1, 1, 1, 1, 1, 1] };
  $('#levelsTable').innerHTML = `<caption class="sr">GioStars levels compared</caption><thead><tr><td></td>${LEVELS.map(l => `<th scope="col" class="${l.id === cur ? 'col-you' : ''}">${l.name}<small>${l.to ? `${l.from.toLocaleString('en-PH')}–${l.to.toLocaleString('en-PH')}` : `${l.from.toLocaleString('en-PH')}+`} ★ a year${l.id === cur ? ' · you' : ''}</small></th>`).join('')}</tr></thead>
    <tbody>${rows.map((r, i) => `<tr><th scope="row">${r}</th>${LEVELS.map(l => i === 0 ? `<td class="${l.id === cur ? 'col-you' : ''}"><b>${l.rate} ★</b></td>` : `<td class="${has[l.id][i] ? 'yes' : 'no'} ${l.id === cur ? 'col-you' : ''}">${has[l.id][i] ? '<span class="lbl">Included</span>' : '<span aria-hidden="true">—</span><span class="sr">Not included</span>'}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function all() { card(); rewards(); levels(); refreshMember(); }
/* stars can change from the order drawer or another tab: always read them fresh */
const sync = () => { Object.assign(S, { member: store.get('member', false), name: store.get('name', ''), stars: store.get('stars', 0), year: store.get('yearStars', 0) }); all(); };
addEventListener('gio:stars', sync); addEventListener('storage', e => { if (e.key && e.key.startsWith('gio:')) sync(); }); addEventListener('pageshow', e => { if (e.persisted) sync(); });
all();

$('#rewardsList').addEventListener('click', e => {
  const b = e.target.closest('[data-redeem]'); if (!b || b.disabled) return;
  const r = REWARDS.find(x => x.stars === +b.dataset.redeem); S.stars = store.get('stars', S.stars); if (S.stars < r.stars) { all(); return; }
  S.stars -= r.stars; store.set('stars', S.stars); const keep = b.dataset.redeem;
  cart.add(r.item, { price: 0, reward: true, title: `Reward: ${r.line}`, note: `${r.note} · ${r.stars} ★ redeemed` }, b.closest('.reward'));
  all(); const nb = $(`[data-redeem="${keep}"]`); (nb && !nb.disabled ? nb : $('#rewardsList .btn:not([disabled])') || $('#h-redeem')).focus?.();
});
// card follows the pointer a little
if (matchMedia('(hover: hover) and (pointer: fine)').matches) tilt($('#member'), 10, (x, y) => { $('#member').style.setProperty('--gx', x * 100 + '%'); $('#member').style.setProperty('--gy', y * 100 + '%'); });

// join / sign in
const tabs = [['#tJoin', '#joinForm'], ['#tSign', '#signForm']];
const showTab = i => tabs.forEach(([t, f], k) => { $(t).setAttribute('aria-selected', k === i); $(f).hidden = k !== i; });
$('#tJoin').addEventListener('click', () => showTab(0)); $('#tSign').addEventListener('click', () => showTab(1));
$('.seg').addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const i = $('#tJoin').getAttribute('aria-selected') === 'true' ? 1 : 0; showTab(i); $(tabs[i][0]).focus(); } });
if (location.hash === '#signin') { showTab(1); setTimeout(() => $('#join').scrollIntoView(), 200); }
document.addEventListener('click', e => { if (e.target.closest('[data-signin]')) { showTab(1); } });
$('#jName').value = S.name;
$('#jName').addEventListener('input', e => { $('#mName').textContent = e.target.value.trim() || 'Your name'; });
$('#joinForm').addEventListener('submit', e => {
  e.preventDefault(); const n = $('#jName').value.trim(), em = $('#jEmail').value.trim(), err = $('#jErr');
  if (!n) { err.textContent = 'Add your first name: it goes on your card and your cups.'; $('#jName').setAttribute('aria-invalid', 'true'); $('#jName').focus(); return; }
  if (!okEmail(em)) { err.textContent = 'Check your email, it should look like name@email.com.'; $('#jEmail').setAttribute('aria-invalid', 'true'); $('#jEmail').focus(); return; }
  err.textContent = ''; $$('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  Object.assign(S, { member: true, name: n, stars: S.member ? S.stars : S.stars + 25 });
  store.set('member', true); store.set('name', n); store.set('stars', S.stars);
  all(); toast(`Welcome to GioStars, ${n}. +25 ★ (demo)`);
  if (!reduce) $('#member').animate([{ transform: 'rotate(-5deg) scale(1)' }, { transform: 'rotate(-2deg) scale(1.04)' }, { transform: 'rotate(-5deg) scale(1)' }], { duration: 500, easing: 'cubic-bezier(.23,1,.32,1)' });
  $('#member').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
});
$('#signForm').addEventListener('submit', e => {
  e.preventDefault(); const em = $('#sEmail').value.trim(), err = $('#sErr');
  if (!okEmail(em)) { err.textContent = 'Check your email, it should look like name@email.com.'; $('#sEmail').setAttribute('aria-invalid', 'true'); $('#sEmail').focus(); return; }
  err.textContent = ''; $('#sEmail').removeAttribute('aria-invalid');
  // the sample member: a regular at the Gold level
  Object.assign(S, { member: true, name: S.name || 'Giovanni', stars: Math.max(S.stars, 132), year: 1260 });
  store.set('member', true); store.set('name', S.name); store.set('stars', S.stars); store.set('yearStars', 1260);
  all(); toast(`Signed in as ${S.name} (sample card)`);
  $('#member').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
});
