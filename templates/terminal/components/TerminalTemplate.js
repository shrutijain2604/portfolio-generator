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
  dotColor,
  stripProtocol,
} from "./shared";
import CursorGlow from "./CursorGlow";

function slug(name) {
  return (
    (name || "guest")
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "guest"
  );
}

// Plain-English section labels — just a lone "$" as a nod to the terminal
// theme, not a command a recruiter would need to decode.
function SectionLabel({ children }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="text-emerald-500">$</span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">
        {children}
      </h2>
    </div>
  );
}

function Block({ label, children }) {
  return (
    <section className="border-t border-zinc-900 py-8 first:border-t-0 first:pt-0">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </section>
  );
}

// Every reorderable section always carries its own border-t — unlike Block,
// none of these are ever the first thing on the page (About/Contact always
// render above them), so there's no first-child case to special-case.
function MovableSection({ children }) {
  return <section className="border-t border-zinc-900 py-8">{children}</section>;
}

export default function TerminalTemplate({ data }) {
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
  const user = slug(name);

  // One entry per id in SECTION_DEFINITIONS (lib/portfolioData.js) — the
  // customer's drag-and-drop order in the editor picks which of these
  // render, and in what sequence, between the anchored About/Contact block
  // and the anchored closing CTA.
  const sections = {
    skills: skills?.length > 0 && (
      <MovableSection>
        <SectionLabel>Skills</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-zinc-300"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
              {skill}
            </span>
          ))}
        </div>
      </MovableSection>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <MovableSection>
        <SectionLabel>Coding Profiles</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-zinc-300 hover:text-zinc-100"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} />
              {profile.platform}
            </a>
          ))}
        </div>
      </MovableSection>
    ),

    // Experience gets the same wider treatment as Projects — once a role
    // can carry a photo, cramming it into the narrow reading column
    // undersells it the same way a project screenshot would be.
    experience: experience?.length > 0 && (
      <MovableSection>
        <SectionLabel>Experience</SectionLabel>
        <div className="space-y-5">
          {experience.map((job, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 sm:flex-row"
              style={{ borderLeftWidth: 3, borderLeftColor: dotColor(job.company || String(i)) }}
            >
              {job.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={job.image}
                  alt=""
                  className="h-40 w-full shrink-0 object-cover sm:h-auto sm:w-56"
                />
              )}
              <div className="min-w-0 flex-1 p-4">
                <p className="break-words text-zinc-200">
                  <span className="font-semibold text-white">{job.role}</span>{" "}
                  <span className="text-zinc-500">at</span> {job.company}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {job.start} — {job.end}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {job.bullets?.map((bullet, j) => (
                    <li key={j} className="flex min-w-0 gap-2 text-zinc-400">
                      <span className="shrink-0 text-zinc-700">·</span>
                      <span className="break-words">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </MovableSection>
    ),

    education: education?.length > 0 && (
      <MovableSection>
        <SectionLabel>Education</SectionLabel>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div
              key={i}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-white">{edu.school}</p>
                <p className="break-words text-zinc-400">{edu.degree}</p>
              </div>
              <div className="shrink-0 whitespace-nowrap text-xs text-zinc-600">
                {edu.start} — {edu.end}
              </div>
            </div>
          ))}
        </div>
      </MovableSection>
    ),

    achievements: achievements?.length > 0 && (
      <MovableSection>
        <SectionLabel>Achievements</SectionLabel>
        <ul className="space-y-2">
          {achievements.map((item, i) => (
            <li key={i} className="flex min-w-0 gap-2 text-zinc-300">
              <span className="shrink-0 text-zinc-700">·</span>
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      </MovableSection>
    ),

    // Full-width rows, same as Experience — a 3-column grid left an
    // awkward wall of empty space for anyone with only one or two
    // projects, since a single grid item doesn't stretch to fill its row.
    projects: projects?.length > 0 && (
      <MovableSection>
        <SectionLabel>Projects</SectionLabel>
        <div className="space-y-5">
          {projects.map((project, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
              style={{ borderLeftWidth: 3, borderLeftColor: dotColor(project.name || String(i)) }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="break-words font-semibold text-white">
                    {project.name || "package-name"}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-600">v{project.version || "1.0.0"}</span>
                </div>
                {project.status && (
                  <span
                    className={`text-xs ${
                      project.status.toLowerCase() === "active"
                        ? "text-emerald-400"
                        : project.status.toLowerCase() === "archived"
                          ? "text-zinc-500"
                          : "text-amber-400"
                    }`}
                  >
                    {project.status}
                  </span>
                )}
              </div>

              <p className="whitespace-pre-line break-words text-zinc-400">{project.description}</p>

              {project.highlights?.length > 0 && (
                <ul className="space-y-1">
                  {project.highlights.map((point, j) => (
                    <li key={j} className="flex min-w-0 gap-2 text-sm text-zinc-500">
                      <span className="shrink-0 text-zinc-700">·</span>
                      <span className="break-words">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(tag) }} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(project.link || project.demo) && (
                <div className="flex flex-wrap gap-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                  {project.link && (
                    <a
                      href={`https://${stripProtocol(project.link)}`}
                      className="flex items-center gap-1.5 hover:text-zinc-200"
                    >
                      <IconGithub className="h-3.5 w-3.5" />
                      Source
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={`https://${stripProtocol(project.demo)}`}
                      className="flex items-center gap-1.5 hover:text-zinc-200"
                    >
                      <IconLink className="h-3.5 w-3.5" />
                      Live demo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </MovableSection>
    ),
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-zinc-950 font-mono text-[14px] leading-relaxed text-zinc-300">
      {/* Ambient wash + scanline texture, full-viewport — without this the
          space around the narrow reading column reads as empty rather than
          deliberate on a wide screen. The interactive CursorGlow alone only
          shows up once the mouse moves; this is what's there before that. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-25"
        style={{ background: "radial-gradient(650px circle at 12% 0%, #10b981 0%, transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(rgba(16,185,129,0.6) 0px, rgba(16,185,129,0.6) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <CursorGlow />

      {/* Window chrome */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-2.5 backdrop-blur">
        <TrafficLights />
        <span className="text-xs text-zinc-600">{user}@dev — zsh</span>
      </div>

      {/* One outer container for the whole page, so every section shares
          the same left edge — independently centering each section is what
          made the page zigzag left-right while scrolling. Sections use the
          full container width now; only the bio paragraph and the closing
          CTA keep their own inner max-width, for prose readability, not to
          leave the rest of the page looking cramped next to Experience and
          Projects. */}
      <div className="mx-auto max-w-5xl px-6 pb-12 pt-12 sm:px-10">
        {/* about — the only contact info shown up top is the "Get in touch"
            CTA at the very bottom of the page; a second contact list here
            duplicated it for no reason. */}
        <Block label="About">
          <p className="break-words text-xl font-semibold text-white">{name || "Your Name"}</p>
          <p className="mt-1 break-words text-emerald-400">{role || "Your Role"}</p>
          <p className="mt-3 max-w-xl break-words leading-relaxed text-zinc-400">{bio}</p>
        </Block>

        {(sectionOrder || []).map((id) => (
          <Fragment key={id}>{sections[id]}</Fragment>
        ))}

        <div className="max-w-2xl">
          {/* closing / contact CTA — a real sign-off, not just a blinking
              cursor, with actual clickable ways to reach out. */}
          <section className="border-t border-zinc-900 pt-8">
            <SectionLabel>Get in touch</SectionLabel>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="flex flex-wrap items-center gap-2 text-[13px] text-zinc-500">
                <span>{user}@dev:~</span>
                <span className="text-emerald-500">$</span>
                <span className="break-words text-zinc-300">echo &quot;Let&rsquo;s build something.&quot;</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-zinc-500">
                <span>{user}@dev:~</span>
                <span className="text-emerald-500">$</span>
                <span className="inline-block h-4 w-2 animate-pulse bg-emerald-500" />
              </p>
            </div>

            {(email || links?.github || links?.linkedin || links?.website) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
                  >
                    <IconMail className="h-3.5 w-3.5" />
                    Say hi
                  </a>
                )}
                {links?.github && (
                  <a
                    href={`https://${stripProtocol(links.github)}`}
                    className="flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                  >
                    <IconGithub className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                )}
                {links?.linkedin && (
                  <a
                    href={`https://${stripProtocol(links.linkedin)}`}
                    className="flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                  >
                    <IconLinkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
                {links?.website && (
                  <a
                    href={`https://${stripProtocol(links.website)}`}
                    className="flex items-center gap-2 rounded-md border border-zinc-800 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                  >
                    <IconLink className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
              </div>
            )}
          </section>

          <footer className="mt-10 border-t border-zinc-900 pt-6">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} {name || "Your Name"}
            </p>
            <p className="mt-1 text-[10px] text-zinc-800">Made with Dev Portfolio Builder</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
