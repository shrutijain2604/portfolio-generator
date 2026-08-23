"use client";

// The console's navigation: an icon rail down the left edge on wide screens
// (what an actual observability product puts there) and a scrolling chip strip
// under the sticky header below lg, where a rail would eat a quarter of a
// phone's width. Rendered as two instances rather than one component emitting
// both, so each layout sits in the DOM position its own CSS needs.
//
// The active item comes from an IntersectionObserver on the panels themselves,
// so it always reflects the panel the visitor is actually looking at rather
// than the last link they clicked. Icons never travel alone: every item keeps
// its real label in both layouts, because an icon-only nav is a
// discoverability failure rather than a minimalist one.

import { useEffect, useState } from "react";
import { tint } from "./shared";

export default function ConsoleRail({ items, theme, variant = "rail" }) {
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
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveHref(`#${topmost.target.id}`);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
    // `items` is rebuilt fresh each render from the same section ids, so its
    // length is the only thing this effect actually needs to re-run for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (variant === "strip") {
    return (
      <nav
        aria-label="Panels"
        className="dash-scroll flex gap-1.5 overflow-x-auto px-4 pb-2.5 sm:px-6 lg:hidden"
      >
        {items.map((item) => {
          const active = activeHref === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "true" : undefined}
              className="dash-focus dash-label flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5"
              style={{
                borderColor: active ? tint(theme.accent, 42) : theme.rule,
                backgroundColor: active ? tint(theme.accent, 12) : "transparent",
                color: active ? theme.ink : theme.muted,
              }}
            >
              <span aria-hidden="true" style={{ color: active ? theme.accent : "inherit" }}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Panels"
      className="sticky top-0 hidden h-dvh w-[6.25rem] shrink-0 flex-col items-center gap-0.5 self-start border-r py-4 lg:flex"
      style={{ borderColor: theme.rule, backgroundColor: theme.railBg }}
    >
      <span
        aria-hidden="true"
        className="mb-3 h-7 w-7 shrink-0 rounded-[7px]"
        style={{
          background: `linear-gradient(140deg, ${theme.palette[0]}, ${theme.palette[1] || theme.palette[0]})`,
          boxShadow: `0 0 0 1px ${tint(theme.ink, 14)}`,
        }}
      />
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? "true" : undefined}
            className="dash-rail-item dash-focus"
            style={{
              backgroundColor: active ? tint(theme.accent, 13) : "transparent",
              color: active ? theme.ink : theme.muted,
            }}
          >
            <span
              aria-hidden="true"
              className="dash-rail-mark"
              style={{ backgroundColor: active ? theme.accent : "transparent" }}
            />
            <span aria-hidden="true" style={{ color: active ? theme.accent : "inherit" }}>
              {item.icon}
            </span>
            <span className="dash-rail-label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
