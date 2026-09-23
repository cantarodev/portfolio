import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Scroll progress bar driven imperatively by GSAP (via a ref) instead of React
 * state. This keeps the server HTML free of browser-derived inline styles, so
 * hydration can never disagree on `transform`.
 */
export function ScrollProgressBar() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = bar.current;
    if (!element) return;

    gsap.set(element, { scaleX: 0, transformOrigin: "left center" });

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(element, { scaleX: self.progress }),
    });

    return () => trigger.kill();
  });

  return (
    <div
      ref={bar}
      aria-hidden
      className="h-0.5 origin-left bg-gradient-to-r from-term via-term-cyan to-copper"
    />
  );
}
