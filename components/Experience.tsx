"use client";
import { useEffect, useRef, useState } from "react";
import { experience, roles } from "@/lib/content";
import { CUE_WHITE, clamp, drawBall, drawCue, drawTable, easeOut, lerp, Vec } from "@/lib/draw";
import { scrollToId, useCompact } from "@/lib/hooks";

const TW = 1200, TH = 600, TR = 22;
const P = { tl: { x: 0, y: 0 }, tr: { x: TW, y: 0 }, bl: { x: 0, y: TH }, br: { x: TW, y: TH }, tm: { x: TW / 2, y: 0 }, bm: { x: TW / 2, y: TH } };
const POCKETS = Object.values(P);
/** Where each role's ball sits on the table. One entry per role, in the order they are shown. */
const LAYOUT: Vec[] = [
  { x: 860, y: 170 },
  { x: 300, y: 440 },
  { x: 940, y: 450 },
  { x: 420, y: 150 },
  { x: 600, y: 300 },
];

/**
 * The pocket a ball goes to is derived from the direction the cue ball is travelling,
 * never hard-coded: a ball struck from the upper left has to leave to the lower right.
 * Picking the best-aligned pocket keeps every pot plausible if the roles are reordered.
 */
function pocketFor(ball: Vec, dir: Vec): Vec {
  let best = POCKETS[0], bestAlign = -Infinity;
  for (const p of POCKETS) {
    const vx = p.x - ball.x, vy = p.y - ball.y, vl = Math.hypot(vx, vy);
    if (vl < 1) continue;
    const align = (dir.x * vx + dir.y * vy) / vl;
    if (align > bestAlign) { bestAlign = align; best = p; }
  }
  return best;
}
type Shot = { b: Vec; c: string; pk: Vec; dir: Vec; start: Vec; hit: Vec; end: Vec };
function buildShots(): Shot[] {
  let cb: Vec = { x: 600, y: 470 };
  return roles.map((r, i) => {
    const b = LAYOUT[i % LAYOUT.length];
    const dx = b.x - cb.x, dy = b.y - cb.y, d = Math.hypot(dx, dy), dir = { x: dx / d, y: dy / d };
    const hit = { x: b.x - dir.x * 2 * TR, y: b.y - dir.y * 2 * TR };
    const end = { x: hit.x + dir.x * 26, y: hit.y + dir.y * 26 };
    const s = { b, c: r.ball, pk: pocketFor(b, dir), dir, start: cb, hit, end };
    cb = end;
    return s;
  });
}

