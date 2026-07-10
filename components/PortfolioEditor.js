"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import EditForm from "./EditForm";
import { defaultPortfolioData, sanitizePortfolioData } from "@/lib/portfolioData";
import { templateComponents } from "@/components/templates";
import { PORTFOLIO_STORAGE_KEY, loadStoredPortfolioData } from "@/lib/portfolioStorage";

const MIN_PANE_PERCENT = 25;
const MAX_PANE_PERCENT = 75;

function DesktopIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function MobileIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

export default function PortfolioEditor({ template }) {
  const [data, setData] = useState(defaultPortfolioData);
  const [restored, setRestored] = useState(false);
  const Template = templateComponents[template.id];

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [deployStatus, setDeployStatus] = useState("idle"); // idle | saving | ready | error
  const [deployUrl, setDeployUrl] = useState("");
  const [deployError, setDeployError] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Desktop preview opens in a real new tab instead of an in-page frame —
  // that's the only way to show the actual full-width desktop rendering
  // with real browser chrome, rather than a scaled-down approximation.
  function openDesktopPreview() {
    window.open(`/preview/${template.id}`, "_blank", "noopener,noreferrer");
  }

  // Deliberately doesn't auto-navigate on success — surfacing the
  // constructed link instead means the save-draft step can be verified on
  // its own (the row actually landing in Supabase, the URL actually being
  // built correctly) without also committing to leaving the app. Doubles as
  // a sane confirmation step for real use later, not just a testing aid.
  async function handleDeploy() {
    setDeployStatus("saving");
    setDeployError("");
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: template.id,
          data: sanitizePortfolioData(data),
          origin: window.location.origin,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Couldn't start deployment.");
      setDeployUrl(result.deployUrl);
      setDeployStatus("ready");
    } catch (err) {
      setDeployStatus("error");
      setDeployError(err.message);
    }
  }

  // Restore any autosaved draft after mount — reading localStorage during
  // the initial render would return different values on the server than on
  // the client and trigger a hydration mismatch, same reason templates never
  // use Math.random()/Date.now() in render.
  useEffect(() => {
    const stored = loadStoredPortfolioData();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time hydrate from a client-only source, not a derived-state loop
      setData(stored);
    }
    setRestored(true);
  }, []);

  // Guard against writing before the restore effect above has applied —
  // otherwise this would fire once on mount with the still-default `data`
  // and briefly stomp over the real saved draft.
  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
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
        <div className="flex flex-wrap items-center justify-end gap-y-2 gap-x-3">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-sky-500/10 p-1 ring-1 ring-inset ring-indigo-500/25 dark:from-indigo-400/10 dark:to-sky-400/10 dark:ring-indigo-400/25">
            <button
              type="button"
              onClick={openDesktopPreview}
              title="See the full desktop layout in a new tab"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-white hover:shadow-sm dark:text-indigo-300 dark:hover:bg-zinc-800"
            >
              <DesktopIcon className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreview(true)}
              title="See how this looks on a phone"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-white hover:shadow-sm dark:text-indigo-300 dark:hover:bg-zinc-800"
            >
              <MobileIcon className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Autosaved to this browser
          </span>
          <button
            type="button"
            onClick={handleDeploy}
            disabled={deployStatus === "saving"}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deployStatus === "saving" ? "Starting deployment…" : "Deploy my portfolio"}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex flex-1 flex-col overflow-hidden lg:flex-row"
        style={{ "--left-width": "50%" }}
      >
        <div className="overflow-y-auto border-b border-zinc-200 bg-zinc-50 px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950/40 lg:w-[var(--left-width)] lg:shrink-0 lg:border-b-0 lg:border-r">
          <EditForm data={data} onChange={setData} templateId={template.id} />
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

      {showMobilePreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-6"
          onClick={() => setShowMobilePreview(false)}
        >
          <div
            className="relative h-[780px] max-h-[85vh] w-[380px] max-w-full rounded-[2.5rem] border-[10px] border-zinc-800 bg-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-1/2 z-10 h-5 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-800" />
            <iframe
              key={template.id}
              src={`/preview/${template.id}`}
              title="Mobile preview"
              className="h-full w-full rounded-[1.75rem] bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobilePreview(false)}
            className="text-xs font-medium text-zinc-300 hover:text-white"
          >
            Close preview
          </button>
        </div>
      )}

      {(deployStatus === "ready" || deployStatus === "error") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setDeployStatus("idle")}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {deployStatus === "ready" ? (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Draft saved</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Next, continue to Vercel to finish deploying — it creates a real repo and a live site under your
                  own GitHub and Vercel accounts.
                </p>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  Continue to Vercel →
                </a>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Couldn&rsquo;t start deployment</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{deployError}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => setDeployStatus("idle")}
              className="mt-4 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {deployStatus === "ready" ? "Not now" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
