// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// No palette picker (see lib/palettes.js) — like Spotify, this template's
// identity is a fixed look: warm newsprint paper plus a fixed set of
// section colors modeled on how real newsrooms color-code their sections
// (Business is always the same blue, Sports the same green, issue to
// issue). Letting a customer recolor it would undercut the "looks like a
// real paper" goal the same way it would for Spotify's black-and-green.
//
// The body is a single CSS multi-column flow (like real newsprint columns,
// ruled apart) rather than a grid/flex-wrap of section cards — a grid or
// flex-wrap row is only ever as tight as its tallest item per row, which is
// exactly what left ugly gaps next to short sections. Columns instead
// refill top-to-bottom automatically, so there's never leftover space
// unless the content itself runs out.

import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  dotColor,
  initials,
  stripProtocol,
  parseYear,
  computeYearsOfExperience,
} from "./shared";
import CursorGlow from "./CursorGlow";

const masthead = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], style: ["normal", "italic"] });
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"] });

const PAPER = "#faf8f3";
const INK = "#18140f";
const INK_SOFT = "#3d362e";
const MUTED = "#8a8078";
const RED = "#c8102e";

// Fixed per-section colors — the whole point is that "Business" is always
// the same blue issue to issue, not a color that shuffles with sectionOrder.
const SECTION_COLORS = {
  experience: "#c8102e",
  projects: "#0057b8",
  education: "#0f8a6f",
  achievements: "#d69a00",
  skills: "#7b2cbf",
  codingProfiles: "#e8542e",
};

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));
const SECTION_WORDS = {
  experience: "role",
  projects: "project",
  education: "credential",
  achievements: "highlight",
  skills: "skill",
  codingProfiles: "profile",
};

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// A section's masthead within the column flow: flag bar, caps headline,
// hairline rule.
function SectionFlag({ label, color, count, word }) {
  return (
    <div>
      <span className="block h-[3px] w-8" style={{ backgroundColor: color }} />
      <h2 className={`${masthead.className} mt-1.5 break-words text-base font-black uppercase leading-tight tracking-tight sm:text-lg`} style={{ color: INK }}>
        {label}
        {count > 0 && (
          <span className="ml-2 text-[10px] font-semibold normal-case tracking-normal" style={{ color: MUTED }}>
            ({plural(count, word)})
          </span>
        )}
      </h2>
      <div className="mt-1 h-px w-full" style={{ backgroundColor: "rgba(0,0,0,0.18)" }} />
    </div>
  );
}

