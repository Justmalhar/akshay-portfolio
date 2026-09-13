"use client";
import { useEffect, useRef, useState } from "react";
import { CUE_WHITE, clamp, drawBall, drawCue, drawTable, Vec } from "@/lib/draw";

/* Table space. The canvas is scaled to fit its container, so all maths lives in these units. */
const W = 1200, H = 600, R = 18, RAIL = 14, POCKET_R = 34, CAPTURE = 30;
const POCKETS: Vec[] = [{ x: 26, y: 26 }, { x: W - 26, y: 26 }, { x: 26, y: H - 26 }, { x: W - 26, y: H - 26 }, { x: W / 2, y: 16 }, { x: W / 2, y: H - 16 }];
const MIN = RAIL + R, MAXX = W - RAIL - R, MAXY = H - RAIL - R;
const COLOURS = ["#e9c33d", "#1d7a3d", "#6b3b1e", "#2b5aa6", "#e98bb5", "#0f0f10"];
const CUE_SPOT: Vec = { x: 300, y: 300 };
const MAX_SPEED = 25, FRICTION = 0.982, STOP = 0.06, SUBSTEPS = 6, RESTITUTION = 0.8;

type Ball = { x: number; y: number; vx: number; vy: number; c: string; potted: boolean; cue?: boolean };
type Status = "aim" | "striking" | "moving" | "cleared";

function rack(): Ball[] {
  const balls: Ball[] = [{ ...CUE_SPOT, vx: 0, vy: 0, c: CUE_WHITE, potted: false, cue: true }];
  const ax = 820, ay = 300; let k = 0;
  for (let row = 0; row < 3; row++) for (let i = 0; i <= row; i++) balls.push({ x: ax + row * R * 1.76, y: ay + (i - row / 2) * R * 2.06, vx: 0, vy: 0, c: COLOURS[k++], potted: false });
  return balls;
}
const moving = (balls: Ball[]) => balls.some((b) => !b.potted && (Math.abs(b.vx) > STOP || Math.abs(b.vy) > STOP));

/** First object ball the cue ball would hit travelling along `dir`, as a distance, or the cushion distance. */
function castAim(cue: Ball, dir: Vec, balls: Ball[]) {
  let best = Infinity, hitBall: Ball | null = null;
  for (const b of balls) {
    if (b.cue || b.potted) continue;
    const fx = b.x - cue.x, fy = b.y - cue.y, proj = fx * dir.x + fy * dir.y;
    if (proj <= 0) continue;
    const perp2 = fx * fx + fy * fy - proj * proj, rr = (2 * R) * (2 * R);
    if (perp2 > rr) continue;
    const t = proj - Math.sqrt(rr - perp2);
    if (t < best) { best = t; hitBall = b; }
  }
  // cushion distance
  const tx = dir.x > 0 ? (MAXX - cue.x) / dir.x : dir.x < 0 ? (MIN - cue.x) / dir.x : Infinity;
  const ty = dir.y > 0 ? (MAXY - cue.y) / dir.y : dir.y < 0 ? (MIN - cue.y) / dir.y : Infinity;
  const wall = Math.min(tx, ty);
  return hitBall && best < wall ? { t: best, ball: hitBall } : { t: wall, ball: null };
}

