// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Deliberately no invented HUD numbers — no XP bar, no "builder score", no
// level counter. Those read as clutter, not signal: a recruiter doesn't
// care that a formula turned 5 skills into "750 XP". The game framing here
// comes from a two-pane character-sheet layout (portrait + stats on the
// left, quest/mission log on the right, like an RPG inventory screen) and
// bracket-cornered HUD panels — not numbers.

import { Fragment } from "react";
import { Press_Start_2P, Chakra_Petch, Inter } from "next/font/google";
import { LEVEL_UP_PALETTES, getPalette } from "@/lib/palettes";
import { IconGithub, IconLinkedin, IconLink, IconMail, stripProtocol, initials, tint, shade, hexToRgb } from "./shared";
import CursorGlow from "./CursorGlow";

// Press Start 2P is used only for short eyebrow labels/badges, at sizes
// where a pixel font is legible (it wasn't, at body/heading size, in this
// template's old version). Chakra Petch — a squarer, still-technical face —
// carries names and headings; Inter carries body copy so bios, bullets and
// descriptions stay easy to actually read.
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400" });
const chakra = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

function IconTrophy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.2M17 5h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.2" />
    </svg>
  );
}

function IconBolt(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function IconBook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

function IconFlag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
    </svg>
  );
}

function IconCompass(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

// Small L-shaped marks at each corner — the classic sci-fi/game HUD
// "targeting frame" cue that reads as a game panel rather than a generic
// rounded card.
function CornerBrackets({ color }) {
  const base = "absolute h-3 w-3";
  return (
    <>
      <span className={`${base} -left-1 -top-1 border-l-2 border-t-2`} style={{ borderColor: color }} />
      <span className={`${base} -right-1 -top-1 border-r-2 border-t-2`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-1 -left-1 border-b-2 border-l-2`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-1 -right-1 border-b-2 border-r-2`} style={{ borderColor: color }} />
    </>
  );
}

// Every panel shares this shell — bracket corners, one accent-colored top
// edge, one pixel-label style. Reusing it everywhere (instead of each
// section inventing its own border/glow combo, like the old version did) is
// what keeps the page from reading as visually noisy.
function Panel({ id, label, icon: Icon, colors, children }) {
  const { INK, ACCENT } = colors;
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: tint(ACCENT, 18), color: ACCENT }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <h2 className={`${pressStart.className} text-[10px] leading-none uppercase tracking-[0.15em]`} style={{ color: ACCENT }}>
          {label}
        </h2>
      </div>
      <div className="relative">
        <CornerBrackets color={ACCENT} />
        <div className="overflow-hidden rounded-md border-2" style={{ borderColor: tint(ACCENT, 32), backgroundColor: tint(INK, 3) }}>
          <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
          <div className="p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Timeline({ items, colors }) {
  const { INK, INK_SOFT, MUTED, ACCENT } = colors;
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i} className="relative border-l-2 pl-5" style={{ borderColor: tint(ACCENT, 30) }}>
          <span
            className="absolute -left-[7px] top-1 h-3 w-3 rounded-full"
            style={{ backgroundColor: ACCENT, boxShadow: `0 0 8px ${tint(ACCENT, 60)}` }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="min-w-0 break-words text-sm font-semibold" style={{ color: INK }}>
              {item.title}
            </p>
            <span className={`${chakra.className} shrink-0 whitespace-nowrap text-xs`} style={{ color: MUTED }}>
              {item.start} – {item.end}
            </span>
          </div>
          {item.subtitle && (
            <p className="mt-0.5 min-w-0 break-words text-sm" style={{ color: MUTED }}>
              {item.subtitle}
            </p>
          )}
          {item.lines?.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {item.lines.map((line, j) => (
                <li key={j} className="flex gap-2 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                  <span className="shrink-0" style={{ color: ACCENT }}>
                    ▸
                  </span>
                  <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LevelUpTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const palette = getPalette("level-up", data.paletteId) || LEVEL_UP_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, PALETTE } = colors;
  // Two accents to cycle per-card (project/skill chips) so each entry reads
  // distinctly without introducing a third unrelated hue into the page.
  const accentCycle = [ACCENT, PALETTE[3] || ACCENT];

  // The customer's drag-and-drop order picks which of these render, and in
  // what sequence — all six live in the main pane so reordering them always
  // has a visible effect (nothing here is silently pinned to the sidebar).
  const sections = {
    experience: experience?.length > 0 && (
      <Panel id="section-experience" label="Mission Log" icon={IconFlag} colors={colors}>
        <Timeline
          colors={colors}
          items={experience.map((job) => ({
            title: job.role,
            subtitle: job.company,
            start: job.start,
            end: job.end,
            lines: job.bullets,
          }))}
        />
      </Panel>
    ),

    education: education?.length > 0 && (
      <Panel id="section-education" label="Origin Story" icon={IconBook} colors={colors}>
        <Timeline
          colors={colors}
          items={education.map((edu) => ({
            title: edu.degree,
            subtitle: edu.school,
            start: edu.start,
            end: edu.end,
          }))}
        />
      </Panel>
    ),

    projects: projects?.length > 0 && (
      <Panel id="section-projects" label="Quest Log" icon={IconCompass} colors={colors}>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => {
            const accent = accentCycle[i % accentCycle.length];
            return (
              <div
                key={i}
                className="min-w-0 rounded-md border-2 p-4"
                style={{ borderColor: tint(accent, 30), backgroundColor: tint(accent, 6) }}
              >
                <p className="break-words text-sm font-semibold" style={{ color: INK }}>
                  {project.name || "Untitled project"}
                </p>
                <p className="mt-1.5 min-w-0 whitespace-pre-line break-words text-sm leading-snug" style={{ color: INK_SOFT }}>
                  {project.description}
                </p>
                {project.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="break-words rounded px-2 py-0.5 text-[11px]"
                        style={{ backgroundColor: tint(accent, 16), color: accent }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs" style={{ borderColor: tint(accent, 18) }}>
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} className="font-semibold" style={{ color: accent }}>
                        Source
                      </a>
                    )}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} className="font-semibold" style={{ color: accent }}>
                        Live demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    ),

    skills: skills?.length > 0 && (
      <Panel id="section-skills" label="Loadout" icon={IconBolt} colors={colors}>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex min-w-0 items-center gap-1.5 rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: tint(ACCENT, 20), backgroundColor: tint(ACCENT, 8), color: INK_SOFT }}
            >
              <IconBolt className="h-3 w-3 shrink-0" style={{ color: ACCENT }} />
              <span className="break-words">{skill}</span>
            </span>
          ))}
        </div>
      </Panel>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <Panel id="section-codingProfiles" label="Guild Links" icon={IconLink} colors={colors}>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="flex min-w-0 items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors"
              style={{ borderColor: tint(ACCENT, 20), backgroundColor: tint(ACCENT, 8), color: INK_SOFT }}
            >
              <IconLink className="h-3 w-3 shrink-0" style={{ color: ACCENT }} />
              <span className="break-words">{profile.platform}</span>
            </a>
          ))}
        </div>
      </Panel>
    ),

    achievements: achievements?.length > 0 && (
      <Panel id="section-achievements" label="Achievements Unlocked" icon={IconTrophy} colors={colors}>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((text, i) => (
            <div
              key={i}
              className="flex min-w-0 items-start gap-3 rounded-md border-2 p-3.5"
              style={{ borderColor: tint(ACCENT, 20), backgroundColor: tint(ACCENT, 6) }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: tint(ACCENT, 20), color: ACCENT }}
              >
                <IconTrophy className="h-3.5 w-3.5" />
              </span>
              <p className="min-w-0 break-words text-sm leading-snug" style={{ color: INK_SOFT }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    ),
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sections[id]);

  const contactLinks = [
    links?.github && { label: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  return (
    <div className={`relative min-h-dvh ${inter.className}`} style={{ backgroundColor: PAPER, color: INK }}>
      <CursorGlow colorRgb={hexToRgb(ACCENT)} size={450} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(${tint(INK, 6)} 0px, ${tint(INK, 6)} 1px, transparent 1px, transparent 3px)`,
          opacity: 0.4,
        }}
      />

      {/* Two-pane character sheet: portrait + fixed stats on the left,
          quest/mission log on the right — a proper desktop layout instead
          of one narrow centered column stretched down the page. Collapses
          to a single stacked column below lg. */}
      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[300px_1fr] lg:gap-10">
        {/* Character panel */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="relative">
            <CornerBrackets color={ACCENT} />
            <div className="overflow-hidden rounded-md border-2" style={{ borderColor: tint(ACCENT, 32), backgroundColor: tint(INK, 3) }}>
              <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
              <div className="flex flex-col items-center p-6 text-center">
                <div
                  className={`${chakra.className} flex h-20 w-20 items-center justify-center rounded-md text-2xl font-bold`}
                  style={{
                    backgroundColor: tint(ACCENT, 14),
                    color: ACCENT,
                    border: `1.5px solid ${tint(ACCENT, 40)}`,
                    boxShadow: `0 0 24px ${tint(ACCENT, 30)}`,
                  }}
                >
                  {initials(name)}
                </div>
                <h1 className={`${chakra.className} mt-4 break-words text-xl font-bold`} style={{ color: INK }}>
                  {name || "Your Name"}
                </h1>
                <span
                  className={`${pressStart.className} mt-2 rounded px-2 py-1 text-[9px] leading-none uppercase tracking-wider`}
                  style={{ backgroundColor: tint(ACCENT, 16), color: ACCENT }}
                >
                  Class
                </span>
                <p className="mt-2 break-words text-sm" style={{ color: MUTED }}>
                  {role || "Your Role"}
                </p>

                {bio && (
                  <p className="mt-4 whitespace-pre-line break-words text-left text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                    {bio}
                  </p>
                )}
              </div>

              {(email || contactLinks.length > 0) && (
                <div className="border-t-2 p-5" style={{ borderColor: tint(ACCENT, 20) }}>
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex w-full items-center justify-center gap-2 rounded-md border-2 px-4 py-2.5 text-sm font-semibold transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      style={{
                        backgroundColor: ACCENT,
                        color: PAPER,
                        borderColor: shade(ACCENT, 25),
                        boxShadow: `3px 3px 0 ${shade(ACCENT, 45)}`,
                      }}
                    >
                      <IconMail className="h-4 w-4" />
                      Recruit Me
                    </a>
                  )}
                  {contactLinks.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-4">
                      {contactLinks.map(({ label, href, Icon }) => (
                        <a key={href} href={href} title={label} className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Quest/mission log, in the customer's chosen order */}
        <main className="min-w-0 space-y-8 sm:space-y-10">
          {visibleIds.map((id) => (
            <Fragment key={id}>{sections[id]}</Fragment>
          ))}

          <footer className="text-center text-xs sm:text-left" style={{ color: MUTED }}>
            © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
          </footer>
        </main>
      </div>
    </div>
  );
}
