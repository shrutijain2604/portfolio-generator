import Link from "next/link";
import { templateComponents } from "@/components/templates";
import { defaultPortfolioData } from "@/lib/portfolioData";

// Templates render at their real desktop width and are then scaled down: a
// live render of the template, not a mockup, so the thumbnail can never
// drift out of sync with what clicking through actually shows. The scale
// itself lives in .home-thumb-render, which deliberately overfills the
// column so no render ever sits in a dead gutter.
export default function TemplatePreviewCard({ template, index = 0 }) {
  const Template = templateComponents[template.id];
  // Tags in portfolioData read "Playful, best for game/creative-tech roles".
  // Only the leading label belongs in a caption this small; the qualifier
  // after the comma is already covered by the description underneath.
  const tagLabel = template.tag ? template.tag.split(",")[0].trim() : null;

  return (
    // Perspective on the wrapper, not the card, so the lift leans the plate
    // back from its own bottom edge instead of just scaling it. h-full plus
    // the grid's equal rows is what keeps all twelve cards aligned even
    // though their descriptions run to different lengths.
    <div
      className="home-reveal h-full"
      style={{ perspective: "1200px", "--home-stagger": `${(index % 3) * 4}%` }}
    >
      <div className="home-card group relative flex h-full flex-col overflow-hidden rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--home-rule)] bg-[var(--home-bg)]">
          {Template && (
            <div className="home-thumb-render pointer-events-none absolute left-0 top-0">
              <Template data={defaultPortfolioData} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="home-grotesque text-[23px] leading-none">{template.name}</h3>
            <span className="home-nums shrink-0 text-[11px] text-[var(--home-faint)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-[1.55] text-[var(--home-dim)]">
            {template.description}
          </p>
          {/* mt-auto pins the tag to the card's foot, so a one-line and a
              three-line description still produce the same card. */}
          {tagLabel && (
            <p className="mt-auto pt-4">
              <span className="home-label rounded-full border border-[var(--home-rose)]/45 bg-[var(--home-rose)]/12 px-2.5 py-1 text-[var(--home-strong)]">
                {tagLabel}
              </span>
            </p>
          )}
        </div>

        {/* Stretched link makes the whole card clickable. It's a sibling
            overlay rather than a wrapper, because the live preview above
            renders the template's own real <a> tags (mailto, GitHub, ...) and
            nesting those inside another <a> is invalid HTML and breaks
            hydration. */}
        <Link
          href={`/editor/${template.id}`}
          className="absolute inset-0 rounded-[var(--home-radius)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-strong)]"
        >
          <span className="sr-only">Try the {template.name} template</span>
        </Link>
      </div>
    </div>
  );
}
