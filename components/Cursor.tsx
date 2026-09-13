"use client";
import { useEffect, useRef } from "react";
import { fitCanvas } from "@/lib/draw";
import { useMotionAllowed } from "@/lib/hooks";

/** Cue-ball cursor with chalk ripples on the felt. Off for touch, narrow screens and reduced motion. */
export default function Cursor() {
  const allowed = useMotionAllowed();
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!allowed || !dot.current || !cv.current) return;
    document.body.classList.add("has-cursor");
    const el = dot.current, canvas = cv.current;
    let ctx = fitCanvas(canvas, innerWidth, innerHeight);
    const onResize = () => { ctx = fitCanvas(canvas, innerWidth, innerHeight); };
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, lx = mx, ly = my, acc = 0;
    const ripples: { x: number; y: number; r: number; life: number; strong?: boolean }[] = [];
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      acc += Math.hypot(mx - lx, my - ly); lx = mx; ly = my;
      if (acc > 18) { acc = 0; ripples.push({ x: mx, y: my, r: 6, life: 1 }); }
      const t = e.target as Element | null;
      el.classList.toggle("big", !!t?.closest("a,button,[data-hover]"));
      el.classList.toggle("hidden", !!t?.closest("[data-nocursor]"));
    };
    const onDown = (e: MouseEvent) => { if (!(e.target as Element)?.closest("[data-nocursor]")) ripples.push({ x: e.clientX, y: e.clientY, r: 10, life: 1, strong: true }); };
    const onLeave = () => el.classList.add("hidden");
    const onEnter = () => el.classList.remove("hidden");
    addEventListener("mousemove", onMove); addEventListener("mousedown", onDown); addEventListener("resize", onResize);
    document.documentElement.addEventListener("mouseleave", onLeave); document.documentElement.addEventListener("mouseenter", onEnter);
    let raf = 0;
    const frame = () => {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; r.r += r.strong ? 5 : 2.2; r.life -= r.strong ? 0.018 : 0.03;
        if (r.life <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(242,232,211,${0.35 * r.life})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); document.body.classList.remove("has-cursor");
      removeEventListener("mousemove", onMove); removeEventListener("mousedown", onDown); removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", onLeave); document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [allowed]);

  if (!allowed) return null;
  return (
    <>
      <canvas ref={cv} className="fxCanvas" aria-hidden="true" />
      <div ref={dot} className="cursor" aria-hidden="true" />
    </>
  );
}
