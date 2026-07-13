// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.

import { Fragment } from "react";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  TrafficLights,
  computeYearsOfExperience,
  dotColor,
  initials,
  stripProtocol,
} from "./shared";
import CursorGlow from "./CursorGlow";
import DeployLog from "./DeployLog";
import DeployedAgo from "./DeployedAgo";

function commitHash(seed) {
  // Deterministic fake hash so it doesn't change on every re-render/refresh.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).slice(0, 7).padStart(7, "0");
}

// A "release tag" sticker for the header — the changelog theme's answer to
// a status badge, but built from the customer's own stats (years coding,
// skill/project counts) mapped onto a fake semver, not an asserted claim.
function ReleaseTag({ skills, experience, projects }) {
  const years = computeYearsOfExperience(experience);
  if (years < 1 && !skills?.length && !projects?.length) return null;
  const tag = `v${Math.max(years, 1)}.${skills?.length || 0}.${projects?.length || 0}`;
  return (
    <span className="inline-flex -rotate-2 items-center gap-1 rounded border border-dashed border-indigo-400/40 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-300">
      {tag} released
    </span>
  );
}

// A decorative commit-graph strip, styled after a GitHub contribution
// graph — deterministic from the customer's own name/role so it's stable
// across reloads and identical between server and client render, not a
// per-visit random pattern.
function CommitGraph({ seed }) {
  const cols = 20;
  const rows = 4;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);

  return (
    <div aria-hidden className="mb-14 -mt-4 hidden items-center gap-3 sm:flex">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        commits
      </span>
      <div className="grid grid-flow-col grid-rows-4 gap-[3px]">
        {cells.map((i) => {
          const on = (i * 7 + seed.length * 3) % 5 !== 0;
          return (
            <span
              key={i}
              className="h-[7px] w-[7px] rounded-[2px]"
              style={{ backgroundColor: on ? dotColor(`${seed}-${i}`) : "rgba(255,255,255,0.05)" }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="h-1.5 w-4 rounded-full bg-emerald-500" />
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        {children}
      </h2>
    </div>
  );
}

function WindowBar() {
  return (
    <div className="sticky top-0 z-10 flex flex-col border-b border-white/10 bg-zinc-900/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <TrafficLights />
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs text-zinc-400">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-zinc-500" fill="currentColor">
            <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm8 1.5V8h4.5L14 3.5Z" />
          </svg>
          CHANGELOG.md
        </div>
        <div className="ml-auto hidden items-center gap-3 text-xs text-zinc-500 sm:flex">
          <DeployedAgo />
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM7.5 8.3v6.9M9 6h6a3 3 0 0 1 3 3v3" />
            </svg>
            main
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>
      {/* A looping build-progress sweep — the changelog theme's ambient,
          always-on motion, the same role CursorGlow plays but without
          needing the visitor to move their mouse first. */}
      <div aria-hidden className="h-[2px] w-full overflow-hidden bg-white/5">
        <div
          className="changelog-progress-sweep h-full w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, #10b981, #6366f1, transparent)" }}
        />
      </div>
    </div>
  );
}

// A small pulsing "commit" node with a short dashed trace and fake hash —
// the changelog theme's divider between sections, so scrolling past one
// reads as moving along a commit history rather than crossing a plain rule.
function SectionDivider({ seed }) {
  return (
    <div aria-hidden className="mb-6 flex items-center gap-3">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-950 ring-1 ring-emerald-600" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      <span className="font-mono text-[10px] text-zinc-700">{commitHash(seed)}</span>
    </div>
  );
}

function MovableSection({ seed, children }) {
  return (
    <section className="mb-14">
      <SectionDivider seed={seed} />
      {children}
    </section>
  );
}

// A vertical stream of small commit-graph squares pinned to a page gutter —
// the changelog theme's take on ambient side motion, reusing the same
// dotColor palette as the CommitGraph strip so the two read as one system.
// Only shows once there's real gutter space beside the centered `max-w-5xl`
// column (xl+), so it never sits near actual content. The pattern is a
// fixed deterministic sequence, not per-render random, so server and client
// markup always match.
function CommitRain({ side, seed }) {
  const offset = side === "left" ? 2 : 6;
  const column = Array.from({ length: 30 }, (_, i) => (i * 7 + offset) % 5 !== 0);
  const cells = [...column, ...column];

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-0 z-[2] hidden h-dvh w-6 overflow-hidden opacity-[0.35] xl:block ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <div className="changelog-rain-track flex flex-col items-center gap-[6px] py-[6px]">
        {cells.map((on, i) => (
          <span
            key={i}
            className="h-[7px] w-[7px] rounded-[2px]"
            style={{ backgroundColor: on ? dotColor(`${seed}-${side}-${i}`) : "rgba(255,255,255,0.06)" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChangelogTemplate({ data }) {
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

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js) — the
  // customer's drag-and-drop order in the editor picks which of these
  // render, and in what sequence, between the header and the closing CTA.
  const sections = {
    skills: skills?.length > 0 && (
      <MovableSection seed={`skills-${name || "guest"}`}>
        <SectionLabel>Skills</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: dotColor(skill) }}
              />
              {skill}
            </span>
          ))}
        </div>
      </MovableSection>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <MovableSection seed={`coding-profiles-${name || "guest"}`}>
        <SectionLabel>Coding Profiles</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} />
              {profile.platform}
            </a>
          ))}
        </div>
      </MovableSection>
    ),

    experience: experience?.length > 0 && (
      <MovableSection seed={`experience-${name || "guest"}`}>
        <SectionLabel>Experience</SectionLabel>
        <div className="relative space-y-8">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-emerald-500/60 via-white/10 to-transparent" />
          {experience.map((job, i) => (
            <div key={i} className="relative pl-8">
              <span
                className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                  i === 0
                    ? "border-emerald-400 bg-zinc-950 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"
                    : "border-zinc-600 bg-zinc-950"
                }`}
              />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-amber-500">
                  {commitHash(`${job.company}${job.role}${i}`)}
                </span>
                {i === 0 && (
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                    HEAD → main
                  </span>
                )}
                <span className="break-words font-sans font-semibold text-white">
                  {job.role} @ {job.company}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {job.start} — {job.end}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {job.bullets?.map((bullet, j) => (
                  <li
                    key={j}
                    className="flex min-w-0 gap-2 rounded bg-emerald-500/[0.04] px-2 py-1 font-mono text-[13px] leading-relaxed text-zinc-300"
                  >
                    <span className="shrink-0 select-none text-emerald-600">+</span>
                    <span className="break-words">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MovableSection>
    ),

    education: education?.length > 0 && (
      <MovableSection seed={`education-${name || "guest"}`}>
        <SectionLabel>Education</SectionLabel>
        <div className="space-y-2.5">
          {education.map((edu, i) => (
            <div
              key={i}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" fill="currentColor">
                  <path d="M4 8.5 4 8.4a1 1 0 0 1 .55-.9L11.5 4a1 1 0 0 1 .9 0l6.95 3.5a1 1 0 0 1 0 1.79L12.4 12.8a1 1 0 0 1-.9 0L4.55 9.3A1 1 0 0 1 4 8.4Z" />
                  <path d="M7 11.5v3.6c0 .5.28.96.73 1.19l3.36 1.7a1 1 0 0 0 .9 0l3.36-1.7c.45-.23.73-.7.73-1.19v-3.6l-4.09 2a1 1 0 0 1-.9 0L7 11.5Z" />
                </svg>
                <div className="min-w-0">
                  <p className="break-words font-sans text-sm font-medium text-white">{edu.school}</p>
                  <span className="mt-1 inline-block break-words rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300">
                    {edu.degree || "Degree"}
                  </span>
                </div>
              </div>
              <span className="shrink-0 whitespace-nowrap font-mono text-xs text-zinc-500">
                {edu.start} — {edu.end}
              </span>
            </div>
          ))}
        </div>
      </MovableSection>
    ),

    achievements: achievements?.length > 0 && (
      <MovableSection seed={`achievements-${name || "guest"}`}>
        <SectionLabel>Achievements</SectionLabel>
        <ul className="space-y-2">
          {achievements.map((item, i) => (
            <li
              key={i}
              className="flex min-w-0 gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-300"
            >
              <span className="shrink-0 select-none text-amber-500">★</span>
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      </MovableSection>
    ),

    // Full-width rows instead of a grid, so an uneven project count (e.g.
    // 2 or 4) never leaves a dangling half-empty row like a fixed column
    // count would.
    projects: projects?.length > 0 && (
      <MovableSection seed={`projects-${name || "guest"}`}>
        <SectionLabel>Projects</SectionLabel>
        <div className="space-y-4">
          {projects.map((project, i) => (
            <div
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {i === 0 && (
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400">
                      Featured
                    </span>
                  )}
                  <span className="break-words font-mono font-semibold text-white">
                    {project.name || "package-name"}
                  </span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    v{project.version || "1.0.0"}
                  </span>
                </div>
                {project.status && (
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      project.status.toLowerCase() === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : project.status.toLowerCase() === "archived"
                          ? "bg-zinc-500/10 text-zinc-400"
                          : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        project.status.toLowerCase() === "active"
                          ? "bg-emerald-400"
                          : project.status.toLowerCase() === "archived"
                            ? "bg-zinc-400"
                            : "bg-amber-400"
                      }`}
                    />
                    {project.status}
                  </span>
                )}
              </div>

              <p className="mt-2.5 whitespace-pre-line break-words font-sans text-sm leading-relaxed text-zinc-400">
                {project.description}
              </p>

              {project.highlights?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {project.highlights.map((point, j) => (
                    <li
                      key={j}
                      className="flex min-w-0 gap-2 font-mono text-[12.5px] leading-relaxed text-zinc-400"
                    >
                      <span className="shrink-0 select-none text-zinc-600">▸</span>
                      <span className="break-words">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                {project.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: dotColor(tag) }}
                    />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/5 pt-3">
                {project.link && (
                  <a
                    href={`https://${stripProtocol(project.link)}`}
                    className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
                  >
                    <IconGithub className="h-3.5 w-3.5" />
                    Source
                  </a>
                )}
                {project.demo && (
                  <a
                    href={`https://${stripProtocol(project.demo)}`}
                    className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
                  >
                    <IconLink className="h-3.5 w-3.5" />
                    Live demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </MovableSection>
    ),
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-zinc-950 text-zinc-200">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-20"
        style={{
          background:
            "radial-gradient(600px circle at 20% 0%, #10b981 0%, transparent 60%), radial-gradient(500px circle at 80% 10%, #6366f1 0%, transparent 55%)",
        }}
      />
      <CursorGlow />
      <CommitRain side="left" seed={name || role || "guest"} />
      <CommitRain side="right" seed={name || role || "guest"} />

      <WindowBar />

      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-14 sm:px-10">
        {/* Header */}
        <header className="mb-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg shadow-emerald-500/10 ring-1 ring-white/10"
            style={{ background: "linear-gradient(135deg, #10b981, #6366f1)" }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <h1 className="changelog-diff-flash break-words rounded font-sans text-3xl font-bold tracking-tight text-white">
              {name || "Your Name"}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {role || "Your Role"}
              </div>
              <ReleaseTag skills={skills} experience={experience} projects={projects} />
            </div>
            <p className="mt-3 max-w-xl break-words font-sans leading-relaxed text-zinc-400">{bio}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-zinc-200">
                  <IconMail className="h-3.5 w-3.5" />
                  {email}
                </a>
              )}
              {links?.github && (
                <a href={`https://${stripProtocol(links.github)}`} className="flex items-center gap-1.5 hover:text-zinc-200">
                  <IconGithub className="h-3.5 w-3.5" />
                  {stripProtocol(links.github)}
                </a>
              )}
              {links?.linkedin && (
                <a href={`https://${stripProtocol(links.linkedin)}`} className="flex items-center gap-1.5 hover:text-zinc-200">
                  <IconLinkedin className="h-3.5 w-3.5" />
                  {stripProtocol(links.linkedin)}
                </a>
              )}
              {links?.website && (
                <a href={`https://${stripProtocol(links.website)}`} className="flex items-center gap-1.5 hover:text-zinc-200">
                  <IconLink className="h-3.5 w-3.5" />
                  {stripProtocol(links.website)}
                </a>
              )}
            </div>
          </div>
        </header>

        <DeployLog name={name} />

        <CommitGraph seed={name || role || "guest"} />

        {(sectionOrder || []).map((id) => (
          <Fragment key={id}>{sections[id]}</Fragment>
        ))}

        {/* Closing terminal session + contact CTA — kept at reading width
            and centered, rather than stretched full-container or left-
            anchored like the sections above; this is the page's closing
            moment, meant to read as a deliberate centered CTA. */}
        <section className="mx-auto mt-2 max-w-2xl">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 font-mono text-[13px] shadow-[0_0_50px_-20px_rgba(16,185,129,0.35)]">
            <p>
              <span className="text-emerald-500">guest</span>
              <span className="text-zinc-600">@</span>
              <span className="text-sky-400">portfolio</span>
              <span className="text-zinc-600">:~$</span>{" "}
              <span className="text-zinc-300">
                Hi, I&rsquo;m {name || "Your Name"} — {role || "Your Role"}.
              </span>
            </p>
            <p className="mt-3">
              <span className="text-emerald-500">guest</span>
              <span className="text-zinc-600">@</span>
              <span className="text-sky-400">portfolio</span>
              <span className="text-zinc-600">:~$</span>{" "}
              <span className="text-zinc-300">
                Open to new opportunities and interesting problems. Reach out below.
              </span>
            </p>
            <p className="mt-3 flex items-center gap-2">
              <span className="text-emerald-500">guest</span>
              <span className="text-zinc-600">@</span>
              <span className="text-sky-400">portfolio</span>
              <span className="text-zinc-600">:~$</span>
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-500" />
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                <IconMail className="h-3.5 w-3.5" />
                Say hi
              </a>
            )}
            {links?.github && (
              <a
                href={`https://${stripProtocol(links.github)}`}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5"
              >
                <IconGithub className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
            {links?.linkedin && (
              <a
                href={`https://${stripProtocol(links.linkedin)}`}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/5"
              >
                <IconLinkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="font-mono text-[11px] text-zinc-600">
            ## [Unreleased] <span className="text-emerald-500">— Added:</span> new opportunities
            <span className="ml-1 inline-block h-3 w-[6px] translate-y-[2px] animate-pulse bg-zinc-600" />
          </p>
          <p className="mt-3 font-mono text-xs text-zinc-500">
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="mt-1 font-mono text-[10px] text-zinc-700">
            Made with Dev Portfolio Builder
          </p>
        </footer>
      </div>
    </div>
  );
}
