"use client";
import { useEffect, useRef } from "react";
import { prints } from "@/lib/content";
import { clamp, easeOut } from "@/lib/draw";

/** Vertical scroll drives the wall of prints sideways while the section is pinned. */
export default function Prints() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0, sy = scrollY;
    const tick = () => {
      sy += (scrollY - sy) * 0.12; if (Math.abs(scrollY - sy) < 0.05) sy = scrollY;
      const w = wrap.current, t = track.current;
      if (w && t) {
        const top = w.getBoundingClientRect().top + scrollY;
        const p = clamp((sy - top) / (w.offsetHeight - innerHeight), 0, 1);
        const max = Math.max(0, t.scrollWidth - innerWidth + 80);
        t.style.transform = `translateX(${-max * easeOut(p)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="railWrap" id="photo" ref={wrap}>
      <div className="pin">
        <div className="head">
          <h2>Prints on the <em>wall.</em></h2>
          <p>Photographs from the road. Keep scrolling and the wall slides past.</p>
        </div>
        <div className="track" ref={track}>
          {prints.map((p) => (
            <figure className="pr" key={p.title} style={{ ["--r" as string]: `${p.tilt}deg` }} data-hover>
              <div className="img" style={p.src ? undefined : { background: p.gradient }}>
                {p.src && <img src={p.src} alt={`${p.title}, ${p.year}`} loading="lazy" />}
              </div>
              <figcaption className="cap"><b>{p.title}</b><span>{p.year}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
