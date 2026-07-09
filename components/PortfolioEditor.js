"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import EditForm from "./EditForm";
import { defaultPortfolioData, sanitizePortfolioData } from "@/lib/portfolioData";
import { templateComponents } from "@/components/templates";

const MIN_PANE_PERCENT = 25;
const MAX_PANE_PERCENT = 75;
const STORAGE_KEY = "dev-portfolio-builder:data";

export default function PortfolioEditor({ template }) {
  const [data, setData] = useState(defaultPortfolioData);
  const [restored, setRestored] = useState(false);
  const Template = templateComponents[template.id];

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Restore any autosaved draft after mount — reading localStorage during
  // the initial render would return different values on the server than on
  // the client and trigger a hydration mismatch, same reason templates never
  // use Math.random()/Date.now() in render.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // A draft saved before a schema field existed (e.g. codingProfiles)
        // won't have it — default missing arrays to empty rather than
        // undefined, or every `.map()` on that field throws.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time hydrate from a client-only source, not a derived-state loop
        setData({ ...defaultPortfolioData, ...parsed, codingProfiles: parsed.codingProfiles || [] });
      } catch {
        // Corrupted or incompatible saved data — keep the default.
      }
    }
    setRestored(true);
  }, []);

  // Guard against writing before the restore effect above has applied —
  // otherwise this would fire once on mount with the still-default `data`
  // and briefly stomp over the real saved draft.
  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, restored]);

  // Dragging mutates the CSS variable directly (like CursorGlow) instead of
  // going through React state, so resizing the panes never re-renders the
  // whole editor + template tree on every pixel of mouse movement.
  function handleDividerMouseDown(e) {
    e.preventDefault();
    setIsDragging(true);

    function handleMouseMove(moveEvent) {
      const rect = containerRef.current.getBoundingClientRect();
      let percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      percent = Math.min(MAX_PANE_PERCENT, Math.max(MIN_PANE_PERCENT, percent));
      containerRef.current.style.setProperty("--left-width", `${percent}%`);
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handleDividerDoubleClick() {
    containerRef.current.style.setProperty("--left-width", "50%");
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div>
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ← Back to templates
          </Link>
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Editing: {template.name}
          </h1>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Autosaved to this browser
        </span>
      </header>

      <div
        ref={containerRef}
        className="flex flex-1 flex-col overflow-hidden lg:flex-row"
        style={{ "--left-width": "50%" }}
      >
        <div className="overflow-y-auto border-b border-zinc-200 bg-zinc-50 px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950/40 lg:w-[var(--left-width)] lg:shrink-0 lg:border-b-0 lg:border-r">
          <EditForm data={data} onChange={setData} />
        </div>

        <div
          onMouseDown={handleDividerMouseDown}
          onDoubleClick={handleDividerDoubleClick}
          className={`hidden w-1.5 shrink-0 cursor-col-resize select-none transition-colors lg:block ${
            isDragging ? "bg-emerald-500" : "bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-800"
          }`}
          title="Drag to resize. Double-click to reset."
        />

        <div className="min-w-0 flex-1 overflow-y-auto">
          <Template data={sanitizePortfolioData(data)} />
        </div>
      </div>
    </div>
  );
}
