// Pure presentational component: renders portfolio `data` only, no state of
// its own.
//
// One bound, tabbed notebook lying on a desk. Every section is a punched sheet
// carrying a different real paper object rather than a recolored copy of one
// card: index cards on a stitched rail for experience, prints in photo corners
// for projects, a die-cut sticker sheet for skills, perforated stubs for
// achievements, a library checkout card for education, punched hang tags for
// coding profiles. That per-section artifact is what makes the page readable
// at a glance and keeps it reading as a book rather than a pile.
//
// Navigation is part of the concept: staggered divider tabs, a sticky index
// rail tracking the sheet in view (ScrapbookTabs), and a real contents page.
/* eslint-disable @next/next/no-img-element */

import { Bodoni_Moda, Newsreader, Courier_Prime, Caveat } from "next/font/google";
import { SCRAPBOOK_PALETTES, getPalette } from "@/lib/palettes";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, initials, stripProtocol, computeYearsOfExperience, tint, shade, hexToRgb } from "./shared";
import CursorGlow from "./CursorGlow";
import RevealOnScroll from "./RevealOnScroll";
import ScrapbookTabs from "./ScrapbookTabs";

// Bodoni Moda is a true didone: it only works large, so it is confined to
// the cover name and the sheet headings, where its contrast reads as a
// pressed title plate. Newsreader carries every paragraph the visitor
// actually reads. Courier Prime is the typewriter voice of the whole
// binder: labels, dates, page numbers, stamps, captions, tags. Caveat is
// the one handwritten accent and appears in exactly three places, so it
// stays a margin annotation instead of becoming the template's voice.
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["500", "700", "900"], style: ["normal", "italic"] });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["600"] });

// Real paper stays paper whatever the theme is: a photo print's border and
// a stuck-on address label are white in every palette, the same way they
// would be in a physical album, so these two are deliberately not palette
// colors. Everything else on the page derives from the palette.
const LABEL_PAPER = "#fbf7ee";
const LABEL_INK = "#2a2118";

