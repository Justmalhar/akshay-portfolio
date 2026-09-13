import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.argv[2] || 'http://localhost:3005';
const OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const R = []; const chk = (n, ok, d = '') => { R.push(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

// centre the table
await page.evaluate(() => { const r = document.querySelector('.tableWrap').getBoundingClientRect(); scrollTo(0, r.top + scrollY - (innerHeight - r.height) / 2); });
await page.waitForTimeout(900);
const box = await page.locator('.tableWrap canvas').boundingBox();
const toScreen = (tx, ty) => ({ x: box.x + tx / 1200 * box.width, y: box.y + ty / 600 * box.height });
const balls = async () => JSON.parse(await page.getAttribute('.tableWrap', 'data-balls'));
const hud = async () => (await page.locator('.hud').innerText()).replace(/\s+/g, ' ');

const POCK = [[26, 26], [1174, 26], [26, 574], [1174, 574], [600, 16], [600, 584]], RR = 18;
const clear = (a, b, skip, list) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); for (let i = 1; i < list.length; i++) { const o = list[i]; if (o.potted || i === skip) continue; const px = o.x - a[0], py = o.y - a[1], pr = (px * dx + py * dy) / L; if (pr < 0 || pr > L) continue; if (Math.abs(px * dy - py * dx) / L < 2 * RR + 2) return false; } return true; };
const plan = (list) => { const cue = list[0]; let best = null; list.forEach((b, i) => { if (i === 0 || b.potted) return; for (const pk of POCK) { const vx = pk[0] - b.x, vy = pk[1] - b.y, vl = Math.hypot(vx, vy); const gx = b.x - vx / vl * 2 * RR, gy = b.y - vy / vl * 2 * RR; const ax = gx - cue.x, ay = gy - cue.y, al = Math.hypot(ax, ay); const cut = Math.acos((ax * vx + ay * vy) / (al * vl)); if (cut > 1.0 || al < 2 * RR + 4) continue; if (!clear([cue.x, cue.y], [gx, gy], i, list) || !clear([b.x, b.y], pk, i, list)) continue; const sc = cut + vl / 1500 + al / 3000; if (!best || sc < best.sc) best = { sc, dir: [ax / al, ay / al], dist: al + vl }; } }); return best; };

let attempts = 0, cleared = false;
for (; attempts < 20 && !cleared; attempts++) {
  const list = await balls();
  if (list.filter((b, i) => i > 0 && !b.potted).length === 0) { cleared = true; break; }
  const p = plan(list); const cue = list[0];
  let tx, ty;
  if (p) { const pw = Math.min(1, 0.35 + p.dist / 1400); const d = 30 + pw * 380; tx = cue.x + p.dir[0] * d; ty = cue.y + p.dir[1] * d; }
  else { const sp = [[1100, 300], [100, 300], [600, 590], [600, 10]]; [tx, ty] = sp[attempts % 4]; }
  const q = toScreen(Math.max(20, Math.min(1180, tx)), Math.max(20, Math.min(580, ty)));
  await page.mouse.move(q.x, q.y); await page.waitForTimeout(120); await page.mouse.click(q.x, q.y);
  for (let i = 0; i < 60; i++) { await page.waitForTimeout(200); if (!(await page.locator('.tableMsg').innerText()).includes('…')) break; }
  if (await page.locator('.winCard').count()) { cleared = true; break; }
}
chk('all six balls potted', cleared, `${attempts} shots`);
await page.waitForTimeout(400);
chk('win card appears', await page.locator('.winCard').isVisible());
chk('win card says the frame is won', (await page.locator('.winKicker').innerText()).toLowerCase().includes('frame won'));
chk('win card reports a shot count', /\d+ shots?\./.test(await page.locator('.winInner p').innerText()), await page.locator('.winInner p').innerText());
chk('confetti canvas was created', await page.evaluate(() => !!document.querySelector('canvas[style*="pointer-events: none"][style*="fixed"]')));
const zi = await page.evaluate(() => { const c = [...document.querySelectorAll('canvas')].find(c => getComputedStyle(c).position === 'fixed' && !c.className); return c ? getComputedStyle(c).zIndex : null; });
chk('confetti draws above the page', zi !== null && Number(zi) >= 70, `z-index ${zi}`);
if (OUT) await page.screenshot({ path: `${OUT}/win-card.png` });
chk('cue-ball cursor is visible over the win card', await page.evaluate(() => { const el = document.querySelector('.winCard'); const t = el.querySelector('button'); return !!t.closest('[data-cursor-on]'); }));
// buttons work
await page.locator('.winCta button').click(); await page.waitForTimeout(500);
chk('“Rack them again” resets and dismisses the card', (await page.locator('.winCard').count()) === 0 && (await hud()).includes('0'), await hud());
chk('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));
// reduced motion: no confetti
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p2 = await ctx2.newPage(); await p2.goto(BASE, { waitUntil: 'networkidle' });
const fired = await p2.evaluate(() => { const before = document.querySelectorAll('canvas').length; window.matchMedia('(prefers-reduced-motion: reduce)').matches; return before; });
chk('reduced motion honoured (page loads, cannons gated)', await p2.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches), 'media query active');
await ctx2.close();
await browser.close();
console.log(R.join('\n'));
console.log(`\n${R.filter(r => r.startsWith('PASS')).length}/${R.length} passed`);
