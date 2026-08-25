"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditForm from "./EditForm";
import ThemeSwitcher from "./ThemeSwitcher";
import { defaultPortfolioData, sanitizePortfolioData } from "@/lib/portfolioData";
import { HANDOFF_TEMPLATE_IDS as HANDOFF_TEMPLATES } from "@/lib/handoffTemplates";
import { templateComponents } from "@/components/templates";
import { loadStoredPortfolioData, saveStoredPortfolioData } from "@/lib/portfolioStorage";
import { getPalettesForTemplate } from "@/lib/palettes";

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

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

function FileIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3.5h7.5L18 8v12.5H6V3.5Z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9 12.5h6M9 16h4" />
    </svg>
  );
}

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.7a10.3 10.3 0 0 0-3.26 20.07c.52.1.7-.22.7-.49v-1.9c-2.86.62-3.46-1.2-3.46-1.2-.47-1.2-1.15-1.52-1.15-1.52-.93-.64.07-.63.07-.63 1.03.07 1.58 1.06 1.58 1.06.92 1.58 2.4 1.12 2.99.86.09-.67.36-1.13.65-1.39-2.28-.26-4.68-1.14-4.68-5.08 0-1.12.4-2.04 1.05-2.76-.1-.26-.45-1.3.1-2.72 0 0 .86-.27 2.8 1.06a9.8 9.8 0 0 1 5.1 0c1.94-1.33 2.8-1.06 2.8-1.06.55 1.42.2 2.46.1 2.72.65.72 1.05 1.64 1.05 2.76 0 3.95-2.4 4.82-4.7 5.07.37.32.7.94.7 1.9v2.82c0 .27.18.6.71.49A10.3 10.3 0 0 0 12 1.7Z" />
    </svg>
  );
}

// Marks the one button that leaves the page. The two preview buttons sit
// together and look alike, but only Desktop opens a tab, and without a cue
// for that the pair reads as a toggle between two in-page states.
function ExternalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 16 16 8" />
      <path d="M9.5 8H16v6.5" />
    </svg>
  );
}

// Pinned above the live preview (not inside the scrollable form). A theme
// is only worth anything if it's seen, and it's easy to scroll past as just
// another card in a long form. Sitting right next to the render it
// controls, with zero scrolling or clicks needed to see it, is what makes
// it register as a feature rather than something to miss entirely.
function ThemeSwatchBar({ palettes, selectedId, onChange }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Theme</span>
      <ThemeSwitcher palettes={palettes} selectedId={selectedId} onChange={onChange} />
    </div>
  );
}

