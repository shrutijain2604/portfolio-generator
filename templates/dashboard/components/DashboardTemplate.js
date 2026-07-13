// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Every chart here is a real aggregate of what the user entered — project
// status counts, tag frequency across projects, years of experience — not
// an invented metric. None of the stat/KPI cards render a bare "0": each
// one only appears when there's a genuine non-zero value behind it, and a
// row with nothing to show doesn't render at all.

import { Fragment } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { DASHBOARD_PALETTES, getPalette } from "@/lib/palettes";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  dotColor,
  initials,
  stripProtocol,
  computeYearsOfExperience,
  tint,
  hexToRgb,
} from "./shared";
import CursorGlow from "./CursorGlow";
import SidebarNav from "./SidebarNav";
import LiveSynced from "./LiveSynced";
import RevealOnScroll from "./RevealOnScroll";

// Space Grotesk's geometric, slightly technical character reads as "data" —
// used for numbers and headings; Inter keeps body copy neutral and dense,
// the way an actual analytics product's UI does.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const SECTION_DEFS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s]));

// Status colors are a semantic convention (green = active), not a brand
// choice — kept fixed rather than tied to the chosen palette, the same way
// a real dashboard's success/warning colors don't change with its theme.
function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "#10b981";
  if (s === "archived") return "#94a3b8";
  return "#f59e0b";
}

function countBy(items, keyFn) {
  const counts = new Map();
  (items || []).forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// flex-1 + a min-width, not a fixed grid column count — so 1, 2, 3 or 4
// stat cards all fill the row proportionally instead of a partial row
// leaving a dangling gap on one side.
function StatCard({ label, value, accent, colors }) {
  return (
    <div
      className="min-w-[150px] flex-1 rounded-2xl border p-4"
      style={{ backgroundColor: tint(accent, 10), borderColor: tint(accent, 24) }}
    >
      <p className="break-words text-xs font-medium uppercase tracking-wide" style={{ color: colors.MUTED }}>
        {label}
      </p>
      <p className={`${spaceGrotesk.className} mt-1.5 break-words text-3xl font-bold`} style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function Widget({ id, title, icon: Icon, accent, colors, children, className = "" }) {
  return (
    <div
      id={id}
      className={`min-w-0 scroll-mt-6 rounded-2xl border p-5 shadow-sm sm:p-6 ${className}`}
      style={{ backgroundColor: tint(colors.INK, 3), borderColor: tint(colors.ACCENT, 14) }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        {Icon && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint(accent || colors.ACCENT, 16), color: accent || colors.ACCENT }}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h3 className={`${spaceGrotesk.className} min-w-0 break-words text-sm font-semibold`} style={{ color: colors.INK }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function BarRow({ label, count, max, color, colors }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs" style={{ color: colors.MUTED }}>
        <span className="min-w-0 truncate">{label}</span>
        <span className={`${spaceGrotesk.className} shrink-0`} style={{ color: colors.INK_SOFT }}>
          {count}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: tint(colors.INK, 8) }}>
        <div className="dashboard-bar-fill h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function IconBriefcase(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconGraduationCap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </svg>
  );
}

function IconFolder(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5 15 9l7 1-5.2 5 1.3 7-6.1-3.4L5.9 22l1.3-7L2 10l7-1 3-6.5Z" />
    </svg>
  );
}

function IconTrophy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.2M17 5h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.2" />
    </svg>
  );
}

const SECTION_ICONS = {
  experience: IconBriefcase,
  education: IconGraduationCap,
  projects: IconFolder,
  skills: IconStar,
  codingProfiles: IconLink,
  achievements: IconTrophy,
};

