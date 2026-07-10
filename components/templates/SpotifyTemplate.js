// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// "Monthly listeners" is a themed display number derived from real counts
// (projects/skills/years of experience), the same honesty rule as Level
// Up's Builder Score — not a claim of an actual audience. Achievements and
// certifications share one schema field, so rather than fabricate two
// categories we render it once, as "Top Charts". Fresher-aware: Education
// gets its own section always; it only takes over the "Listening History"
// slot when there's no work history yet.
/* eslint-disable @next/next/no-img-element */

import { IconGithub, IconLinkedin, IconLink, dotColor, initials, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const PURPLE = "#730a81";
const BG = "#121212";
const CARD = "#181818";
const MUTED = "#b3b3b3";

function hueFor(seed) {
  let h = 0;
  const s = String(seed || "x");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 5v14l11-7-11-7Z" />
    </svg>
  );
}

function IconVerified({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2 14.3 3.7 17.1 3.4 18 6.1 20.4 7.6 19.7 10.4 20.9 13 18.9 15.1 19.2 17.9 16.4 18.5 15 21 12 19.9 9 21 7.6 18.5 4.8 17.9 5.1 15.1 3.1 13 4.3 10.4 3.6 7.6 6 6.1 6.9 3.4 9.7 3.7Z"
        fill="#3d91f4"
      />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NowPlayingBars() {
  return (
    <span className="inline-flex h-3.5 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] animate-pulse rounded-sm"
          style={{ backgroundColor: PURPLE, height: i === 1 ? "14px" : "9px", animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}

export default function SpotifyTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;
  const yearsXp = computeYearsOfExperience(experience);
  const bannerHue = hueFor(name || "artist");
  const firstName = (name || "Artist").trim().split(/\s+/)[0];

  const monthlyListeners =
    1000 +
    (projects?.length || 0) * 4200 +
    (skills?.length || 0) * 950 +
    yearsXp * 3100 +
    (achievements?.length || 0) * 1800;

  const educationSection = education?.length > 0 && (
    <section className="px-6 pb-10 sm:px-10">
      <h2 className="mb-4 text-2xl font-bold text-white">Education</h2>
      <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
        {education.map((edu, i) => (
          <div key={i} className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-white/5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: dotColor(edu.school || String(i)) }}
            >
              <IconPlay className="h-4 w-4 text-white/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{edu.degree || "Degree"}</p>
              <p className="truncate text-xs" style={{ color: MUTED }}>
                {edu.school}
              </p>
            </div>
            <span className="shrink-0 text-xs" style={{ color: MUTED }}>
              {edu.start} – {edu.end}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: BG }}>
      <CursorGlow colorRgb="29, 185, 84" size={500} />

      {/* Header */}
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 h-80"
          style={{ background: `linear-gradient(180deg, hsl(${bannerHue}, 55%, 30%) 0%, ${BG} 100%)` }}
        />
        <div className="relative flex flex-col items-center gap-6 px-6 pb-6 pt-16 sm:flex-row sm:items-end sm:px-10 sm:pt-20">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name || "Artist"}
              className="h-40 w-40 rounded-full object-cover shadow-2xl sm:h-56 sm:w-56"
            />
          ) : (
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full text-5xl font-bold text-white shadow-2xl sm:h-56 sm:w-56"
              style={{ backgroundColor: dotColor(name || "artist") }}
            >
              {initials(name)}
            </div>
          )}
          <div className="pb-2 text-center sm:text-left">
            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
              <IconVerified className="h-5 w-5" />
              <span className="text-sm font-semibold text-white">Verified Artist</span>
            </div>
            <h1 className="mt-2 text-5xl font-black tracking-tight text-white sm:text-7xl">{name || "Your Name"}</h1>
            <p className="mt-3 text-sm" style={{ color: MUTED }}>
              {monthlyListeners.toLocaleString()} monthly listeners · {role || "Your Role"}
            </p>
          </div>
        </div>

        {/* Action row */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 px-6 py-6 sm:justify-start sm:px-10">
          {projects?.length > 0 && (
            <a
              href="#projects"
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: PURPLE }}
            >
              <IconPlay className="h-6 w-6 translate-x-0.5 text-black" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="rounded-full border border-zinc-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:border-white"
            >
              Follow
            </a>
          )}
          <div className="flex items-center gap-4">
            {links?.github && (
              <a href={`https://${stripProtocol(links.github)}`} className="text-zinc-400 transition-colors hover:text-white">
                <IconGithub className="h-5 w-5" />
              </a>
            )}
            {links?.linkedin && (
              <a href={`https://${stripProtocol(links.linkedin)}`} className="text-zinc-400 transition-colors hover:text-white">
                <IconLinkedin className="h-5 w-5" />
              </a>
            )}
            {links?.website && (
              <a href={`https://${stripProtocol(links.website)}`} className="text-zinc-400 transition-colors hover:text-white">
                <IconLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {bio && (
        <div className="mx-6 mb-4 rounded-lg p-5 sm:mx-10" style={{ backgroundColor: CARD }}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">About</h2>
          <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
            {bio}
          </p>
        </div>
      )}

      {/* Discography — projects as albums */}
      {projects?.length > 0 && (
        <section id="projects" className="px-6 pb-10 pt-6 sm:px-10">
          <h2 className="mb-4 text-2xl font-bold text-white">Projects</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((project, i) => (
              <div key={i} className="group rounded-md p-3 transition-colors hover:bg-[#282828]" style={{ backgroundColor: CARD }}>
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md shadow-lg">
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl font-bold text-white"
                      style={{ backgroundColor: PURPLE }}
                    >
                      {(project.name || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div
                    className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <IconPlay className="h-4 w-4 translate-x-0.5 text-black" />
                  </div>
                </div>
                <p className="truncate text-sm font-semibold text-white">{project.name || "Untitled"}</p>
                <p className="mt-1 truncate text-xs" style={{ color: MUTED }}>
                  Project · {project.status || "Released"}
                </p>
                {project.description && (
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: MUTED }}>
                    {project.description}
                  </p>
                )}
                {project.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{ backgroundColor: "#333333", color: dotColor(tag) }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <p className="mt-2 text-xs">
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} className="hover:underline" style={{ color: PURPLE }}>
                        Source
                      </a>
                    )}
                    {project.link && project.demo && "  "}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} className="hover:underline" style={{ color: PURPLE }}>
                        Live
                      </a>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Playlist — skills as one playlist of tracks */}
      {skills?.length > 0 && (
        <section className="px-6 pb-10 sm:px-10">
          <h2 className="mb-4 text-2xl font-bold text-white">Skills</h2>
          <div className="rounded-lg p-5" style={{ backgroundColor: CARD }}>
            <div className="mb-4 flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded"
                style={{ background: `linear-gradient(135deg, ${PURPLE}, hsl(${bannerHue}, 60%, 45%))` }}
              >
                <IconPlay className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: MUTED }}>
                  Playlist
                </p>
                <p className="text-lg font-bold text-white">{firstName}&rsquo;s Toolkit</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  {skills.length} track{skills.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {skills.map((skill, i) => (
                <div key={skill} className="flex items-center gap-3 rounded px-1 py-2 hover:bg-white/5">
                  <span className="w-5 text-sm" style={{ color: MUTED }}>
                    {i + 1}
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
                  <span className="text-sm text-white">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coding profiles */}
      {codingProfiles?.length > 0 && (
        <section className="px-6 pb-10 sm:px-10">
          <h2 className="mb-4 text-2xl font-bold text-white">Coding Profiles</h2>
          <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
            {codingProfiles.map((profile, i) => (
              <a
                key={i}
                href={`https://${stripProtocol(profile.url)}`}
                className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-white/5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: dotColor(profile.platform) }}
                >
                  <IconPlay className="h-4 w-4 text-white/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{profile.platform}</p>
                  <p className="truncate text-xs" style={{ color: MUTED }}>
                    {stripProtocol(profile.url)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Listening History — experience, fresher-aware */}
      {hasExperience ? (
        <>
          <section className="px-6 pb-10 sm:px-10">
            <h2 className="mb-4 text-2xl font-bold text-white">Experience</h2>
            <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
              {experience.map((job, i) => {
                const isCurrent = (job.end || "").toLowerCase() === "present";
                return (
                  <div key={i} className="flex items-start gap-4 rounded-md px-3 py-3 hover:bg-white/5">
                    <div
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded"
                      style={{ backgroundColor: dotColor(job.company || String(i)) }}
                    >
                      {isCurrent ? <NowPlayingBars /> : <IconPlay className="h-4 w-4 text-white/70" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{job.role || "Role"}</p>
                      <p className="truncate text-xs" style={{ color: MUTED }}>
                        {job.company}
                      </p>
                      {job.bullets?.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {job.bullets.map((b, j) => (
                            <li key={j} className="text-xs" style={{ color: MUTED }}>
                              ♪ {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: MUTED }}>
                      {job.start} – {job.end}
                    </span>
                  </div>
                );
              })}
            </div>
            {yearsXp > 0 && (
              <p className="mt-3 text-xs" style={{ color: MUTED }}>
                {yearsXp} years on the charts
              </p>
            )}
          </section>
          {educationSection}
        </>
      ) : (
        educationSection
      )}

      {/* Top Charts — achievements / certifications */}
      {achievements?.length > 0 && (
        <section className="px-6 pb-10 sm:px-10">
          <h2 className="mb-4 text-2xl font-bold text-white">Achievements</h2>
          <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
            {achievements.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-white/5">
                <span className="w-6 text-center text-lg font-bold" style={{ color: i === 0 ? PURPLE : MUTED }}>
                  {i + 1}
                </span>
                <p className="text-sm text-white">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Follow / contact */}
      <section className="px-6 pb-10 sm:px-10">
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: CARD }}>
          <p className="text-lg font-bold text-white">Like what you hear?</p>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Get in touch — new collabs always welcome.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className="rounded-full px-6 py-2 text-sm font-bold text-black"
                style={{ backgroundColor: PURPLE }}
              >
                Follow
              </a>
            )}
            {links?.github && (
              <a
                href={`https://${stripProtocol(links.github)}`}
                className="flex items-center gap-2 rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                <IconGithub className="h-4 w-4" /> GitHub
              </a>
            )}
            {links?.linkedin && (
              <a
                href={`https://${stripProtocol(links.linkedin)}`}
                className="flex items-center gap-2 rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                <IconLinkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-6 pb-10 text-center text-xs sm:px-10" style={{ color: "#727272" }}>
        © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
      </footer>
    </div>
  );
}
