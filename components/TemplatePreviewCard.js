import Link from "next/link";
import { templateComponents } from "@/components/templates";
import { defaultPortfolioData } from "@/lib/portfolioData";

// Templates render at this internal "desktop" width, then get scaled down
// to thumbnail size — a real live render of the template, not a mockup, so
// it can never drift out of sync with what clicking through actually shows.
const PREVIEW_WIDTH = 1100;
const PREVIEW_SCALE = 0.27;

export default function TemplatePreviewCard({ template }) {
  const Template = templateComponents[template.id];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-56 overflow-hidden border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        {Template && (
          <div
            className="pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{ width: PREVIEW_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
          >
            <Template data={defaultPortfolioData} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h2>
            {template.tag && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {template.tag}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{template.description}</p>
        </div>
        <span className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Try it →
        </span>
      </div>

      {/* Stretched link makes the whole card clickable. It's a sibling
          overlay rather than a wrapper, because the live preview above
          renders the template's own real <a> tags (mailto, GitHub, ...) —
          nesting those inside another <a> is invalid HTML and breaks
          hydration. */}
      <Link href={`/editor/${template.id}`} className="absolute inset-0">
        <span className="sr-only">Try the {template.name} template</span>
      </Link>
    </div>
  );
}