export default function PortfolioEditor({ template }) {
  const router = useRouter();
  const [data, setData] = useState(defaultPortfolioData);
  const [restored, setRestored] = useState(false);
  const Template = templateComponents[template.id];
  const palettes = getPalettesForTemplate(template.id);

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // The draft, readable from an effect without making that effect depend on it
  // and re-run on every keystroke. Synced in its own effect rather than during
  // render, and declared above the effect that reads it: effects for a commit
  // run in source order, so it is always current by the time it is read.
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [deployStatus, setDeployStatus] = useState("idle"); // idle | saving | ready | error
  const [deployUrl, setDeployUrl] = useState("");
  const [deployError, setDeployError] = useState("");
  const [handoff, setHandoff] = useState(null);
  // Whether they have gone off to Vercel yet. All this page can honestly know
  // is that the link was followed: Vercel reports nothing back here, so the
  // dialog changes what it offers without claiming the deploy succeeded.
  const [vercelOpened, setVercelOpened] = useState(false);
  // What the build is actually doing: null before watching, then "pending",
  // "success", "failed", or "unknown" if it never resolved in the window.
  const [buildState, setBuildState] = useState(null);
  const [buildUrl, setBuildUrl] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Whether this template hands over a repo containing the customer's content
  // or still goes through the old clone-plus-database route. Mirrors the
  // server's own list in lib/templateFiles.js; the server refuses anything not
  // on its copy, so this only decides which button flow to run.
  const ownsItsData = HANDOFF_TEMPLATES.has(template.id);

  // Their own first name, off the form. A congratulation addressed to somebody
  // lands differently from one addressed to nobody, and this is the one moment
  // in the product that has earned it. Falls back to a plain congratulation
  // rather than to a placeholder, because greeting "Your Name" is worse than
  // not greeting at all.
  const firstName = (data.name || "").trim().split(/\s+/)[0] || "";

  // Desktop preview opens in a real new tab instead of an in-page frame:
  // that's the only way to show the actual full-width desktop rendering
  // with real browser chrome, rather than a scaled-down approximation.
  function openDesktopPreview() {
    window.open(`/preview/${template.id}?mode=desktop`, "_blank", "noopener,noreferrer");
  }

  // The handoff: create a repository in the customer's own GitHub account with
  // their content already committed into it.
  //
  // The data is posted straight from the browser rather than being saved here
  // first and read back after the GitHub round trip. That is what keeps this
  // app from holding a copy of somebody's employment history at all: it passes
  // through, it is not stored. The draft is already in localStorage, so
  // surviving the redirect costs nothing.
  const runHandoff = useCallback(async (portfolio) => {
    setDeployStatus("saving");
    setDeployError("");
    setVercelOpened(false);
    setBuildState(null);
    setBuildUrl("");
    try {
      const res = await fetch("/api/github/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: template.id, data: sanitizePortfolioData(portfolio) }),
      });
      const result = await res.json();

      // Not an error: the first attempt is expected to come back this way,
      // and the answer is to go and connect.
      if (res.status === 401 && result.needsAuth) {
        window.location.href = `/api/github/start?returnTo=${encodeURIComponent(
          `/editor/${template.id}`
        )}`;
        return;
      }

      if (!res.ok) throw new Error(result.error || "Couldn't create the repository.");
      setHandoff(result);
      setDeployStatus("ready");
    } catch (err) {
      setDeployStatus("error");
      setDeployError(err.message);
    }
  }, [template.id]);

  // The older path, for templates that still read their content from the
  // database at request time. Deliberately doesn't auto-navigate on success:
  // surfacing the constructed link means the save-draft step can be verified
  // on its own without also committing to leaving the app.
  async function saveDraftAndDeploy() {
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

  function handleDeploy() {
    if (ownsItsData) return runHandoff(data);
    return saveDraftAndDeploy();
  }

  // Restore any autosaved draft after mount. Reading localStorage during
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

  // Coming back from GitHub. The connect flow leaves the browser on this page
  // with a marker in the query string; picking the deploy back up here is what
  // makes the round trip invisible to the customer, who only ever pressed one
  // button.
  //
  // Waits for `restored`, because resuming with the still-default sample data
  // would commit Ada Lovelace into somebody's repository. The marker is
  // stripped from the URL first so a refresh cannot fire a second repository.
  useEffect(() => {
    if (!restored) return;

    const params = new URLSearchParams(window.location.search);
    const connected = params.get("github") === "connected";
    const failure = params.get("githubError");
    if (!connected && !failure) return;

    window.history.replaceState({}, "", window.location.pathname);

    if (failure) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a client-only source (the URL the OAuth redirect landed on), not a derived-state loop
      setDeployStatus("error");
      setDeployError(
        failure === "cancelled"
          ? "You cancelled the GitHub connection, so nothing was created."
          : failure === "unconfigured"
            ? "Deploying isn't set up on this server yet. Please try again later."
            : "That GitHub connection didn't complete. Please try again."
      );
      return;
    }

    runHandoff(dataRef.current);
  }, [restored, runHandoff]);

  // Watching the build for real, instead of guessing.
  //
  // Vercel posts a commit status back to the repository, so the truth about
  // whether somebody's site built is public information on a public repo, and
  // the browser can read it directly. Polling from here rather than from our
  // server matters: it runs against the visitor's own GitHub rate limit
  // instead of pooling every customer onto one server IP, and it needs no
  // token, so nothing has to be kept alive after the handoff.
  //
  // The combined status endpoint is one request per poll rather than the two
  // the deployments API would need, which is what keeps a five minute watch
  // well inside the sixty-per-hour anonymous allowance.
  useEffect(() => {
    if (!vercelOpened || !handoff?.branch) return undefined;

    let cancelled = false;
    let timer = 0;
    const startedAt = Date.now();
    const POLL_MS = 10000;
    const GIVE_UP_MS = 5 * 60 * 1000;

    async function check() {
      if (cancelled) return;

      let settled = false;
      try {
        const res = await fetch(
          `https://api.github.com/repos/${handoff.owner}/${handoff.repo}/commits/${handoff.branch}/status`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (res.ok) {
          const body = await res.json();
          const vercel = (body.statuses || []).find((s) => s.context === "Vercel");
          if (vercel?.state === "success") {
            setBuildState("success");
            setBuildUrl(vercel.target_url || "");
            settled = true;
          } else if (vercel?.state === "failure" || vercel?.state === "error") {
            setBuildState("failed");
            setBuildUrl(vercel.target_url || "");
            settled = true;
          }
        }
      } catch {
        // A refused or offline request says nothing about the build, so it is
        // treated the same as "not finished yet" and simply retried below.
      }

      if (cancelled || settled) return;
      // Never reports failure on a timeout. A slow build and a broken one look
      // identical from here, and calling a working site broken is the worse
      // of the two mistakes.
      if (Date.now() - startedAt > GIVE_UP_MS) {
        setBuildState("unknown");
        return;
      }
      timer = window.setTimeout(check, POLL_MS);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- entering the watching state as the watch begins, not derived state
    setBuildState("pending");
    check();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [vercelOpened, handoff]);

  // Escape closes the result dialog. A modal that can only be dismissed with a
  // pointer is a trap for anyone navigating by keyboard.
  useEffect(() => {
    if (deployStatus !== "ready" && deployStatus !== "error") return undefined;
    function onKey(event) {
      if (event.key === "Escape") setDeployStatus("idle");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deployStatus]);

  // Guard against writing before the restore effect above has applied,
  // otherwise this would fire once on mount with the still-default `data`
  // and briefly stomp over the real saved draft.
  useEffect(() => {
    if (!restored) return;
    saveStoredPortfolioData(data);
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
          {/* Two actions, not a toggle: neither button has a selected state,
              so the group is drawn as one bordered object split by a hairline
              rather than as a segmented control that implies one of the two is
              currently on. The label names what the pair is for, which the
              buttons alone never said. */}
          <div className="flex items-center gap-2.5">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 sm:inline dark:text-zinc-500">
              Preview
            </span>
            <div className="flex items-center rounded-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={openDesktopPreview}
                title="See the full desktop layout in a new tab"
                className="group flex items-center gap-1.5 rounded-l-full py-2 pl-3.5 pr-3 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <DesktopIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Desktop
                <ExternalIcon
                  className="h-2.5 w-2.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px dark:text-zinc-500"
                  aria-hidden="true"
                />
              </button>

              <span className="h-4 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

              <button
                type="button"
                onClick={() => setShowMobilePreview(true)}
                title="See how this looks on a phone"
                className="flex items-center gap-1.5 rounded-r-full py-2 pl-3 pr-3.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <MobileIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Mobile
              </button>
            </div>
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

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {palettes && (
            <ThemeSwatchBar
              palettes={palettes}
              selectedId={data.paletteId}
              onChange={(paletteId) => setData({ ...data, paletteId })}
            />
          )}
          {/* `transform` makes this pane the containing block for any
              `position: fixed` element a template renders (e.g. a fixed
              background wallpaper) — without it, `fixed` inside a template
              resolves against the real browser window, not this bounded
              scrollable pane, and would cover the edit form on the left
              instead of staying confined to the preview. Templates
              themselves stay unaware of this — they use plain `fixed` as if
              they were a normal full page, same as the actual deployed
              site and the standalone /preview route, both of which have no
              such wrapper and don't need one. */}
          <div className="min-w-0 flex-1 overflow-y-auto" style={{ transform: "translateZ(0)" }}>
            <Template data={sanitizePortfolioData(data)} />
          </div>
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
              src={`/preview/${template.id}?mode=mobile`}
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

      {/* Work in progress. Repo creation takes a few seconds of network round
          trips, and the only sign of it used to be the label on a button in the
          far corner, which on a page this wide is easy to miss entirely. An
          overlay says plainly that something is happening and that the tab
          needs to stay open.

          Deliberately not a checklist that ticks itself off: the server
          reports one result at the end, not per-step progress, so a staged
          animation would be inventing detail it does not have. */}
      {deployStatus === "saving" && ownsItsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-xl dark:bg-zinc-900"
          >
            <span
              aria-hidden="true"
              className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500 dark:border-zinc-700 dark:border-t-emerald-400"
            />
            <h2 className="mt-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Building your repository
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Creating it in your GitHub account and committing your content into it. This takes a
              few seconds, so please keep this tab open.
            </p>
          </div>
        </div>
      )}

      {(deployStatus === "ready" || deployStatus === "error") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setDeployStatus("idle")}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deploy-dialog-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* A real close control rather than a word buried under the
                secondary links, so dismissing is findable without reading the
                whole dialog first. */}
            <button
              type="button"
              onClick={() => setDeployStatus("idle")}
              className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <CloseIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>

            {deployStatus === "ready" && handoff ? (
              <>
                {/* The mark carries the whole mood of this dialog, so a live
                    site gets a filled badge with a halo and a check that draws
                    itself, not the same pale outline every other state wears.
                    Everything about the success case is centred; the states
                    that are still waiting or reporting a problem stay left
                    aligned, because those are for reading rather than for
                    celebrating. */}
                <div className={buildState === "success" && vercelOpened ? "text-center" : ""}>
                  {vercelOpened && buildState === "pending" ? (
                    <span
                      aria-hidden="true"
                      className="block h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500 dark:border-zinc-700 dark:border-t-emerald-400"
                    />
                  ) : vercelOpened && buildState === "failed" ? (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    >
                      <CloseIcon className="h-5 w-5" />
                    </span>
                  ) : vercelOpened && buildState === "success" ? (
                    <span aria-hidden="true" className="relative mx-auto block h-16 w-16">
                      {/* A ring that expands past the badge and fades, so the
                          moment has a beat rather than just a shape. */}
                      <span className="dpb-ring absolute inset-0 rounded-full border-2 border-emerald-500" />
                      <span
                        className="dpb-pop relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-500/15"
                      >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                      >
                        <path className="dpb-draw" d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}

                  {buildState === "success" && vercelOpened ? (
                    <>
                      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                        Published
                      </p>
                      <h2
                        id="deploy-dialog-title"
                        className="mt-2.5 text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-zinc-900 dark:text-zinc-50"
                      >
                        {firstName ? `Congratulations, ${firstName}.` : "Congratulations."}
                      </h2>
                      <p className="mx-auto mt-3 max-w-[32ch] text-[14.5px] leading-[1.6] text-zinc-500 dark:text-zinc-400">
                        Your portfolio is on the internet, on accounts you own, with nothing
                        standing between you and it.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2
                        id="deploy-dialog-title"
                        className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                      >
                        {!vercelOpened
                          ? "Your repository is ready"
                          : buildState === "failed"
                            ? "Vercel couldn\u2019t build it"
                            : buildState === "pending"
                              ? "Building your site"
                              : "Finishing up on Vercel"}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {!vercelOpened
                          ? "Everything you typed is committed into a repository in your own GitHub account. Nothing here can change it or take it away."
                          : buildState === "failed"
                            ? "The build reported an error. The log says what went wrong, and your repository is untouched, so nothing is lost."
                            : buildState === "pending"
                              ? "Once you finish the import on Vercel, the build starts and this updates on its own. It usually takes under a minute."
                              : "Vercel didn\u2019t report back within a few minutes. That often just means the import is still open in the other tab, so check there."}
                      </p>
                    </>
                  )}
                </div>

                {/* The live site is the thing they came for, so once it exists
                    it leads. Before that the deploy button holds the position,
                    and the repo sits under whichever is showing. */}
                {buildUrl && buildState === "success" ? (
                  <a
                    href={buildUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    Open your live site
                    <ExternalIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}

                {buildUrl && buildState === "failed" ? (
                  <a
                    href={buildUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    See the build log
                    <ExternalIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}

                <a
                  href={handoff.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-2.5 rounded-xl border border-zinc-200 px-3.5 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                >
                  <GitHubIcon
                    className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-zinc-800 dark:text-zinc-100">
                    {handoff.owner}/{handoff.repo}
                  </span>
                  <ExternalIcon
                    className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500"
                    aria-hidden="true"
                  />
                </a>

                {/* Once the site is up, going back to Vercel is a rare errand
                    rather than the next step, so it stops being a button. */}
                <a
                  href={handoff.deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setVercelOpened(true)}
                  className={
                    !vercelOpened
                      ? "mt-3 flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                      : buildState === "success"
                        ? "mt-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-zinc-400 dark:hover:text-zinc-200"
                        : "mt-3 flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                  }
                >
                  {!vercelOpened ? "Deploy it on Vercel" : "Reopen Vercel"}
                  <ExternalIcon className={vercelOpened ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
                </a>

                {/* The single most useful thing anybody can be told here, and
                    previously it read like a footnote: a small heading, small
                    grey text and a small link. It is now a panel with the file
                    named as an object, because "you can change this yourself,
                    forever" is the product's whole argument and it should not
                    look like fine print. */}
                <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-left dark:bg-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      <FileIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100">
                        Yours to change, forever
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-[1.6] text-zinc-500 dark:text-zinc-400">
                        Your whole portfolio is one file. Edit{" "}
                        <span className="font-mono text-[12.5px] text-zinc-700 dark:text-zinc-300">
                          data/portfolio.js
                        </span>{" "}
                        on GitHub, commit, and the site rebuilds itself. No account here, no
                        dashboard, no us.
                      </p>
                      <a
                        href={handoff.editUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-950"
                      >
                        Open the file
                        <ExternalIcon className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Finishing here means leaving, not returning to the form.
                    The work is handed over and lives somewhere else now, so
                    dropping somebody back on an editor for a portfolio they
                    have already shipped reads as though nothing happened. The
                    corner cross still just dismisses, for anyone who wants to
                    look at the dialog's links again. */}
                {vercelOpened && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeployStatus("idle");
                      router.push("/");
                    }}
                    className="mt-5 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Done
                  </button>
                )}
              </>
            ) : deployStatus === "ready" ? (
              <div className="text-center">
                <h2
                  id="deploy-dialog-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
                >
                  Draft saved
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Next, continue to Vercel to finish deploying: it creates a real repo and a live
                  site under your own GitHub and Vercel accounts.
                </p>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  Continue to Vercel
                </a>
              </div>
            ) : (
              <div className="text-center">
                <h2
                  id="deploy-dialog-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
                >
                  Couldn&rsquo;t start deployment
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {deployError}
                </p>
                <button
                  type="button"
                  onClick={() => setDeployStatus("idle")}
                  className="mt-5 w-full rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
