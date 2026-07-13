"use client";

import { useEffect, useState } from "react";

// A ticking "deployed x ago" readout — counts up from page load, echoing a
// CI/CD deploy timestamp without asserting anything about the site's real
// deploy history.
function formatAgo(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}s ago`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s ago`;
}

export default function DeployedAgo() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      deployed {formatAgo(seconds)}
    </span>
  );
}
