export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export type Vec = { x: number; y: number };
export const lerp2 = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const BALL_COLOURS = ["#c9313d", "#e9c33d", "#1d7a3d", "#6b3b1e", "#2b5aa6", "#e98bb5", "#0f0f10", "#c9313d", "#e9c33d", "#c9313d"];
export const CUE_WHITE = "#e9e2d0";

export function drawBall(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, alpha = 1) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, "rgba(255,255,255,.9)");
  g.addColorStop(0.3, col);
  g.addColorStop(1, "rgba(0,0,0,.6)");
  c.save();
  c.globalAlpha = alpha;
  c.shadowColor = "rgba(0,0,0,.5)";
  c.shadowBlur = 14;
  c.shadowOffsetY = 6;
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/** A cue stick. `dir` points from the ball toward the butt of the cue. */
export function drawCue(c: CanvasRenderingContext2D, x: number, y: number, dir: Vec, gap: number, length: number, width = 9) {
  const tx = x + dir.x * gap, ty = y + dir.y * gap;
  const bx = tx + dir.x * length, by = ty + dir.y * length;
  c.save();
  c.lineCap = "round";
  c.shadowColor = "rgba(0,0,0,.5)";
  c.shadowBlur = 14;
  c.shadowOffsetY = 8;
  const g = c.createLinearGradient(tx, ty, bx, by);
  g.addColorStop(0, "#e9dcc0");
  g.addColorStop(0.12, "#c9a45c");
  g.addColorStop(0.6, "#5a3a22");
  g.addColorStop(1, "#2a1a10");
  c.strokeStyle = g;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(tx + dir.x * 4, ty + dir.y * 4);
  c.lineTo(bx, by);
  c.stroke();
  c.strokeStyle = "#3b7dd8"; // chalked tip
  c.beginPath();
  c.moveTo(tx, ty);
  c.lineTo(tx + dir.x * 5, ty + dir.y * 5);
  c.stroke();
  c.restore();
}

/** Size a canvas for the device pixel ratio and return the 2d context scaled to CSS pixels. */
export function fitCanvas(cv: HTMLCanvasElement, w: number, h: number, maxDpr = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  cv.style.width = w + "px";
  cv.style.height = h + "px";
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Top-down table felt, brass rails and six pockets, drawn in a W×H space. */
export function drawTable(c: CanvasRenderingContext2D, W: number, H: number, pockets: Vec[], pocketR: number) {
  c.fillStyle = "#0a3126";
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.6);
  g.addColorStop(0, "rgba(255,255,255,.06)");
  g.addColorStop(1, "rgba(0,0,0,.25)");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(201,164,92,.7)";
  c.lineWidth = 14;
  c.strokeRect(7, 7, W - 14, H - 14);
  c.strokeStyle = "rgba(60,35,18,.9)";
  c.lineWidth = 6;
  c.strokeRect(3, 3, W - 6, H - 6);
  // baulk line and the D
  c.strokeStyle = "rgba(242,232,211,.12)";
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(W * 0.25, 20); c.lineTo(W * 0.25, H - 20); c.stroke();
  c.beginPath(); c.arc(W * 0.25, H / 2, H * 0.2, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
  for (const p of pockets) {
    c.fillStyle = "#050807";
    c.beginPath(); c.arc(p.x, p.y, pocketR, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(201,164,92,.7)"; c.lineWidth = 4; c.stroke();
  }
}
