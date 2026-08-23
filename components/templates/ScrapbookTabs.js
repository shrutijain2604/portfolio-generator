"use client";

import { useEffect, useState } from "react";

// The binder's index: one colored divider tab per sheet, tracking whichever
// sheet is actually in view, so the rail reads as an edge-on view of the
// pages rather than a link list that never reflects where the visitor is.
// The active tab slides out of the stack the way a thumbed-through divider
// does. Desktop only: small screens navigate from the table of contents on
// the cover instead, since a fixed rail there would eat width the sheets
// need. Plain anchors rather than scroll handlers: they work before this
// component hydrates, and the browser scrolls whichever container the
// template happens to be inside (the editor's preview pane included).
//
// `mono` is the template's typewriter font class, passed in rather than
// loaded here: every other template keeps its next/font calls in the
// template file, and a second call for the same family would just duplicate
// the @font-face rules.
export default function ScrapbookTabs({ items, mono, card, ink, inkSoft, rule }) {
  const [activeId, setActiveId] = useState(items[0]?.id || null);
  const itemKey = items.map((item) => item.id).join(",");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(topmost.target.id);
      },
      { rootMargin: "-12% 0px -66% 0px", threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
    // `items` is rebuilt fresh each render from the same sheet ids, so that
    // joined id list is the only thing this effect actually needs to re-run
    // for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  return (
    <nav aria-label="Sections" className="sticky top-8 hidden self-start lg:block">
      <p className={`${mono} mb-3 pl-2 text-[10px] font-bold uppercase tracking-[0.28em]`} style={{ color: inkSoft }}>
        Index
      </p>
      <ul className="space-y-1.5 border-l pl-0" style={{ borderColor: rule }}>
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className="scrapbook-tab flex min-h-9 items-center gap-2 rounded-r-[3px] py-1.5 pl-2.5 pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: active ? item.color : card,
                  borderLeft: `3px solid ${item.color}`,
                  boxShadow: active ? "0 3px 9px rgba(0,0,0,0.24)" : "0 1px 3px rgba(0,0,0,0.16)",
                  outlineColor: item.color,
                }}
              >
                <span
                  className={`${mono} min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.14em]`}
                  style={{ color: active ? item.textOn : inkSoft }}
                >
                  {item.label}
                </span>
                <span
                  className={`${mono} shrink-0 text-[10px] tabular-nums`}
                  style={{ color: active ? item.textOn : ink, opacity: active ? 1 : 0.55 }}
                >
                  {String(item.page).padStart(2, "0")}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
