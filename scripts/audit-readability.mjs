import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3005';
const OUT  = process.argv[3];
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false },
];

/** Sections to park the scroll at so pinned/absolute content is actually laid out. */
const STOPS = ['top', 'play', 'work', 'exp-mid', 'toolkit', 'vezilo', 'photo', 'lounge', 'contact'];

const audit = `(stopName) => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => { const m = (s || '').match(/[\\d.]+/g); return m ? m.map(Number) : null; };
  const alpha = (s) => { const p = parse(s); return p && p.length > 3 ? p[3] : 1; };
  const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

  // effective background: walk up to the first opaque-ish background colour
  const bgOf = (el) => {
    let n = el, gradient = false, acc = null;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') gradient = true;
      const a = alpha(cs.backgroundColor), p = parse(cs.backgroundColor);
      if (p && a > 0) { const c = p.slice(0, 3); acc = acc ? over(acc.c, c, acc.a) && { c: over(acc.c, c, acc.a), a: 1 } : { c, a }; if (a >= 0.95) return { rgb: acc.c, gradient }; }
      n = n.parentElement;
    }
    const bp = parse(getComputedStyle(document.body).backgroundColor) || [12, 59, 46];
    return { rgb: acc ? over(acc.c, bp.slice(0, 3), acc.a) : bp.slice(0, 3), gradient };
  };

  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };

  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    // only elements that directly own visible text
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    // skip anything the design has faded out at this scroll position
    let op = 1, n = el; while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
    if (op < 0.25) continue;

    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight) || 400;
    const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    const fgp = parse(cs.color) || [255, 255, 255];
    const bg = bgOf(el);
    const fg = over(fgp.slice(0, 3), bg.rgb, alpha(cs.color) * op);
    const cr = ratio(fg, bg.rgb);
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const need = large ? 3 : 4.5;
    const key = el.tagName + '|' + (el.className || '') + '|' + own.slice(0, 40) + '|' + Math.round(fs);
    if (seen.has(key)) continue; seen.add(key);

    const chars = own.length;
    const perLine = lh > 0 ? Math.round(chars / Math.max(1, Math.round(r.height / lh))) : chars;

    out.push({
      stop: stopName,
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''),
      text: own.slice(0, 60),
      fontSize: +fs.toFixed(1),
      weight: fw,
      lineHeight: +(lh / fs).toFixed(2),
      letterSpacing: cs.letterSpacing === 'normal' ? 0 : +parseFloat(cs.letterSpacing).toFixed(2),
      upper: cs.textTransform === 'uppercase',
      contrast: +cr.toFixed(2),
      needs: need,
      contrastFail: cr < need && !bg.gradient,
      contrastUnknown: bg.gradient && cr < need,
      gradientBg: bg.gradient,
      widthPx: Math.round(r.width),
      charsPerLine: perLine,
      tap: (el.closest('a,button') ? (() => { const t = el.closest('a,button').getBoundingClientRect(); return Math.round(Math.min(t.width, t.height)); })() : null),
    });
  }
  return out;
}`;

const browser = await chromium.launch({ channel: 'chrome' });
const all = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.mobile, hasTouch: vp.mobile });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.waitForTimeout(1200);
  for (const stop of STOPS) {
    if (stop === 'top') await page.evaluate(() => scrollTo(0, 0));
    else if (stop === 'exp-mid') await page.evaluate(() => { const w = document.querySelector('.expWrap'); scrollTo(0, w.offsetTop + innerHeight * 0.85 * 2 + innerHeight * 0.5); });
    else await page.evaluate((s) => { const e = document.getElementById(s); if (e) scrollTo(0, e.offsetTop + 40); }, stop);
    await page.waitForTimeout(700);
    const rows = await page.evaluate(`(${audit})(${JSON.stringify(stop)})`);
    all.push(...rows.map(r => ({ ...r, vp: vp.name, vpw: vp.width })));
    if (OUT && vp.mobile) await page.screenshot({ path: `${OUT}/${vp.name}-${stop}.png` });
  }
  await ctx.close();
}
await browser.close();

// de-duplicate per viewport
const uniq = new Map();
for (const r of all) { const k = `${r.vp}|${r.sel}|${r.text}|${r.fontSize}`; if (!uniq.has(k)) uniq.set(k, r); }
const rows = [...uniq.values()];
fs.writeFileSync('/tmp/audit.json', JSON.stringify(rows, null, 1));

const report = (title, list, fmt) => {
  console.log('\n### ' + title + ' (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  for (const r of list.slice(0, 26)) console.log('  ' + fmt(r));
  if (list.length > 26) console.log(`  ... ${list.length - 26} more`);
};

for (const vp of VIEWPORTS) {
  const v = rows.filter(r => r.vp === vp.name);
  console.log(`\n${'='.repeat(72)}\n${vp.name} (${vp.width}px) — ${v.length} text elements checked\n${'='.repeat(72)}`);
  report('Contrast below WCAG AA', v.filter(r => r.contrastFail).sort((a, b) => a.contrast - b.contrast),
    r => `${String(r.contrast).padStart(5)}:1 (needs ${r.needs}) ${String(r.fontSize).padStart(5)}px  ${r.sel.slice(0, 46).padEnd(46)} "${r.text.slice(0, 34)}"`);
  report('Contrast over a gradient (verify by eye)', v.filter(r => r.contrastUnknown),
    r => `${String(r.fontSize).padStart(5)}px  ${r.sel.slice(0, 46).padEnd(46)} "${r.text.slice(0, 34)}"`);
  const worst = v.filter(r => !r.gradientBg).sort((a,b)=>a.contrast-b.contrast).slice(0,3);
  console.log('\n### Lowest measurable contrast: ' + worst.map(r=>`${r.contrast}:1 ${r.sel.split('.')[0]}`).join(', '));
  report('Body text under 16px', v.filter(r => !r.upper && r.fontSize < 16 && r.text.length > 40).sort((a, b) => a.fontSize - b.fontSize),
    r => `${String(r.fontSize).padStart(5)}px lh${r.lineHeight} ${r.sel.slice(0, 46).padEnd(46)} "${r.text.slice(0, 34)}"`);
  report('Any text under 12px', v.filter(r => r.fontSize < 12).sort((a, b) => a.fontSize - b.fontSize),
    r => `${String(r.fontSize).padStart(5)}px ${r.upper ? 'UPPER ' : '      '}${r.sel.slice(0, 44).padEnd(44)} "${r.text.slice(0, 30)}"`);
  report('Line length over 85 characters', v.filter(r => r.charsPerLine > 85 && r.text.length > 80).sort((a, b) => b.charsPerLine - a.charsPerLine),
    r => `${String(r.charsPerLine).padStart(4)} chars/line ${r.sel.slice(0, 44).padEnd(44)} "${r.text.slice(0, 30)}"`);
  report('Tap target under 44px', v.filter(r => r.tap !== null && r.tap < 44).sort((a, b) => a.tap - b.tap),
    r => `${String(r.tap).padStart(4)}px  ${r.sel.slice(0, 48).padEnd(48)} "${r.text.slice(0, 26)}"`);
}
console.log('\nfull data: /tmp/audit.json');
