"use client";

// Shared swatch-button rendering for theme selection — used both pinned
// above the live preview pane in the editor (PortfolioEditor.js) and as a
// floating control on the standalone preview pages (app/preview/[template]),
// so customers can restyle a template without navigating back to the editor
// every time. One definition, two different surrounding containers.
//
// Each swatch is a conic sweep through the theme's own 4-color PALETTE
// (lib/palettes.js) rather than a flat dot — it reads more like a tiny
// color wheel than a single tint, so the pick actually previews the
// theme's character instead of just one accent.

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function ThemeSwitcher({ palettes, selectedId, onChange, vertical = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${vertical ? "flex-col" : "flex-wrap"} ${className}`}>
      {palettes.map((p) => {
        const active = p.id === selectedId;
        const [c1, c2, c3, c4] = p.colors.PALETTE;
        const sweep = `conic-gradient(from 180deg, ${c1}, ${c2}, ${c3 || c1}, ${c4 || c2}, ${c1})`;
        return (
          <button
            key={p.id}
            type="button"
            title={p.label}
            aria-label={p.label}
            aria-pressed={active}
            onClick={() => onChange(p.id)}
            style={active ? { "--tw-ring-color": p.colors.POP } : undefined}
            className={`group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-offset-2 transition-all duration-150 hover:scale-110 dark:ring-offset-zinc-900 ${
              active ? "scale-110 ring-2" : "ring-0 hover:ring-2 hover:ring-zinc-200 dark:hover:ring-zinc-700"
            }`}
          >
            <span
              className="absolute inset-0 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10"
              style={{ background: sweep }}
            />
            {active && (
              <span
                className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-zinc-900/90"
                style={{ color: p.colors.POP }}
              >
                <IconCheck className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
