"use client";

import { useEffect, useState } from "react";
import { tint } from "./shared";

// Highlights whichever section is actually in view, the way a real
// product's docs/dashboard nav does, instead of a static link list that
// never reflects where the visitor actually is on the page.
export default function SidebarNav({ items, accent, ink, inkSoft, muted, borderColor }) {
  const [activeHref, setActiveHref] = useState(items[0]?.href || null);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.href.replace("#", "")))
      .filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveHref(`#${topmost.target.id}`);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
    // `items` is rebuilt fresh each render from the same section ids, so
    // its length/hrefs are the only thing this effect actually needs to
    // re-run for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <nav className="mt-5 space-y-1 border-t px-3 pt-4" style={{ borderColor }}>
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: active ? tint(accent, 14) : "transparent",
              color: active ? ink : inkSoft,
              borderLeft: `2px solid ${active ? accent : "transparent"}`,
            }}
          >
            <span className="shrink-0" style={{ color: active ? accent : muted }}>
              {item.icon}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
