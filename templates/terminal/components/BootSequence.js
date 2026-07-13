"use client";

import { useEffect, useState } from "react";

// A typewriter "boot log" that plays once on load — pure decorative dressing
// for the terminal theme, so it's aria-hidden; the real name/role/bio live
// in the semantic About block just below it, not in here.
export default function BootSequence({ name, sectionCount }) {
  const lines = [
    "booting portfolio_os v2.0...",
    `loading profile: ${name || "guest"}`,
    `mounting ${sectionCount} module${sectionCount === 1 ? "" : "s"}`,
    "status: ready",
  ];

  const [display, setDisplay] = useState([]);

  useEffect(() => {
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    const current = [];

    function tick() {
      if (cancelled || lineIndex >= lines.length) return;
      const line = lines[lineIndex];
      current[lineIndex] = line.slice(0, charIndex);
      setDisplay([...current]);

      if (charIndex < line.length) {
        charIndex++;
        setTimeout(tick, 18);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(tick, 220);
      }
    }

    const id = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // `lines` is rebuilt fresh each render from name/sectionCount, so those
    // are the only real dependencies of the sequence this effect plays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, sectionCount]);

  const finished = display.length === lines.length && display[lines.length - 1] === lines[lines.length - 1];

  if (display.length === 0) return null;

  return (
    <div aria-hidden className="terminal-fade-up mb-8 font-mono text-[12px] leading-relaxed text-zinc-600">
      {display.map((text, i) => (
        <p key={i}>
          <span className="text-emerald-600">$</span> {text}
          {!finished && i === display.length - 1 && (
            <span className="ml-0.5 inline-block h-3 w-[6px] translate-y-[2px] animate-pulse bg-emerald-600" />
          )}
        </p>
      ))}
    </div>
  );
}
