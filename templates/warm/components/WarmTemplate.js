// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
/* eslint-disable @next/next/no-img-element */

import { Fragment } from "react";
import { Fredoka, Figtree } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { WARM_PALETTES, getPalette } from "@/lib/palettes";
import { IconGithub, IconLinkedin, IconLink, IconMail, initials, stripProtocol, dotColor, tint, shade, hexToRgb } from "./shared";
import CursorGlow from "./CursorGlow";

// Fredoka's rounded terminals carry the "warm and personal" feel in the
// headlines; Figtree keeps body copy clean and readable rather than also
// leaning playful, so the page doesn't read as childish at paragraph length.
const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const SECTION_DEFS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s]));

// Friendlier phrasing than Editorial's newsy labels, and a small emoji per
// section — this template's whole point is to read as a person, not a
// publication.
const SECTION_LABELS = {
  skills: "Things I enjoy working with",
  codingProfiles: "Where I practice",
  experience: "Where I've worked",
  education: "Where I studied",
  achievements: "A few highlights",
  projects: "Things I've built",
};

const SECTION_EMOJI = {
  skills: "✨",
  codingProfiles: "💻",
  experience: "💼",
  education: "🎓",
  achievements: "🏆",
  projects: "🚀",
};

function SectionHeading({ id, children, colors, accent }) {
  return (
    <div id={id} className="mb-7 flex scroll-mt-8 items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base shadow-sm"
        style={{ backgroundColor: tint(accent, 18) }}
      >
        {children.emoji}
      </span>
      <h2 className={`${fredoka.className} break-words text-2xl font-semibold tracking-tight`} style={{ color: colors.INK }}>
        {children.label}
      </h2>
    </div>
  );
}

