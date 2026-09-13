"use client";
import { useEffect, useState } from "react";

/** True when the visitor prefers reduced motion or is on a coarse pointer (touch) device. */
export function useMotionAllowed() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const wide = window.matchMedia("(min-width: 961px)");
    const update = () => setOk(!mq.matches && fine.matches && wide.matches);
    update();
    [mq, fine, wide].forEach((m) => m.addEventListener("change", update));
    return () => [mq, fine, wide].forEach((m) => m.removeEventListener("change", update));
  }, []);
  return ok;
}

/** Smoothly scroll to an element id (works with sticky/pinned sections). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
