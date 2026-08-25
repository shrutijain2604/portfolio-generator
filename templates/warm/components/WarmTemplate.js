// Pure presentational component: renders portfolio `data` only, no state of
// its own.
//
// One room, one sun. The page is a warm interior lit from a single window and
// everything on it is an object sitting in that light rather than a card on a
// background. Two rules follow:
//
//   - One light means one shadow direction, held in --warm-sh-x / --warm-sh-y
//     (app/globals.css). Nothing hardcodes an offset, because a room where two
//     objects disagree about where the sun is stops reading as a room.
//   - The light has an hour, held in data-light on the root. HourDial sets it
//     from the visitor's clock and then their choice, and the stylesheet
//     re-aims sun, shadows, sky and spill off that one attribute.
//
// Motion is therefore about light: content rises into it on a view() timeline,
// and picking a thing up shortens its shadow.
/* eslint-disable @next/next/no-img-element */

import { Fraunces, Instrument_Sans } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { WARM_PALETTES, getPalette } from "@/lib/palettes";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  initials,
  stripProtocol,
  dotColor,
  tint,
  shade,
  computeYearsOfExperience,
} from "./shared";
import HourDial from "./HourDial";

// Fraunces carries the warmth, and it does it structurally rather than by
// being cute: SOFT rounds the terminals and WONK swaps in the wonky
// alternates, so the display type is literally softer at the hero and settles
// down for headings. Instrument Sans stays quiet underneath, because a page
// that is friendly in both its display and its body copy reads as childish
// instead of personal.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
const sans = Instrument_Sans({ subsets: ["latin"] });

const SECTION_DEFS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s]));

// Spoken, first-person headings, since the whole premise is that a person is
// showing you their room. Kept short enough to sit on one line beside the
// section rule at every width.
const SECTION_LABELS = {
  skills: "Tools I reach for",
  codingProfiles: "Where I practice",
  experience: "Where I've worked",
  education: "Where I studied",
  achievements: "A few good moments",
  projects: "Things I've made",
};

// Reads as a sentence rather than a date range, which is the difference
// between a resume row and someone telling you about a job. Either end can be
// missing, so this never assembles half a range around a stray separator.
function span(start, end) {
  const from = (start || "").trim();
  const to = (end || "").trim();
  if (from && to) return `${from} to ${to}`;
  return from || to || "";
}

// Accent colors in these palettes were picked to be seen, not read: several
// of them sit under 4.5:1 as text on cream. Mixing an accent 45% into the
// palette's own ink keeps the hue clearly present while pinning its luminance
// near INK's, so a colored name or link stays colored and stays legible on
// every one of the seven palettes (worst case across all of them: 4.99:1).
// Raw accents are still used everywhere they are not text: station rings,
// bullets, monogram plates, the rail.
function inked(color) {
  return `color-mix(in srgb, ${color} 45%, var(--warm-ink))`;
}

// WCAG's own relative-luminance formula, used for exactly one decision: which
// of two letter colors a monogram plate needs. Palette accents run across a
// 4x luminance range and the dark palette swaps PAPER and INK, so no single
// fixed letter clears 3:1 on all of them, and no CSS expression can branch on
// how light a color is. Only ever called with a PALETTE hex.
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

// Ink and paper as absolutes rather than palette roles, because that is what
// they are here: a letter printed on colored stock. Verified at 3.4:1 or
// better against every plate either branch can produce.
function monogramInk(accent) {
  return relativeLuminance(accent) > 0.25 ? "#2a1d12" : "#fdf8f0";
}

