// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.

import { Fragment } from "react";
import { Fraunces } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { EDITORIAL_PALETTES, getPalette } from "@/lib/palettes";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  stripProtocol,
  dotColor,
  tint,
  hexToRgb,
  shade,
} from "./shared";
import CursorGlow from "./CursorGlow";
import ReadingTimer from "./ReadingTimer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

// Section head set like a magazine's department rule: the folio number, the
// title, then a hairline that runs out to the measure. The number used to be
// an oversized ghost numeral sitting behind the title, which collided with
// the first letter at most widths and read as a mistake rather than a device.
function SectionTitle({ children, colors, accent, number, id }) {
  return (
    <div id={id} className="flex scroll-mt-10 items-center gap-4">
      <div className="flex min-w-0 items-baseline gap-3">
        {number && (
          <span
            className={`${fraunces.className} shrink-0 text-xl font-semibold tabular-nums`}
            style={{ color: accent }}
          >
            {number}
          </span>
        )}
        <h2
          className={`${fraunces.className} min-w-0 break-words text-3xl font-semibold tracking-tight`}
          style={{ color: colors.INK }}
        >
          {children}
        </h2>
      </div>
      <span aria-hidden className="h-px min-w-6 flex-1" style={{ backgroundColor: `${accent}40` }} />
    </div>
  );
}

function BulletLines({ lines, accent, className = "", textColor }) {
  return (
    <div className={`space-y-2 ${className}`} style={{ color: textColor }}>
      {lines.map((line, i) => (
        <p key={i} className="flex min-w-0 gap-3 break-words">
          {/* A drawn rule rather than a dash character: it keeps a consistent
              weight and length whatever font the body copy falls back to. */}
          <span aria-hidden className="mt-[0.7em] h-px w-3.5 shrink-0" style={{ backgroundColor: accent }} />
          <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
        </p>
      ))}
    </div>
  );
}

function TimelineEntry({ title, subtitle, start, end, lines, accent, colors }) {
  return (
    <div className="relative min-w-0 pl-6">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <span className="absolute bottom-0 left-[4.5px] top-5 w-px" style={{ backgroundColor: tint(colors.ACCENT, 15) }} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="min-w-0 break-words font-sans text-[15px] font-semibold" style={{ color: colors.INK }}>
          {title}
          {subtitle && <span className="font-normal" style={{ color: colors.MUTED }}> · {subtitle}</span>}
        </p>
        <p
          className="shrink-0 whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.14em]"
          style={{ color: colors.MUTED }}
        >
          {start} - {end}
        </p>
      </div>
      {lines?.length > 0 && (
        <BulletLines
          lines={lines}
          accent={accent}
          textColor={colors.INK_SOFT}
          className="mt-2 font-sans text-[15px] leading-relaxed"
        />
      )}
    </div>
  );
}

