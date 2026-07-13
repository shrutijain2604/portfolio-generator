"use client";

import { useEffect, useState } from "react";

// A typewriter "deploy log" that plays once on load — pure decorative
// dressing for the changelog/shipping theme, so it's aria-hidden; the real
// name/role/bio live in the semantic header just below it.
export default function DeployLog({ name }) {
  const lines = [
    "$ git push origin main",
    "remote: compiling profile...",
    `remote: building ${name || "your"} portfolio`,
    "remote: deployed to production ✓",
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
        setTimeout(tick, 16);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(tick, 260);
      }
    }

    const id = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // `lines` is rebuilt fresh each render from `name`, the only real
    // dependency of the sequence this effect plays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const finished = display.length === lines.length && display[lines.length - 1] === lines[lines.length - 1];

  if (display.length === 0) return null;

  return (
    <div
      aria-hidden
      className="changelog-fade-up mb-10 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-[12px] leading-relaxed text-zinc-500"
    >
      {display.map((text, i) => (
        <p key={i} className={text.startsWith("$") ? "text-zinc-300" : ""}>
          {text}
          {!finished && i === display.length - 1 && (
            <span className="ml-0.5 inline-block h-3 w-[6px] translate-y-[2px] animate-pulse bg-emerald-500" />
          )}
        </p>
      ))}
    </div>
  );
}