// An opaque mix of `color` into `base`, for the sheet's own surfaces. tint()
// mixes toward transparent, which is right for a wash laid over something
// but wrong for a card that then needs its own opaque cutouts punched out
// of it (a ticket's perforation notches, a binding hole). Those have to be
// painted in the color of whatever sits behind, which only works if the
// surface itself is a known solid color.
function blend(color, base, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, ${base})`;
}

// Perceived brightness of a "#rrggbb" palette color, 0 to 255. Only ever
// called on palette hex values, never on a dotColor() result (which can be
// an hsl() string).
function brightness(hex) {
  const [r, g, b] = hexToRgb(hex).split(", ").map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Legible text/ink to sit directly on a solid `hex` fill: the divider tabs
// and the label-maker strip, whose backgrounds are palette colors ranging
// from near-black ink to bright gold.
function inkOn(hex) {
  return brightness(hex) > 165 ? "#1b1206" : "#fffaf0";
}

// The palette accents are picked to work as fills, and several of them
// (gold, lime, coral) sit around 3:1 against pale paper, which is fine for
// a rule or a tab but short of AA for the small type this template sets in
// accent color. So accent *text* gets darkened on light paper and lightened on
// the dark palette, while fills, rules and tabs keep the raw accent, which
// is what preserves each section's color identity.
function accentInk(color, darkPaper) {
  return darkPaper ? `color-mix(in srgb, ${color}, white 34%)` : shade(color, 50);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// A tiny run of tape holding something down. Translucent rather than a
// printed washi pattern, with the short ends cut on a slight angle, which
// is what reads as tape instead of as a colored rectangle.
function Tape({ className = "", color, rotation = -7 }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-6 w-24 ${className}`}
      style={{
        background: `linear-gradient(160deg, ${tint(color, 62)}, ${tint(color, 40)} 55%, ${tint(color, 58)})`,
        clipPath: "polygon(3% 0, 97% 4%, 100% 96%, 2% 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.14)",
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

// A rubber-stamped box: the one motif that recurs across sheets (date
// ranges, project tags, contact links), so the binder reads as one
// document stamped by one person.
function Stamp({ children, color, ink, className = "", rotation = -2.5 }) {
  return (
    <span
      className={`${courier.className} inline-block shrink-0 whitespace-nowrap rounded-[2px] border-[1.5px] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.16em] ${className}`}
      style={{ borderColor: tint(color, 55), color: ink, transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </span>
  );
}

const PHOTO_CORNERS = [
  { pos: "left-0 top-0", clip: "polygon(0 0, 100% 0, 0 100%)" },
  { pos: "right-0 top-0", clip: "polygon(0 0, 100% 0, 100% 100%)" },
  { pos: "left-0 bottom-0", clip: "polygon(0 0, 0 100%, 100% 100%)" },
  { pos: "right-0 bottom-0", clip: "polygon(100% 0, 100% 100%, 0 100%)" },
];

// A photo as it is actually mounted in an album: a print with a thick
// paper border, held at all four corners by slip-in photo corners. The
// corners are straight-cut triangles, and they are what replaced the torn
// paper edge as this template's photo treatment.
function PhotoPrint({ src, alt, monogram, accent, caption, className = "", tilt = -1.6 }) {
  return (
    <span className={`scrapbook-print relative block ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      <span
        className={`block p-2 ${caption ? "pb-3" : "pb-6"}`}
        style={{ backgroundColor: LABEL_PAPER, boxShadow: "0 2px 6px rgba(0,0,0,0.22), 0 12px 24px rgba(0,0,0,0.16)" }}
      >
        <span className="relative block aspect-[4/3] overflow-hidden">
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <span
              className={`${bodoni.className} flex h-full w-full items-center justify-center text-5xl font-medium`}
              style={{
                backgroundColor: blend(accent, LABEL_PAPER, 18),
                backgroundImage: `repeating-linear-gradient(45deg, ${tint(accent, 13)} 0 7px, transparent 7px 14px)`,
                color: shade(accent, 48),
              }}
            >
              {monogram}
            </span>
          )}
          {/* Photo corners, drawn as four right triangles slipped over the
              image's corners. aria-hidden: they are mounting hardware. */}
          {PHOTO_CORNERS.map((corner) => (
            <span
              key={corner.pos}
              aria-hidden
              className={`pointer-events-none absolute h-6 w-6 ${corner.pos}`}
              style={{ clipPath: corner.clip, background: "linear-gradient(135deg, rgba(0,0,0,0.42), rgba(0,0,0,0.18))" }}
            />
          ))}
        </span>
        {/* The caption lives inside the print so it tilts with it, the way
            a name written on the paper border would. */}
        {caption && (
          <span
            className={`${courier.className} mt-2 block truncate text-center text-[10px] font-bold uppercase tracking-[0.16em]`}
            style={{ color: LABEL_INK }}
          >
            {caption}
          </span>
        )}
      </span>
    </span>
  );
}

// The sheet: one punched page of the binder. Three layers deep (two
// under-sheets peeking out down-right past straight cut edges, then the
// page itself), so the stack has real thickness without any torn-edge
// filter. The divider tab sits proud of the top edge, and each sheet's tab
// is nudged to a different x position so scrolling past the binder shows a
// staggered index rather than tabs stacked in one column.
function Sheet({ id, page, total, head, tab, tabColor, tabX, rot, c, children }) {
  return (
    <RevealOnScroll arrivedClassName="scrapbook-sheet-arrive" threshold={0.06} rootMargin="0px 0px -70px 0px">
      <div className="scrapbook-sheet relative" style={{ "--sheet-rot": `${rot}deg` }}>
        <div
          aria-hidden
          className="absolute inset-0 translate-x-[7px] translate-y-[9px] rounded-[2px]"
          style={{ backgroundColor: shade(c.CARD, 20), boxShadow: "0 14px 28px rgba(0,0,0,0.22)" }}
        />
        <div aria-hidden className="absolute inset-0 translate-x-[3px] translate-y-[4px] rounded-[2px]" style={{ backgroundColor: shade(c.CARD, 9) }} />
        <section
          id={id}
          aria-labelledby={`${id}-title`}
          className="relative scroll-mt-10 rounded-[2px]"
          style={{ backgroundColor: c.CARD, boxShadow: `inset 0 1px 0 ${tint("#ffffff", 45)}` }}
        >
          {tab && (
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[1.6rem] z-10 max-w-[46%] -translate-x-1/2 rounded-t-[3px] px-3 pb-1.5 pt-[7px]"
              style={{ left: tabX, backgroundColor: tabColor, color: inkOn(tabColor), boxShadow: "0 -3px 7px rgba(0,0,0,0.2)" }}
            >
              <span className={`${courier.className} block truncate text-[10px] font-bold uppercase tracking-[0.18em]`}>{tab}</span>
            </span>
          )}
          {/* The binding: three punched holes painted in the desk color so
              the page reads as actually pierced, plus the margin rule every
              ruled notebook has. Hidden below sm, where the sheet needs the
              full width for content. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 sm:block">
            {["14%", "50%", "86%"].map((top) => (
              <span
                key={top}
                className="absolute left-[1.1rem] h-3.5 w-3.5 -translate-y-1/2 rounded-full"
                style={{ top, backgroundColor: c.DESK, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
              />
            ))}
            <span className="absolute inset-y-5 left-[3.6rem] w-px" style={{ backgroundColor: blend(c.POP, c.CARD, 55) }} />
          </div>
          <div className="px-5 pb-9 pt-4 sm:pl-[4.8rem] sm:pr-9">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b pb-2" style={{ borderColor: tint(c.INK, 16) }}>
              <span className={`${courier.className} truncate text-[10px] font-bold uppercase tracking-[0.3em]`} style={{ color: c.INK_SOFT }}>
                {head}
              </span>
              <span className={`${courier.className} shrink-0 text-[10px] uppercase tracking-[0.2em]`} style={{ color: c.INK_SOFT }}>
                pg. {pad(page)} / {pad(total)}
              </span>
            </div>
            {children}
          </div>
        </section>
      </div>
    </RevealOnScroll>
  );
}

// The warm phrase above each sheet's content. The running head already
// gives the formal section name, so this one is allowed to be the voice of
// the person whose binder this is.
function SheetTitle({ id, children, accent, ink }) {
  return (
    <div className="mb-6">
      <h2 id={id} className={`${bodoni.className} break-words text-[1.7rem] font-medium leading-tight sm:text-4xl`} style={{ color: ink }}>
        {children}
      </h2>
      <span aria-hidden className="mt-2 block h-[3px] w-16 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

// A handwritten line with an ink underline that draws itself the first
// time it scrolls into view. `pathLength="1"` normalizes the path so the
// keyframe can animate stroke-dashoffset 1 to 0 without measuring it.
// Stays fully drawn by default per RevealOnScroll's contract, so a visitor
// without JS never sees a half-drawn line.
function InkNote({ children, color }) {
  return (
    <RevealOnScroll arrivedClassName="scrapbook-ink-arrive" threshold={0.6} rootMargin="0px">
      <span className="inline-flex flex-col items-start">
        <span className={`${caveat.className} text-xl leading-tight`} style={{ color }}>
          {children}
        </span>
        <svg width="132" height="10" viewBox="0 0 132 10" className="scrapbook-ink" aria-hidden focusable="false">
          <path
            d="M2,7 Q34,2 66,6 T130,4"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
          />
        </svg>
      </span>
    </RevealOnScroll>
  );
}

// Experience: index cards strung down a stitched rail. Each card gets the
// red top rule and faint ruling of a real 5x3 card, and its dates as a
// rubber stamp in the top corner.
function ExperienceSheet({ experience, accent, ink, c }) {
  return (
    <ol className="scrapbook-stack relative space-y-5 border-l border-dashed pl-6 sm:pl-8" style={{ borderColor: tint(accent, 50) }}>
      {experience.map((job, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden
            className="absolute top-7 hidden h-2.5 w-2.5 rounded-full border-2 sm:block"
            style={{ left: "-2.3rem", borderColor: accent, backgroundColor: c.CARD }}
          />
          <article
            className="scrapbook-lift relative overflow-hidden rounded-[2px]"
            style={{
              "--rest-rot": `${i % 2 === 0 ? -0.35 : 0.3}deg`,
              backgroundColor: blend(c.POP, c.CARD, 5),
              border: `1px solid ${tint(c.INK, 15)}`,
              boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
            }}
          >
            <span aria-hidden className="block h-[3px]" style={{ backgroundColor: blend(c.POP, c.CARD, 70) }} />
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-4">
              <div className="min-w-0">
                <h3 className={`${bodoni.className} break-words text-xl font-medium leading-snug`} style={{ color: c.INK }}>
                  {job.role || "Role"}
                </h3>
                <p className={`${courier.className} mt-1 break-words text-[11px] font-bold uppercase tracking-[0.18em]`} style={{ color: c.INK_SOFT }}>
                  {job.company || "Company"}
                </p>
              </div>
              {(job.start || job.end) && (
                <Stamp color={accent} ink={ink} rotation={2}>
                  {[job.start, job.end].filter(Boolean).join("-")}
                </Stamp>
              )}
            </div>
            {job.bullets?.length > 0 && (
              <ul className={`${newsreader.className} scrapbook-ruled mt-3 px-5 pb-5 text-[0.95rem] leading-7`} style={{ color: c.INK_SOFT }}>
                {job.bullets.map((line, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.85rem] h-1 w-1 shrink-0 rounded-[1px]" style={{ backgroundColor: accent }} />
                    <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}

// Projects: album mounts. The print sits on a panel with its highlights on a
// slip tucked in behind it, visible rather than hidden behind a flip, because
// the highlights are what a hiring manager came to read. The mount tilts in
// real perspective on hover (see .scrapbook-mount in globals.css).
//
// Landscape at full width, portrait when sharing the row. An odd project count
// promotes the first to a full-width lead mount so the rest pair up exactly,
// which is what keeps the sheet from ever showing an empty column.
//
// The landscape split only applies from md up: below that a fixed 17rem print
// column would squeeze the copy into an unreadable gutter, so the print stacks
// above the text instead.
function ProjectMount({ project, accent, ink, c, tilt, wide }) {
  const print = (
    <PhotoPrint
      src={project.image}
      alt={project.name ? `${project.name} screenshot` : "Project screenshot"}
      monogram={(project.name || "?")[0]?.toUpperCase()}
      accent={accent}
      tilt={tilt}
    />
  );
  const body = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className={`${bodoni.className} min-w-0 break-words text-2xl font-medium leading-tight`} style={{ color: c.INK }}>
          {project.name || "Untitled project"}
        </h3>
        <span className={`${courier.className} shrink-0 text-[10px] font-bold uppercase tracking-[0.18em]`} style={{ color: c.INK_SOFT }}>
          {[project.version && `v${project.version}`, project.status].filter(Boolean).join(" · ")}
        </span>
      </div>
      {project.description && (
        <p className={`${newsreader.className} mt-2 whitespace-pre-line break-words text-[0.95rem] leading-7`} style={{ color: c.INK_SOFT }}>
          {project.description}
        </p>
      )}
      {project.highlights?.length > 0 && (
        <div
          className="mt-4 rounded-[2px] px-4 py-3"
          style={{
            backgroundColor: blend(c.INK, c.CARD, 9),
            border: `1px solid ${tint(c.INK, 16)}`,
            boxShadow: "0 4px 11px rgba(0,0,0,0.12)",
            transform: "rotate(-0.8deg)",
          }}
        >
          <span className={`${caveat.className} block text-lg leading-none`} style={{ color: ink }}>
            notes on the back
          </span>
          <ul className={`${newsreader.className} mt-2 space-y-1.5 text-[0.9rem] leading-6`} style={{ color: c.INK_SOFT }}>
            {project.highlights.map((line, j) => (
              <li key={j} className="flex gap-2.5">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-[1px]" style={{ backgroundColor: accent }} />
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {project.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Stamp key={tag} color={dotColor(tag)} ink={c.INK_SOFT} rotation={0}>
              {tag}
            </Stamp>
          ))}
        </div>
      )}
      {(project.link || project.demo) && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3" style={{ borderColor: tint(c.INK, 14) }}>
          {project.link && <PaperLink href={`https://${stripProtocol(project.link)}`} color={ink}>Source</PaperLink>}
          {project.demo && <PaperLink href={`https://${stripProtocol(project.demo)}`} color={ink}>Live demo</PaperLink>}
        </div>
      )}
    </div>
  );

  return (
    <article
      className="scrapbook-mount-inner relative rounded-[2px] p-4 pb-5"
      style={{
        backgroundColor: blend(accent, c.CARD, 11),
        border: `1px solid ${tint(c.INK, 14)}`,
        boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
      }}
    >
      {wide ? (
        <div className="gap-6 md:grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-start">
          <div className="mb-5 md:mb-0">{print}</div>
          {body}
        </div>
      ) : (
        <>
          {print}
          <div className="mt-5">{body}</div>
        </>
      )}
    </article>
  );
}

function ProjectsSheet({ projects, accent, ink, c }) {
  const lead = projects.length % 2 === 1 ? projects[0] : null;
  const paired = lead ? projects.slice(1) : projects;
  return (
    <ul className="scrapbook-stack grid gap-7 lg:grid-cols-2">
      {lead && (
        <li className="scrapbook-mount lg:col-span-2">
          <ProjectMount project={lead} accent={accent} ink={ink} c={c} tilt={-1.5} wide />
        </li>
      )}
      {paired.map((project, i) => (
        <li key={i} className="scrapbook-mount">
          <ProjectMount project={project} accent={accent} ink={ink} c={c} tilt={i % 2 === 0 ? 1.3 : -1.4} />
        </li>
      ))}
    </ul>
  );
}

// A typed footnote link: the underline thickens on hover and focus rather
// than appearing from nothing, so the affordance is there before the
// pointer is.
function PaperLink({ href, color, children }) {
  return (
    <a
      href={href}
      className={`${courier.className} scrapbook-underline text-[11px] font-bold uppercase tracking-[0.16em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{ color, "--rule": color, outlineColor: color }}
    >
      {children}
    </a>
  );
}

// Skills: a sheet of die-cut stickers on its perforated backing card. Each
// sticker takes the deterministic color of its own label (dotColor), gets
// the thick paper edge a real die cut leaves, and peels up at the corner
// on hover. This is the page's signature object.
function SkillsSheet({ skills, accent, c }) {
  return (
    <div
      className="rounded-[3px] border border-dashed p-4 sm:p-5"
      style={{ borderColor: tint(c.INK, 30), backgroundColor: blend(c.INK, c.CARD, 9) }}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <span className={`${courier.className} text-[10px] font-bold uppercase tracking-[0.28em]`} style={{ color: c.INK_SOFT }}>
          Sticker sheet
        </span>
        <span className={`${courier.className} shrink-0 text-[10px] uppercase tracking-[0.2em]`} style={{ color: c.INK_SOFT }}>
          {skills.length} {skills.length === 1 ? "sticker" : "stickers"}
        </span>
      </div>
      <ul className="scrapbook-stack flex flex-wrap gap-x-3 gap-y-4">
        {skills.map((skill, i) => (
          <li key={skill} className="scrapbook-sticker-slot">
            <span
              className="scrapbook-sticker relative inline-flex items-center gap-2 rounded-full px-3.5 py-[7px]"
              style={{
                "--sticker-rot": `${[-2.6, 1.9, -1.2, 2.7, -3.1, 1.3][i % 6]}deg`,
                backgroundColor: blend(dotColor(skill), c.CARD, 34),
                border: `3px solid ${LABEL_PAPER}`,
                boxShadow: "0 2px 5px rgba(0,0,0,0.22)",
                color: c.INK,
              }}
            >
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
              <span className={`${courier.className} text-[11px] font-bold uppercase tracking-[0.12em]`}>{skill}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={`${caveat.className} mt-4 text-lg leading-none`} style={{ color: accentInk(accent, c.DARK) }}>
        collected, not claimed
      </p>
    </div>
  );
}

// Achievements: ticket stubs. The perforation is a dashed rule with two
// notches punched out of it, painted in the sheet color behind the ticket
// which is exactly why the ticket's own fill has to be opaque (blend()).
function AchievementsSheet({ achievements, accent, ink, c }) {
  return (
    <ul className="scrapbook-stack space-y-4">
      {achievements.map((text, i) => (
        <li key={i}>
          <div
            className="scrapbook-ticket relative grid grid-cols-[4.6rem_minmax(0,1fr)] overflow-hidden rounded-[2px] sm:grid-cols-[5.6rem_minmax(0,1fr)]"
            style={{
              "--rest-rot": `${i % 2 === 0 ? -0.4 : 0.35}deg`,
              backgroundColor: blend(accent, c.CARD, 9),
              border: `1px solid ${tint(c.INK, 15)}`,
              boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
            }}
          >
            <div className="scrapbook-ticket-stub flex flex-col items-center justify-center gap-1 py-4" style={{ backgroundColor: blend(accent, c.CARD, 22) }}>
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill={accent}>
                <path d="M12 2.5l2.7 6.1 6.6.6-5 4.4 1.5 6.5L12 16.7l-5.8 3.4 1.5-6.5-5-4.4 6.6-.6L12 2.5z" />
              </svg>
              <span className={`${courier.className} text-[10px] font-bold uppercase tracking-[0.16em]`} style={{ color: ink }}>
                No. {pad(i + 1)}
              </span>
            </div>
            <p className={`${newsreader.className} min-w-0 whitespace-pre-line break-words py-4 pl-5 pr-5 text-[0.95rem] leading-7`} style={{ color: c.INK_SOFT }}>
              {text}
            </p>
            <span aria-hidden className="absolute inset-y-0 left-[4.6rem] w-0 border-l border-dashed sm:left-[5.6rem]" style={{ borderColor: tint(c.INK, 45) }} />
            <span aria-hidden className="absolute -top-2 left-[4.6rem] h-4 w-4 -translate-x-1/2 rounded-full sm:left-[5.6rem]" style={{ backgroundColor: c.CARD }} />
            <span aria-hidden className="absolute -bottom-2 left-[4.6rem] h-4 w-4 -translate-x-1/2 rounded-full sm:left-[5.6rem]" style={{ backgroundColor: c.CARD }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Education: the checkout card from the back of a library book. Ruled
// rows, a red margin rule, and the years stamped in the right-hand column
// where the due date would go. Reads as a card with one row just as well
// as with four, which is the sparse case this section usually is.
function EducationSheet({ education, accent, ink, c }) {
  return (
    <div
      className="relative overflow-hidden rounded-[2px]"
      style={{ backgroundColor: blend(c.POP, c.CARD, 5), border: `1px solid ${tint(c.INK, 15)}`, boxShadow: "0 6px 14px rgba(0,0,0,0.14)" }}
    >
      <div className="flex items-baseline justify-between gap-3 border-b-[3px] px-5 py-3" style={{ borderColor: blend(c.POP, c.CARD, 60) }}>
        <span className={`${courier.className} text-[10px] font-bold uppercase tracking-[0.26em]`} style={{ color: c.INK_SOFT }}>
          Institution / programme
        </span>
        <span className={`${courier.className} shrink-0 text-[10px] font-bold uppercase tracking-[0.2em]`} style={{ color: c.INK_SOFT }}>
          Years
        </span>
      </div>
      <ul className="scrapbook-stack">
        {education.map((edu, i) => (
          <li
            key={i}
            className="flex flex-col gap-2 border-b border-dashed px-5 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            style={{ borderColor: tint(c.INK, 18) }}
          >
            <div className="min-w-0">
              <h3 className={`${bodoni.className} break-words text-xl font-medium leading-snug`} style={{ color: c.INK }}>
                {edu.school || "School"}
              </h3>
              {edu.degree && (
                <p className={`${newsreader.className} mt-0.5 break-words text-[0.95rem] leading-6`} style={{ color: c.INK_SOFT }}>
                  {edu.degree}
                </p>
              )}
            </div>
            {(edu.start || edu.end) && (
              <Stamp color={accent} ink={ink} rotation={-2}>
                {[edu.start, edu.end].filter(Boolean).join("-")}
              </Stamp>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Coding profiles: punched hang tags, cut to the classic luggage-tag
// pentagon with the hole in the point. The whole tag is the link, and it
// swings from the hole on hover and keyboard focus.
//
// The tag shape lives on an inner layer, not on the link itself, because
// clip-path clips an element's focus ring along with its background: put
// the pentagon on the <a> and the keyboard focus outline gets cut away
// entirely, leaving the tags with no visible focus state at all.
function CodingSheet({ profiles, accent, ink, c }) {
  return (
    <ul className="scrapbook-stack flex flex-wrap gap-4">
      {profiles.map((profile, i) => (
        <li key={i}>
          <a
            href={`https://${stripProtocol(profile.url)}`}
            className="scrapbook-tag relative block min-w-[14rem] max-w-full py-4 pl-12 pr-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ "--tag-rot": `${i % 2 === 0 ? -2.2 : 1.6}deg`, outlineColor: accent }}
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundColor: blend(accent, c.CARD, 20),
                clipPath: "polygon(0 50%, 1.4rem 0, 100% 0, 100% 100%, 1.4rem 100%)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.16)",
              }}
            />
            <span aria-hidden className="absolute left-[1.05rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full" style={{ backgroundColor: c.CARD, boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }} />
            <span className={`${bodoni.className} relative block truncate text-lg font-medium leading-tight`} style={{ color: c.INK }}>
              {profile.platform}
            </span>
            <span className={`${courier.className} relative mt-0.5 block truncate text-[11px] tracking-[0.08em]`} style={{ color: ink }}>
              {stripProtocol(profile.url)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const SECTION_HEADS = {
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  achievements: "Achievements",
  skills: "Toolkit",
  codingProfiles: "Profiles",
};

const SECTION_TITLES = {
  experience: "Where I\u2019ve worked",
  education: "Where I studied",
  projects: "Things I\u2019ve made",
  achievements: "Little wins, kept",
  skills: "What\u2019s in the kit",
  codingProfiles: "Where I compete",
};

// Singular and plural of the unit each section is counted in, for the
// contents page. Counting what the customer typed is derivation, not a
// fabricated stat. Nothing here invents a number.
const SECTION_UNITS = {
  experience: ["role", "roles"],
  education: ["school", "schools"],
  projects: ["project", "projects"],
  achievements: ["entry", "entries"],
  skills: ["tool", "tools"],
  codingProfiles: ["profile", "profiles"],
};

// Where each sheet's divider tab sits along its top edge. Cycled by sheet
// order so consecutive tabs never overlap and the binder reads as indexed.
const TAB_POSITIONS = ["58%", "37%", "74%", "27%", "85%", "47%"];
const SHEET_ROTATIONS = [-0.3, 0.25, -0.15, 0.32, -0.28, 0.18];

export default function ScrapbookTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const palette = getPalette("scrapbook", data.paletteId) || SCRAPBOOK_PALETTES[0];
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, CARD, PALETTE } = palette.colors;

  // Everything below reads colors off one object, so the desk color (which
  // the punched holes have to be painted in) travels with the palette
  // instead of being recomputed per component.
  const darkPaper = brightness(PAPER) < 128;
  // The dark palette's desk is mixed down further than the light ones
  // because the paper texture laid over it (below) can only ever lighten a
  // near-black ground: measured against the sheets, overlaying the texture
  // on the old value closed the desk-to-sheet gap from 16 to 8 and the page
  // went flat. Starting 60% down instead of 34% pays for the lift and lands
  // back at a gap of 14.
  const desk = shade(PAPER, darkPaper ? 60 : 26);
  const c = { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, CARD, DESK: desk, DARK: darkPaper };

  const yearsXp = computeYearsOfExperience(experience);

  const counts = {
    experience: (experience || []).length,
    education: (education || []).length,
    projects: (projects || []).length,
    achievements: (achievements || []).length,
    skills: (skills || []).length,
    codingProfiles: (codingProfiles || []).length,
  };
  const orderedIds = (sectionOrder || []).filter((id) => counts[id] > 0);

  // Page 01 is the cover and the last page is the back cover, so a section
  // in position i is page i + 2. The contents page, the running heads and
  // the index rail all number off this one arithmetic.
  const totalPages = orderedIds.length + 2;
  const pageOf = (id) => orderedIds.indexOf(id) + 2;

  // Every sheet in a section shares that section's accent: the section, not
  // the individual card, is the unit of color identity, which is what makes
  // "this whole sheet is Projects" legible from the tab alone.
  const accentOf = (id) => PALETTE[orderedIds.indexOf(id) % PALETTE.length];

  const sectionBody = {
    experience: (accent, ink) => <ExperienceSheet experience={experience} accent={accent} ink={ink} c={c} />,
    education: (accent, ink) => <EducationSheet education={education} accent={accent} ink={ink} c={c} />,
    projects: (accent, ink) => <ProjectsSheet projects={projects} accent={accent} ink={ink} c={c} />,
    achievements: (accent, ink) => <AchievementsSheet achievements={achievements} accent={accent} ink={ink} c={c} />,
    skills: (accent) => <SkillsSheet skills={skills} accent={accent} c={c} />,
    codingProfiles: (accent, ink) => <CodingSheet profiles={codingProfiles} accent={accent} ink={ink} c={c} />,
  };

  // `textOn` travels with each tab because only this file knows how to read
  // a palette color's brightness, and the rail needs legible type against
  // whichever accent the active tab is filled with.
  const tabItems = [
    { id: "cover", label: "Cover", color: ACCENT, textOn: inkOn(ACCENT), page: 1 },
    ...orderedIds.map((id) => {
      const accent = accentOf(id);
      return { id, label: SECTION_HEADS[id], color: accent, textOn: inkOn(accent), page: pageOf(id) };
    }),
    { id: "colophon", label: "Contact", color: POP, textOn: inkOn(POP), page: totalPages },
  ];

  return (
    <div className={`scrapbook-root relative min-h-dvh ${newsreader.className}`} style={{ backgroundColor: desk, color: INK }}>
      {/* The desk the binder sits on: one big sheet of wrinkled paper (a
          71KB webp) laid under the whole page, blended with the palette's
          own desk color rather than dropped in as a photo, so each theme
          still reads as its own paper stock instead of the same picture with
          a wash over it. It replaced a pair of 5.7MB wallpaper PNGs that
          every customer's clone used to inherit.
          `cover`, not a tile: the texture has no seamless repeat, and
          stretched across the viewport its creases become the large soft
          folds of a single sheet, which is what a binder should be lying on.
          The blend has to differ by theme because a near-white texture can
          only ever darken a pale desk and only ever lighten a dark one.
          Multiply lets the creases sink into the light palettes, where the
          texture does most of its work. The dark palette takes overlay held
          back to just over half strength (`opacity` composites the blended
          result back over the identical desk color underneath, which is the
          interpolation knob), and there the texture is close to
          imperceptible by necessity: measured, it can modulate a near-black
          ground by about 2 levels of luminance before the desk starts
          reading as lighter than the sheets lying on it, so the sheets keep
          the contrast and the desk keeps only a hint of grain.
          `fixed` with no containing-block trick: this template is written
          as if it always owns a full page (the deployed site and the
          standalone /preview route both do), and the editor's constrained
          preview pane scopes `fixed` to itself on its own end
          (PortfolioEditor.js), so this component never needs to know which
          context it is rendered in. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundColor: desk,
          backgroundImage: "url(/scrapbook-desk-paper.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: darkPaper ? "overlay" : "multiply",
          opacity: darkPaper ? 0.55 : 1,
        }}
      />
      {/* A warm pool of light from above and a vignette that darkens the
          corners, so the sheets read as objects lit from the front. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(120% 80% at 50% -10%, ${tint(POP, 16)}, transparent 62%)`,
            "radial-gradient(125% 95% at 50% 26%, transparent 42%, rgba(0,0,0,0.3) 100%)",
          ].join(", "),
        }}
      />
      <CursorGlow colorRgb={hexToRgb(POP)} size={620} />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
          <ScrapbookTabs items={tabItems} mono={courier.className} card={CARD} ink={INK} inkSoft={INK_SOFT} rule={tint(INK, 18)} />

          <div className="space-y-11 sm:space-y-14">
            {/* Cover: the front of the binder. Portrait taped in, name
                pressed large, role on a label-maker strip, and a real
                table of contents that doubles as the only navigation
                small screens get (the index rail is desktop-only). */}
            <Sheet id="cover" page={1} total={totalPages} head={name || "Portfolio"} rot={-0.25} c={c}>
              <div className="grid gap-7 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:items-start md:gap-9">
                <div className="relative mx-auto w-full max-w-[13rem] pt-3 md:mx-0">
                  <Tape className="-left-4 -top-1 z-10" color={ACCENT} rotation={-8} />
                  <Tape className="-right-5 bottom-2 z-10" color={POP} rotation={-6} />
                  <PhotoPrint
                    src={photoUrl}
                    alt={name ? `${name}, portrait` : "Portrait"}
                    monogram={initials(name)}
                    accent={ACCENT}
                    caption={name || "Your Name"}
                    tilt={-2.2}
                  />
                </div>

                <div className="min-w-0">
                  <InkNote color={accentInk(ACCENT, darkPaper)}>this one&rsquo;s mine</InkNote>
                  <h1
                    id="cover-title"
                    className={`${bodoni.className} mt-2 break-words text-[2.6rem] font-black leading-[0.95] tracking-tight sm:text-6xl`}
                    style={{ color: INK }}
                  >
                    {name || "Your Name"}
                  </h1>
                  <span
                    className={`${courier.className} mt-4 inline-block max-w-full truncate rounded-[3px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]`}
                    style={{ backgroundColor: INK, color: inkOn(INK) }}
                  >
                    {role || "Your Role"}
                  </span>
                  {bio && (
                    <p
                      className={`${newsreader.className} scrapbook-ruled mt-5 whitespace-pre-line break-words text-[1.05rem] italic leading-7`}
                      style={{ color: INK_SOFT }}
                    >
                      {bio}
                    </p>
                  )}
                  {yearsXp > 0 && (
                    <p className={`${courier.className} mt-5 text-[10px] font-bold uppercase tracking-[0.24em]`} style={{ color: INK_SOFT }}>
                      {yearsXp} year{yearsXp === 1 ? "" : "s"} of it so far
                    </p>
                  )}
                </div>
              </div>

              {orderedIds.length > 0 && (
                <nav aria-label="Contents" className="mt-8 rounded-[2px] border border-dashed p-4 sm:p-5" style={{ borderColor: tint(INK, 26) }}>
                  <p className={`${courier.className} mb-3 text-[10px] font-bold uppercase tracking-[0.28em]`} style={{ color: INK_SOFT }}>
                    Contents
                  </p>
                  <ol className="space-y-1">
                    {orderedIds.map((id, i) => {
                      const [one, many] = SECTION_UNITS[id];
                      return (
                        <li key={id}>
                          <a
                            href={`#${id}`}
                            className="scrapbook-contents-row flex items-baseline gap-2 rounded-[2px] px-1.5 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                            style={{ outlineColor: accentOf(id) }}
                          >
                            <span className={`${courier.className} w-6 shrink-0 text-[11px] tabular-nums`} style={{ color: INK_SOFT }}>
                              {pad(i + 1)}
                            </span>
                            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[1px]" style={{ backgroundColor: accentOf(id) }} />
                            <span className={`${bodoni.className} min-w-0 truncate text-lg font-medium leading-tight`} style={{ color: INK }}>
                              {SECTION_HEADS[id]}
                            </span>
                            <span aria-hidden className="min-w-3 flex-1 border-b border-dotted" style={{ borderColor: tint(INK, 34) }} />
                            {/* The item count is the first thing to go on a
                                phone: the row still has to fit the label and
                                the page number, and those two are what the
                                contents page is for. */}
                            <span className={`${courier.className} hidden w-24 shrink-0 text-right text-[11px] tracking-[0.08em] sm:inline-block`} style={{ color: INK_SOFT }}>
                              {counts[id]} {counts[id] === 1 ? one : many}
                            </span>
                            <span className={`${courier.className} w-12 shrink-0 text-right text-[11px] tabular-nums`} style={{ color: INK_SOFT }}>
                              pg. {pad(pageOf(id))}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              )}
            </Sheet>

            {/* The sections, in the customer's chosen order. Each is its own
                tabbed sheet carrying its own kind of paper object. */}
            {orderedIds.map((id, i) => {
              const accent = accentOf(id);
              const ink = accentInk(accent, darkPaper);
              return (
                <Sheet
                  key={id}
                  id={id}
                  page={pageOf(id)}
                  total={totalPages}
                  head={SECTION_HEADS[id]}
                  tab={SECTION_HEADS[id]}
                  tabColor={accent}
                  tabX={TAB_POSITIONS[i % TAB_POSITIONS.length]}
                  rot={SHEET_ROTATIONS[i % SHEET_ROTATIONS.length]}
                  c={c}
                >
                  <SheetTitle id={`${id}-title`} accent={accent} ink={INK}>
                    {SECTION_TITLES[id]}
                  </SheetTitle>
                  {sectionBody[id](accent, ink)}
                </Sheet>
              );
            })}

            {/* Back cover: the address label and the stamps, the way the
                inside back of a notebook carries whose it is. */}
            <Sheet
              id="colophon"
              page={totalPages}
              total={totalPages}
              head="Contact"
              tab="Contact"
              tabColor={POP}
              tabX="40%"
              rot={0.22}
              c={c}
            >
              <SheetTitle id="colophon-title" accent={POP} ink={INK}>
                Last page
              </SheetTitle>
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
                {email && (
                  <div className="relative">
                    <Tape className="-right-3 -top-2 z-10" color={POP} rotation={7} />
                    <div
                      className="rounded-[2px] border border-dashed p-4"
                      style={{ backgroundColor: LABEL_PAPER, borderColor: "rgba(42,33,24,0.35)", boxShadow: "0 6px 14px rgba(0,0,0,0.16)", transform: "rotate(-0.8deg)" }}
                    >
                      <p className={`${courier.className} text-[10px] font-bold uppercase tracking-[0.28em]`} style={{ color: LABEL_INK }}>
                        Reply to
                      </p>
                      <a
                        href={`mailto:${email}`}
                        className={`${bodoni.className} scrapbook-underline mt-1.5 block break-words text-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
                        style={{ color: LABEL_INK, "--rule": LABEL_INK, outlineColor: LABEL_INK }}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <InkNote color={accentInk(POP, darkPaper)}>drop me a line</InkNote>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {email && (
                      <StampLink href={`mailto:${email}`} color={POP} ink={accentInk(POP, darkPaper)} c={c} rotation={-1.5}>
                        <IconMail className="h-3.5 w-3.5" /> Email
                      </StampLink>
                    )}
                    {links?.github && (
                      <StampLink href={`https://${stripProtocol(links.github)}`} color={PALETTE[0]} ink={accentInk(PALETTE[0], darkPaper)} c={c} rotation={1.8}>
                        <IconGithub className="h-3.5 w-3.5" /> GitHub
                      </StampLink>
                    )}
                    {links?.linkedin && (
                      <StampLink href={`https://${stripProtocol(links.linkedin)}`} color={PALETTE[1]} ink={accentInk(PALETTE[1], darkPaper)} c={c} rotation={-2.2}>
                        <IconLinkedin className="h-3.5 w-3.5" /> LinkedIn
                      </StampLink>
                    )}
                    {links?.website && (
                      <StampLink href={`https://${stripProtocol(links.website)}`} color={PALETTE[2]} ink={accentInk(PALETTE[2], darkPaper)} c={c} rotation={1.2}>
                        <IconLink className="h-3.5 w-3.5" /> Website
                      </StampLink>
                    )}
                  </div>
                </div>
              </div>
              <p className={`${courier.className} mt-8 border-t pt-4 text-[10px] uppercase tracking-[0.2em]`} style={{ borderColor: tint(INK, 14), color: INK_SOFT }}>
                © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
              </p>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

// The contact links as stamped chips: a real link, sized for touch, that
// straightens out of its tilt when you reach for it.
function StampLink({ href, color, ink, c, rotation, children }) {
  return (
    <a
      href={href}
      className={`${courier.className} scrapbook-stamp-link inline-flex min-h-11 items-center gap-2 rounded-[2px] border-[1.5px] px-4 text-[11px] font-bold uppercase tracking-[0.16em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
      style={{
        "--stamp-rot": `${rotation}deg`,
        borderColor: tint(color, 55),
        backgroundColor: blend(color, c.CARD, 8),
        color: ink,
        outlineColor: color,
      }}
    >
      {children}
    </a>
  );
}