// Education runs full width, one record per row, rather than sharing the
// two-up grid experience uses. A degree and an institution are both long,
// unbreakable-in-the-middle strings, and in a half-width column they wrapped
// into each other and lost the line between qualification and awarding body.
function EducationEntry({ degree, school, start, end, accent, colors }) {
  const dates = [start, end].filter(Boolean).join(" - ");
  return (
    <article className="min-w-0 border-t pt-5" style={{ borderColor: `${colors.ACCENT}18` }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3
          className={`${fraunces.className} min-w-0 break-words text-xl font-semibold`}
          style={{ color: colors.INK }}
        >
          {degree}
        </h3>
        {dates && (
          <p
            className="shrink-0 whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.14em]"
            style={{ color: colors.MUTED }}
          >
            {dates}
          </p>
        )}
      </div>
      {school && (
        <p className="mt-2 flex min-w-0 items-baseline gap-2.5 font-sans text-[14.5px]" style={{ color: colors.INK_SOFT }}>
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
          <span className="min-w-0 break-words">{school}</span>
        </p>
      )}
    </article>
  );
}

// A rotated vertical "spine" label pinned to a page edge, like the running
// folio text along a real magazine's margin. It only shows once there's real
// gutter space beside the centered layout (xl+), so it never sits near
// actual content. Static copy, not derived from customer data, since a
// vertical column has no safe way to truncate an arbitrarily long name.
function Folio({ side, label }) {
  return (
    <div
      aria-hidden
      className={`editorial-breathe pointer-events-none fixed top-1/2 z-[2] hidden -translate-y-1/2 xl:block ${
        side === "left" ? "left-5 rotate-180" : "right-5"
      }`}
      style={{ writingMode: "vertical-rl" }}
    >
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-current opacity-60">
        {label}
      </span>
    </div>
  );
}

// A pulled quote, the classic magazine device for filling a column with a
// line already said elsewhere on the page, sourced from the customer's own
// achievements/highlights/bullets, in that priority order, never invented.
function pickPullQuote({ achievements, projects, experience }) {
  if (achievements?.length > 0) return achievements[0];
  const projectHighlight = projects?.find((p) => p.highlights?.length > 0)?.highlights[0];
  if (projectHighlight) return projectHighlight;
  const bullet = experience?.find((e) => e.bullets?.length > 0)?.bullets[0];
  if (bullet) return bullet;
  return null;
}

function PullQuote({ text, accent, colors, fraunces }) {
  if (!text) return null;
  return (
    <blockquote className="editorial-fade-up my-2 border-l-4 pl-6" style={{ borderColor: accent }}>
      <span className={`${fraunces.className} block text-5xl leading-none`} style={{ color: accent, opacity: 0.4 }}>
        &ldquo;
      </span>
      <p className={`${fraunces.className} -mt-3 max-w-xl break-words text-2xl italic leading-snug`} style={{ color: colors.INK }}>
        {text}
      </p>
    </blockquote>
  );
}

// A small ornamental break between sections, a real magazine's dinkus,
// so the generous gap between sections reads as a deliberate pause instead
// of dead space.
function SectionOrnament({ accent }) {
  return (
    <div aria-hidden className="flex items-center justify-center gap-3">
      <span className="h-px w-12" style={{ backgroundColor: `${accent}40` }} />
      <span className="editorial-breathe text-sm" style={{ color: accent }}>
        ❦
      </span>
      <span className="h-px w-12" style={{ backgroundColor: `${accent}40` }} />
    </div>
  );
}

// A wire-service style headline ticker built from real project/role data:
// no invented copy, just the same facts already on the page reframed as
// breaking-news banner text.
function pickHeadlines({ role, projects, skills }) {
  return [
    role && `NOW FEATURING: ${role.toUpperCase()}`,
    ...(projects || [])
      .slice(0, 3)
      .map((p) => p.name && `IN THIS ISSUE: ${p.name.toUpperCase()}`),
    skills?.length > 0 && `${skills.length} SKILLS ON FILE`,
  ].filter(Boolean);
}

function WireTicker({ items, accent }) {
  if (items.length === 0) return null;
  const line = `${items.join("   ✦   ")}   ✦   `;
  return (
    <div aria-hidden className="overflow-hidden border-b-4 py-1.5" style={{ borderColor: accent }}>
      <div
        className="editorial-marquee-track flex w-max whitespace-nowrap font-sans text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: accent }}
      >
        <span className="pr-6">{line}</span>
        <span className="pr-6">{line}</span>
      </div>
    </div>
  );
}

// A couple of scattered ink-stain blots in the page margins: press-room
// texture that only shows once there's real gutter space (xl+), so it
// never sits near actual content. Fixed positions, not random, so a
// refresh doesn't reshuffle them.
function InkBlots({ palette }) {
  const blots = [
    { top: "22%", side: "left", inset: "1.5rem", size: 90, color: palette[0] },
    { top: "62%", side: "right", inset: "2rem", size: 70, color: palette[2] || palette[0] },
    { top: "85%", side: "left", inset: "3rem", size: 55, color: palette[1] || palette[0] },
  ];
  return (
    <>
      {blots.map((b, i) => (
        <div
          key={i}
          aria-hidden
          className="editorial-breathe pointer-events-none fixed z-[1] hidden rounded-full blur-sm xl:block"
          style={{
            top: b.top,
            [b.side]: b.inset,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color}33, transparent 70%)`,
          }}
        />
      ))}
    </>
  );
}

// A fine, static paper-grain texture over the whole page, the tactile
// detail that separates a print-styled page from a flat one, without any
// motion of its own.
function PaperGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.05] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

// Set as a magazine index rather than a row of filled pills: a spot-colour
// dot and the label at its own casing, so a long skills list reads as
// typography instead of a block of pastel bubbles. Casing is left untouched
// because the difference between "PostgreSQL" and "Postgresql" matters to
// the audience.
function ChipRow({ items, getKey, getLabel, getColor, href, textColor }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2.5">
      {items.map((item) => {
        const label = getLabel(item);
        const color = getColor(item);
        const chipClass = "flex min-w-0 items-baseline gap-1.5 font-sans text-[13px] font-medium";
        const chipStyle = { color: textColor };
        const dot = (
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
            style={{ backgroundColor: color }}
          />
        );
        return href ? (
          <a
            key={getKey(item)}
            href={href(item)}
            className={`${chipClass} editorial-toc-link`}
            style={chipStyle}
          >
            {dot}
            <span className="break-words">{label}</span>
          </a>
        ) : (
          <span key={getKey(item)} className={chipClass} style={chipStyle}>
            {dot}
            <span className="break-words">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function EditorialTemplate({ data }) {
  const {
    name,
    role,
    bio,
    email,
    links,
    skills,
    codingProfiles,
    experience,
    education,
    achievements,
    projects,
    sectionOrder,
  } = data;

  const palette = getPalette("editorial", data.paletteId) || EDITORIAL_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE } = colors;

  const issueDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();

  const contactItems = [
    email && { label: email, href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // Short, friendly labels for the closing CTA buttons. contactItems above
  // shows the actual handle/URL text (right for a byline), but a
  // call-to-action reads better as "Say hi" than the raw email address.
  const ctaLinks = [
    email && { label: "Say hi", href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js). The
  // customer's drag-and-drop order in the editor picks which of these
  // render, and in what sequence, in the main column below the masthead.
  const sections = {
    experience: experience?.length > 0 && (
      <div className="space-y-10">
        {experience.map((job, i) => (
          <TimelineEntry
            key={i}
            title={job.role}
            subtitle={job.company}
            start={job.start}
            end={job.end}
            lines={job.bullets}
            accent={PALETTE[i % PALETTE.length]}
            colors={colors}
          />
        ))}
      </div>
    ),

    education: education?.length > 0 && (
      <div className="space-y-6">
        {education.map((edu, i) => (
          <EducationEntry
            key={i}
            degree={edu.degree}
            school={edu.school}
            start={edu.start}
            end={edu.end}
            accent={PALETTE[(i + 1) % PALETTE.length]}
            colors={colors}
          />
        ))}
      </div>
    ),

    achievements: achievements?.length > 0 && (
      <ul className="grid grid-cols-1 gap-x-10 gap-y-2.5 font-sans text-[15px] leading-relaxed sm:grid-cols-2" style={{ color: INK_SOFT }}>
        {achievements.map((item, i) => (
          <li key={i} className="flex min-w-0 gap-3">
            <span
              aria-hidden
              className="mt-[0.7em] h-px w-3.5 shrink-0"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    ),

    skills: skills?.length > 0 && (
      <ChipRow items={skills} getKey={(s) => s} getLabel={(s) => s} getColor={dotColor} textColor={INK} />
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <ChipRow
        items={codingProfiles}
        getKey={(p, i) => p.platform + i}
        getLabel={(p) => p.platform}
        getColor={(p) => dotColor(p.platform)}
        href={(p) => `https://${stripProtocol(p.url)}`}
        textColor={INK}
      />
    ),

    // Magazine "spread": the first project reads as the cover story at full
    // width, the rest fall into a two-up grid of briefs, rather than every
    // project getting identical visual weight regardless of order.
    projects: projects?.length > 0 && (
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
        {projects.map((project, i) => {
          const projectAccent = PALETTE[i % PALETTE.length];
          return (
            <article key={i} className={`min-w-0 ${i === 0 ? "sm:col-span-2" : ""}`}>
              {/* A single-hue panel: one ink fading into its own shadow, the
                  way a printed page carries a spot colour. The kicker sits at
                  the dark end so it stays legible whatever accent the palette
                  supplies, and it names the slot the project holds in the
                  running order, the only claim the layout itself can make
                  about it. */}
              <div
                className={`flex w-full items-end justify-between gap-4 rounded-sm p-5 ${i === 0 ? "aspect-[21/9]" : "aspect-[16/9]"}`}
                style={{ background: `linear-gradient(135deg, ${projectAccent}, ${shade(projectAccent, 60)})` }}
              >
                <span
                  className={`${fraunces.className} font-bold italic leading-none text-white/45 ${i === 0 ? "text-7xl" : "text-5xl"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85">
                  {i === 0 ? "Cover story" : "Brief"}
                </span>
              </div>

              <h3
                className={`${fraunces.className} mt-6 break-words font-semibold ${i === 0 ? "text-3xl" : "text-2xl"}`}
                style={{ color: INK }}
              >
                {project.name || "Project name"}
              </h3>

              <p
                className={`mt-3 whitespace-pre-line break-words font-sans leading-relaxed ${i === 0 ? "max-w-2xl text-[17px]" : "text-[16px]"}`}
                style={{ color: INK_SOFT }}
              >
                {project.description}
              </p>

              {project.highlights?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {project.highlights.map((point, j) => (
                    <p key={j} className={`${fraunces.className} break-words text-[15px] italic`} style={{ color: MUTED }}>
                      {point}
                    </p>
                  ))}
                </div>
              )}

              {project.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="break-words rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: tint(dotColor(tag)), color: dotColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(project.link || project.demo) && (
                <p className="mt-3 font-sans text-sm">
                  {project.link && (
                    <a href={`https://${stripProtocol(project.link)}`} className="underline underline-offset-4" style={{ color: projectAccent }}>
                      Source
                    </a>
                  )}
                  {project.link && project.demo && <span className="mx-2" style={{ color: MUTED }}>·</span>}
                  {project.demo && (
                    <a href={`https://${stripProtocol(project.demo)}`} className="underline underline-offset-4" style={{ color: projectAccent }}>
                      Live
                    </a>
                  )}
                </p>
              )}
            </article>
          );
        })}
      </div>
    ),
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sections[id]);
  const pullQuoteText = pickPullQuote({ achievements, projects, experience });
  const headlines = pickHeadlines({ role, projects, skills });

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: PAPER, color: INK }}>
      <PaperGrain />
      <CursorGlow colorRgb={hexToRgb(POP)} size={550} />
      <Folio side="left" label="The Portfolio Edition" />
      <Folio side="right" label="Printed With Care" />
      <InkBlots palette={PALETTE} />

      <WireTicker items={headlines} accent={POP} />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:py-16">
        {/* Masthead strip */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-4 pb-3" style={{ borderColor: POP }}>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: POP }}>
            The Portfolio Edition
          </span>
          <span
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] uppercase tracking-[0.3em]"
            style={{ color: MUTED }}
          >
            Issue No. 01 · {issueDate}
            <ReadingTimer accent={POP} />
          </span>
        </div>

        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-x-14">
          {/* Sidebar: the masthead's "contributor" column of identity, bio,
              contact and the chip-based sections, pinned in place on desktop
              so the wide canvas reads as a deliberate two-column magazine
              spread instead of one narrow column adrift in empty space. */}
          <aside className="relative mt-10 min-w-0 lg:sticky lg:top-10 lg:mt-14 lg:border-r lg:pr-10" style={{ borderColor: `${ACCENT}18` }}>
            <h1
              className={`${fraunces.className} editorial-highlight break-words text-4xl font-semibold tracking-tight sm:text-5xl`}
              style={{
                color: INK,
                backgroundImage: `linear-gradient(${POP}4d, ${POP}4d)`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0 90%",
                backgroundSize: "0% 0.35em",
              }}
            >
              {name || "Your Name"}
            </h1>
            <p
              className={`${fraunces.className} mt-2 break-words text-lg italic`}
              style={{
                backgroundImage: `linear-gradient(90deg, ${POP}, ${PALETTE[1]})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {role || "Your Role"}
            </p>
            <p
              className="first-letter:float-left first-letter:mr-1 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] mt-6 max-w-md break-words font-sans text-[15.5px] leading-relaxed"
              style={{ color: INK_SOFT }}
            >
              {bio}
            </p>

            {contactItems.length > 0 && (
              <div className="mt-7 space-y-2.5 border-t pt-5 font-sans text-[13.5px]" style={{ borderColor: `${ACCENT}18` }}>
                {contactItems.map(({ label, href, Icon }) => (
                  <a key={href} href={href} className="flex min-w-0 items-center gap-2 transition-colors" style={{ color: MUTED }}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="break-words underline decoration-transparent underline-offset-4 hover:decoration-current">
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            )}

            {skills?.length > 0 && (
              <div className="mt-7 border-t pt-5" style={{ borderColor: `${ACCENT}18` }}>
                <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                  Skills
                </p>
                {sections.skills}
              </div>
            )}

            {codingProfiles?.length > 0 && (
              <div className="mt-7 border-t pt-5" style={{ borderColor: `${ACCENT}18` }}>
                <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                  Coding Profiles
                </p>
                {sections.codingProfiles}
              </div>
            )}
          </aside>

          {/* Main column */}
          <main className="mt-12 min-w-0 lg:mt-14">
            {/* Table of contents, a real magazine's "in this issue" strip,
                and functional here too: each entry anchors to its section. */}
            {visibleIds.length > 0 && (
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b pb-6 font-sans text-[12.5px]" style={{ borderColor: `${ACCENT}18` }}>
                <span className="font-semibold uppercase tracking-[0.2em]" style={{ color: INK }}>
                  In this issue
                </span>
                {visibleIds
                  .filter((id) => id !== "skills" && id !== "codingProfiles")
                  .map((id, i) => (
                    <a
                      key={id}
                      href={`#section-${id}`}
                      className="editorial-toc-link flex items-center gap-1.5"
                      style={{ color: MUTED }}
                    >
                      <span style={{ color: PALETTE[i % PALETTE.length] }}>{String(i + 1).padStart(2, "0")}</span>
                      {SECTION_LABELS[id]}
                    </a>
                  ))}
              </nav>
            )}

            <PullQuote text={pullQuoteText} accent={POP} colors={colors} fraunces={fraunces} />

            <div className="mt-12 space-y-14">
              {visibleIds
                .filter((id) => id !== "skills" && id !== "codingProfiles")
                .map((id, i) => (
                  <Fragment key={id}>
                    {i > 0 && <SectionOrnament accent={PALETTE[i % PALETTE.length]} />}
                    <section>
                      <SectionTitle
                        id={`section-${id}`}
                        colors={colors}
                        accent={PALETTE[i % PALETTE.length]}
                        number={String(i + 1).padStart(2, "0")}
                      >
                        {SECTION_LABELS[id]}
                      </SectionTitle>
                      <div className="mt-9">{sections[id]}</div>
                    </section>
                  </Fragment>
                ))}
            </div>

            {/* Closing */}
            <section className="mt-20 border-t-4 pt-12" style={{ borderColor: POP }}>
              <p className={`${fraunces.className} break-words text-3xl font-semibold italic`} style={{ color: INK }}>
                Get in touch.
              </p>
              {ctaLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {ctaLinks.map(({ label, href, Icon }, i) => (
                    <a
                      key={href}
                      href={href}
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-75"
                      style={{
                        color: POP,
                        borderColor: tint(POP, 45),
                        backgroundColor: i === 0 ? tint(POP, 14) : "transparent",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </section>

            <footer className="mt-16 border-t pt-6" style={{ borderColor: `${ACCENT}15` }}>
              <p className="break-words font-sans text-[11px] uppercase tracking-[0.15em]" style={{ color: `${MUTED}cc` }}>
                Editor-in-Chief: {name || "Your Name"}
                {role && <> · Contributing Writer: {role}</>}
              </p>
              <p className="mt-3 break-words font-sans text-xs" style={{ color: MUTED }}>
                © {new Date().getFullYear()} {name || "Your Name"}
              </p>
              <p className="mt-1 font-sans text-[10px]" style={{ color: `${MUTED}99` }}>
                Made with Dev Portfolio Builder
              </p>
              <p className="editorial-breathe mt-2 font-sans text-[10px] italic" style={{ color: `${MUTED}99` }}>
                Set in Fraunces · printed fresh for every visit
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
