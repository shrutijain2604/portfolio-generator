"use client";

import { useEffect, useState } from "react";

function formatAgo(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}s ago`;
  const m = Math.floor(totalSeconds / 60);
  return `${m}m ago`;
}

// A quiet "data freshness" readout, the way a real dashboard shows when it
// last synced — counts from when this page loaded, not a claim about an
// actual backend sync.
export default function LiveSynced({ accent, textColor }) {
  const [seconds, setSeconds] = useState(null);

  useEffect(() => {
    const start = Date.now();
    const tick = () => setSeconds(Math.floor((Date.now() - start) / 1000));
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  if (seconds === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: textColor }}>
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: accent }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
      </span>
      Synced {formatAgo(seconds)}
    </span>
  );
}
