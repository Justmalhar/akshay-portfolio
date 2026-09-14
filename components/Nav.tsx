"use client";
import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { scrollToId } from "@/lib/hooks";

const items = [
  { id: "play", label: "Play" },
  { id: "work", label: "Work" },
  { id: "toolkit", label: "Toolkit" },
  { id: "vezilo", label: "Vezilo" },
  { id: "photo", label: "Prints" },
  { id: "lounge", label: "Lounge" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -50% 0px" }
    );
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Primary">
      <a className="logo" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`${site.name}, back to top`}>
        {site.name.toUpperCase()}<i />
      </a>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={active === i.id ? "on" : ""} onClick={(e) => { e.preventDefault(); scrollToId(i.id); history.replaceState(null, "", `#${i.id}`); }}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
