"use client";

import { useEffect, useState } from "react";

// A ticking "session uptime" readout — a nod to the `uptime` command, timing
// how long this page has been open rather than claiming anything about the
// visitor or the site's real-world history.
function formatUptime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function SessionUptime() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="ml-auto hidden items-center gap-1.5 font-mono text-[11px] text-zinc-500 sm:flex">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      session {formatUptime(seconds)}
    </span>
  );
}