export default function PoolGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shots, setShots] = useState(0);
  const [left, setLeft] = useState(COLOURS.length);
  const [msg, setMsg] = useState("Your break. Aim, then click to shoot.");
  const [quiet, setQuiet] = useState(false);
  const [status, setStatus] = useState<Status>("aim");
  const [touch, setTouch] = useState(false);
  const g = useRef({ balls: rack(), status: "aim" as Status, pointer: null as Vec | null, strikeT: 0, pendingDir: { x: 1, y: 0 }, pendingPower: 0, shots: 0, pottedThisShot: 0, scratched: false });

  const publish = () => { const el = wrapRef.current; if (el) el.dataset.balls = JSON.stringify(g.current.balls.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y), potted: b.potted, cue: !!b.cue }))); };
  const reset = () => {
    const s = g.current; s.balls = rack(); publish(); s.status = "aim"; s.shots = 0; s.pottedThisShot = 0; s.scratched = false;
    setShots(0); setLeft(COLOURS.length); setStatus("aim"); setQuiet(false); setMsg("Re-racked. Your break.");
  };

  useEffect(() => {
    const canvas = cv.current!, c = canvas.getContext("2d")!;
    const s = g.current; publish();
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const toTable = (e: PointerEvent): Vec => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
    const aimFrom = (p: Vec) => {
      const cue = s.balls[0]; const dx = p.x - cue.x, dy = p.y - cue.y, d = Math.hypot(dx, dy) || 1;
      return { dir: { x: dx / d, y: dy / d }, power: clamp((d - 30) / 380, 0.12, 1) };
    };
    const shoot = () => {
      if (s.status !== "aim" || !s.pointer) return;
      const { dir, power } = aimFrom(s.pointer);
      s.pendingDir = dir; s.pendingPower = power; s.strikeT = 0; s.status = "striking"; setStatus("striking");
    };
    const onMove = (e: PointerEvent) => { s.pointer = toTable(e); };
    const onLeave = () => { s.pointer = null; };
    const onDown = (e: PointerEvent) => { if (e.button !== 0) return; s.pointer = toTable(e); shoot(); };
    canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerleave", onLeave); canvas.addEventListener("pointerdown", onDown);
    const onRerack = () => reset(); addEventListener("portfolio:rerack", onRerack);

    const settle = () => {
      const cue = s.balls[0];
      if (s.scratched) {
        cue.potted = false; cue.vx = cue.vy = 0; cue.x = CUE_SPOT.x; cue.y = CUE_SPOT.y;
        for (let tries = 0; tries < 12 && s.balls.some((b) => !b.cue && !b.potted && Math.hypot(b.x - cue.x, b.y - cue.y) < 2 * R + 2); tries++) cue.x -= R * 2.2;
      }
      const remaining = s.balls.filter((b) => !b.cue && !b.potted).length;
      setLeft(remaining); publish();
      if (remaining === 0) { s.status = "cleared"; setStatus("cleared"); setQuiet(false); setMsg(`Table cleared in ${s.shots} shot${s.shots === 1 ? "" : "s"}. Re-rack?`); return; }
      s.status = "aim"; setStatus("aim");
      if (s.scratched) { setQuiet(false); setMsg("Scratch. Cue ball respotted, play on."); }
      else if (s.pottedThisShot > 0) { setQuiet(false); setMsg(s.pottedThisShot > 1 ? `${s.pottedThisShot} potted in one. Play on.` : remaining === 1 ? "Potted. One left." : "Potted. Play on."); }
      else { setQuiet(true); setMsg("Missed. Another go."); }
    };

    const physics = () => {
      const balls = s.balls, f = Math.pow(FRICTION, 1 / SUBSTEPS);
      for (let step = 0; step < SUBSTEPS; step++) {
        for (const b of balls) {
          if (b.potted) continue;
          b.x += b.vx / SUBSTEPS; b.y += b.vy / SUBSTEPS; b.vx *= f; b.vy *= f;
          for (const p of POCKETS) if (Math.hypot(b.x - p.x, b.y - p.y) < CAPTURE) { b.potted = true; b.vx = b.vy = 0; if (b.cue) s.scratched = true; else s.pottedThisShot++; break; }
          if (b.potted) continue;
          if (b.x < MIN) { b.x = MIN; b.vx = -b.vx * RESTITUTION; } else if (b.x > MAXX) { b.x = MAXX; b.vx = -b.vx * RESTITUTION; }
          if (b.y < MIN) { b.y = MIN; b.vy = -b.vy * RESTITUTION; } else if (b.y > MAXY) { b.y = MAXY; b.vy = -b.vy * RESTITUTION; }
        }
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j]; if (a.potted || b.potted) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (d === 0 || d >= 2 * R) continue;
          const nx = dx / d, ny = dy / d, p = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (p > 0) { a.vx -= p * nx; a.vy -= p * ny; b.vx += p * nx; b.vy += p * ny; }
          const ov = (2 * R - d) / 2; a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
        }
      }
      for (const b of balls) if (Math.abs(b.vx) <= STOP && Math.abs(b.vy) <= STOP) { b.vx = 0; b.vy = 0; }
    };

    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(50, now - last); last = now;
      const cue = s.balls[0];
      if (s.status === "striking") {
        s.strikeT += dt / 110;
        if (s.strikeT >= 1) {
          cue.vx = s.pendingDir.x * s.pendingPower * MAX_SPEED; cue.vy = s.pendingDir.y * s.pendingPower * MAX_SPEED;
          s.shots++; setShots(s.shots); s.pottedThisShot = 0; s.scratched = false; s.status = "moving"; setStatus("moving"); setQuiet(true); setMsg("…");
        }
      }
      if (s.status === "moving") { physics(); if (!moving(s.balls)) settle(); }

      /* draw */
      c.clearRect(0, 0, W, H);
      drawTable(c, W, H, POCKETS, POCKET_R);
      for (const b of s.balls) if (!b.potted && !b.cue) drawBall(c, b.x, b.y, R, b.c);
      if (!cue.potted) {
        if ((s.status === "aim" && s.pointer) || s.status === "striking") {
          const { dir, power } = s.status === "aim" ? aimFrom(s.pointer!) : { dir: s.pendingDir, power: s.pendingPower };
          if (s.status === "aim") {
            const cast = castAim(cue, dir, s.balls);
            const gx = cue.x + dir.x * cast.t, gy = cue.y + dir.y * cast.t;
            c.save(); c.setLineDash([4, 12]); c.lineWidth = 2; c.strokeStyle = "rgba(242,232,211,.38)";
            c.beginPath(); c.moveTo(cue.x + dir.x * R, cue.y + dir.y * R); c.lineTo(gx, gy); c.stroke(); c.setLineDash([]);
            c.strokeStyle = "rgba(242,232,211,.5)"; c.beginPath(); c.arc(gx, gy, R, 0, Math.PI * 2); c.stroke();
            if (cast.ball) {
              const ox = cast.ball.x - gx, oy = cast.ball.y - gy, od = Math.hypot(ox, oy) || 1;
              c.strokeStyle = "rgba(231,201,128,.7)"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cast.ball.x, cast.ball.y); c.lineTo(cast.ball.x + (ox / od) * (40 + 90 * power), cast.ball.y + (oy / od) * (40 + 90 * power)); c.stroke();
            }
            c.restore();
          }
          const pull = R + 6 + power * 80;
          const gap = s.status === "striking" ? pull - (pull - R - 2) * Math.min(1, s.strikeT) : pull;
          drawCue(c, cue.x, cue.y, { x: -dir.x, y: -dir.y }, gap, 640, 12);
          // power meter under the cue ball
          if (s.status === "aim") { c.save(); c.globalAlpha = 0.9; c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(cue.x - 40, cue.y + R + 12, 80, 5); c.fillStyle = power > 0.75 ? "#c9313d" : "#e7c980"; c.fillRect(cue.x - 40, cue.y + R + 12, 80 * power, 5); c.restore(); }
        }
        drawBall(c, cue.x, cue.y, R, CUE_WHITE);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); removeEventListener("portfolio:rerack", onRerack);
      canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("pointerdown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="play" className="wrap play">
      <div className="inner">
      <div className="head" data-reveal>
        <div>
          <div className="plaque">Interlude</div>
          <h2 style={{ marginTop: 22 }}>Your <em>break.</em></h2>
          <p>{touch ? "Six balls, one cue. Tap where you want the cue ball to go: the further from it you tap, the harder it hits." : "Six balls, one cue. Move the mouse to aim, click to shoot: the further from the cue ball you click, the harder it hits."} Pot them all, or scroll on. Nobody is keeping score.</p>
        </div>
        <div className="hud" aria-live="polite">
          <span>Shots<b>{shots}</b></span>
          <span>Left<b>{left}</b></span>
        </div>
      </div>
      <div className="tableWrap" ref={wrapRef} data-nocursor data-reveal>
        <canvas ref={cv} width={W} height={H} role="img" aria-label="A playable pool table with six balls and a cue ball" />
        <div className={`tableMsg${quiet ? " quiet" : ""}`} aria-live="polite">{msg}</div>
      </div>
      <div className="playFoot">
        <span className="hint">{touch ? "Tap · pot" : "Aim · click · pot"}{status === "cleared" ? " · cleared" : ""}</span>
        <div className="cta">
          <button className="btn ghost small" onClick={reset}><span className="ball" style={{ background: "var(--yellow)" }} /> Re-rack table</button>
          <a className="btn small" href="#work" onClick={(e) => { e.preventDefault(); document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }); }}>On to the work ↓</a>
        </div>
      </div>
      </div>
    </section>
  );
}
