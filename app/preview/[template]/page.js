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
import { loadStoredPortfolioData } from "@/lib/portfolioStorage";

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

  return <Template data={sanitizePortfolioData(data)} />;
}
