"use client";

import { useEffect, useState } from "react";

function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// A persistent corner HUD readout — game-chrome flavor for the session
// clock, not a claim about the portfolio itself. No invented game stats
// (XP, score, level) live here, only the literal time this page has been
// open, matching this template's own no-fake-numbers rule.
export default function HudStatus({ accent, ink, pixelClassName }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-4 left-4 z-[5] hidden items-center gap-2 rounded border-2 bg-black/40 px-3 py-2 backdrop-blur sm:flex"
      style={{ borderColor: accent }}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
          style={{ backgroundColor: accent }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
      </span>
      <span className={`${pixelClassName} text-[8px] leading-none`} style={{ color: ink }}>
        SESSION {formatClock(seconds)}
      </span>
    </div>
  );
}
