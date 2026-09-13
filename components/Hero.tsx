"use client";
import { useEffect, useRef } from "react";
import { site } from "@/lib/content";
import { scrollToId } from "@/lib/hooks";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => ref.current?.classList.toggle("gone", scrollY > 30);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollToId(id); };
  return (
    <div className="heroWrap" id="top">
      <header className="hero" ref={ref}>
        <div className="inner">
          <div className="copy">
            <div className="plaque">{site.fullName} · {site.tagline}</div>
            <h1>
              {site.headline[0]}<br />{site.headline[1]}<br /><em>{site.headline[2]}</em>
            </h1>
            <p className="lead">{site.intro}</p>
            <div className="cta">
              <a className="btn" href="#work" onClick={go("work")} data-magnetic><span className="ball" style={{ background: "var(--red)" }} /> See the work</a>
              <a className="btn ghost" href="#vezilo" onClick={go("vezilo")} data-magnetic><span className="ball" style={{ background: "var(--pink)" }} /> Vezilo</a>
              <a className="btn ghost" href="#play" onClick={go("play")} data-magnetic><span className="ball" style={{ background: "var(--yellow)" }} /> Play a frame</a>
            </div>
          </div>
        </div>
        <div className="scrollhint" aria-hidden="true">Scroll to break <i /></div>
      </header>
    </div>
  );
}
