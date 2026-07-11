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
// treatment: a torn-paper bottom edge via clip-path, the one motif applied
// everywhere instead of a different decorative idea per section.
/* eslint-disable @next/next/no-img-element */

import { Fraunces, Inter, Caveat } from "next/font/google";
import { SCRAPBOOK_PALETTES, getPalette } from "@/lib/palettes";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, initials, stripProtocol, computeYearsOfExperience, tint, shade, hexToRgb } from "./shared";
import CursorGlow from "./CursorGlow";

// Fraunces is a soft, editorial display serif — carries names, headlines
// and card titles. Inter keeps body copy clean and readable. Caveat is
// used in exactly two spots (the header eyebrow and the contact card) as a
// single handwritten accent, not the primary voice of the whole page.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

// One fixed torn-edge shape, built once — not randomized per card, since a
// different jagged pattern on every card is what read as chaotic rather
// than deliberate. clip-path only draws straight segments, so the top
// stays a clean rectangle (like a paper-trimmer cut) and only the bottom
// tears — that combination is what actually reads as "torn paper" rather
// than a random blob.
const TORN_CLIP = (() => {
  const teeth = 16;
  const depth = 5; // percent of the card's own height
  const baseY = 100 - depth;
  const points = ["0% 0%", "100% 0%", `100% ${baseY}%`];
  for (let i = 0; i <= teeth; i++) {
    const x = 100 - (i / teeth) * 100;
    const y = i % 2 === 0 ? 100 : baseY;
    points.push(`${x.toFixed(2)}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
})();

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

// Every card in every section shares this shell. `filter: drop-shadow`
// (not `box-shadow`) because a box-shadow would draw a rectangular shadow
// ignoring the clip-path — drop-shadow follows the actual clipped, torn
// silhouette instead.
function Pin({ children, accent, colors, className = "" }) {
  return (
    <div className={`relative ${className}`} style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.14))" }}>
      <div className="border-x border-t" style={{ backgroundColor: colors.CARD, borderColor: tint(accent, 30), clipPath: TORN_CLIP }}>
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
  return (
    <Pin accent={accent} colors={colors}>
      {project.image ? (
        <img src={project.image} alt={project.name || "Project"} className="w-full object-cover" />
      ) : (
        <div
          className="flex h-36 w-full items-center justify-center text-4xl font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, 30)})` }}
        >
          {(project.name || "?")[0]?.toUpperCase()}
        </div>
      )}
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
function CardGrid({ items }) {
  if (items.length === 1) {
    return <div className="mx-auto max-w-md">{items[0]}</div>;
  }
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {items.map((item, i) => (
        <div key={i} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
          {item}
        </div>
      ))}
    </div>
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
            <span className={`${caveat.className} text-lg`} style={{ color: ACCENT }}>
              welcome to my board
            </span>
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
              <span className={`${caveat.className} text-lg`} style={{ color: ACCENT }}>
                always open to a chat
              </span>
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
