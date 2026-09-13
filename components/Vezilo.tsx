"use client";
import { useEffect, useRef } from "react";
import { vezilo } from "@/lib/content";

export default function Vezilo() {
  const device = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const d = device.current;
      if (d) { const r = d.getBoundingClientRect(); d.style.setProperty("--py", `${(r.top - innerHeight / 2) * -0.08}px`); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = Boolean(vezilo.href && vezilo.cta);
  return (
    <section id="vezilo" className="wrap">
      <div className="vz" data-reveal>
        <div>
          <div className="plaque">{vezilo.kicker}</div>
          <h2 style={{ marginTop: 26 }}>{vezilo.title} <em>{vezilo.titleAccent}</em></h2>
          <p className="lead">{vezilo.body}</p>
          {live ? (
            <a className="btn" href={vezilo.href} target="_blank" rel="noopener noreferrer" data-magnetic><span className="ball" style={{ background: "var(--blue)" }} /> {vezilo.cta}</a>
          ) : (
            <p className="status"><span className="dot" aria-hidden="true" /> {vezilo.status}</p>
          )}
        </div>
        <div className="device" ref={device} aria-hidden="true">
          <div className="s"><h4>Vezilo</h4><div className="c" /><div className="c" /><div className="c" /><div className="c" /></div>
        </div>
      </div>
    </section>
  );
}