/** Pinned section: each role you scroll through pots one ball. Fully scrubbable. */
export default function Experience() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [cleared, setCleared] = useState(false);
  const compact = useCompact();
  const n = roles.length;

  useEffect(() => {
    // On phones the section is a plain stacked list (see globals.css), so none of this runs.
    if (compact) {
      if (wrap.current) wrap.current.style.height = "";
      return;
    }
    const shots = buildShots();
    const canvas = cv.current!, c = canvas.getContext("2d")!;
    const stepPx = () => innerHeight * 0.85;
    const size = () => { if (wrap.current) wrap.current.style.height = `${n * stepPx() + innerHeight}px`; };
    size(); addEventListener("resize", size);
    let sy = scrollY, raf = 0, lastStep = -1, lastCleared = false;
    const frame = () => {
      sy += (scrollY - sy) * 0.12; if (Math.abs(scrollY - sy) < 0.05) sy = scrollY;
      const top = wrap.current!.getBoundingClientRect().top + scrollY;
      const inner = sy - top, sp = stepPx();
      let st = clamp(Math.floor(inner / sp), 0, n - 1), t = clamp((inner - st * sp) / sp, 0, 1);
      if (inner < 0) { st = 0; t = 0; } if (inner >= n * sp) t = 1;
      c.clearRect(0, 0, TW, TH);
      drawTable(c, TW, TH, POCKETS, 36);
      let cbp: Vec = shots[0].start;
      shots.forEach((s, i) => {
        if (i < st) return;                                   // already potted
        if (i > st) { drawBall(c, s.b.x, s.b.y, TR, s.c); return; }
        const travel = clamp((t - 0.28) / 0.27, 0, 1), pot = clamp((t - 0.55) / 0.3, 0, 1), shrink = clamp((t - 0.78) / 0.12, 0, 1);
        const bx = lerp(s.b.x, s.pk.x, easeOut(pot)), by = lerp(s.b.y, s.pk.y, easeOut(pot));
        if (shrink < 1) drawBall(c, bx, by, TR * (1 - shrink), s.c);
        cbp = { x: lerp(s.start.x, s.hit.x, easeOut(travel)), y: lerp(s.start.y, s.hit.y, easeOut(travel)) };
        if (t > 0.55) { const f = clamp((t - 0.55) / 0.2, 0, 1); cbp = { x: lerp(s.hit.x, s.end.x, easeOut(f)), y: lerp(s.hit.y, s.end.y, easeOut(f)) }; }
        if (t < 0.36) {
          let gap = TR + 10; if (t < 0.18) gap += easeOut(t / 0.18) * 110; else if (t < 0.28) gap += 110 * (1 - easeOut((t - 0.18) / 0.1));
          c.globalAlpha = t < 0.28 ? 1 : 1 - (t - 0.28) / 0.08;
          drawCue(c, cbp.x, cbp.y, { x: -s.dir.x, y: -s.dir.y }, gap, 620, 12);
          c.globalAlpha = 1;
        }
        if (t < 0.28) { c.save(); c.setLineDash([4, 12]); c.strokeStyle = "rgba(242,232,211,.35)"; c.lineWidth = 2; c.beginPath(); c.moveTo(cbp.x, cbp.y); c.lineTo(s.hit.x, s.hit.y); c.stroke(); c.restore(); }
      });
      if (st === n - 1 && t >= 1) cbp = shots[n - 1].end;
      drawBall(c, cbp.x, cbp.y, TR, CUE_WHITE);
      const shown = inner < 0 ? 0 : st, cl = st === n - 1 && t >= 0.9;
      if (shown !== lastStep) { lastStep = shown; setStep(shown); }
      if (cl !== lastCleared) { lastCleared = cl; setCleared(cl); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [n, compact]);

  return (
    <>
      <div className="exphead wrap" id="work">
        <h2>{experience.title} <em>{experience.titleAccent}</em></h2>
        <p>{experience.sub}</p>
      </div>
      <div className="expWrap" ref={wrap}>
        <div className="pin">
          <div className="tablecard">
            <canvas ref={cv} width={TW} height={TH} aria-label="Illustration: a snooker table where each role pots a ball as you scroll" />
            <div className="lbl"><span>Top-down table</span><span>{cleared ? "Table cleared" : `Shot ${step + 1} of ${n}`}</span></div>
          </div>
          <div>
            <div className="stepbar">
              <div className="dots" aria-hidden="true">
                {roles.map((r, i) => <i key={r.title} style={{ background: r.ball }} className={i === step ? "now" : i < step ? "done" : ""} />)}
              </div>
              <span className="count">{cleared ? "Table cleared" : `Shot ${step + 1} of ${n}`}</span>
            </div>
            <div className="shots">
              {roles.map((r, i) => (
                <article className={`shot${i === step ? " on" : ""}`} key={r.title} style={{ ["--ball" as string]: r.ball }}>
                  <div className="yr">{r.years}</div>
                  <div className="role">{r.role}</div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                  <div className="tags">{r.tags.map((t) => <span key={t}>{t}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
          <a className={`skip${cleared ? " hide" : ""}`} href="#vezilo" onClick={(e) => { e.preventDefault(); scrollToId("vezilo"); }}>Skip to Vezilo ↓</a>
        </div>
      </div>
    </>
  );
}