export default function DashboardTemplate({ data }) {
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

  const palette = getPalette("dashboard", data.paletteId) || DASHBOARD_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE } = colors;

  // Falls back to a raw job count when the dates don't parse into whole
  // years (e.g. missing or free-text dates) — still real, still non-zero
  // when there's real experience, still hidden entirely when there isn't.
  const computedYears = computeYearsOfExperience(experience);
  const experienceStat = computedYears > 0 ? computedYears : experience?.length || 0;

  const statItems = [
    experienceStat > 0 && { label: "Years experience", value: experienceStat },
    projects?.length > 0 && { label: "Projects shipped", value: projects.length },
    skills?.length > 0 && { label: "Skills", value: skills.length },
    achievements?.length > 0 && { label: "Achievements", value: achievements.length },
  ].filter(Boolean);

  const statusCounts = countBy(projects, (p) => p.status || "Unspecified");
  const maxStatusCount = Math.max(1, ...statusCounts.map(([, c]) => c));

  // Tag cloud: sized by relative frequency instead of showing a raw count
  // or bar, so "most-used across your projects" reads visually rather
  // than as a number.
  const tagFrequency = countBy(
    (projects || []).flatMap((p) => p.tags || []),
    (tag) => tag
  ).slice(0, 12);
  const maxTagCount = Math.max(1, ...tagFrequency.map(([, c]) => c));

  const contactLinks = [
    email && { label: "Email", href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js) — the
  // customer's drag-and-drop order in the editor picks which of these
  // render, and in what sequence, and drives the sidebar nav too.
  const sections = {
    experience: experience?.length > 0 && (
      <Widget id="section-experience" title="Experience" icon={IconBriefcase} colors={colors}>
        <div className="divide-y" style={{ borderColor: tint(ACCENT, 12) }}>
          {experience.map((job, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold" style={{ color: INK }}>
                    {job.role}
                  </p>
                  <p className="break-words text-xs" style={{ color: MUTED }}>
                    {job.company}
                  </p>
                </div>
                <span className={`${spaceGrotesk.className} shrink-0 whitespace-nowrap text-xs`} style={{ color: MUTED }}>
                  {job.start} – {job.end}
                </span>
              </div>
              {job.bullets?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {job.bullets.map((bullet, j) => (
                    <li key={j} className="flex min-w-0 gap-2 text-sm" style={{ color: INK_SOFT }}>
                      <span className="shrink-0" style={{ color: PALETTE[i % PALETTE.length] }}>
                        •
                      </span>
                      <span className="min-w-0 whitespace-pre-line break-words">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Widget>
    ),

    education: education?.length > 0 && (
      <Widget id="section-education" title="Education" icon={IconGraduationCap} colors={colors}>
        <div className="divide-y" style={{ borderColor: tint(ACCENT, 12) }}>
          {education.map((edu, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold" style={{ color: INK }}>
                  {edu.degree}
                </p>
                <p className="break-words text-xs" style={{ color: MUTED }}>
                  {edu.school}
                </p>
              </div>
              <span className={`${spaceGrotesk.className} shrink-0 whitespace-nowrap text-xs`} style={{ color: MUTED }}>
                {edu.start} – {edu.end}
              </span>
            </div>
          ))}
        </div>
      </Widget>
    ),

    projects: projects?.length > 0 && (
      <div id="section-projects" className="scroll-mt-6">
        <h2 className={`${spaceGrotesk.className} mb-4 text-sm font-semibold`} style={{ color: INK }}>
          Projects
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <div
              key={i}
              className="min-w-0 overflow-hidden rounded-2xl border shadow-sm"
              style={{ backgroundColor: tint(INK, 3), borderColor: tint(ACCENT, 14), borderLeft: `3px solid ${statusColor(project.status)}` }}
            >
              <div className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 break-words text-sm font-semibold" style={{ color: INK }}>
                    {project.name || "Project name"}
                  </span>
                  {project.status && (
                    <span
                      className="shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: tint(statusColor(project.status), 16), color: statusColor(project.status) }}
                    >
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 min-w-0 whitespace-pre-line break-words text-sm" style={{ color: INK_SOFT }}>
                  {project.description}
                </p>
                {project.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                        style={{ backgroundColor: tint(INK, 6), color: INK_SOFT }}
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(tag) }} />
                        <span className="break-words">{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs" style={{ borderColor: tint(ACCENT, 12) }}>
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} className="font-medium" style={{ color: ACCENT }}>
                        Source
                      </a>
                    )}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} className="font-medium" style={{ color: ACCENT }}>
                        Live demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills?.length > 0 && (
      <Widget id="section-skills" title="Skills" icon={IconStar} colors={colors}>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              style={{ backgroundColor: tint(INK, 5), borderColor: tint(ACCENT, 14), color: INK_SOFT }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
              <span className="break-words">{skill}</span>
            </span>
          ))}
        </div>
      </Widget>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <Widget id="section-codingProfiles" title="Coding Profiles" icon={IconLink} colors={colors}>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              style={{ backgroundColor: tint(INK, 5), borderColor: tint(ACCENT, 14), color: INK_SOFT }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} />
              <span className="break-words">{profile.platform}</span>
            </a>
          ))}
        </div>
      </Widget>
    ),

    achievements: achievements?.length > 0 && (
      <Widget id="section-achievements" title="Achievements" icon={IconTrophy} colors={colors}>
        <ul className="space-y-2">
          {achievements.map((item, i) => (
            <li key={i} className="flex min-w-0 gap-2.5 text-sm" style={{ color: INK_SOFT }}>
              <span className="shrink-0" style={{ color: PALETTE[i % PALETTE.length] }}>
                —
              </span>
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      </Widget>
    ),
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sections[id]);

  const navItems = [
    { href: "#overview", icon: <IconHome className="h-4 w-4" />, label: "Overview" },
    ...visibleIds.map((id) => {
      const Icon = SECTION_ICONS[id];
      return { href: `#section-${id}`, icon: Icon && <Icon className="h-4 w-4" />, label: SECTION_DEFS[id]?.label };
    }),
    { href: "#contact", icon: <IconMail className="h-4 w-4" />, label: "Contact" },
  ];

  return (
    <div className={`relative flex min-h-dvh ${inter.className}`} style={{ backgroundColor: PAPER, color: INK }}>
      <CursorGlow colorRgb={hexToRgb(POP)} size={500} />

      {/* Sidebar */}
      <aside
        className="relative hidden w-72 shrink-0 border-r sm:block"
        style={{ borderColor: tint(ACCENT, 14), backgroundColor: tint(INK, 2) }}
      >
        <div className="sticky top-0 flex h-dvh flex-col overflow-y-auto">
          {/* Banner + avatar */}
          <div className="relative">
            <div className="h-16 w-full" style={{ background: `linear-gradient(135deg, ${POP}, ${PALETTE[1]})` }} />
            <div className="px-6 pb-5">
              <div className="relative -mt-8 inline-block">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold shadow-md ring-4"
                  style={{ backgroundColor: POP, color: PAPER, "--tw-ring-color": PAPER }}
                >
                  {initials(name)}
                </div>
                {/* Presence dot — a small, standard "active" indicator
                    rather than anything playful, matching the rest of this
                    template's real-product register. */}
                <span
                  className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full ring-2"
                  style={{ backgroundColor: "#10b981", "--tw-ring-color": PAPER }}
                >
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                </span>
              </div>
              <p className="mt-3 break-words text-sm font-semibold" style={{ color: INK }}>
                {name || "Your Name"}
              </p>
              <p className="break-words text-xs" style={{ color: MUTED }}>
                {role || "Your Role"}
              </p>
              {bio && (
                <p className="mt-2 line-clamp-3 break-words text-xs leading-relaxed" style={{ color: MUTED }}>
                  {bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats — only the ones with a real value, sharing the row
              proportionally rather than a fixed 2-up grid that would leave
              a zero or an empty cell when only one is present. */}
          {statItems.length > 0 && (
            <div className="flex flex-wrap gap-2 px-6">
              {statItems.slice(0, 2).map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[100px] flex-1 rounded-xl px-3 py-2"
                  style={{ backgroundColor: tint(INK, 5) }}
                >
                  <p className={`${spaceGrotesk.className} text-base font-bold`} style={{ color: INK }}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: MUTED }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Nav — highlights whichever section is actually scrolled into
              view, like a real docs/dashboard sidebar. */}
          <SidebarNav
            items={navItems}
            accent={ACCENT}
            ink={INK}
            inkSoft={INK_SOFT}
            muted={MUTED}
            borderColor={tint(ACCENT, 12)}
          />

          {/* Skills preview */}
          {skills?.length > 0 && (
            <div className="mt-5 px-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                Top skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="break-words rounded-full px-2 py-0.5 text-[11px]"
                    style={{ backgroundColor: tint(INK, 6), color: INK_SOFT }}
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="text-[11px]" style={{ color: MUTED }}>
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer: icon-button links */}
          <div className="mt-auto flex items-center gap-2 border-t px-6 py-4" style={{ borderColor: tint(ACCENT, 12) }}>
            {contactLinks.map(({ label, href, Icon }) => (
              <a
                key={href}
                href={href}
                title={label}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
                style={{ borderColor: tint(ACCENT, 20), color: MUTED }}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-6 sm:p-10">
        {/* Mobile identity block (sidebar is hidden below sm) */}
        <div className="mb-6 flex items-center gap-3 sm:hidden">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: POP, color: PAPER }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold" style={{ color: INK }}>
              {name || "Your Name"}
            </p>
            <p className="break-words text-xs" style={{ color: MUTED }}>
              {role || "Your Role"}
            </p>
          </div>
        </div>

        <div id="overview" className="scroll-mt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h1 className={`${spaceGrotesk.className} break-words text-2xl font-bold tracking-tight`} style={{ color: INK }}>
              Overview
            </h1>
            <LiveSynced accent={PALETTE[0]} textColor={MUTED} />
          </div>
          {bio && (
            <p className="mt-2 max-w-2xl break-words text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
              {bio}
            </p>
          )}

          {/* KPI cards — only ones with a real value; the whole row is
              absent rather than showing a wall of zeros for an empty
              portfolio. */}
          {statItems.length > 0 && (
            <RevealOnScroll arrivedClassName="dashboard-pop-in" threshold={0.4} rootMargin="0px">
              <div className="mt-6 flex flex-wrap gap-4">
                {statItems.map((stat, i) => (
                  <StatCard key={stat.label} {...stat} accent={PALETTE[i % PALETTE.length]} colors={colors} />
                ))}
              </div>
            </RevealOnScroll>
          )}

          {/* Chart widgets — bars fill in from zero once the widget
              actually scrolls into view, the way a real analytics product's
              charts animate on load rather than appearing pre-drawn. */}
          {(statusCounts.length > 0 || tagFrequency.length > 0) && (
            <RevealOnScroll arrivedClassName="dashboard-reveal-arrived" threshold={0.3} rootMargin="0px">
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {statusCounts.length > 0 && (
                  <Widget title="Project status" colors={colors}>
                    {statusCounts.map(([status, count]) => (
                      <BarRow key={status} label={status} count={count} max={maxStatusCount} color={statusColor(status)} colors={colors} />
                    ))}
                  </Widget>
                )}
                {tagFrequency.length > 0 && (
                  <Widget title="Tech stack across projects" colors={colors}>
                    <div className="flex flex-wrap items-center gap-2">
                      {tagFrequency.map(([tag, count]) => {
                        const ratio = count / maxTagCount;
                        const tier = ratio >= 0.75 ? "high" : ratio >= 0.4 ? "mid" : "low";
                        return (
                          <span
                            key={tag}
                            className={`flex min-w-0 items-center gap-1.5 rounded-full border ${
                              tier === "high"
                                ? "px-3 py-1.5 text-sm font-semibold"
                                : tier === "mid"
                                  ? "px-2.5 py-1 text-sm font-medium"
                                  : "px-2 py-1 text-xs"
                            }`}
                            style={{ backgroundColor: tint(INK, 5), borderColor: tint(ACCENT, 14), color: tier === "high" ? INK : tier === "mid" ? INK_SOFT : MUTED }}
                          >
                            <span
                              className="shrink-0 rounded-full"
                              style={{
                                width: tier === "high" ? 8 : 6,
                                height: tier === "high" ? 8 : 6,
                                backgroundColor: dotColor(tag),
                              }}
                            />
                            <span className="break-words">{tag}</span>
                          </span>
                        );
                      })}
                    </div>
                  </Widget>
                )}
              </div>
            </RevealOnScroll>
          )}
        </div>

        {/* Sections, in the customer's chosen order */}
        <div className="mt-6 space-y-6">
          {visibleIds.map((id) => (
            <Fragment key={id}>{sections[id]}</Fragment>
          ))}
        </div>

        {/* Contact */}
        <div id="contact" className="mt-6 scroll-mt-6">
          <Widget title="Get in touch" colors={colors}>
            <p className="text-sm" style={{ color: INK_SOFT }}>
              Interested in working together? Reach out below.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: POP, color: PAPER }}
                >
                  Email me
                </a>
              )}
              {links?.github && (
                <a
                  href={`https://${stripProtocol(links.github)}`}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: tint(ACCENT, 20), color: INK_SOFT }}
                >
                  <IconGithub className="h-4 w-4" /> GitHub
                </a>
              )}
              {links?.linkedin && (
                <a
                  href={`https://${stripProtocol(links.linkedin)}`}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: tint(ACCENT, 20), color: INK_SOFT }}
                >
                  <IconLinkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
          </Widget>
        </div>

        <footer className="mt-8 text-xs" style={{ color: MUTED }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </main>
    </div>
  );
}
