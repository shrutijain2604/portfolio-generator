// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Every chart here is a real aggregate of what the user entered — project
// status counts, tag frequency across projects, years of experience — not
// an invented metric. Fresher-aware, same pattern as the other templates:
// Education stands in for Experience when there's no work history.

import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, initials, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const ACCENT = "#4f46e5"; // indigo-600

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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Widget({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function BarRow({ label, count, max, color }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-600">
        <span className="truncate">{label}</span>
        <span className="font-mono text-slate-400">{count}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </a>
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

export default function DashboardTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;
  const yearsXp = computeYearsOfExperience(experience);

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

  const educationWidget = education?.length > 0 && (
    <Widget title="Education" className="scroll-mt-6" >
      <div className="divide-y divide-slate-100">
        {education.map((edu, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
              <p className="text-xs text-slate-500">{edu.school}</p>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {edu.start} – {edu.end}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );

  return (
    <div className="relative flex min-h-full bg-slate-50 text-slate-900">
      <CursorGlow colorRgb="79, 70, 229" size={500} />

      {/* Sidebar */}
      <aside className="relative hidden w-72 shrink-0 border-r border-slate-200 bg-white sm:block">
        <div className="sticky top-0 flex h-dvh flex-col overflow-y-auto">
          {/* Banner + avatar */}
          <div className="relative">
            <div className="h-16 w-full" style={{ background: `linear-gradient(135deg, ${ACCENT}, #818cf8)` }} />
            <div className="px-6 pb-5">
              <div
                className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ring-4 ring-white"
                style={{ backgroundColor: ACCENT }}
              >
                {initials(name)}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{name || "Your Name"}</p>
              <p className="text-xs text-slate-500">{role || "Your Role"}</p>
              {bio && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">{bio}</p>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 px-6">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-mono text-base font-bold text-slate-900">{yearsXp || experience?.length || 0}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Yrs exp</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-mono text-base font-bold text-slate-900">{projects?.length || 0}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Projects</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-5 space-y-1 border-t border-slate-100 px-3 pt-4">
            <NavLink href="#overview" icon={<IconHome className="h-4 w-4" />}>
              Overview
            </NavLink>
            <NavLink href="#experience" icon={<IconBriefcase className="h-4 w-4" />}>
              {hasExperience ? "Experience" : "Education"}
            </NavLink>
            {projects?.length > 0 && (
              <NavLink href="#projects" icon={<IconFolder className="h-4 w-4" />}>
                Projects
              </NavLink>
            )}
            {skills?.length > 0 && (
              <NavLink href="#skills" icon={<IconStar className="h-4 w-4" />}>
                Skills
              </NavLink>
            )}
            {codingProfiles?.length > 0 && (
              <NavLink href="#coding-profiles" icon={<IconLink className="h-4 w-4" />}>
                Coding Profiles
              </NavLink>
            )}
            {achievements?.length > 0 && (
              <NavLink href="#achievements" icon={<IconTrophy className="h-4 w-4" />}>
                Achievements
              </NavLink>
            )}
            <NavLink href="#contact" icon={<IconMail className="h-4 w-4" />}>
              Contact
            </NavLink>
          </nav>

          {/* Skills preview */}
          {skills?.length > 0 && (
            <div className="mt-5 px-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Top skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && <span className="text-[11px] text-slate-400">+{skills.length - 4} more</span>}
              </div>
            </div>
          )}

          {/* Footer: icon-button links */}
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 px-6 py-4">
            {email && (
              <a
                href={`mailto:${email}`}
                title="Email"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <IconMail className="h-4 w-4" />
              </a>
            )}
            {links?.github && (
              <a
                href={`https://${stripProtocol(links.github)}`}
                title="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <IconGithub className="h-4 w-4" />
              </a>
            )}
            {links?.linkedin && (
              <a
                href={`https://${stripProtocol(links.linkedin)}`}
                title="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <IconLinkedin className="h-4 w-4" />
              </a>
            )}
            {links?.website && (
              <a
                href={`https://${stripProtocol(links.website)}`}
                title="Website"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <IconLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-6 sm:p-10">
        {/* Mobile identity block (sidebar is hidden below sm) */}
        <div className="mb-6 flex items-center gap-3 sm:hidden">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {initials(name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{name || "Your Name"}</p>
            <p className="text-xs text-slate-500">{role || "Your Role"}</p>
          </div>
        </div>

        <div id="overview" className="scroll-mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          {bio && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{bio}</p>}

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Years experience" value={yearsXp || experience?.length || 0} />
            <StatCard label="Projects shipped" value={projects?.length || 0} />
            <StatCard label="Skills" value={skills?.length || 0} />
            <StatCard label="Achievements" value={achievements?.length || 0} />
          </div>

          {/* Chart widgets */}
          {(statusCounts.length > 0 || tagFrequency.length > 0) && (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {statusCounts.length > 0 && (
                <Widget title="Project status">
                  {statusCounts.map(([status, count]) => (
                    <BarRow key={status} label={status} count={count} max={maxStatusCount} color={statusColor(status)} />
                  ))}
                </Widget>
              )}
              {tagFrequency.length > 0 && (
                <Widget title="Tech stack across projects">
                  <div className="flex flex-wrap items-center gap-2">
                    {tagFrequency.map(([tag, count]) => {
                      const ratio = count / maxTagCount;
                      const tier = ratio >= 0.75 ? "high" : ratio >= 0.4 ? "mid" : "low";
                      return (
                        <span
                          key={tag}
                          className={`flex items-center gap-1.5 rounded-full border bg-slate-50 ${
                            tier === "high"
                              ? "border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900"
                              : tier === "mid"
                                ? "border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-700"
                                : "border-slate-200 px-2 py-1 text-xs text-slate-500"
                          }`}
                        >
                          <span
                            className="rounded-full"
                            style={{
                              width: tier === "high" ? 8 : 6,
                              height: tier === "high" ? 8 : 6,
                              backgroundColor: dotColor(tag),
                            }}
                          />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </Widget>
              )}
            </div>
          )}
        </div>

        {/* Experience-aware ordering: Education stands in for Experience
            when there's no work history yet (fresher-friendly). */}
        <div id="experience" className="mt-6 scroll-mt-6">
          {hasExperience ? (
            <Widget title="Experience">
              <div className="divide-y divide-slate-100">
                {experience.map((job, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{job.role}</p>
                        <p className="text-xs text-slate-500">{job.company}</p>
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {job.start} – {job.end}
                      </span>
                    </div>
                    {job.bullets?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {job.bullets.map((bullet, j) => (
                          <li key={j} className="flex gap-2 text-sm text-slate-600">
                            <span style={{ color: ACCENT }}>•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Widget>
          ) : (
            educationWidget
          )}
        </div>
        {hasExperience && educationWidget && <div className="mt-4">{educationWidget}</div>}

        {/* Projects */}
        {projects?.length > 0 && (
          <div id="projects" className="mt-6 scroll-mt-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Projects</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  style={{ borderLeft: `3px solid ${statusColor(project.status)}` }}
                >
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{project.name || "Project name"}</span>
                      {project.status && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: `${statusColor(project.status)}1a`, color: statusColor(project.status) }}
                        >
                          {project.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{project.description}</p>
                    {project.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(tag) }} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.link || project.demo) && (
                      <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs">
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
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <div id="skills" className="mt-6 scroll-mt-6">
            <Widget title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
                    {skill}
                  </span>
                ))}
              </div>
            </Widget>
          </div>
        )}

        {/* Coding profiles */}
        {codingProfiles?.length > 0 && (
          <div id="coding-profiles" className="mt-6 scroll-mt-6">
            <Widget title="Coding Profiles">
              <div className="flex flex-wrap gap-2">
                {codingProfiles.map((profile, i) => (
                  <a
                    key={i}
                    href={`https://${stripProtocol(profile.url)}`}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} />
                    {profile.platform}
                  </a>
                ))}
              </div>
            </Widget>
          </div>
        )}

        {/* Achievements */}
        {achievements?.length > 0 && (
          <div id="achievements" className="mt-6 scroll-mt-6">
            <Widget title="Achievements">
              <ul className="space-y-2">
                {achievements.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                    <span style={{ color: ACCENT }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Widget>
          </div>
        )}

        {/* Contact */}
        <div id="contact" className="mt-6 scroll-mt-6">
          <Widget title="Get in touch">
            <p className="text-sm text-slate-600">
              Interested in working together? Reach out below.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Email me
                </a>
              )}
              {links?.github && (
                <a
                  href={`https://${stripProtocol(links.github)}`}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <IconGithub className="h-4 w-4" /> GitHub
                </a>
              )}
              {links?.linkedin && (
                <a
                  href={`https://${stripProtocol(links.linkedin)}`}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <IconLinkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
          </Widget>
        </div>

        <footer className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </main>
    </div>
  );
}
