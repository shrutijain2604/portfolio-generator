// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Structured like every other template — labeled sections in the
// customer's chosen order, each with its own heading — not a single flat
// stream of mixed card types. A pure masonry board (all card types
// interleaved together) read as random, not curated, because nothing told
// the eye what it was looking at. Within each section, cards lay out in a
// centered flex-wrap grid, and every card gets one consistent signature
// treatment: an organically torn paper edge on all sides (an SVG filter,
// see TornPaperFilters below), the one motif applied everywhere instead
// of a different decorative idea per section.
/* eslint-disable @next/next/no-img-element */

import { Fraunces, Inter, Caveat } from "next/font/google";
import { SCRAPBOOK_PALETTES, getPalette } from "@/lib/palettes";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, initials, stripProtocol, computeYearsOfExperience, tint, shade, hexToRgb } from "./shared";
import CursorGlow from "./CursorGlow";
import RevealOnScroll from "./RevealOnScroll";
import FlipPolaroid from "./FlipPolaroid";

// Fraunces is a soft, editorial display serif — carries names, headlines
// and card titles. Inter keeps body copy clean and readable. Caveat is
// used in exactly two spots (the header eyebrow and the contact card) as a
// single handwritten accent, not the primary voice of the whole page.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

// Four torn-edge SVG filters, rendered once and referenced by every card
// via CSS (see .scrapbook-torn in globals.css) — an organically torn,
// raking-lit paper surface on all four sides, instead of a fixed zigzag
// clip-path that could only ever cut straight segments. Ported directly
// from happy358/TornPaper (MIT) as inline markup rather than pulling in
// its runtime script — this codebase's decorative pieces are all
// hand-rolled with no external dependency, and the technique is just an
// SVG filter graph: fractal noise displaces + erodes the element's own
// alpha edges into an irregular tear, and a second noise pass lit from a
// raking angle (feDiffuseLighting) gives the paper surface real texture,
// multiplied over the actual card content. Four fixed seeds (not
// Math.random()) so each card's tear is a little different but stays
// identical between server and client renders.
const TORN_PAPER_VARIANTS = [
  { id: "scrapbook-torn-1", seed: 7 },
  { id: "scrapbook-torn-2", seed: 23 },
  { id: "scrapbook-torn-3", seed: 41 },
  { id: "scrapbook-torn-4", seed: 58 },
];

function TornPaperFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        {TORN_PAPER_VARIANTS.map(({ id, seed }) => (
          <filter key={id} id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="10" seed={seed} result="paper_noise" />
            <feDiffuseLighting in="paper_noise" lightingColor="white" surfaceScale="3" result="paper">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="10" seed={seed} result="edge_noise" />
            <feGaussianBlur stdDeviation="0.5" in="SourceGraphic" />
            <feMorphology operator="erode" radius="5" />
            <feOffset dx="-2" dy="-2" />
            <feDisplacementMap scale="10" xChannelSelector="B" yChannelSelector="G" in2="edge_noise" result="edge" />
            <feComposite in="paper" in2="edge" operator="atop" result="result_rough" />
            <feComposite in="SourceGraphic" in2="edge" operator="atop" result="result_sg" />
            <feBlend mode="multiply" in="result_rough" in2="result_sg" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

function WashiTape({ className = "", color, rotation = -6 }) {
  return (
    <div
      className={`pointer-events-none absolute h-5 w-20 rounded-[1px] opacity-90 ${className}`}
      style={{
        background: `repeating-linear-gradient(45deg, ${color}, ${color} 6px, ${tint(color, 60)} 6px, ${tint(color, 60)} 12px)`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
    />
  );
}

// A little metal tack pinning each card to the board — grounded with its
// own tiny shadow ellipse so it reads as sitting slightly proud of the
// paper, not printed on it. Idles with a sway (per-card delay comes from
// the --pin-delay custom property set on the grid wrapper) and "presses
// in" on hover/focus, in sync with the card lifting off the board — see
// .scrapbook-card / .scrapbook-pin in globals.css. An SVG drawing, not an
// emoji pushpin, so it stays crisp and consistent across platforms.
function CorkPin({ color }) {
  return (
    <span aria-hidden className="scrapbook-pin pointer-events-none absolute left-1/2 top-0 z-10">
      <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
        <ellipse cx="13" cy="24.5" rx="4" ry="1.6" fill="rgba(0,0,0,0.18)" />
        <path d="M13 15 L13 22" stroke={shade(color, 35)} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="13" cy="9" r="7.5" fill={shade(color, 12)} />
        <circle cx="10.5" cy="6.5" r="2.6" fill="rgba(255,255,255,0.6)" />
        <circle cx="10" cy="6" r="1.1" fill="rgba(255,255,255,0.9)" />
      </svg>
    </span>
  );
}

// Every card in every section shares this shell — the one signature
// treatment applied everywhere instead of a different decorative idea per
// section, built up in real layers: a second sheet (.scrapbook-paper-peek),
// tinted a shade darker, sits behind the main sheet and offset a few px so
// it peeks out past the torn edge — the classic "there's another page
// under this one" scrapbook tell. Both sheets get their tear + texture
// from .scrapbook-torn (a shared class; which of the four TornPaperFilters
// variants each card gets is chosen by nth-child position on the grid
// wrapper, in globals.css — see .scrapbook-board there). No border or
// clip-path anymore — the SVG filter draws the entire torn silhouette
// itself, so a straight CSS border would just cut a rectangle across an
// organic shape. `.scrapbook-card`'s own drop-shadow (globals.css) still
// lifts the whole stack together and follows whatever the filter painted,
// since drop-shadow shadows the element's actual rendered pixels.
function Pin({ children, accent, colors, className = "" }) {
  return (
    <div className={`scrapbook-card ${className}`}>
      <CorkPin color={accent} />
      <div aria-hidden className="scrapbook-torn scrapbook-paper-peek pointer-events-none absolute inset-0" style={{ backgroundColor: shade(colors.CARD, 10) }} />
      <div className="scrapbook-torn relative" style={{ backgroundColor: colors.CARD }}>
        {children}
        <div className="h-4" aria-hidden />
      </div>
    </div>
  );
}

function AccentBar({ color }) {
  return <div className="h-[5px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${tint(color, 45)})` }} />;
}

function SectionHeading({ children, accent }) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="h-px flex-1" style={{ backgroundColor: tint(accent, 30) }} />
      <h2 className={`${fraunces.className} shrink-0 text-2xl font-medium italic`} style={{ color: accent }}>
        {children}
      </h2>
      <span className="h-px flex-1" style={{ backgroundColor: tint(accent, 30) }} />
    </div>
  );
}

function ProjectCard({ project, accent, colors }) {
  // The back only gets content — and the photo only becomes flippable —
  // when there's a real highlight or description to show; flipping to a
  // blank card would be a dead end. See FlipPolaroid.
  const note = project.highlights?.[0] || project.description || "";
  return (
    <Pin accent={accent} colors={colors}>
      <FlipPolaroid
        label={project.name || "this project"}
        front={
          // An actual polaroid — thick warm-white paper border (always
          // this off-white, regardless of the section's accent, the way a
          // real photo's paper border ignores whatever it's stuck next
          // to), tucked into the card with its own slight independent
          // tilt so it reads as a photo someone placed there, not a
          // banner image the card was born with.
          <div className="flex h-full w-full flex-col items-center justify-center p-3">
            <div className="scrapbook-polaroid flex h-full w-full flex-col p-2 pb-5" style={{ backgroundColor: "#fbf9f4" }}>
              <div className="min-h-0 flex-1 overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.name || "Project"} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, 30)})` }}
                  >
                    {(project.name || "?")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        back={
          note && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center" style={{ backgroundColor: tint(accent, 14) }}>
              <span className={`${caveat.className} break-words text-lg leading-snug`} style={{ color: colors.INK }}>
                &ldquo;{note}&rdquo;
              </span>
            </div>
          )
        }
      />
      <div className="p-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`${fraunces.className} min-w-0 break-words text-lg font-medium`} style={{ color: colors.INK }}>
            {project.name || "Untitled project"}
          </p>
          {project.status && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: tint(accent, 18), color: accent }}
            >
              {project.status}
            </span>
          )}
        </div>
        {project.description && (
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed" style={{ color: colors.INK_SOFT }}>
            {project.description}
          </p>
        )}
        {project.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="break-words rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: tint(colors.INK, 6), color: colors.INK_SOFT }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {(project.link || project.demo) && (
          <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs font-semibold" style={{ borderColor: tint(accent, 20) }}>
            {project.link && (
              <a href={`https://${stripProtocol(project.link)}`} style={{ color: accent }}>
                Source
              </a>
            )}
            {project.demo && (
              <a href={`https://${stripProtocol(project.demo)}`} style={{ color: accent }}>
                Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </Pin>
  );
}

function JobCard({ job, accent, colors }) {
  return (
    <Pin accent={accent} colors={colors}>
      <AccentBar color={accent} />
      <div className="p-5 pb-2">
        <p className={`${fraunces.className} break-words text-base font-medium`} style={{ color: colors.INK }}>
          {job.role || "Role"}
        </p>
        <p className="break-words text-sm" style={{ color: colors.MUTED }}>
          {job.company || "Company"} · {job.start} – {job.end}
        </p>
        {job.bullets?.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {job.bullets.map((line, j) => (
              <li key={j} className="flex gap-2 text-sm leading-relaxed" style={{ color: colors.INK_SOFT }}>
                <span className="shrink-0" style={{ color: accent }}>
                  ·
                </span>
                <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Pin>
  );
}

function EduCard({ edu, accent, colors }) {
  return (
    <Pin accent={accent} colors={colors}>
      <AccentBar color={accent} />
      <div className="p-5 pb-2">
        <p className={`${fraunces.className} break-words text-base font-medium`} style={{ color: colors.INK }}>
          {edu.degree || "Degree"}
        </p>
        <p className="break-words text-sm" style={{ color: colors.MUTED }}>
          {edu.school || "School"} · {edu.start} – {edu.end}
        </p>
      </div>
    </Pin>
  );
}

function SkillsCard({ skills, accent, colors }) {
  return (
    <Pin accent={accent} colors={colors}>
      <AccentBar color={accent} />
      <div className="p-5 pb-2">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: tint(colors.INK, 6), color: colors.INK_SOFT }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
              <span className="break-words">{skill}</span>
            </span>
          ))}
        </div>
      </div>
    </Pin>
  );
}

function CodingCard({ profiles, accent, colors }) {
  return (
    <Pin accent={accent} colors={colors}>
      <AccentBar color={accent} />
      <div className="p-5 pb-2">
        <div className="space-y-1">
          {profiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-black/[0.04]"
            >
              <span className="min-w-0 truncate font-medium" style={{ color: colors.INK }}>
                {profile.platform}
              </span>
              <span className="shrink-0 truncate text-xs" style={{ color: accent }}>
                {stripProtocol(profile.url)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Pin>
  );
}

function AchievementCard({ text, accent, colors }) {
  return (
    <Pin accent={accent} colors={colors}>
      <div className="flex items-start gap-3 p-5 pb-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
          style={{ backgroundColor: tint(accent, 18), color: accent }}
        >
          ★
        </span>
        <p className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed" style={{ color: colors.INK_SOFT }}>
          {text}
        </p>
      </div>
    </Pin>
  );
}

// flex-wrap + justify-center, not CSS-columns masonry (which balances
// total height across columns and scatters cards at mismatched vertical
// offsets once heights vary — that's what looked "misaligned") and not
// CSS Grid either (a grid can't self-center a partial last row — a lone
// leftover card stays pinned to column 1 with an empty gap beside it).
// Flexbox with explicit per-card widths gets both: every row's cards start
// at the same top edge, and an incomplete last row centers itself instead
// of hugging the left edge. A section with exactly one card (Toolkit,
// Coding Profiles) just centers that one card instead of stretching it
// across empty columns.
// Cards flutter in and settle into their resting tilt the first time a
// section scrolls into view, instead of the whole board landing at once.
// `.scrapbook-board` is what the per-card tilt (--rest-rot) and stagger
// delays in globals.css key off of; the extra wrapper div even in the
// single-card case keeps that targeting consistent (and keeps the
// flutter's own transform off the card's element, which owns its resting
// rotation and hover-lift transform separately).
function CardGrid({ items }) {
  if (items.length === 1) {
    return (
      <RevealOnScroll arrivedClassName="scrapbook-flutter-arrive" threshold={0.2} rootMargin="0px 0px -60px 0px">
        <div className="scrapbook-board mx-auto max-w-md">
          <div>{items[0]}</div>
        </div>
      </RevealOnScroll>
    );
  }
  return (
    <RevealOnScroll arrivedClassName="scrapbook-flutter-arrive" threshold={0.15} rootMargin="0px 0px -60px 0px">
      <div className="scrapbook-board flex flex-wrap justify-center gap-6">
        {items.map((item, i) => (
          <div key={i} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            {item}
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}

// A handwritten eyebrow line with an ink underline that draws itself the
// first time it scrolls into view — `pathLength="1"` normalizes the SVG
// path so the draw-on keyframe (globals.css) can animate stroke-dashoffset
// 1 → 0 without measuring the path's real length. Stays fully drawn
// (dashoffset 0) by default per RevealOnScroll's contract, so a visitor
// without JS, or a crawler, never sees a missing/half-drawn line.
function InkEyebrow({ children, color }) {
  return (
    <RevealOnScroll arrivedClassName="scrapbook-ink-arrive" threshold={0.6} rootMargin="0px">
      <span className="inline-flex flex-col items-center">
        <span className={`${caveat.className} text-lg`} style={{ color }}>
          {children}
        </span>
        <svg width="150" height="12" viewBox="0 0 150 12" className="scrapbook-ink -mt-1" aria-hidden focusable="false">
          <path d="M2,8 Q37,2 75,7 T148,5" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 0 }} />
        </svg>
      </span>
    </RevealOnScroll>
  );
}

const SECTION_LABELS = {
  experience: "Where I’ve worked",
  education: "Where I studied",
  projects: "Things I’ve made",
  achievements: "Little wins",
  skills: "Toolkit",
  codingProfiles: "Where I compete",
};

export default function ScrapbookTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const palette = getPalette("scrapbook", data.paletteId) || SCRAPBOOK_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, PALETTE, CARD } = colors;

  const yearsXp = computeYearsOfExperience(experience);

  // Every card within a section shares that section's one accent color —
  // the section, not the individual card, is the unit of color identity,
  // which is what makes "this whole cluster is Projects" legible at a
  // glance instead of every card competing for attention on its own.
  const sectionCards = {
    experience: (experience || []).length > 0 ? (accent) => experience.map((job, i) => <JobCard key={i} job={job} accent={accent} colors={colors} />) : null,
    education: (education || []).length > 0 ? (accent) => education.map((edu, i) => <EduCard key={i} edu={edu} accent={accent} colors={colors} />) : null,
    projects: (projects || []).length > 0 ? (accent) => projects.map((project, i) => <ProjectCard key={i} project={project} accent={accent} colors={colors} />) : null,
    achievements:
      (achievements || []).length > 0 ? (accent) => achievements.map((text, i) => <AchievementCard key={i} text={text} accent={accent} colors={colors} />) : null,
    skills: (skills || []).length > 0 ? (accent) => [<SkillsCard key="skills" skills={skills} accent={accent} colors={colors} />] : null,
    codingProfiles: (codingProfiles || []).length > 0 ? (accent) => [<CodingCard key="coding" profiles={codingProfiles} accent={accent} colors={colors} />] : null,
  };
  const orderedIds = (sectionOrder || []).filter((id) => sectionCards[id]);

  return (
    <div className={`relative min-h-dvh ${inter.className}`} style={{ backgroundColor: PAPER, color: INK }}>
      <TornPaperFilters />
      {/* One shared wallpaper texture across every palette, `fixed` so it
          stays pinned to the viewport as the page scrolls instead of
          scrolling with the content — a translucent wash of the palette's
          own PAPER color sits on top so each theme still reads as
          distinct, rather than every palette looking like a flat recolor
          of the same photo. Plain `position: fixed`, no containing-block
          trick here — this template is written as if it's always a full
          page (matching the actual deployed site and the standalone
          /preview route); the editor's constrained live-preview pane
          takes care of scoping `fixed` to itself on its own end
          (PortfolioEditor.js), so this component doesn't need to know or
          care which context it's rendered in.
          A <picture> with a media-query <source>, not next/image — this is
          art direction (a genuinely different photo per breakpoint, not
          just a resized variant of the same one), so the browser needs to
          pick a source before fetching, or both images would end up
          downloaded on every device. */}
      <div className="pointer-events-none fixed inset-0">
        <picture>
          <source media="(min-width: 640px)" srcSet="/scrapbook-wallpaper-for-desktop.png" />
          <img src="/scrapbook-wallpaper-for-mobile.png" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0" style={{ backgroundColor: tint(PAPER, 55) }} />
      </div>
      <CursorGlow colorRgb={hexToRgb(ACCENT)} size={550} />

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        {/* Header */}
        <header className="mx-auto mb-16 flex max-w-2xl flex-col items-center gap-5 text-center sm:mb-24">
          <div className="relative">
            <WashiTape className="-left-5 -top-3 z-10" color={tint(ACCENT, 30)} rotation={-10} />
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name || "Portrait"}
                className="h-32 w-32 rounded-full object-cover shadow-lg ring-4"
                style={{ "--tw-ring-color": CARD }}
              />
            ) : (
              <div
                className="flex h-32 w-32 items-center justify-center rounded-full text-3xl font-semibold shadow-lg ring-4"
                style={{ backgroundColor: tint(ACCENT, 16), color: ACCENT, "--tw-ring-color": CARD }}
              >
                {initials(name)}
              </div>
            )}
          </div>
          <div>
            <InkEyebrow color={ACCENT}>welcome to my board</InkEyebrow>
            <h1 className={`${fraunces.className} mt-1 break-words text-5xl font-medium tracking-tight sm:text-6xl`} style={{ color: INK }}>
              {name || "Your Name"}
            </h1>
            <p className="mt-2 break-words text-lg" style={{ color: MUTED }}>
              {role || "Your Role"}
            </p>
          </div>
          {bio && (
            <p className={`${fraunces.className} max-w-lg whitespace-pre-line break-words text-xl italic leading-relaxed`} style={{ color: INK_SOFT }}>
              &ldquo;{bio}&rdquo;
            </p>
          )}
          {yearsXp > 0 && (
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>
              {yearsXp} year{yearsXp === 1 ? "" : "s"} in the making
            </p>
          )}
        </header>

        {/* Sections, in the customer's chosen order — each its own labeled
            cluster instead of one undifferentiated stream of cards. */}
        {orderedIds.map((id, sectionIndex) => {
          const accent = PALETTE[sectionIndex % PALETTE.length];
          return (
            <section key={id} className="mb-16 sm:mb-20">
              <SectionHeading accent={accent}>{SECTION_LABELS[id]}</SectionHeading>
              <CardGrid items={sectionCards[id](accent)} />
            </section>
          );
        })}

        {/* Contact — the same torn-paper card, not a different decorative
            idea, so it reads as part of the same set instead of a bolt-on. */}
        <section className="mx-auto mt-4 max-w-xl">
          <Pin accent={ACCENT} colors={colors}>
            <AccentBar color={ACCENT} />
            <div className="p-8 pb-4 text-center">
              <InkEyebrow color={ACCENT}>always open to a chat</InkEyebrow>
              <p className={`${fraunces.className} mt-1 break-words text-3xl font-medium`} style={{ color: INK }}>
                Let&rsquo;s connect
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <IconMail className="h-4 w-4" /> Say hello
                  </a>
                )}
                {links?.github && (
                  <a
                    href={`https://${stripProtocol(links.github)}`}
                    className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ borderColor: tint(ACCENT, 30), color: INK_SOFT }}
                  >
                    <IconGithub className="h-4 w-4" /> GitHub
                  </a>
                )}
                {links?.linkedin && (
                  <a
                    href={`https://${stripProtocol(links.linkedin)}`}
                    className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ borderColor: tint(ACCENT, 30), color: INK_SOFT }}
                  >
                    <IconLinkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {links?.website && (
                  <a
                    href={`https://${stripProtocol(links.website)}`}
                    className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ borderColor: tint(ACCENT, 30), color: INK_SOFT }}
                  >
                    <IconLink className="h-4 w-4" /> Website
                  </a>
                )}
              </div>
            </div>
          </Pin>
        </section>

        <footer className="mt-10 text-center text-xs" style={{ color: MUTED }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </div>
    </div>
  );
}