function SectionHead({ id, index, label, color }) {
  return (
    <div id={id} className="mb-7 flex scroll-mt-10 items-center gap-3.5 sm:gap-4">
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }} />
      <h2 className={`${fraunces.className} warm-head min-w-0 break-words text-[clamp(1.4rem,3.2vw,2rem)] font-medium leading-tight`}>
        {label}
      </h2>
      <span aria-hidden className="warm-rule h-px min-w-4 flex-1" />
      <span className="shrink-0 text-[11px] font-semibold tabular-nums tracking-[0.08em]" style={{ color: "var(--warm-muted)" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

// A small object resting on a surface. Rendered as a link when it points
// somewhere, a plain token when it is just a label, but the same object
// either way so the shelf reads as one set of things.
function Token({ label, color, href, icon, style }) {
  const inner = (
    <>
      {icon ? (
        <span aria-hidden style={{ color }}>
          {icon}
        </span>
      ) : (
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span className="min-w-0 break-words">{label}</span>
    </>
  );

  // A token that goes somewhere has to be a comfortable target on a phone;
  // one that is only a label should not be 44px tall for no reason, or a long
  // skill list turns into a wall of oversized pills.
  const className = `warm-token inline-flex min-w-0 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium ${
    href ? "min-h-11" : "py-2"
  }`;

  return href ? (
    <a href={href} className={`${className} cursor-pointer`} style={style}>
      {inner}
    </a>
  ) : (
    <span className={className} style={style}>
      {inner}
    </span>
  );
}

// The window, and the photograph standing on its sill. This is the one place
// the light is visible rather than inferred, so it is worth its markup: sky,
// haze, sun and halo behind a single sheet of glass, a sill with a lit top
// face, and a frame throwing a shadow along it.
//
// The frame is a sibling of the casing rather than a child because the casing
// clips its own glazing, and a photo on a windowsill has to break that edge
// to read as standing in front of the glass instead of taped behind it.
function Window({ photoUrl, name, colors }) {
  const { PAPER, INK, MUTED } = colors;

  return (
    <figure className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="warm-window relative overflow-clip rounded-[7px] p-3 sm:p-4">
        <div className="warm-sky relative aspect-[16/11] w-full overflow-clip rounded-[3px] sm:aspect-[5/4]">
          <span aria-hidden className="warm-halo pointer-events-none absolute rounded-full" />
          <span aria-hidden className="warm-sun pointer-events-none absolute rounded-full" />
          <span aria-hidden className="warm-haze pointer-events-none absolute inset-0" />
          {/* Glazing bars, then one sheet of glass over all four panes so the
              reflection crosses the bars instead of restarting in each pane. */}
          <span aria-hidden className="warm-mullion absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2" />
          <span aria-hidden className="warm-mullion absolute inset-x-0 top-[46%] h-[3px]" />
          <span aria-hidden className="warm-glass pointer-events-none absolute inset-0" />
        </div>
      </div>
      <div aria-hidden className="warm-sill relative -mx-3 h-4 rounded-b-[4px] sm:-mx-4" />

      <div className="absolute bottom-4 left-5 w-24 sm:left-7 sm:w-28">
        <span
          aria-hidden
          className="warm-stand-shadow absolute -bottom-1.5 left-1/2 h-3 w-[145%] -translate-x-1/2 rounded-[50%] blur-[3px]"
        />
        <div className="warm-stand relative rounded-[5px] p-[5px]" style={{ backgroundColor: `color-mix(in srgb, ${PAPER} 88%, white)` }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name ? `${name}, in their own photo` : "Portrait"}
              className="aspect-[4/5] w-full rounded-[2px] object-cover"
            />
          ) : (
            <div
              className={`${fraunces.className} warm-head flex aspect-[4/5] w-full items-center justify-center rounded-[2px] text-2xl font-semibold`}
              style={{
                backgroundColor: `color-mix(in srgb, ${INK} 8%, ${PAPER})`,
                color: MUTED,
              }}
            >
              {initials(name)}
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}

export default function WarmTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } =
    data;

  const palette = getPalette("warm", data.paletteId) || WARM_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE, SKY_HI, SKY_LO, SUN } = colors;

  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, icon: <IconMail className="h-4 w-4" /> },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, icon: <IconGithub className="h-4 w-4" /> },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, icon: <IconLinkedin className="h-4 w-4" /> },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, icon: <IconLink className="h-4 w-4" /> },
  ].filter(Boolean);

  // Both numbers come straight out of what was entered (parsed years, counted
  // rows), so this line stays true for a two-job history and disappears
  // entirely when no year was given rather than guessing at one.
  const workYears = computeYearsOfExperience(experience);
  const workPlaces = experience?.length || 0;
  const workNote =
    workYears > 0
      ? `${workYears} ${workYears === 1 ? "year" : "years"} so far, across ${workPlaces} ${workPlaces === 1 ? "place" : "places"}.`
      : null;

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js). The
  // customer's drag-and-drop order in the editor picks which of these render,
  // and in what sequence.
  const sections = {
    skills: skills?.length > 0 && (
      <div className="warm-ledge rounded-2xl px-3.5 py-3.5 sm:px-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Token key={skill} label={skill} color={dotColor(skill)} />
          ))}
        </div>
      </div>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {codingProfiles.map((profile, i) => (
          <Token
            key={profile.platform + i}
            label={profile.platform}
            color={inked(ACCENT)}
            icon={<IconLink className="h-3.5 w-3.5" />}
            href={`https://${stripProtocol(profile.url)}`}
          />
        ))}
      </div>
    ),

    // The rail: one segment per role rather than one line down the whole
    // list, because a view() range on an element taller than the scrollport
    // never completes. Segments meet at the padding, so what the reader sees
    // is a single line lighting up ahead of them as they go.
    experience: experience?.length > 0 && (
      <div>
        {workNote && (
          <p className={`${fraunces.className} warm-voice mb-6 text-[15px] italic`} style={{ color: MUTED }}>
            {workNote}
          </p>
        )}
        <ol>
          {experience.map((job, i) => {
            const accent = PALETTE[i % PALETTE.length];
            const range = span(job.start, job.end);
            return (
              <li key={i} className="warm-role relative pb-7 pl-9 last:pb-0 sm:pl-14">
                <span aria-hidden className="warm-rail absolute bottom-0 left-1.5 top-1 w-0.5 sm:left-[11px]">
                  <span className="warm-rail-fill absolute inset-0" />
                </span>
                <span
                  aria-hidden
                  className="warm-station absolute left-0 top-1 h-3.5 w-3.5 rounded-full sm:left-[5px]"
                  style={{ color: accent }}
                />
                <div className="warm-surface warm-lift rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className={`${fraunces.className} warm-head min-w-0 break-words text-[17px] font-semibold`}>
                      {job.role || job.company}
                    </h3>
                    {range && (
                      <span
                        className="shrink-0 text-[11.5px] font-semibold uppercase tabular-nums tracking-[0.12em]"
                        style={{ color: MUTED }}
                      >
                        {range}
                      </span>
                    )}
                  </div>
                  {job.role && job.company && (
                    <p className="mt-1 break-words text-[14px] font-medium" style={{ color: inked(accent) }}>
                      {job.company}
                    </p>
                  )}
                  {job.bullets?.length > 0 && (
                    <ul className="mt-3.5 space-y-2">
                      {job.bullets.map((line, j) => (
                        <li key={j} className="flex min-w-0 gap-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                          <span aria-hidden className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                          <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    ),

    // Plaques rather than another rail: two vertical timelines in a row would
    // read as the same section twice.
    education: education?.length > 0 && (
      <div className="flex flex-wrap gap-4">
        {education.map((edu, i) => {
          const accent = PALETTE[(i + 1) % PALETTE.length];
          const range = span(edu.start, edu.end);
          return (
            <div key={i} className="warm-surface warm-lift min-w-0 grow basis-[min(100%,18rem)] rounded-2xl p-5">
              {range && (
                <p className="text-[11px] font-semibold uppercase tabular-nums tracking-[0.16em]" style={{ color: MUTED }}>
                  {range}
                </p>
              )}
              <h3 className={`${fraunces.className} warm-head mt-2 break-words text-[16.5px] font-semibold`}>{edu.degree || edu.school}</h3>
              {edu.degree && edu.school && (
                <p className="mt-1 break-words text-[14px] font-medium" style={{ color: inked(accent) }}>
                  {edu.school}
                </p>
              )}
            </div>
          );
        })}
      </div>
    ),

    achievements: achievements?.length > 0 && (
      <div className="warm-surface rounded-2xl p-1.5 sm:p-2">
        <ul>
          {achievements.map((item, i) => {
            const accent = PALETTE[i % PALETTE.length];
            return (
              <li
                key={i}
                className="flex min-w-0 gap-3.5 px-3.5 py-3.5 text-[14.5px] leading-relaxed"
                style={{
                  color: INK_SOFT,
                  borderTop: i > 0 ? `1px solid ${tint(INK, 8)}` : undefined,
                }}
              >
                <span
                  aria-hidden
                  className="mt-[0.4rem] h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                />
                <span className="min-w-0 whitespace-pre-line break-words">{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
    ),

    // Hung as framed prints, at deliberately uneven heights: a wall of
    // pictures is never a grid, and the offset is what stops two columns of
    // frames reading as a table of cards.
    projects: projects?.length > 0 && (
      <div className="flex flex-wrap gap-8 sm:gap-x-8 sm:gap-y-10">
        {projects.map((project, i) => {
          const accent = PALETTE[i % PALETTE.length];
          return (
            <article key={i} className={`warm-frame min-w-0 grow basis-[min(100%,22rem)] ${i % 2 === 1 ? "sm:mt-12" : ""}`}>
              <div className="warm-frame-inner rounded-[13px] p-2.5 sm:p-3">
                <div
                  className="warm-mat relative rounded-[7px] p-2.5 sm:p-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${PAPER} 97%, white)`,
                  }}
                >
                  {/* The print keeps its 16:10 proportion until that would make
                      it taller than a print on a wall reasonably gets. A frame
                      that grows to fill the row (a lone project takes the whole
                      wall) then becomes panoramic rather than enormous, and two
                      frames side by side land at the same height either way. */}
                  <div className="warm-print relative aspect-[16/10] max-h-[19rem] w-full overflow-clip rounded-[3px]">
                    {project.image ? (
                      <img src={project.image} alt={project.name || "Project"} className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className={`${fraunces.className} warm-monogram flex h-full w-full items-center justify-center text-5xl font-semibold`}
                        style={{
                          "--warm-mono-a": accent,
                          "--warm-mono-b": shade(accent, 22),
                          color: monogramInk(accent),
                        }}
                      >
                        {(project.name || "?").trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="px-0.5 pt-3.5">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <h3 className={`${fraunces.className} warm-head min-w-0 break-words text-[17px] font-semibold`}>
                        {project.name || "Untitled"}
                      </h3>
                      {project.version && (
                        <span className="shrink-0 text-[11.5px] font-medium tabular-nums" style={{ color: MUTED }}>
                          {project.version}
                        </span>
                      )}
                      {project.status && (
                        <span
                          className="shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            backgroundColor: tint(accent, 12),
                            color: inked(accent),
                          }}
                        >
                          {project.status}
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="mt-2 min-w-0 whitespace-pre-line break-words text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                        {project.description}
                      </p>
                    )}

                    {project.highlights?.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {project.highlights.map((line, j) => (
                          <li key={j} className="flex min-w-0 gap-2.5 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                            <span
                              aria-hidden
                              className="mt-[0.5rem] h-[3px] w-[3px] shrink-0 rounded-full"
                              style={{ backgroundColor: accent }}
                            />
                            <span className="min-w-0 break-words">{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {project.tags?.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="break-words rounded-[3px] px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                            style={{
                              backgroundColor: tint(dotColor(tag), 22),
                              color: INK_SOFT,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.link || project.demo) && (
                      <p className="mt-4 flex flex-wrap gap-4 text-[13px] font-semibold">
                        {project.link && (
                          <a
                            href={`https://${stripProtocol(project.link)}`}
                            className="warm-link cursor-pointer"
                            style={{ color: inked(accent) }}
                          >
                            Source
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={`https://${stripProtocol(project.demo)}`}
                            className="warm-link cursor-pointer"
                            style={{ color: inked(accent) }}
                          >
                            Live
                          </a>
                        )}
                      </p>
                    )}
                  </div>

                  {/* The glass. Its own clipping wrapper, rather than clipping
                      the mat, because `overflow` other than visible flattens a
                      preserve-3d subtree and the print inside has to keep its
                      own z to come forward when the frame turns. */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-clip rounded-[7px]">
                    <span className="warm-sheen absolute inset-0" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    ),
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sections[id]);

  return (
    <div
      className={`warm-room warm-wall relative min-h-dvh overflow-clip ${sans.className}`}
      data-light="golden"
      style={{
        backgroundColor: PAPER,
        color: INK,
        "--warm-paper": PAPER,
        "--warm-ink": INK,
        "--warm-muted": MUTED,
        "--warm-pop": POP,
        "--warm-sun": SUN,
        "--warm-sky-hi": SKY_HI,
        "--warm-sky-lo": SKY_LO,
      }}
    >
      {/* `overflow-clip` rather than `overflow-hidden`, and the distinction
          matters: hidden makes this a scroll container, and every view()
          timeline below resolves against the nearest scroll container, so
          hidden would hand them a box that never scrolls and the reveals
          would never run. clip crops the decoration without creating one. */}
      <span aria-hidden className="warm-vignette pointer-events-none absolute inset-0" />

      {/* The window's light landing on the wall, with the dust it makes
          visible. Positioned to fall from where the window actually is. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[95vh] overflow-clip">
        <span className="warm-shaft absolute right-[4%] top-0 h-full w-[52%] origin-top sm:w-[42%]" />
        <span
          className="warm-mote absolute right-[16%] top-[58%] h-[3px] w-[3px] rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${SUN} 70%, white)`,
            "--warm-mote-dur": "21s",
            "--warm-mote-delay": "0s",
          }}
        />
        <span
          className="warm-mote absolute right-[30%] top-[70%] h-[4px] w-[4px] rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${SUN} 60%, white)`,
            "--warm-mote-dur": "27s",
            "--warm-mote-delay": "-6s",
          }}
        />
        <span
          className="warm-mote absolute right-[9%] top-[76%] h-[2px] w-[2px] rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${SUN} 80%, white)`,
            "--warm-mote-dur": "18s",
            "--warm-mote-delay": "-11s",
          }}
        />
        <span
          className="warm-mote absolute right-[23%] top-[86%] h-[3px] w-[3px] rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${SUN} 65%, white)`,
            "--warm-mote-dur": "24s",
            "--warm-mote-delay": "-17s",
          }}
        />
      </span>

      <main className="relative mx-auto max-w-6xl px-6 pb-14 pt-14 sm:px-10 sm:pt-20 lg:px-12">
        <header className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
          <div className="order-2 min-w-0 lg:order-1">
            <p className={`${fraunces.className} warm-voice text-[17px] italic`} style={{ color: MUTED }}>
              Hi, I&rsquo;m
            </p>
            <h1
              className={`${fraunces.className} warm-display mt-1 break-words text-[clamp(2.6rem,8vw,4.4rem)] font-semibold leading-[0.94] tracking-[-0.02em]`}
            >
              {name || "Your Name"}
            </h1>
            <p className="mt-4 flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: INK_SOFT }}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: POP, boxShadow: `0 0 10px ${POP}` }} />
              {role || "Your Role"}
            </p>
            {bio && (
              <p className="mt-5 max-w-[46ch] break-words text-[16.5px] leading-8" style={{ color: INK_SOFT }}>
                {bio}
              </p>
            )}
            {contactItems.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {contactItems.map((item, i) => (
                  <Token
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    color={i === 0 ? inked(POP) : inked(ACCENT)}
                    // The first contact is the one being offered, so it is
                    // tinted rather than filled: a tint keeps the vetted
                    // ink-on-paper contrast that a solid accent behind small
                    // label text would lose.
                    style={i === 0 ? { background: tint(POP, 18) } : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <Window photoUrl={photoUrl} name={name} colors={colors} />
            <div className="mt-5">
              <HourDial colors={colors} />
            </div>
          </div>
        </header>

        {/* Sections in the customer's chosen order, each rising into the light
            as it is scrolled to (see .warm-reveal). Rendered conditionally
            rather than as an empty wrapper: someone who has entered nothing
            but a name should get a hero and a closing note sitting a normal
            distance apart, not two of them separated by the empty column this
            would otherwise still reserve. */}
        {visibleIds.length > 0 && (
          <div className="mt-20 space-y-16 sm:mt-24">
            {visibleIds.map((id, i) => (
              <section key={id} className="warm-reveal">
                <SectionHead
                  id={`section-${id}`}
                  index={i}
                  label={SECTION_LABELS[id] || SECTION_DEFS[id]?.label}
                  color={PALETTE[i % PALETTE.length]}
                />
                {sections[id]}
              </section>
            ))}
          </div>
        )}

        {/* The end of the day: the one panel that inverts, so the page finishes
            on the brightest thing in a darkening room. Ground and text are the
            palette's own vetted ink/paper pair, which is what keeps this
            readable on the light palettes and on the dark one. */}
        <section className="warm-lamp-panel warm-reveal relative mt-20 overflow-clip rounded-[1.75rem] px-7 py-14 text-center sm:mt-24 sm:px-12">
          <span aria-hidden className="warm-lamp-glow pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-lg">
            <p
              className={`${fraunces.className} warm-voice text-[15px] italic`}
              style={{ color: `color-mix(in srgb, ${PAPER} 72%, ${INK})` }}
            >
              Still here?
            </p>
            <p
              className={`${fraunces.className} warm-head mt-2 text-[clamp(1.7rem,4.4vw,2.5rem)] font-medium leading-tight`}
              style={{ color: PAPER }}
            >
              The light&rsquo;s on.
            </p>
            <p className="mt-3.5 text-[15px] leading-7" style={{ color: `color-mix(in srgb, ${PAPER} 80%, ${INK})` }}>
              There&rsquo;s room for one more conversation, about a role, a project, or nothing in particular.
            </p>
            {email && (
              <a
                href={`mailto:${email}`}
                className="mt-7 inline-flex min-h-11 cursor-pointer items-center rounded-full px-6 text-[13.5px] font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: PAPER, color: INK }}
              >
                Write to me
              </a>
            )}
            {contactItems.length > 1 && (
              <p className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium">
                {contactItems
                  .filter((item) => !item.href.startsWith("mailto:"))
                  .map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="warm-link cursor-pointer"
                      style={{
                        color: `color-mix(in srgb, ${PAPER} 78%, ${INK})`,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
              </p>
            )}
          </div>
        </section>

        <footer className="mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11.5px]" style={{ color: MUTED }}>
          <p>
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="opacity-80">Made with Dev Portfolio Builder</p>
        </footer>
      </main>
    </div>
  );
}
