// Front Page: a modern newspaper set as one no-scroll page on lg and up.
//
// Height is a fixed budget rather than a flow, so densityFor() derives type
// size, leading, entry spacing and column count from how much the customer
// actually entered. It is a budget, not magic: an enormous portfolio can still
// outrun the smallest tier. Below lg the page scrolls and type returns to a
// fixed readable size.
//
// Exactly two rules on the page, under the nameplate and above the sign-off,
// and the body is one continuous multi-column flow that breaks mid-story like
// newsprint. Only headings are protected, via break-after: avoid.
//
// sectionOrder[0] gets the largest heading. Nothing is fabricated: tenure and
// the EST. year are computed from real dates. No palette picker and no
// CursorGlow, both deliberate: black on white IS the identity, and a tracking
// light breaks the printed-matter illusion.

import { Fragment } from "react";
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  initials,
  stripProtocol,
  parseYear,
  computeYearsOfExperience,
} from "./shared";
import FitToPage from "./FitToPage";

// Exposed as CSS variables as well as classNames so ::first-letter can pick up
// the display face for the drop cap — a pseudo-element can't be handed a React
// className.
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--np-display",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--np-serif",
});
// Datelines, kickers, and tags only — a mono reads as press furniture (and
// quietly signals "developer") without a third serif voice.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--np-mono" });

const PAPER = "#ffffff";
const INK = "#111111";
const INK_SOFT = "#2e2e2e";
const MUTED = "#767676";
const FAINT = "#9b9b9b";
const RED = "#c8102e"; // keep in sync with the literal in the drop-cap class below
const RULE = "#111111";

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

// Standing section kickers, the way a paper has "Business" and "Arts &
// Leisure". Pure editorial furniture: it names the desk, it never asserts
// anything about the customer.
const SECTION_KICKERS = {
  experience: "The Career Desk",
  projects: "Shipped & Shipping",
  education: "Credentials",
  achievements: "Citations & Honors",
  skills: "The Stack",
  codingProfiles: "The Directory",
};

const SECTION_WORDS = {
  experience: "role",
  projects: "project",
  education: "credential",
  achievements: "highlight",
  skills: "skill",
  codingProfiles: "profile",
};

const PRESENT = /^(present|current|now|ongoing)$/i;

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// " – " with nothing either side is worse than no line at all.
function dateRange(start, end) {
  return [start, end].map((v) => (v || "").trim()).filter(Boolean).join(" – ");
}

// Base type sizes, in `vh` so they track the window, each multiplied by
// `--np-fit` — the multiplier FitToPage measures at runtime. The base only has
// to be in the right neighbourhood; the fit does the rest.
//
// What used to be here was a weight model that derived sizes from character and
// entry counts. It is gone on purpose. It could not be made correct: it clipped
// real sentences on some window sizes and left a third of the page blank on
// others, and one tier boundary alone cost 22% of the page. Measuring beats
// predicting. See FitToPage.js.
const FIT = (base, min, max) => `calc(clamp(${min}, ${base}vh, ${max}) * var(--np-fit))`;

const SIZES = {
  body: FIT(1.45, "7px", "15px"),
  title: FIT(1.85, "9.5px", "19px"),
  meta: FIT(0.92, "6px", "10px"),
  entry: FIT(0.95, "0.35rem", "1.35rem"),
  bullet: FIT(0.44, "0.14rem", "0.55rem"),
  gap: FIT(2.0, "0.7rem", "2.6rem"),
  colGap: FIT(1.7, "1rem", "2.3rem"),
};

// CONTAINER queries, not viewport ones, and that distinction matters here.
// The editor renders this template inside a ~735px split pane while the window
// is 1512px wide, so a `lg:` breakpoint (which reads the WINDOW) fired and
// packed five columns into that pane at ~130px each — enough to hyphenate
// "capabili-ties". `@container` measures the template's own box instead, so the
// same code gives two columns in the editor pane and five on the full page.
//
// Tailwind's scanner needs literal class strings, not an interpolated
// `columns-${n}`, hence the lookup. The tier caps the maximum; the container
// width decides how many of those are actually reached.
const COLUMN_CLASS =
  "columns-1 @xl:columns-2 @4xl:columns-3 @6xl:columns-4 @7xl:columns-5";