// Renders one section as: [heading + first entry] glued together as one
// unbreakable unit (so a column break can never separate a heading from all
// of its content — the previous bug), followed by any remaining entries
// flowing freely into later columns like a real continued newspaper column.
// Forcing the *whole* section to stay together instead (the first attempt
// at fixing that bug) backfired: a long Experience block dragged the
// balanced column height up so far that the short remaining sections filled
// only 1-2 of the 4 available columns, leaving the rest empty.
function Section({ label, color, count, word, entries }) {
  const [first, ...rest] = entries;
  return (
    <>
      <div className="break-inside-avoid">
        <SectionFlag label={label} color={color} count={count} word={word} />
        <div className="mt-2.5">{first}</div>
      </div>
      {rest.length > 0 && <div className="mt-3 space-y-3">{rest}</div>}
    </>
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
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();
  const allStartYears = [...(experience || []), ...(education || [])].map((x) => parseYear(x.start)).filter(Boolean);
  const estYear = allStartYears.length ? Math.min(...allStartYears) : null;

  const contactItems = [
    email && { label: email, href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  const ctaLinks = [
    email && { label: "Email", value: email, href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", value: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", value: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", value: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  const counts = {
    experience: experience?.length || 0,
    projects: projects?.length || 0,
    education: education?.length || 0,
    achievements: achievements?.length || 0,
    skills: skills?.length || 0,
    codingProfiles: codingProfiles?.length || 0,
  };

  // Each section is an array of standalone entry nodes (not one composed
  // block) so Section above can glue the heading to just the first entry
  // and let the rest flow freely across columns.
  const sectionEntries = {
    experience: (experience || []).map((job, i) => (
      <article key={i} className="break-inside-avoid">
        <h3 className="break-words text-[14.5px] font-black leading-snug" style={{ color: INK }}>
          {job.role || "Role"}
        </h3>
        <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wide" style={{ color: SECTION_COLORS.experience }}>
          {job.company} · {job.start} – {job.end}
        </p>
        {job.bullets?.length > 0 && (
          <div className="mt-1 space-y-1 text-[12.5px] leading-snug" style={{ color: INK_SOFT, hyphens: "auto" }}>
            {job.bullets.map((b, j) => (
              <p key={j} className="whitespace-pre-line break-words text-justify">
                {b}
              </p>
            ))}
          </div>
        )}
      </article>
    )),

    projects: (projects || []).map((project, i) => (
      <article key={i} className="break-inside-avoid">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-none border" style={{ borderColor: "rgba(0,0,0,0.15)" }}>
            {project.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: dotColor(project.name || "project") }}
              >
                {initials(project.name || "PJ")}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-[14.5px] font-black leading-tight" style={{ color: INK }}>
              {project.name || "Project"}
            </h3>
            <p className="break-words text-[10px] font-bold uppercase tracking-wide" style={{ color: SECTION_COLORS.projects }}>
              {project.status || "Independent"}
              {project.version ? ` · v${project.version}` : ""}
            </p>
          </div>
        </div>
        {project.description && (
          <p className="mt-1.5 whitespace-pre-line break-words text-justify text-[12.5px] leading-snug" style={{ color: INK_SOFT, hyphens: "auto" }}>
            {project.description}
          </p>
        )}
        {project.highlights?.length > 0 && (
          <div className="mt-1 space-y-0.5 text-[11.5px] italic leading-snug" style={{ color: MUTED }}>
            {project.highlights.map((h, j) => (
              <p key={j} className="break-words">
                — {h}
              </p>
            ))}
          </div>
        )}
        {project.tags?.length > 0 && (
          <p className="mt-1 break-words text-[10.5px]" style={{ color: MUTED }}>
            <span className="font-semibold uppercase tracking-wide">Filed under:</span> {project.tags.join(", ")}
          </p>
        )}
        {(project.link || project.demo) && (
          <p className="mt-1 text-[11.5px] font-semibold">
            {project.link && (
              <a href={`https://${stripProtocol(project.link)}`} className="underline underline-offset-4" style={{ color: SECTION_COLORS.projects }}>
                Source
              </a>
            )}
            {project.link && project.demo && <span className="mx-1.5" style={{ color: MUTED }}>·</span>}
            {project.demo && (
              <a href={`https://${stripProtocol(project.demo)}`} className="underline underline-offset-4" style={{ color: SECTION_COLORS.projects }}>
                Live
              </a>
            )}
          </p>
        )}
      </article>
    )),

    education: (education || []).map((edu, i) => (
      <article key={i} className="break-inside-avoid">
        <p className="break-words text-[13.5px] font-bold leading-snug" style={{ color: INK }}>
          {edu.degree || "Degree"}
        </p>
        <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wide" style={{ color: SECTION_COLORS.education }}>
          {edu.school} · {edu.start} – {edu.end}
        </p>
      </article>
    )),

    achievements: (achievements || []).map((item, i) => (
      <p key={i} className="break-inside-avoid whitespace-pre-line break-words text-justify text-[12.5px] leading-snug" style={{ color: INK_SOFT, hyphens: "auto" }}>
        <span className="mr-1.5 font-bold" style={{ color: SECTION_COLORS.achievements }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        {item}
      </p>
    )),

    skills:
      skills?.length > 0
        ? [
            <p key="skills" className="text-justify text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>
              {skills.map((skill, i) => (
                <span key={skill}>
                  {i > 0 && (
                    <span className="mx-1" style={{ color: "rgba(0,0,0,0.3)" }}>
                      ·
                    </span>
                  )}
                  <span className="break-words font-bold" style={{ color: dotColor(skill) }}>
                    {skill}
                  </span>
                </span>
              ))}
            </p>,
          ]
        : [],

    codingProfiles: (codingProfiles || []).map((profile, i) => (
      <a
        key={i}
        href={`https://${stripProtocol(profile.url)}`}
        className="break-inside-avoid flex items-center justify-between gap-2 border-b py-1 text-[12.5px]"
        style={{ borderColor: "rgba(0,0,0,0.1)" }}
      >
        <span className="break-words font-bold" style={{ color: INK }}>
          {profile.platform}
        </span>
        <span className="shrink-0 truncate text-[10.5px]" style={{ color: MUTED }}>
          {stripProtocol(profile.url)} →
        </span>
      </a>
    )),
  };

  if (yearsXp > 0 && sectionEntries.experience.length > 0) {
    sectionEntries.experience.push(
      <p key="years-xp" className="break-inside-avoid text-[11px] italic" style={{ color: MUTED }}>
        {yearsXp} years of combined experience.
      </p>
    );
  }

  const order = (sectionOrder || []).filter((id) => sectionEntries[id]?.length > 0);

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: PAPER }}>
      <CursorGlow colorRgb="200, 16, 46" size={550} />

      <div className={`${serif.className} relative mx-auto max-w-[1800px] px-5 py-8 sm:px-10 sm:py-10 xl:px-16`}>
        {/* Masthead */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b pb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ borderColor: "rgba(0,0,0,0.15)", color: MUTED }}>
          <span>{today}</span>
          <span>PORTFOLIO EDITION{estYear ? ` · EST. ${estYear}` : ""}</span>
        </div>
        <h1 className={`${masthead.className} mt-2 break-words text-center text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl`} style={{ color: INK }}>
          {name || "Your Name"}
        </h1>
        <p className={`${masthead.className} mt-1.5 break-words text-center text-base italic sm:text-lg`} style={{ color: RED }}>
          {role || "Your Role"}
        </p>
        <div className="mt-2.5 space-y-[3px]">
          <div className="h-[3px] w-full" style={{ backgroundColor: INK }} />
          <div className="h-px w-full" style={{ backgroundColor: INK }} />
        </div>

        {/* Byline / lead — a flex row centered on the photo rather than a
            float, so a short bio still reads as one balanced block instead
            of leaving dead space under a taller floated image. */}
        <div className="mx-auto mt-5 flex max-w-3xl items-center gap-4 sm:gap-5">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="w-20 shrink-0 rounded-none border object-cover sm:w-28"
              style={{ borderColor: "rgba(0,0,0,0.2)" }}
            />
          ) : (
            <div
              className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-none border text-2xl font-black text-white sm:w-28"
              style={{ backgroundColor: dotColor(name || "portfolio"), borderColor: "rgba(0,0,0,0.2)" }}
            >
              {initials(name)}
            </div>
          )}
          <p
            className="min-w-0 flex-1 whitespace-pre-line break-words text-justify text-[14.5px] leading-snug"
            style={{ color: INK_SOFT, hyphens: "auto" }}
          >
            {bio}
          </p>
        </div>

        {contactItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-y py-2.5 text-[11.5px]" style={{ borderColor: "rgba(0,0,0,0.15)" }}>
            {contactItems.map(({ label, href, Icon }) => (
              <a key={href} href={href} className="flex min-w-0 items-center gap-1.5" style={{ color: MUTED }}>
                <Icon className="h-3 w-3 shrink-0" />
                <span className="break-words">{label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Section index — a real front page's "Inside" line, not app-style
            nav chips: plain text, pipe-separated, page numbers optional. */}
        {order.length > 0 && (
          <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
            Inside:{" "}
            {order.map((id, i) => (
              <span key={id}>
                {i > 0 && (
                  <span className="mx-1.5" style={{ color: "rgba(0,0,0,0.25)" }}>
                    |
                  </span>
                )}
                <a href={`#section-${id}`} style={{ color: SECTION_COLORS[id] }} className="hover:underline">
                  {SECTION_LABELS[id]}
                </a>
              </span>
            ))}
          </p>
        )}

        {/* Continuous ruled newsprint columns — every section flows in
            sequence, refilling each column before spilling to the next, so
            there's no leftover gap the way mismatched cards left one. */}
        <div
          className="mt-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5"
          style={{ columnGap: "2rem", columnRule: "1px solid rgba(0,0,0,0.18)" }}
        >
          {order.map((id, i) => (
            <div key={id} id={`section-${id}`} className={`scroll-mt-10 ${i === 0 ? "" : "mt-5"}`}>
              <Section label={SECTION_LABELS[id]} color={SECTION_COLORS[id]} count={counts[id]} word={SECTION_WORDS[id]} entries={sectionEntries[id]} />
            </div>
          ))}
        </div>

        {/* Closing — a compact masthead-style strip, not a big CTA card. */}
        <section className="mt-6 border-y-2 py-3" style={{ borderColor: INK }}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h2 className={`${masthead.className} break-words text-base font-black uppercase tracking-tight`} style={{ color: INK }}>
                Get In Touch
              </h2>
              <p className="break-words text-[11px]" style={{ color: MUTED }}>
                Open to new opportunities{role ? ` as a ${role}` : ""}.
              </p>
            </div>
            {ctaLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {ctaLinks.map(({ label, value, href, Icon }) => (
                  <a key={href} href={href} className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: INK_SOFT }}>
                    <Icon className="h-3 w-3 shrink-0" style={{ color: RED }} />
                    <span className="break-words">{label === "Email" ? value : label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-6 border-t pt-4 text-[11px]" style={{ borderColor: "rgba(0,0,0,0.15)", color: MUTED }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </div>
    </div>
  );
}
