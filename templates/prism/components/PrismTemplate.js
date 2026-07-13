// Pure presentational component: renders portfolio `data` only, no state of
// its own — same contract every template here follows (see
// EditorialTemplate.js's header comment for why).
//
// The look: blurred, slowly-drifting gradient blobs (colors from the active
// palette's PALETTE[4]) behind frosted-glass cards for every section — the
// "premium SaaS landing page" treatment applied to a portfolio. Deliberately
// a conventional hero + flowing card grid layout rather than a new
// structural metaphor, so the gradient/glass treatment itself carries the
// design.

import { PRISM_PALETTES, getPalette } from "@/lib/palettes";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, tint, hexToRgb, initials, stripProtocol } from "./shared";
import CursorGlow from "./CursorGlow";

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

// Only ever called on this template's own palette colors (always "#rrggbb"),
// not on an arbitrary dotColor() result (which can be an hsl() string) — so
// a plain hex-channel luminance check is enough, unlike shared.js's helpers,
// which have to handle both formats.
function isDarkColor(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// Four large, heavily blurred radial blobs — one per palette color, one
// per page corner — positioned once and drifting slowly via CSS
// keyframes — no JS animation loop needed. Wrapped in `@media
// (prefers-reduced-motion: no-preference)` so a reduced-motion preference
// simply never matches the animation rule at all, rather than requiring a
// JS media-query check to conditionally disable it. Sized in `vw` so they
// scale with viewport width and keep covering a wide desktop canvas rather
// than leaving flat, empty background at the edges.
//
// `mix-blend-screen` is load-bearing, not decorative: four ~50vw circles
// at partial opacity inevitably overlap across most of the page, and with
// the default blend (normal alpha compositing) that overlap averages
// toward a single muddy, undifferentiated color — exactly what happened
// before this was added. `screen` blends additively instead (screening any
// color with black — this template's dark PAPER — returns that color
// unchanged, and overlapping two screened colors brightens toward each
// hue rather than muddying), which is what keeps overlapping blobs
// reading as distinct glowing colors instead of a flat wash.
function AuroraBlobs({ colors }) {
  const [c1, c2, c3, c4] = colors;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes prism-drift-1 { 0%, 100% { transform: translate(-8%, -10%) scale(1); } 50% { transform: translate(6%, 8%) scale(1.2); } }
        @keyframes prism-drift-2 { 0%, 100% { transform: translate(10%, 6%) scale(1.1); } 50% { transform: translate(-6%, -8%) scale(1); } }
        @keyframes prism-drift-3 { 0%, 100% { transform: translate(-4%, 12%) scale(1); } 50% { transform: translate(8%, -10%) scale(1.15); } }
        @keyframes prism-drift-4 { 0%, 100% { transform: translate(6%, -8%) scale(1.05); } 50% { transform: translate(-8%, 10%) scale(1.2); } }
        @media (prefers-reduced-motion: no-preference) {
          .prism-blob-1 { animation: prism-drift-1 24s ease-in-out infinite; }
          .prism-blob-2 { animation: prism-drift-2 28s ease-in-out infinite; }
          .prism-blob-3 { animation: prism-drift-3 32s ease-in-out infinite; }
          .prism-blob-4 { animation: prism-drift-4 26s ease-in-out infinite; }
        }
      `}</style>
      <div className="prism-blob-1 absolute -left-[10%] -top-[15%] h-[55vw] w-[55vw] rounded-full mix-blend-screen blur-3xl" style={{ background: c1, opacity: 0.4 }} />
      <div className="prism-blob-2 absolute -right-[15%] top-[8%] h-[50vw] w-[50vw] rounded-full mix-blend-screen blur-3xl" style={{ background: c2, opacity: 0.35 }} />
      <div className="prism-blob-3 absolute -bottom-[20%] left-[15%] h-[60vw] w-[60vw] rounded-full mix-blend-screen blur-3xl" style={{ background: c3, opacity: 0.32 }} />
      <div className="prism-blob-4 absolute -bottom-[15%] -right-[10%] h-[52vw] w-[52vw] rounded-full mix-blend-screen blur-3xl" style={{ background: c4, opacity: 0.3 }} />
    </div>
  );
}

function GlassCard({ children, isDark, className = "" }) {
  return (
    <div
      className={`rounded-3xl border p-6 backdrop-blur-xl sm:p-8 ${className}`}
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)",
        borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.7)",
        boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.35)" : "0 8px 40px rgba(15,15,35,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children, accent, colors }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} />
      <h2 className="break-words text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: colors.MUTED }}>
        {children}
      </h2>
    </div>
  );
}

function ChipRow({ items, getKey, getLabel, getColor, href, isDark }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const label = getLabel(item);
        const color = getColor(item);
        const chipClass = "flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm";
        const chipStyle = {
          backgroundColor: tint(color, isDark ? 18 : 14),
          borderColor: tint(color, isDark ? 35 : 30),
          color: isDark ? "#fff" : "inherit",
        };
        const inner = (
          <>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="break-words">{label}</span>
          </>
        );
        return href ? (
          <a key={getKey(item)} href={href(item)} className={chipClass} style={chipStyle}>
            {inner}
          </a>
        ) : (
          <span key={getKey(item)} className={chipClass} style={chipStyle}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

export default function PrismTemplate({ data }) {
  const { name, role, bio, email, photoUrl, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const palette = getPalette("prism", data.paletteId) || PRISM_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE } = colors;
  const isDark = isDarkColor(PAPER);

  // Friendly labels ("GitHub", not the raw URL) — this list only ever
  // renders as the closing CTA's buttons, which read better as a short
  // action name than a raw handle/URL (unlike a byline credit, which is
  // the one place a raw URL text is the right call — no template here
  // needs that second form, so there's only ever this one list).
  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // One card per entry, not one card per section — a section with several
  // entries (e.g. 3 jobs' worth of bullets) used to render as a single
  // GlassCard, which could end up dramatically taller than its masonry
  // neighbors and dominate a whole column. Flattening to one card per
  // entry (same fix already proven in HolographicTemplate.js's "deck")
  // gives the masonry many medium-sized cards to distribute evenly
  // instead of one oversized one.
  const entryCards = [];
  (sectionOrder || []).forEach((id, sectionIndex) => {
    const accent = PALETTE[sectionIndex % PALETTE.length];

    if (id === "experience" && experience?.length > 0) {
      experience.forEach((job, i) =>
        entryCards.push(
          <GlassCard key={`experience-${i}`} isDark={isDark} className="mb-6 break-inside-avoid">
            <SectionHeading accent={accent} colors={colors}>
              {SECTION_LABELS.experience}
            </SectionHeading>
            <p className="break-words text-[15px] font-semibold" style={{ color: INK }}>
              {job.role || "Role"}
              {job.company && <span style={{ color: MUTED }}> · {job.company}</span>}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
              {job.start} — {job.end}
            </p>
            {job.bullets?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {job.bullets.map((line, j) => (
                  <p key={j} className="flex min-w-0 gap-2.5 break-words text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                    <span className="shrink-0" style={{ color: accent }}>
                      ✦
                    </span>
                    <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
                  </p>
                ))}
              </div>
            )}
          </GlassCard>
        )
      );
    }

    if (id === "education" && education?.length > 0) {
      education.forEach((edu, i) =>
        entryCards.push(
          <GlassCard key={`education-${i}`} isDark={isDark} className="mb-6 break-inside-avoid">
            <SectionHeading accent={accent} colors={colors}>
              {SECTION_LABELS.education}
            </SectionHeading>
            <p className="break-words text-[15px] font-semibold" style={{ color: INK }}>
              {edu.degree || "Degree"}
            </p>
            <p className="mt-0.5 break-words text-[13px]" style={{ color: MUTED }}>
              {edu.school} · {edu.start}–{edu.end}
            </p>
          </GlassCard>
        )
      );
    }

    if (id === "achievements" && achievements?.length > 0) {
      achievements.forEach((item, i) =>
        entryCards.push(
          <GlassCard key={`achievement-${i}`} isDark={isDark} className="mb-6 break-inside-avoid">
            <SectionHeading accent={accent} colors={colors}>
              {SECTION_LABELS.achievements}
            </SectionHeading>
            <p className="flex min-w-0 gap-3 break-words text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
              <span className="shrink-0" style={{ color: accent }}>
                ✦
              </span>
              <span className="break-words">{item}</span>
            </p>
          </GlassCard>
        )
      );
    }

    if (id === "projects" && projects?.length > 0) {
      projects.forEach((project, i) =>
        entryCards.push(
          <GlassCard key={`project-${i}`} isDark={isDark} className="mb-6 break-inside-avoid">
            <SectionHeading accent={accent} colors={colors}>
              {SECTION_LABELS.projects}
            </SectionHeading>
            <p className="break-words text-[15px] font-semibold" style={{ color: INK }}>
              {project.name || "Project"}
            </p>
            {project.description && (
              <p className="mt-1.5 whitespace-pre-line break-words text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                {project.description}
              </p>
            )}
            {project.tags?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: tint(dotColor(tag), isDark ? 20 : 14), color: isDark ? "#fff" : dotColor(tag) }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {(project.link || project.demo) && (
              <p className="mt-2 text-sm">
                {project.link && (
                  <a href={`https://${stripProtocol(project.link)}`} className="underline underline-offset-4" style={{ color: accent }}>
                    Source
                  </a>
                )}
                {project.link && project.demo && <span className="mx-2" style={{ color: MUTED }}>·</span>}
                {project.demo && (
                  <a href={`https://${stripProtocol(project.demo)}`} className="underline underline-offset-4" style={{ color: accent }}>
                    Live
                  </a>
                )}
              </p>
            )}
          </GlassCard>
        )
      );
    }

    if (id === "skills" && skills?.length > 0) {
      entryCards.push(
        <GlassCard key="skills" isDark={isDark} className="mb-6 break-inside-avoid">
          <SectionHeading accent={accent} colors={colors}>
            {SECTION_LABELS.skills}
          </SectionHeading>
          <ChipRow items={skills} getKey={(s) => s} getLabel={(s) => s} getColor={dotColor} isDark={isDark} />
        </GlassCard>
      );
    }

    if (id === "codingProfiles" && codingProfiles?.length > 0) {
      entryCards.push(
        <GlassCard key="codingProfiles" isDark={isDark} className="mb-6 break-inside-avoid">
          <SectionHeading accent={accent} colors={colors}>
            {SECTION_LABELS.codingProfiles}
          </SectionHeading>
          <ChipRow
            items={codingProfiles}
            getKey={(p, i) => p.platform + i}
            getLabel={(p) => p.platform}
            getColor={(p) => dotColor(p.platform)}
            href={(p) => `https://${stripProtocol(p.url)}`}
            isDark={isDark}
          />
        </GlassCard>
      );
    }
  });

  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ backgroundColor: PAPER, color: INK }}>
      <AuroraBlobs colors={PALETTE} />
      <CursorGlow colorRgb={hexToRgb(POP)} size={550} />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="h-24 w-24 rounded-full border object-cover shadow-lg"
              style={{ borderColor: tint(POP, 40) }}
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full border text-2xl font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, ${PALETTE[0]}, ${PALETTE[2]})`, borderColor: tint(POP, 40), color: "#fff" }}
            >
              {initials(name)}
            </div>
          )}
          <h1 className="mt-6 break-words text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: INK }}>
            {name || "Your Name"}
          </h1>
          <p
            className="mt-2 break-words text-lg font-semibold lg:text-xl"
            style={{
              backgroundImage: `linear-gradient(90deg, ${POP}, ${PALETTE[1]})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {role || "Your Role"}
          </p>
          {bio && (
            <p className="mt-5 max-w-2xl break-words whitespace-pre-line text-[15.5px] leading-relaxed lg:text-base" style={{ color: INK_SOFT }}>
              {bio}
            </p>
          )}
        </div>

        {/* The deck of entry cards */}
        {entryCards.length > 0 && (
          <div className="mt-16 columns-1 sm:columns-2 sm:gap-6 lg:columns-3">
            {/* CSS multi-column masonry, not a grid: a grid row forces every
                card in it to match its tallest neighbor's height (that's
                what stretched Education to match Skills' height and left a
                large blank void inside it) — `columns` instead sizes each
                card to its own content and lets it flow into whichever
                column has room next. Every card flows as a regular
                (non-spanning) column item, deliberately — `column-span:
                all` was tried and dropped: mixing a full-width spanning
                item into a multi-column flow is a known cross-browser
                rendering quirk (Chromium reliably inserts a large,
                unpredictable gap around the spanning element). */}
            {entryCards}
          </div>
        )}

        {/* Closing contact */}
        {contactItems.length > 0 && (
          <GlassCard isDark={isDark} className="mt-6 flex flex-col items-center text-center">
            <p className="text-lg font-semibold" style={{ color: INK }}>
              Let&rsquo;s connect
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {contactItems.map(({ label, href, Icon }, i) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-75"
                  style={{
                    color: isDark ? "#fff" : POP,
                    borderColor: tint(POP, 45),
                    backgroundColor: i === 0 ? tint(POP, 16) : "transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{label}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        )}

        <footer className="mt-10 text-center text-xs" style={{ color: MUTED }}>
          <p>
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="mt-1 opacity-70">Made with Dev Portfolio Builder</p>
        </footer>
      </div>
    </div>
  );
}
