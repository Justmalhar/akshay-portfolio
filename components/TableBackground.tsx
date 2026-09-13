"use client";
import { useEffect, useRef } from "react";
import { BALL_COLOURS, CUE_WHITE, clamp, drawBall, drawCue, easeInOut, easeOut, fitCanvas, lerp, lerp2, Vec } from "@/lib/draw";
import { useMotionAllowed } from "@/lib/hooks";

/**
 * The fixed canvas behind the page: the rack breaks as you scroll the hero, the balls settle
 * into the margins for the rest of the visit, and they roll back into a triangle at the contact.
 */
export default function TableBackground() {
  const allowed = useMotionAllowed();
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!allowed || !cv.current) return;
    const canvas = cv.current;
    let W = innerWidth, H = innerHeight, ctx = fitCanvas(canvas, W, H);
    const R = 13;
    let rack: (Vec & { c: string })[] = [], rest1: Vec[] = [], rest: Vec[] = [], rerack: Vec[] = [], contactTop = 0;
    const layout = () => {
      W = innerWidth; H = innerHeight; ctx = fitCanvas(canvas, W, H);
      const ax = Math.min(W * 0.72, W - 260), ay = H * 0.42; rack = []; let k = 0;
      for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) rack.push({ x: ax + row * R * 1.78, y: ay + (i - row / 2) * R * 2.05, c: BALL_COLOURS[k++] });
      rest1 = rack.map((_, i) => (i % 2 ? { x: W - 46, y: 110 + (((i * 7) % 10) / 10) * (H - 220) } : { x: W * 0.5 + (((i * 3) % 10) / 10) * (W * 0.42), y: H - 64 }));
      rest = rack.map((_, i) => ({ x: i % 2 ? W - 46 : 46, y: 90 + (((i * 7) % 10) / 10) * (H - 180) }));
      const c = document.getElementById("contact"); contactTop = c ? c.getBoundingClientRect().top + scrollY : 1e9;
      const rx = W / 2 - 40, ry = Math.max(96, H * 0.15); rerack = [];
      for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) rerack.push({ x: rx + row * R * 1.78, y: ry + (i - row / 2) * R * 2.05 });
    };
    layout();
    const ro = new ResizeObserver(layout); ro.observe(document.body); addEventListener("resize", layout);
    const contactEl = document.getElementById("contact");
    let sy = scrollY, raf = 0;
    const frame = () => {
      sy += (scrollY - sy) * 0.12; if (Math.abs(scrollY - sy) < 0.05) sy = scrollY;
      ctx.clearRect(0, 0, W, H);
      const p = clamp(sy / H, 0, 1);                              // the break
      const p2 = clamp((sy - H) / (H * 0.6), 0, 1);               // settle into the margins
      const q = clamp((sy - (contactTop - H * 0.9)) / (H * 0.9), 0, 1); // re-rack
      const apex = rack[0];
      const cs = { x: apex.x - Math.min(W * 0.14, 190), y: apex.y + Math.min(H * 0.17, 150) };
      const dd = Math.hypot(apex.x - cs.x, apex.y - cs.y), d = { x: (apex.x - cs.x) / dd, y: (apex.y - cs.y) / dd };
      const hit = { x: apex.x - d.x * 2 * R - 1, y: apex.y - d.y * 2 * R - 1 };
      const stp = clamp(p / 0.22, 0, 1), scatter = clamp((p - 0.22) / 0.78, 0, 1);
      rack.forEach((b, i) => {
        let x: number, y: number, a = 1;
        if (q > 0) { x = lerp(rest[i].x, rerack[i].x, easeInOut(q)); y = lerp(rest[i].y, rerack[i].y, easeInOut(q)); a = lerp(0.5, 1, easeInOut(q)); }
        else {
          const t = clamp(scatter * 1.35 - (i / rack.length) * 0.35, 0, 1);
          x = lerp(b.x, rest1[i].x, easeOut(t)); y = lerp(b.y, rest1[i].y, easeOut(t));
          if (p2 > 0) { x = lerp(x, rest[i].x, easeInOut(p2)); y = lerp(y, rest[i].y, easeInOut(p2)); a = lerp(1, 0.5, easeInOut(p2)); }
        }
        drawBall(ctx, x, y, R, b.c, a);
      });
      contactEl?.classList.toggle("racked", q > 0.95);
      let cb = lerp2(cs, hit, easeOut(stp)); if (scatter > 0) cb = lerp2(hit, { x: W * 0.6, y: H * 0.72 }, easeOut(scatter));
      const park = { x: 46, y: H * 0.5 }; if (p2 > 0) cb = lerp2(cb, park, easeInOut(p2)); let ca = lerp(1, 0.5, easeInOut(p2));
      if (q > 0) { cb = lerp2(park, { x: rerack[0].x - 90, y: rerack[0].y }, easeInOut(q)); ca = lerp(0.5, 1, easeInOut(q)); }
      drawBall(ctx, cb.x, cb.y, R, CUE_WHITE, ca);
      if (p < 0.3) {
        const gap = R + 8 + (stp < 0.7 ? easeOut(stp / 0.7) * 70 : 70 * (1 - easeOut((stp - 0.7) / 0.3)));
        ctx.globalAlpha = 1 - clamp((p - 0.22) / 0.08, 0, 1);
        drawCue(ctx, cb.x, cb.y, { x: -d.x, y: -d.y }, gap, Math.min(520, W * 0.36));
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("resize", layout); };
  }, [allowed]);

  if (!allowed) return null;
  return <canvas ref={cv} className="bgCanvas" aria-hidden="true" />;
}