function Card({ children, colors, className = "" }) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-5 shadow-sm sm:p-6 ${className}`}
      style={{ backgroundColor: tint(colors.INK, 4), borderColor: tint(colors.ACCENT, 18) }}
    >
      {children}
    </div>
  );
}

function TimelineCard({ title, subtitle, start, end, lines, accent, colors }) {
  return (
    <Card colors={colors} className="relative overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: accent }} />
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 pl-2">
        <div className="min-w-0">
          <p className={`${fredoka.className} break-words text-base font-semibold`} style={{ color: colors.INK }}>
            {title}
          </p>
          {subtitle && (
            <p className="break-words text-sm" style={{ color: colors.MUTED }}>
              {subtitle}
            </p>
          )}
        </div>
        <span
          className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: tint(accent, 16), color: accent }}
        >
          {start} — {end}
        </span>
      </div>
      {lines?.length > 0 && (
        <div className="mt-3 space-y-1.5 pl-2">
          {lines.map((line, i) => (
            <p key={i} className="flex min-w-0 gap-2 text-[14.5px] leading-relaxed" style={{ color: colors.INK }}>
              <span className="shrink-0" style={{ color: accent }}>
                ●
              </span>
              <span className="min-w-0 whitespace-pre-line break-words">{line}</span>
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}

function ContactPill({ href, icon, label, colors, filled }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
      style={
        filled
          ? { backgroundColor: colors.POP, color: colors.PAPER }
          : { backgroundColor: tint(colors.INK, 4), color: colors.INK, border: `1px solid ${tint(colors.ACCENT, 25)}` }
      }
    >
      <span style={filled ? undefined : { color: colors.ACCENT }}>{icon}</span>
      {label}
    </a>
  );
}

function ChipRow({ items, getKey, getLabel, getColor, href, colors }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => {
        const label = getLabel(item);
        const color = getColor(item);
        const chipClass = "flex min-w-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold";
        const chipStyle = { backgroundColor: tint(color, 16), color: colors.INK };
        return href ? (
          <a key={getKey(item)} href={href(item)} className={chipClass} style={chipStyle}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="break-words">{label}</span>
          </a>
        ) : (
          <span key={getKey(item)} className={chipClass} style={chipStyle}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="break-words">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function WarmTemplate({ data }) {
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

  const palette = getPalette("warm", data.paletteId) || WARM_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE } = colors;

  const firstName = (name || "there").trim().split(/\s+/)[0];

  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, icon: <IconMail className="h-4 w-4" /> },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, icon: <IconGithub className="h-4 w-4" /> },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, icon: <IconLinkedin className="h-4 w-4" /> },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, icon: <IconLink className="h-4 w-4" /> },
  ].filter(Boolean);

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js) — the
  // customer's drag-and-drop order in the editor picks which of these
  // render, and in what sequence.
  const sections = {
    skills: skills?.length > 0 && (
      <ChipRow items={skills} getKey={(s) => s} getLabel={(s) => s} getColor={dotColor} colors={colors} />
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <ChipRow
        items={codingProfiles}
        getKey={(p, i) => p.platform + i}
        getLabel={(p) => p.platform}
        getColor={(p) => dotColor(p.platform)}
        href={(p) => `https://${stripProtocol(p.url)}`}
        colors={colors}
      />
    ),

    experience: experience?.length > 0 && (
      <div className="space-y-4">
        {experience.map((job, i) => (
          <TimelineCard
            key={i}
            title={`${job.role} @ ${job.company}`}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {education.map((edu, i) => (
          <TimelineCard
            key={i}
            title={edu.degree || "Degree"}
            subtitle={edu.school}
            start={edu.start}
            end={edu.end}
            accent={PALETTE[(i + 1) % PALETTE.length]}
            colors={colors}
          />
        ))}
      </div>
    ),

    achievements: achievements?.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {achievements.map((item, i) => {
          const accent = PALETTE[i % PALETTE.length];
          return (
            <div key={i} className="flex min-w-0 items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: tint(INK, 4), borderColor: tint(ACCENT, 18) }}>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                style={{ backgroundColor: tint(accent, 20) }}
              >
                ★
              </span>
              <span className="min-w-0 break-words pt-1 text-[14.5px] leading-relaxed" style={{ color: INK }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    ),

    projects: projects?.length > 0 && (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const accent = PALETTE[i % PALETTE.length];
          return (
            <div
              key={i}
              className="flex min-w-0 flex-col overflow-hidden rounded-3xl border shadow-sm transition-transform hover:-translate-y-1"
              style={{ backgroundColor: tint(INK, 4), borderColor: tint(ACCENT, 18) }}
            >
              {project.image ? (
                <img src={project.image} alt={project.name} className="h-40 w-full object-cover" />
              ) : (
                <div
                  className="flex h-28 w-full items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent, 25)})` }}
                >
                  🛠️
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className={`${fredoka.className} break-words text-lg font-semibold`} style={{ color: INK }}>
                  {project.name || "Project name"}
                </h3>
                <p className="mt-2 min-w-0 whitespace-pre-line break-words text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  {project.description}
                </p>
                {project.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="break-words rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: tint(dotColor(tag), 18), color: INK }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <p className="mt-auto flex gap-4 pt-4 text-sm font-bold">
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} style={{ color: accent }}>
                        Code
                      </a>
                    )}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} style={{ color: accent }}>
                        Live
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ),
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sections[id]);

  return (
    <div className={`relative min-h-dvh overflow-hidden ${figtree.className}`} style={{ backgroundColor: PAPER, color: INK }}>
      {/* Ambient blobs — a static, layered backdrop rather than a flat
          color, so the wide page doesn't read as empty around the centered
          content. Contained by the root's overflow-hidden; nothing in this
          template needs position: sticky, so that's safe here (unlike
          Editorial's sidebar). */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: PALETTE[0] }} />
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl" style={{ backgroundColor: PALETTE[1] }} />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: PALETTE[2] }} />
      <CursorGlow colorRgb={hexToRgb(POP)} size={550} />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-20">
        {/* Hero */}
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-4 rounded-full opacity-50 blur-xl"
              style={{ background: `linear-gradient(135deg, ${POP}, ${PALETTE[1]})` }}
            />
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name || "Portrait"}
                className="relative h-32 w-32 rounded-full object-cover shadow-xl"
              />
            ) : (
              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full text-4xl font-semibold shadow-xl"
                style={{ background: `linear-gradient(135deg, ${POP}, ${shade(POP, 25)})`, color: PAPER }}
              >
                {initials(name)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className={`${fredoka.className} break-words text-4xl font-semibold tracking-tight sm:text-5xl`} style={{ color: INK }}>
              Hi, I&rsquo;m {firstName} 👋
            </h1>
            <span
              className="mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: tint(POP, 16), color: POP }}
            >
              {role || "Your Role"}
            </span>
          </div>

          <p className="max-w-xl break-words text-[17px] leading-relaxed" style={{ color: INK_SOFT }}>
            {bio}
          </p>

          {contactItems.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {contactItems.map((item, i) => (
                <ContactPill key={item.href} {...item} colors={colors} filled={i === 0} />
              ))}
            </div>
          )}
        </header>

        {/* Sections, in the customer's chosen order */}
        <div className="mt-20 space-y-20">
          {visibleIds.map((id, i) => (
            <Fragment key={id}>
              <section>
                <SectionHeading id={`section-${id}`} colors={colors} accent={PALETTE[i % PALETTE.length]}>
                  {{ label: SECTION_LABELS[id] || SECTION_DEFS[id]?.label, emoji: SECTION_EMOJI[id] || "✦" }}
                </SectionHeading>
                {sections[id]}
              </section>
            </Fragment>
          ))}
        </div>

        {/* Closing */}
        <section className="relative mt-20 overflow-hidden rounded-[2.5rem] p-10 text-center" style={{ backgroundColor: tint(POP, 12) }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: PALETTE[1] }} />
          <p className={`${fredoka.className} relative text-2xl font-semibold`} style={{ color: INK }}>
            Say hello 👋
          </p>
          <p className="relative mt-2 text-[15px]" style={{ color: MUTED }}>
            I&rsquo;d love to hear from you — about a role, a project, or just to say hi.
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="relative mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-bold shadow-sm"
              style={{ backgroundColor: POP, color: PAPER }}
            >
              Send me an email
            </a>
          )}
        </section>

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
