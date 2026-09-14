import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.argv[2] || 'http://localhost:3005';
const OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const R = []; const chk = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`);

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const cdp = await ctx.newCDPSession(page);
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

const centre = async () => { await page.evaluate(() => { const r = document.querySelector('.tableWrap').getBoundingClientRect(); scrollTo(0, r.top + scrollY - (innerHeight - r.height) / 2); }); await page.waitForTimeout(700); };
await centre();
const box = async () => page.locator('.tableWrap canvas').boundingBox();
let B = await box();
const toScreen = (tx, ty) => ({ x: B.x + tx / 1200 * B.width, y: B.y + ty / 600 * B.height });
const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] });
const aim = () => page.getAttribute('.tableWrap', 'data-aim');
const balls = async () => JSON.parse(await page.getAttribute('.tableWrap', 'data-balls'));
const shots = async () => Number((await page.locator('.hud b').first().innerText()).trim());
const settle = async () => { for (let i = 0; i < 60; i++) { await page.waitForTimeout(200); if (!(await page.locator('.tableMsg').innerText()).includes('…')) break; } };

const VW = 390, VH = 844;
/**
 * Shorten a drag so it stays on screen without bending it. A real finger can leave the table
 * (pointer capture keeps the drag alive), it just cannot leave the phone.
 */
function rayClamp(from, to, pad = 12) {
  const dx = to.x - from.x, dy = to.y - from.y;
  let t = 1;
  if (dx !== 0) { if (to.x < pad) t = Math.min(t, (pad - from.x) / dx); if (to.x > VW - pad) t = Math.min(t, (VW - pad - from.x) / dx); }
  if (dy !== 0) { if (to.y < pad) t = Math.min(t, (pad - from.y) / dy); if (to.y > VH - pad) t = Math.min(t, (VH - pad - from.y) / dy); }
  t = Math.max(0, Math.min(1, t));
  return { x: from.x + dx * t, y: from.y + dy * t };
}
/** Drag between two screen points. */
async function dragScreen(a, b, { steps = 10, release = true } = {}) {
  await touch('touchStart', a);
  for (let i = 1; i <= steps; i++) await touch('touchMove', { x: a.x + (b.x - a.x) * i / steps, y: a.y + (b.y - a.y) * i / steps });
  if (release) await touch('touchEnd', b);
  return b;
}
/** Drag between two table-space points, clamped to the screen along the same line. */
async function drag(from, to, opts = {}) {
  const a = toScreen(from.x, from.y);
  return dragScreen(a, rayClamp(a, toScreen(to.x, to.y)), opts);
}

// 1. the cue is on the table before you touch anything
chk('a resting cue is drawn on a touch device', (await aim() || '').startsWith('rest'), await aim());
if (OUT) await page.screenshot({ path: `${OUT}/1-rest.png` });

// 2. dragging shows the cue following the finger, with power
await touch('touchStart', toScreen(300, 300));
await touch('touchMove', toScreen(200, 300));
await page.waitForTimeout(120);
const midAim = await aim();
chk('dragging switches the cue to the finger', (midAim || '').startsWith('drag'), midAim);
await touch('touchMove', toScreen(120, 300));
await page.waitForTimeout(120);
const farAim = await aim();
const pw = (t) => Number((t || '0:0').split(':')[1]);
chk('pulling back further raises the power', pw(farAim) > pw(midAim), `${midAim} -> ${farAim}`);
if (OUT) await page.screenshot({ path: `${OUT}/2-pullback.png` });

// 3. release fires, and the ball goes the opposite way to the pull
const before = await balls();
await touch('touchEnd', toScreen(120, 300));
await page.waitForTimeout(150);
const swing = await aim();
chk('release swings the cue', /^(strike|none|rest)/.test(String(swing)), String(swing));
await settle();
const after = await balls();
chk('the drag took a shot', (await shots()) === 1, `shots=${await shots()}`);
chk('pulling left sends the ball right', after[0].x > before[0].x + 40, `cue x ${before[0].x} -> ${after[0].x}`);
if (OUT) await page.screenshot({ path: `${OUT}/3-after-shot.png` });

// 4. a tap with no pull must not fire
const s0 = await shots();
const tp = toScreen((await balls())[0].x + 8, (await balls())[0].y + 8);
await touch('touchStart', tp); await touch('touchEnd', tp);
await page.waitForTimeout(600);
chk('a tap with no pull-back does not shoot', (await shots()) === s0, `shots ${s0} -> ${await shots()}`);
chk('and it says why', /pull back/i.test(await page.locator('.tableMsg').innerText()), await page.locator('.tableMsg').innerText());

// 5. the cue returns to rest after the shot
chk('the cue returns to rest between shots', (await aim() || '').startsWith('rest'), await aim());

// 6. a drag that ends off the table still fires (pointer capture)
const s1 = await shots();
let cb = (await balls())[0];
await drag({ x: cb.x, y: cb.y }, { x: cb.x - 260, y: cb.y - 240 });
await settle();
chk('a drag released off the table still fires', (await shots()) === s1 + 1, `shots ${s1} -> ${await shots()}`);

// 7. dragging on the table must not scroll the page
await centre(); B = await box();
const yBefore = await page.evaluate(() => scrollY);
cb = (await balls())[0];
await drag({ x: cb.x, y: cb.y }, { x: cb.x, y: cb.y - 280 }, { release: false });
const yDuring = await page.evaluate(() => scrollY);
await touch('touchEnd', toScreen(cb.x, cb.y - 280));
await settle();
chk('dragging on the table does not scroll the page', yBefore === yDuring, `${yBefore} -> ${yDuring}`);

// 8. the page still scrolls when you swipe outside the table
const yPre = await page.evaluate(() => scrollY);
const off = { x: 195, y: 700 };
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [off] });
for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: off.x, y: off.y - i * 30 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.waitForTimeout(700);
chk('swiping beside the table still scrolls', (await page.evaluate(() => scrollY)) !== yPre, `${yPre} -> ${await page.evaluate(() => scrollY)}`);

// 9. play it out to a clear with touch drags only
await centre(); B = await box();
await page.locator('#play button', { hasText: 'Re-rack' }).click(); await page.waitForTimeout(400);
const POCK = [[26,26],[1174,26],[26,574],[1174,574],[600,16],[600,584]], RR = 18;
const clear = (a, b, skip, l) => { const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy); for (let i=1;i<l.length;i++){const o=l[i]; if(o.potted||i===skip) continue; const px=o.x-a[0],py=o.y-a[1],pr=(px*dx+py*dy)/L; if(pr<0||pr>L) continue; if(Math.abs(px*dy-py*dx)/L<2*RR+2) return false;} return true; };
const plan = (l) => { const cue=l[0]; let best=null; l.forEach((b,i)=>{ if(i===0||b.potted) return; for(const pk of POCK){ const vx=pk[0]-b.x,vy=pk[1]-b.y,vl=Math.hypot(vx,vy); const gx=b.x-vx/vl*2*RR, gy=b.y-vy/vl*2*RR; const ax=gx-cue.x,ay=gy-cue.y,al=Math.hypot(ax,ay); const cut=Math.acos((ax*vx+ay*vy)/(al*vl)); if(cut>1.0||al<2*RR+4) continue; if(!clear([cue.x,cue.y],[gx,gy],i,l)||!clear([b.x,b.y],pk,i,l)) continue; const sc=cut+vl/1500+al/3000; if(!best||sc<best.sc) best={sc,dir:[ax/al,ay/al],dist:al+vl}; } }); return best; };
let cleared = false, tries = 0;
for (; tries < 22 && !cleared; tries++) {
  const l = await balls();
  if (l.filter((b, i) => i > 0 && !b.potted).length === 0) { cleared = true; break; }
  const pl = plan(l), cue = l[0];
  let dx, dy;
  if (pl) { const power = Math.min(1, 0.45 + pl.dist / 1400); const d = 50 + power * 150; dx = -pl.dir[0] * d; dy = -pl.dir[1] * d; }
  else { dx = -160; dy = -90; }
  // pull back along the planned line; rayClamp shortens it to fit the screen without bending it
  await drag({ x: cue.x, y: cue.y }, { x: cue.x + dx, y: cue.y + dy });
  await settle();
  if (await page.locator('.winCard').count()) { cleared = true; break; }
}
chk('a full frame is playable with touch drags alone', cleared, `${tries} shots`);
chk('the win card shows on touch', (await page.locator('.winCard').count()) > 0);
if (OUT) await page.screenshot({ path: `${OUT}/4-touch-win.png` });
chk('no console errors or exceptions', errors.length === 0, errors.slice(0, 2).join(' | '));

// 10. mouse behaviour is untouched
const mctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const mp = await mctx.newPage();
await mp.goto(BASE, { waitUntil: 'networkidle' });
await mp.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
await mp.evaluate(() => { const r = document.querySelector('.tableWrap').getBoundingClientRect(); scrollTo(0, r.top + scrollY - (innerHeight - r.height) / 2); });
await mp.waitForTimeout(700);
const mb = await mp.locator('.tableWrap canvas').boundingBox();
chk('mouse: no resting cue, aim follows hover', (await mp.getAttribute('.tableWrap', 'data-aim') || '').startsWith('none'), await mp.getAttribute('.tableWrap', 'data-aim'));
await mp.mouse.move(mb.x + mb.width * 0.7, mb.y + mb.height * 0.5);
await mp.waitForTimeout(200);
chk('mouse: hovering aims the cue', (await mp.getAttribute('.tableWrap', 'data-aim') || '').startsWith('hover'), await mp.getAttribute('.tableWrap', 'data-aim'));
await mp.mouse.click(mb.x + mb.width * 0.7, mb.y + mb.height * 0.5);
for (let i = 0; i < 60; i++) { await mp.waitForTimeout(200); if (!(await mp.locator('.tableMsg').innerText()).includes('…')) break; }
chk('mouse: click still shoots', Number((await mp.locator('.hud b').first().innerText()).trim()) === 1);
await mctx.close();

await browser.close();
console.log(R.join('\n'));
console.log(`\n${R.filter(r => r.startsWith('PASS')).length}/${R.length} passed`);
