"use client";

// The dashboard's signature panel: every dated thing the customer entered laid
// out on one shared year axis, with a crosshair the visitor scrubs. Nothing is
// invented: spans are the years they typed, and the "concurrent" strip counts
// how many spans overlap each year.
//
// Year granularity, not day: the schema only collects years (see
// lib/portfolioData.js), so a year is one cell rather than a point on a line.
// That makes "2021 to 2023" three cells wide, and lets a single-year career
// render as a full-width band instead of a 1px sliver.
//
// Every lane is a drawn track and every year a ruled column, so uncovered time
// reads as measured and empty rather than as blank page. A chart whose
// background disappears is what makes a sparse timeline look broken.

import { useMemo, useRef, useState } from "react";
import { tint } from "./shared";

function activeAt(spans, year) {
  return spans.filter((span) => year >= span.start && year <= span.end);
}

// Axis labels thin out rather than overlap: every year for a short career,
// roughly eight ticks for a long one, with the first and last always kept so
// the window's real bounds never have to be inferred.
function tickStep(columns) {
  return columns <= 12 ? 1 : Math.ceil(columns / 8);
}

export default function ConsoleTimeline({ spans, from, to, theme, kinds }) {
  const columns = to - from + 1;
  const [cursorIndex, setCursorIndex] = useState(null);
  const overlayRef = useRef(null);

  const years = useMemo(() => Array.from({ length: columns }, (_, i) => from + i), [columns, from]);
  const load = useMemo(() => years.map((year) => activeAt(spans, year).length), [years, spans]);
  const peak = Math.max(1, ...load);
  const step = tickStep(columns);
  const cell = 100 / columns;

  const cursorYear = cursorIndex === null ? null : years[cursorIndex];
  const live = cursorYear === null ? [] : activeAt(spans, cursorYear);

  // Reads the overlay's box (not the panel's) so the label gutter's width,
  // which changes at the sm breakpoint, never has to be known in JS. One read
  // per pointer event, before React writes: no read/write interleaving.
  function indexFromClientX(clientX) {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(columns - 1, Math.max(0, Math.floor(ratio * columns)));
  }

  function handlePointerMove(event) {
    setCursorIndex(indexFromClientX(event.clientX));
  }

  function handleKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Escape") return setCursorIndex(null);
    if (event.key === "Home") return setCursorIndex(0);
    if (event.key === "End") return setCursorIndex(columns - 1);
    const base = cursorIndex === null ? columns - 1 : cursorIndex;
    const next = event.key === "ArrowLeft" ? base - 1 : base + 1;
    setCursorIndex(Math.min(columns - 1, Math.max(0, next)));
  }

  return (
    <div>
      {/* Readout. aria-live so a screen reader hears the scrub result, which is
          the one thing the crosshair carries that the lanes do not already
          spell out in text. */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1" aria-live="polite">
        <p className="dash-mono dash-tight text-xl font-semibold leading-none" style={{ color: theme.ink }}>
          {cursorYear ?? `${from} → ${to}`}
        </p>
        <p className="dash-mono min-w-0 text-[11px] leading-tight" style={{ color: theme.muted }}>
          {cursorYear === null
            ? `${spans.length} ${spans.length === 1 ? "span" : "spans"}, hover or arrow-key the plot`
            : live.length === 0
              ? "nothing tracked this year"
              : live.map((span) => `${span.title} @ ${span.sub}`).join("   ")}
        </p>
      </div>

      {/* The plot scrolls inside its own box on narrow screens rather than
          squeezing a decade of year-cells into 320px. */}
      <div className="dash-scroll mt-3 overflow-x-auto">
        <div
          className="dash-tl relative min-w-[24rem] outline-none"
          role="group"
          tabIndex={0}
          aria-label={`Career window ${from} to ${to}. Arrow keys move the year cursor.`}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setCursorIndex(null)}
          onBlur={() => setCursorIndex(null)}
          onKeyDown={handleKeyDown}
        >
          {/* One overlay for the whole plot, offset by the label gutter, so the
              year rules and the crosshair are single elements spanning every
              lane instead of one per lane that could drift out of alignment.
              Painted before the lanes, so bars sit on top of both. */}
          <div
            ref={overlayRef}
            className="dash-tl-overlay"
            aria-hidden="true"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, ${theme.rule} 0 1px, transparent 1px calc(100% / ${columns}))`,
            }}
          >
            {cursorIndex !== null && (
              <span
                className="dash-tl-cursor"
                style={{
                  left: `${cursorIndex * cell}%`,
                  width: `${cell}%`,
                  backgroundColor: tint(theme.accent, theme.isDark ? 16 : 11),
                  borderColor: tint(theme.accent, 55),
                }}
              />
            )}
          </div>

          {spans.map((span, i) => {
            const isLive = cursorYear !== null && cursorYear >= span.start && cursorYear <= span.end;
            const dimmed = cursorYear !== null && !isLive;
            const width = (span.end - span.start + 1) * cell;
            return (
              <div key={span.id} className="dash-tl-row">
                <div className="min-w-0 pr-3">
                  <p
                    className="truncate text-[12px] font-semibold leading-tight"
                    style={{ color: dimmed ? theme.muted : theme.ink }}
                  >
                    {span.title}
                  </p>
                  <p className="truncate text-[11px] leading-tight" style={{ color: theme.muted }}>
                    {span.sub}
                  </p>
                </div>
                <div className="dash-tl-track" style={{ backgroundColor: theme.track }}>
                  <span
                    className="dash-tl-bar"
                    style={{
                      left: `${(span.start - from) * cell}%`,
                      width: `${width}%`,
                      animationDelay: `${i * 70}ms`,
                      backgroundColor: tint(span.color, isLive ? 42 : theme.isDark ? 26 : 18),
                      borderLeftColor: span.color,
                      color: span.ink,
                      opacity: dimmed ? 0.5 : 1,
                      backgroundImage:
                        span.kind === "study"
                          ? `repeating-linear-gradient(135deg, ${tint(span.color, 20)} 0 6px, transparent 6px 12px)`
                          : "none",
                    }}
                  >
                    {/* The range, not the name: a one-year span is one cell
                        wide, and a company name would only ever be clipped
                        there. The name is in the lane label, where it has room. */}
                    <span className="dash-tl-bar-text">
                      {span.start === span.end ? span.start : `${span.start} → ${span.end}`}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}

          {/* Concurrency: how many tracked spans overlap in each year. */}
          <div className="dash-tl-row">
            <div className="min-w-0 pr-3">
              <p className="dash-label truncate" style={{ color: theme.muted }}>
                Concurrent
              </p>
              <p className="dash-mono truncate text-[10px] leading-tight" style={{ color: theme.muted }}>
                peak {peak}
              </p>
            </div>
            <div className="dash-tl-strip" style={{ backgroundColor: theme.track }}>
              {load.map((count, i) => (
                <span
                  key={years[i]}
                  className="dash-tl-col"
                  style={{
                    height: `${Math.max(count / peak, 0.05) * 100}%`,
                    animationDelay: `${i * 18}ms`,
                    backgroundColor:
                      count === 0
                        ? tint(theme.ink, 10)
                        : cursorIndex === i
                          ? theme.accent
                          : tint(theme.accent, theme.isDark ? 48 : 40),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Axis */}
          <div className="dash-tl-row dash-tl-axis" style={{ borderColor: theme.rule }}>
            <div />
            <div className="flex">
              {years.map((year, i) => {
                const show = i === 0 || i === columns - 1 || i % step === 0;
                return (
                  <span
                    key={year}
                    className="dash-mono min-w-0 flex-1 overflow-hidden text-center text-[10px] leading-none"
                    style={{ color: cursorIndex === i ? theme.ink : theme.muted }}
                  >
                    {show ? year : "·"}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {kinds.length > 1 && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {kinds.map((kind) => (
            <li key={kind.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-5 shrink-0 rounded-[2px] border-l-2"
                style={{
                  backgroundColor: tint(kind.color, theme.isDark ? 28 : 20),
                  borderLeftColor: kind.color,
                  backgroundImage:
                    kind.kind === "study"
                      ? `repeating-linear-gradient(135deg, ${tint(kind.color, 22)} 0 6px, transparent 6px 12px)`
                      : "none",
                }}
              />
              <span className="dash-label" style={{ color: theme.muted }}>
                {kind.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
