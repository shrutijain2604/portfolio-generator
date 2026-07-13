"use client";

import { useEffect, useRef, useState } from "react";

// Gives an element a one-time animation the first time it scrolls into
// view, instead of the whole page landing at once. Content is fully
// visible by default (no opacity-0 starting state) so a visitor without
// JS, or a crawler, never sees anything missing; `arrivedClassName` is
// only added once the browser confirms the element has actually arrived,
// so each template can supply its own on-arrival animation (a gentle
// fade-up, a snappy pop, etc.) without this component knowing which.
export default function RevealOnScroll({ children, arrivedClassName = "warm-arrive", threshold = 0.2, rootMargin = "0px 0px -80px 0px" }) {
  const ref = useRef(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArrived(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={arrived ? arrivedClassName : ""}>
      {children}
    </div>
  );
}