// Protects a heading from being split from the copy beneath it. The ONLY break
// control in the body flow; everything else may break freely.
const KEEP_WITH_NEXT = { breakAfter: "avoid", breakInside: "avoid" };

function Kicker({ children, color = MUTED, className = "" }) {
  return (
    <span
      className={`${mono.className} block text-[8.5px] font-medium uppercase leading-none tracking-[0.18em] ${className}`}
      style={{ color }}
    >
      {children}
    </span>
  );
}

// A photo in newspaper jargon is a "cut". Clean and full-colour: the previous
// grayscale-plus-dot-mesh screening was authentic to 1935 letterpress and
// exactly why the page read as an antique.
function NewsCut({ src, alt, caption, className = "", aspect }) {
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || ""} className="block w-full object-cover" style={{ aspectRatio: aspect }} />
      {caption && (
        <figcaption
          className={`${mono.className} mt-1.5 text-[8px] uppercase leading-snug tracking-[0.11em]`}
          style={{ color: FAINT }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function InitialsCut({ name, className = "" }) {
  return (
    <div className={`flex aspect-square items-center justify-center ${className}`} style={{ backgroundColor: "#f2f2f2" }}>
      <span className={`${display.className} text-4xl font-black leading-none`} style={{ color: INK }}>
        {initials(name)}
      </span>
    </div>
  );
}

// Section heading: red kicker over a bold serif label. Title case, no rule —
// the space is the separator.
function SectionHeading({ id, label, kicker, count, word, large, first }) {
  return (
    <div
      id={`section-${id}`}
      className={`scroll-mt-8 ${first ? "" : "mt-[var(--np-section)]"} mb-[var(--np-head)]`}
      style={KEEP_WITH_NEXT}
    >
      <Kicker color={RED}>{kicker}</Kicker>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <h2
          className={`${display.className} break-words font-black leading-[1.05] tracking-[-0.015em] ${
            large ? "text-[19px] lg:text-[21px]" : "text-[16px] lg:text-[17px]"
          }`}
          style={{ color: INK }}
        >
          {label}
        </h2>
        {count > 0 && (
          <span
            className={`${mono.className} text-[8px] uppercase tracking-[0.13em]`}
            style={{ color: FAINT }}
          >
            {plural(count, word)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function NewspaperTemplate({ data }) {
  const {
    name,
    role,
    bio,
    email,
    links,
    photoUrl,
    skills,
    codingProfiles,
    experience,
    education,
    achievements,
    projects,
    sectionOrder,
  } = data;

  const yearsXp = computeYearsOfExperience(experience);
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
  const allStartYears = [...(experience || []), ...(education || [])].map((x) => parseYear(x.start)).filter(Boolean);
  const estYear = allStartYears.length ? Math.min(...allStartYears) : null;

  // The current post if one is open-ended, else the most recent listed. Feeds
  // the deck and byline only; Experience still tells the whole story.
  const jobs = experience || [];
  const leadJob = jobs.find((job) => PRESENT.test((job.end || "").trim())) || jobs[0] || null;
  const leadIsCurrent = leadJob ? PRESENT.test((leadJob.end || "").trim()) : false;
  // Trailing stop trimmed first: a company already ending in a period
  // ("Analytical Engines Inc.") otherwise renders a double stop.
  const leadCompany = (leadJob?.company || "").trim().replace(/[.,;:]+$/, "");
  const deck = leadCompany
    ? `${leadIsCurrent ? "Currently" : "Most recently"} at ${leadCompany}.${
        yearsXp > 0 ? ` ${plural(yearsXp, "year")} in the field.` : ""
      }`
    : yearsXp > 0
      ? `${plural(yearsXp, "year")} in the field.`
      : "";

  const counts = {
    experience: jobs.length,
    projects: projects?.length || 0,
    education: education?.length || 0,
    achievements: achievements?.length || 0,
    skills: skills?.length || 0,
    codingProfiles: codingProfiles?.length || 0,
  };

  const ctaLinks = [
    email && { label: "Email", value: email, href: `mailto:${email}`, Icon: IconMail },
    links?.github && {
      label: "GitHub",
      value: stripProtocol(links.github),
      href: `https://${stripProtocol(links.github)}`,
      Icon: IconGithub,
    },
    links?.linkedin && {
      label: "LinkedIn",
      value: stripProtocol(links.linkedin),
      href: `https://${stripProtocol(links.linkedin)}`,
      Icon: IconLinkedin,
    },
    links?.website && {
      label: "Website",
      value: stripProtocol(links.website),
      href: `https://${stripProtocol(links.website)}`,
      Icon: IconLink,
    },
  ].filter(Boolean);

  // Mobile keeps a fixed readable size; only lg and up switch to the
  // density-derived sizes, since only lg and up have the fixed height budget.
  const prose =
    "whitespace-pre-line break-words text-justify text-[13px] leading-[1.55] lg:text-[length:var(--np-body)] lg:leading-[var(--np-lead)]";
  const fragment =
    "whitespace-pre-line break-words text-[13px] leading-[1.55] lg:text-[length:var(--np-body)] lg:leading-[var(--np-lead)]";
  const entryTitle = `${display.className} break-words font-bold leading-[1.2] text-[15px] lg:text-[length:var(--np-title)]`;
  const entryMeta = `${mono.className} mt-1 break-words font-medium uppercase tracking-[0.12em] text-[9px] lg:text-[length:var(--np-meta)]`;
  const linkClass = "underline decoration-1 underline-offset-2 transition-opacity hover:opacity-60";
  const entryShell = "mb-4 lg:mb-[var(--np-entry)]";
  const bulletGap = "mt-2 space-y-2 lg:mt-[var(--np-bullet)] lg:[&>*+*]:mt-[var(--np-bullet)] lg:space-y-0";

  // Entries are standalone nodes rendered as direct children of the one column
  // flow. Direct childhood matters: `break-after` only behaves reliably on
  // immediate children of the multicol container, which is why sections render
  // as fragments rather than wrappers.
  const sectionEntries = {
    experience: jobs.map((job, i) => {
      const when = dateRange(job.start, job.end);
      return (
        <article key={`xp-${i}`} className={entryShell}>
          <div style={KEEP_WITH_NEXT}>
            <h3 className={entryTitle} style={{ color: INK }}>
              {job.role || "Role"}
            </h3>
            {(job.company || when) && (
              <p className={entryMeta} style={{ color: RED }}>
                {[job.company, when].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {job.bullets?.length > 0 && (
            <div className={bulletGap} style={{ color: INK_SOFT, hyphens: "auto" }}>
              {job.bullets.map((b, j) => (
                <p key={j} className={prose}>
                  {b}
                </p>
              ))}
            </div>
          )}
        </article>
      );
    }),

    projects: (projects || []).map((project, i) => (
      <article key={`pj-${i}`} className={entryShell}>
        <div style={KEEP_WITH_NEXT}>
          {project.image && (
            <NewsCut src={project.image} alt={project.name || "Project"} className="mb-2" aspect="16 / 10" />
          )}
          <h3 className={entryTitle} style={{ color: INK }}>
            {project.name || "Project"}
          </h3>
          <p className={entryMeta} style={{ color: RED }}>
            {[project.status || "Independent", project.version && `v${project.version}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        {project.description && (
          <p className={`mt-2 ${prose}`} style={{ color: INK_SOFT, hyphens: "auto" }}>
            {project.description}
          </p>
        )}
        {project.highlights?.length > 0 && (
          <ul className={bulletGap}>
            {project.highlights.map((h, j) => (
              <li
                key={j}
                className="flex gap-1.5 italic text-[12px] leading-[1.45] lg:text-[length:var(--np-body)] lg:leading-[var(--np-lead)]"
                style={{ color: MUTED }}
              >
                <span aria-hidden style={{ color: RED }}>
                  &mdash;
                </span>
                <span className="break-words">{h}</span>
              </li>
            ))}
          </ul>
        )}
        {project.tags?.length > 0 && (
          <p
            className={`${mono.className} mt-2 break-words uppercase tracking-[0.11em] text-[8.5px] lg:text-[length:var(--np-meta)]`}
            style={{ color: FAINT }}
          >
            {project.tags.join(" · ")}
          </p>
        )}
        {(project.link || project.demo) && (
          <p
            className={`${mono.className} mt-1.5 font-medium uppercase tracking-[0.12em] text-[9px] lg:text-[length:var(--np-meta)]`}
          >
            {project.link && (
              <a href={`https://${stripProtocol(project.link)}`} className={linkClass} style={{ color: RED }}>
                Source
              </a>
            )}
            {project.link && project.demo && <span className="mx-1.5" style={{ color: FAINT }}>&middot;</span>}
            {project.demo && (
              <a href={`https://${stripProtocol(project.demo)}`} className={linkClass} style={{ color: RED }}>
                Live site
              </a>
            )}
          </p>
        )}
      </article>
    )),

    education: (education || []).map((edu, i) => {
      const when = dateRange(edu.start, edu.end);
      return (
        <article key={`ed-${i}`} className={entryShell} style={{ breakInside: "avoid" }}>
          <h3
            className="break-words font-semibold leading-[1.25] text-[14px] lg:text-[length:var(--np-title)]"
            style={{ color: INK }}
          >
            {edu.degree || "Degree"}
          </h3>
          {(edu.school || when) && (
            <p className={entryMeta} style={{ color: RED }}>
              {[edu.school, when].filter(Boolean).join(" · ")}
            </p>
          )}
        </article>
      );
    }),

    achievements: (achievements || []).map((item, i) => (
      <div key={`ac-${i}`} className={`${entryShell} flex gap-2`} style={{ breakInside: "avoid" }}>
        <span
          className={`${mono.className} shrink-0 pt-[2px] font-bold tabular-nums text-[9px] lg:text-[length:var(--np-meta)]`}
          style={{ color: RED }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <p className={fragment} style={{ color: INK_SOFT }}>
          {item}
        </p>
      </div>
    )),

    // A single flowing index line, middot-separated. The ruled grid this
    // replaced left a gap between every column and a ragged blank strip on the
    // right; inline text packs with no gaps at all and reads like a paper's
    // market listing.
    skills:
      skills?.length > 0
        ? [
            <p key="skills" className={`${entryShell} break-words ${prose.replace("text-justify", "")}`} style={{ color: INK_SOFT }}>
              {skills.map((skill, i) => (
                <Fragment key={skill}>
                  {i > 0 && (
                    <span aria-hidden style={{ color: FAINT }}>
                      {" · "}
                    </span>
                  )}
                  {skill}
                </Fragment>
              ))}
            </p>,
          ]
        : [],

    codingProfiles: (codingProfiles || []).map((profile, i) => (
      <a
        key={`cp-${i}`}
        href={`https://${stripProtocol(profile.url)}`}
        className={`${entryShell} group block`}
        style={{ breakInside: "avoid" }}
      >
        <span
          className="break-words font-semibold text-[14px] lg:text-[length:var(--np-title)]"
          style={{ color: INK }}
        >
          {profile.platform}
        </span>
        <span
          className={`${mono.className} mt-0.5 block uppercase tracking-[0.12em] transition-opacity group-hover:opacity-60 text-[9px] lg:text-[length:var(--np-meta)]`}
          style={{ color: RED }}
        >
          {stripProtocol(profile.url)} &rarr;
        </span>
      </a>
    )),
  };

  const order = (sectionOrder || []).filter((id) => sectionEntries[id]?.length > 0);

  return (
    <div
      className={`${display.variable} ${serif.variable} ${mono.variable} @container min-h-dvh`}
      style={{ backgroundColor: PAPER }}
    >
      <FitToPage
        measure="[data-np-flow]"
        className={`${serif.className} mx-auto flex w-full max-w-[1560px] flex-col px-5 py-4 sm:px-8 @6xl:h-dvh @6xl:overflow-hidden @6xl:px-10 @6xl:py-5`}
        style={{
          // Consumed by the lg: variants throughout. Kept as variables rather
          // than inline font sizes so mobile can opt out of page-fitting.
          "--np-fit": "1",
          "--np-body": SIZES.body,
          // The standfirst. Derived from the body size rather than set
          // independently so it keeps its proportion at every fit value.
          "--np-lede": "calc(var(--np-body) * 1.38)",
          "--np-lead": "1.45",
          "--np-title": SIZES.title,
          "--np-meta": SIZES.meta,
          "--np-entry": SIZES.entry,
          "--np-bullet": SIZES.bullet,
          "--np-section": SIZES.gap,
          "--np-head": "0.5rem",
        }}
      >
        {/* Folio line */}
        <div
          className={`${mono.className} flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[8.5px] uppercase tracking-[0.18em]`}
          style={{ color: FAINT }}
        >
          <span>{today}</span>
          <span className="hidden sm:inline">Portfolio Edition</span>
          <span>{estYear ? `Est. ${estYear}` : " "}</span>
        </div>

        {/* Nameplate. The customer's name IS the paper's masthead. RULE 1 OF 2
            sits beneath it. */}
        <h1
          className={`${display.className} mt-2.5 break-words text-center text-[2.1rem] font-black uppercase leading-[0.88] tracking-[-0.03em] sm:text-[3.2rem] lg:text-[clamp(2.2rem,6.4vh,4.4rem)]`}
          style={{ color: INK }}
        >
          {name || "Your Name"}
        </h1>
        <div className="mt-3" style={{ borderTop: `1px solid ${RULE}` }} />

        {/* THE FOLD. A front page's masthead area: one big headline beside
            one cut, and nothing else. The summary is NOT here — it is the lede
            paragraph in the first body column, which is where a newspaper puts
            its story text.

            That placement is the point. Held up here beside the picture, a
            two-line summary had nowhere good to go: run full width and it set a
            200-character line; capped, it left a ~840px band of blank
            newsprint; and split into two columns it broke a single sentence
            across two one-line stubs. In a body column it is simply a
            paragraph, at a proper measure, drop cap and all — and the space it
            used to leave beside the cut is now taken by a headline big enough
            to earn it. */}
        <div className="mt-3.5 flex flex-col gap-x-9 gap-y-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <Kicker color={RED}>{leadIsCurrent ? "In the role" : "Latest dispatch"}</Kicker>
            <h2
              className={`${display.className} mt-2.5 break-words text-[1.9rem] font-black leading-[1.0] tracking-[-0.03em] sm:text-[2.6rem] @6xl:text-[clamp(2.2rem,8.4vh,5rem)]`}
              style={{ color: INK }}
            >
              {role || "Your Role"}
            </h2>
            {deck && (
              <p
                className={`${display.className} mt-3 break-words text-base italic leading-snug @6xl:text-[clamp(0.9rem,2.3vh,1.35rem)]`}
                style={{ color: MUTED }}
              >
                {deck}
              </p>
            )}
            <p
              className={`${mono.className} mt-2.5 text-[8.5px] uppercase tracking-[0.16em] @6xl:text-[length:var(--np-meta)]`}
              style={{ color: FAINT }}
            >
              By {name || "Your Name"}
              {leadJob?.company && (
                <>
                  <span className="mx-2" style={{ color: "#d4d4d4" }}>
                    &middot;
                  </span>
                  {leadJob.company} Bureau
                </>
              )}
            </p>
          </div>

          <div className="w-24 shrink-0 sm:w-28 lg:w-[clamp(7rem,17vh,12rem)]">
            {photoUrl ? (
              <NewsCut
                src={photoUrl}
                alt={name ? `${name}, ${role || "portrait"}` : "Portrait"}
                aspect="1 / 1"
                caption={[name, role].filter(Boolean).join(", ")}
              />
            ) : (
              <InitialsCut name={name} />
            )}
          </div>
        </div>

        {/* Inside this edition — a front page's index, set as press furniture
            rather than app-style nav chips. Contact details live only in the
            sign-off; repeating them here was pure duplication. */}
        {order.length > 0 && (
          <nav className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5" aria-label="Sections">
            <Kicker color={RED} className="shrink-0">
              Inside
            </Kicker>
            {order.map((id, i) => (
              <a
                key={id}
                href={`#section-${id}`}
                className={`${mono.className} text-[8.5px] uppercase tracking-[0.14em] transition-opacity hover:opacity-60`}
                style={{ color: INK_SOFT }}
              >
                <span className="mr-1 tabular-nums" style={{ color: FAINT }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {SECTION_LABELS[id]}
              </a>
            ))}
          </nav>
        )}

        {/* THE BODY — one continuous flow, and the flex child that absorbs all
            remaining height. `min-h-0` is what allows it to shrink inside the
            flex column instead of forcing the page taller than the viewport. */}
        {order.length > 0 && (
          <div
            data-np-flow
            className={`mt-5 @6xl:mt-3 @6xl:min-h-0 @6xl:flex-1 @6xl:overflow-hidden ${COLUMN_CLASS}`}
            style={{ columnGap: SIZES.colGap, orphans: 2, widows: 2 }}
          >
            {bio && (
              <p
                className="mb-[calc(var(--np-entry)*1.7)] whitespace-pre-line break-words text-[14.5px] font-semibold leading-[1.5] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.2rem] first-letter:font-black first-letter:leading-[0.7] first-letter:text-[#c8102e] first-letter:[font-family:var(--np-display)] @6xl:text-[length:var(--np-lede)] @6xl:first-letter:text-[clamp(2.2rem,7vh,4rem)]"
                style={{ color: INK, hyphens: "auto" }}
              >
                {bio}
              </p>
            )}
            {order.map((id, i) => (
              <Fragment key={id}>
                <SectionHeading
                  id={id}
                  label={SECTION_LABELS[id]}
                  kicker={SECTION_KICKERS[id]}
                  count={counts[id]}
                  word={SECTION_WORDS[id]}
                  large={i === 0}
                  first={i === 0}
                />
                {sectionEntries[id]}
              </Fragment>
            ))}
          </div>
        )}

        {/* Sign-off. RULE 2 OF 2. One compact strip: the separate CTA block and
            footer were two stacked bands of mostly-empty page. */}
        <footer
          className="mt-4 flex shrink-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-2.5 @6xl:mt-3"
          style={{ borderTop: `1px solid ${RULE}` }}
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={`${display.className} text-[15px] font-black tracking-[-0.01em]`} style={{ color: INK }}>
              Get in touch
            </span>
            <span className="text-[11px]" style={{ color: MUTED }}>
              Open to new opportunities{role ? ` as a ${role}` : ""}.
            </span>
          </div>
          {ctaLinks.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {ctaLinks.map(({ label, value, href, Icon }) => (
                <a key={href} href={href} className="group flex min-w-0 items-center gap-1.5">
                  <Icon className="h-3 w-3 shrink-0" style={{ color: RED }} />
                  <span
                    className={`${mono.className} break-words text-[9px] uppercase tracking-[0.12em] transition-opacity group-hover:opacity-60`}
                    style={{ color: INK_SOFT }}
                  >
                    {label === "Email" ? value : label}
                  </span>
                </a>
              ))}
            </div>
          )}
          <span className={`${mono.className} text-[8px] uppercase tracking-[0.14em]`} style={{ color: FAINT }}>
            &copy; {new Date().getFullYear()} {name || "Your Name"} &middot; Made with Dev Portfolio Builder
          </span>
        </footer>
      </FitToPage>
    </div>
  );
}
