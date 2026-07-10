// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.

import { IconGithub, IconLinkedin, IconLink, IconMail, TrafficLights, dotColor, initials, stripProtocol } from "./shared";
import CursorGlow from "./CursorGlow";

function commitHash(seed) {
  // Deterministic fake hash so it doesn't change on every re-render/refresh.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).slice(0, 7).padStart(7, "0");
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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-zinc-900/90 px-4 py-2.5 backdrop-blur">
      <TrafficLights />
      <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs text-zinc-400">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-zinc-500" fill="currentColor">
          <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm8 1.5V8h4.5L14 3.5Z" />
        </svg>
        CHANGELOG.md
      </div>
      <div className="ml-auto hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
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
  );
}

export default function ChangelogTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;

  return (
    <div className="relative min-h-dvh bg-zinc-950 text-zinc-200">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-20"
        style={{
          background:
            "radial-gradient(600px circle at 20% 0%, #10b981 0%, transparent 60%), radial-gradient(500px circle at 80% 10%, #6366f1 0%, transparent 55%)",
        }}
      />
      <CursorGlow />

      <WindowBar />

      <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-14 sm:px-10">
        {/* Header */}
        <header className="mb-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg shadow-emerald-500/10 ring-1 ring-white/10"
            style={{ background: "linear-gradient(135deg, #10b981, #6366f1)" }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <h1 className="font-sans text-3xl font-bold tracking-tight text-white">
              {name || "Your Name"}
            </h1>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {role || "Your Role"}
            </div>
            <p className="mt-3 max-w-xl font-sans leading-relaxed text-zinc-400">{bio}</p>

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

        {/* Stats summary line */}
        <p className="mb-14 font-mono text-xs text-zinc-500">
          <span className="text-zinc-300">{experience?.length || 0} roles</span>
          {" · "}
          <span className="text-emerald-500">{projects?.length || 0} projects shipped</span>
          {" · "}
          <span className="text-sky-400">{skills?.length || 0} skills</span>
        </p>

        {/* Skills */}
        {skills?.length > 0 && (
          <section className="mb-14">
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
          </section>
        )}

        {/* Coding profiles */}
        {codingProfiles?.length > 0 && (
          <section className="mb-14">
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
          </section>
        )}

        {/* Experience as git log / commit graph */}
        {experience?.length > 0 && (
          <section className="mb-14">
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
                    <span className="font-sans font-semibold text-white">
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
                        className="flex gap-2 rounded bg-emerald-500/[0.04] px-2 py-1 font-mono text-[13px] leading-relaxed text-zinc-300"
                      >
                        <span className="select-none text-emerald-600">+</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education as git tags */}
        {education?.length > 0 && (
          <section className="mb-14">
            <SectionLabel>Education</SectionLabel>
            <div className="space-y-2.5">
              {education.map((edu, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-indigo-400" fill="currentColor">
                    <path d="M4 8.5 4 8.4a1 1 0 0 1 .55-.9L11.5 4a1 1 0 0 1 .9 0l6.95 3.5a1 1 0 0 1 0 1.79L12.4 12.8a1 1 0 0 1-.9 0L4.55 9.3A1 1 0 0 1 4 8.4Z" />
                    <path d="M7 11.5v3.6c0 .5.28.96.73 1.19l3.36 1.7a1 1 0 0 0 .9 0l3.36-1.7c.45-.23.73-.7.73-1.19v-3.6l-4.09 2a1 1 0 0 1-.9 0L7 11.5Z" />
                  </svg>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300">
                    {edu.degree || "Degree"}
                  </span>
                  <span className="font-sans text-sm font-medium text-white">{edu.school}</span>
                  <span className="ml-auto font-mono text-xs text-zinc-500">
                    {edu.start} — {edu.end}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements as release notes */}
        {achievements?.length > 0 && (
          <section className="mb-14">
            <SectionLabel>Achievements</SectionLabel>
            <ul className="space-y-2">
              {achievements.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-300"
                >
                  <span className="select-none text-amber-500">★</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects as package registry */}
        {projects?.length > 0 && (
          <section>
            <SectionLabel>Projects</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project, i) => (
                <div
                  key={i}
                  className={`group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.04] ${
                    i === 0 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400">
                          Featured
                        </span>
                      )}
                      <span className="font-mono font-semibold text-white">
                        {project.name || "package-name"}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
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

                  <p className="mt-2.5 font-sans text-sm leading-relaxed text-zinc-400">
                    {project.description}
                  </p>

                  {project.highlights?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {project.highlights.map((point, j) => (
                        <li
                          key={j}
                          className="flex gap-2 font-mono text-[12.5px] leading-relaxed text-zinc-400"
                        >
                          <span className="select-none text-zinc-600">▸</span>
                          <span>{point}</span>
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
          </section>
        )}

        {/* Closing terminal session + contact CTA */}
        <section className="mt-16">
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
          <p className="font-mono text-xs text-zinc-500">
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
