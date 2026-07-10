"use client";

// Renders a customer's in-progress draft with no editor chrome — this is
// the page opened in a new tab (desktop) or embedded in a phone-frame
// iframe (mobile) by the "Preview" buttons in the editor. It intentionally
// reads straight from localStorage instead of the database: nothing is
// persisted server-side until the customer actually clicks "Deploy my
// portfolio", so this is the only place a draft preview can come from.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTemplate, sanitizePortfolioData } from "@/lib/portfolioData";
import { templateComponents } from "@/components/templates";
import { loadStoredPortfolioData, saveStoredPortfolioData } from "@/lib/portfolioStorage";
import { getPalettesForTemplate } from "@/lib/palettes";
import ThemeSwitcher from "@/components/ThemeSwitcher";

function CenteredMessage({ title, body }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
      {body && <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{body}</p>}
      <Link
        href="/"
        className="mt-3 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Back to templates
      </Link>
    </div>
  );
}

export default function PreviewPage() {
  const { template: templateId } = useParams();
  const template = getTemplate(templateId);
  const Template = templateComponents[templateId];
  const palettes = getPalettesForTemplate(templateId);

  // Set by the editor's Desktop/Mobile preview buttons (PortfolioEditor.js)
  // so this one page can tell which chrome it's embedded in — read via
  // window.location instead of next/navigation's useSearchParams(), which
  // would force this otherwise fully client-rendered page into a Suspense
  // boundary for no benefit (there's no server data here to stream around).
  // A direct visit with no param falls back to the desktop layout.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time read from a client-only source (the URL), not a derived-state loop
    setIsMobile(new URLSearchParams(window.location.search).get("mode") === "mobile");
  }, []);

  // "loading" avoids a flash of the "no draft found" message before the
  // localStorage read (which can only happen client-side, after mount)
  // has had a chance to run.
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = loadStoredPortfolioData();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time hydrate from a client-only source, not a derived-state loop
    setData(stored);
    setStatus(stored ? "ready" : "empty");
  }, []);

  if (!template || !Template) {
    return <CenteredMessage title="Template not found" />;
  }

  if (status === "loading") {
    return null;
  }

  if (status === "empty") {
    return (
      <CenteredMessage
        title="No draft to preview yet"
        body="Open this template in the editor and add your details first — the preview reads your latest autosaved draft."
      />
    );
  }

  // Written straight back to localStorage (the same draft the editor reads
  // from) so a theme picked here without ever returning to the editor tab
  // still sticks — this page is the only place a lot of users will ever
  // see the theme switcher, so it needs to actually persist the change,
  // not just re-render this one tab.
  function handlePaletteChange(paletteId) {
    const next = { ...data, paletteId };
    setData(next);
    saveStoredPortfolioData(next);
  }

  return (
    <>
      <Template data={sanitizePortfolioData(data)} />
      {palettes && isMobile && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-lg ring-1 ring-black/10 backdrop-blur dark:bg-zinc-900/90 dark:ring-white/10">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Theme</span>
          <ThemeSwitcher palettes={palettes} selectedId={data.paletteId} onChange={handlePaletteChange} />
        </div>
      )}
      {palettes && !isMobile && (
        <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-3 rounded-full bg-white/90 px-2.5 py-4 shadow-lg ring-1 ring-black/10 backdrop-blur dark:bg-zinc-900/90 dark:ring-white/10">
          <span
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
            style={{ writingMode: "vertical-rl" }}
          >
            Theme
          </span>
          <ThemeSwitcher palettes={palettes} selectedId={data.paletteId} onChange={handlePaletteChange} vertical />
        </div>
      )}
    </>
  );
}
