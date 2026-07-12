// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// "Monthly listeners" is a themed display number derived from real counts
// (projects/skills/years of experience), the same honesty rule as Level
// Up's Builder Score — not a claim of an actual audience. Achievements and
// certifications share one schema field, so rather than fabricate two
// categories we render it once, as "Top Charts". Skills render as genre
// tags in the About card, not a numbered track list — a numbered list of
// 25 "tracks" for someone with 25 skills reads as clutter, not music;
// wrapping pill tags scale to any count without it. No color theming here
// (unlike Editorial/Warm/Dashboard/Scrapbook) — Spotify's whole identity
// is one specific black-and-green look, so a theme picker would undercut
// the "this genuinely looks like Spotify" goal rather than serve it.
/* eslint-disable @next/next/no-img-element */

import { IconGithub, IconLinkedin, IconLink, dotColor, initials, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const GREEN = "#1DB954";
const BG = "#0a0a0a";
const CARD = "#181818";
const CARD_HOVER = "#242424";
const MUTED = "#a7a7a7";

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
        fill={GREEN}
      />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.7" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ className, dir = "left" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

function IconMore({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function IconShuffle({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h3.5L16 18h4.5M3 18h3.5L11 12M16 6h4.5" />
      <path d="m18 4 2.5 2L18 8M18 16l2.5 2-2.5 2" />
    </svg>
  );
}

function IconSkip({ className, dir = "back" }) {
  return dir === "back" ? (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6 6h2v12H6zM20 6v12L10 12z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16 6h2v12h-2zM4 6v12l10-6z" />
    </svg>
  );
}

function IconRepeat({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconVolume({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M17 9a5 5 0 0 1 0 6" />
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
          style={{ backgroundColor: GREEN, height: i === 1 ? "14px" : "9px", animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}

// The row layout every list-style section (Education/Coding Profiles)
// shares — a small colored square plus a title/subtitle pair. Text wraps
// instead of truncating (a truncated title read as a cut-off bug, not a
// design choice, especially on narrow screens) and there's no separate
// right-aligned trailing column — a fixed-width column for dates is what
// squeezed everything else into an unreadably narrow strip on mobile,
// where dates now just live at the end of the subtitle line instead.
function Row({ href, icon, seed, title, subtitle }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag href={href} className="flex items-start gap-4 rounded-md px-3 py-4 transition-colors hover:bg-white/5">
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded" style={{ backgroundColor: dotColor(seed) }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-lg font-semibold text-white">{title}</p>
        {subtitle && (
          <p className="break-words text-sm" style={{ color: MUTED }}>
            {subtitle}
          </p>
        )}
      </div>
    </Tag>
  );
}

function SectionShell({ id, label, children }) {
  return (
    <section id={`section-${id}`} className="scroll-mt-20 px-6 pb-10 sm:px-10">
      <h2 className="mb-4 text-2xl font-bold text-white">{label}</h2>
      {children}
    </section>
  );
}

export default function SpotifyTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;
  const yearsXp = computeYearsOfExperience(experience);
  const bannerHue = hueFor(name || "artist");

  // "Follow" reads as a social/professional action, not an email compose —
  // LinkedIn is the closer real-world equivalent, with mailto as the
  // fallback for anyone who only filled in an email.
  const followHref = links?.linkedin ? `https://${stripProtocol(links.linkedin)}` : email ? `mailto:${email}` : null;

  const monthlyListeners =
    1000 +
    (projects?.length || 0) * 4200 +
    (skills?.length || 0) * 950 +
    yearsXp * 3100 +
    (achievements?.length || 0) * 1800;

  // The five draggable sections (same ids as every other template) — Skills
  // isn't one of them any more, since it now lives in the About card as
  // genre tags rather than a standalone reorderable block.
  const sections = {
    experience: experience?.length > 0 && (
      <SectionShell id="experience" label="Experience">
        <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
          {experience.map((job, i) => {
            const isCurrent = (job.end || "").toLowerCase() === "present";
            return (
              <div key={i} className="flex items-start gap-3 rounded-md px-3 py-4 hover:bg-white/5 sm:gap-4">
                <span className="mt-3 hidden w-5 shrink-0 text-center text-sm sm:block" style={{ color: MUTED }}>
                  {i + 1}
                </span>
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded" style={{ backgroundColor: dotColor(job.company || String(i)) }}>
                  {isCurrent ? <NowPlayingBars /> : <IconPlay className="h-4 w-4 text-white/70" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-lg font-semibold text-white">{job.role || "Role"}</p>
                  <p className="break-words text-sm" style={{ color: MUTED }}>
                    {job.company} · {job.start} – {job.end}
                  </p>
                  {job.bullets?.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5">
                      {job.bullets.map((b, j) => (
                        <li key={j} className="whitespace-pre-line break-words text-sm leading-relaxed" style={{ color: MUTED }}>
                          ♪ {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {yearsXp > 0 && (
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            {yearsXp} years of experience
          </p>
        )}
      </SectionShell>
    ),

    projects: projects?.length > 0 && (
      <SectionShell id="projects" label="Projects">
        {projects.length <= 2 ? (
          // 1-2 projects: a large horizontal "Featured" card per project —
          // fixed small tiles would leave one lonely tile in a wide empty
          // row, and letting a tile stretch to fill that row (the earlier
          // attempt) just made it a huge, oddly-cropped square instead.
          // A horizontal card actually uses the extra width for content
          // (description/tags), not a bigger image.
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="group flex flex-col gap-4 rounded-md p-4 transition-colors sm:flex-row" style={{ backgroundColor: CARD }}>
                <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md shadow-lg sm:w-52">
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-5xl font-bold text-black"
                      style={{ background: `linear-gradient(135deg, ${GREEN}, hsl(${hueFor(project.name || i)}, 60%, 40%))` }}
                    >
                      {(project.name || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div
                    className="absolute bottom-2 right-2 flex h-11 w-11 translate-y-1 items-center justify-center rounded-full opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    style={{ backgroundColor: GREEN }}
                  >
                    <IconPlay className="h-4 w-4 translate-x-0.5 text-black" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-xl font-bold text-white">{project.name || "Untitled"}</p>
                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    Project · {project.status || "Released"}
                  </p>
                  {project.description && (
                    <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed" style={{ color: MUTED }}>
                      {project.description}
                    </p>
                  )}
                  {project.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="break-words rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: "#2a2a2a", color: dotColor(tag) }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.link || project.demo) && (
                    <p className="mt-3 flex flex-wrap gap-4 text-xs">
                      {project.link && (
                        <a href={`https://${stripProtocol(project.link)}`} className="font-semibold hover:underline" style={{ color: GREEN }}>
                          Source
                        </a>
                      )}
                      {project.demo && (
                        <a href={`https://${stripProtocol(project.demo)}`} className="font-semibold hover:underline" style={{ color: GREEN }}>
                          Live
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 3+ projects: the compact album-tile grid, fixed-width so cards
          // stay a reasonable size and just wrap across rows.
          <div className="flex flex-wrap gap-4">
            {projects.map((project, i) => (
              <div key={i} className="group w-40 rounded-md p-3 transition-colors sm:w-44" style={{ backgroundColor: CARD }}>
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md shadow-lg">
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl font-bold text-black"
                      style={{ background: `linear-gradient(135deg, ${GREEN}, hsl(${hueFor(project.name || i)}, 60%, 40%))` }}
                    >
                      {(project.name || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div
                    className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    style={{ backgroundColor: GREEN }}
                  >
                    <IconPlay className="h-4 w-4 translate-x-0.5 text-black" />
                  </div>
                </div>
                <p className="truncate text-sm font-semibold text-white">{project.name || "Untitled"}</p>
                <p className="mt-1 truncate text-xs" style={{ color: MUTED }}>
                  Project · {project.status || "Released"}
                </p>
                {project.description && (
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-relaxed" style={{ color: MUTED }}>
                    {project.description}
                  </p>
                )}
                {project.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: "#2a2a2a", color: dotColor(tag) }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <p className="mt-2 flex flex-wrap gap-3 text-xs">
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} className="font-semibold hover:underline" style={{ color: GREEN }}>
                        Source
                      </a>
                    )}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} className="font-semibold hover:underline" style={{ color: GREEN }}>
                        Live
                      </a>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionShell>
    ),

    education: education?.length > 0 && (
      <SectionShell id="education" label="Education">
        <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
          {education.map((edu, i) => (
            <Row
              key={i}
              seed={edu.school || String(i)}
              icon={<IconPlay className="h-4 w-4 text-white/70" />}
              title={edu.degree || "Degree"}
              subtitle={[edu.school, [edu.start, edu.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
            />
          ))}
        </div>
      </SectionShell>
    ),

    achievements: achievements?.length > 0 && (
      <SectionShell id="achievements" label="Achievements">
        <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
          {achievements.map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-md px-3 py-4 hover:bg-white/5">
              <span className="w-6 shrink-0 text-center text-lg font-bold" style={{ color: i === 0 ? GREEN : MUTED }}>
                {i + 1}
              </span>
              <p className="min-w-0 whitespace-pre-line break-words text-base text-white">{item}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <SectionShell id="codingProfiles" label="Coding Profiles">
        <div className="rounded-lg p-2" style={{ backgroundColor: CARD }}>
          {codingProfiles.map((profile, i) => (
            <Row
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              seed={profile.platform}
              icon={<IconPlay className="h-4 w-4 text-white/70" />}
              title={profile.platform}
              subtitle={stripProtocol(profile.url)}
            />
          ))}
        </div>
      </SectionShell>
    ),
  };
  const order = (sectionOrder || []).filter((id) => sections[id]);

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: BG }}>
      <CursorGlow colorRgb="29, 185, 84" size={500} />

      <div id="top" className="pb-28">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-3 backdrop-blur-md sm:px-8" style={{ backgroundColor: "rgba(10,10,10,0.75)" }}>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
              <IconChevron className="h-4 w-4" dir="left" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-zinc-500">
              <IconChevron className="h-4 w-4" dir="right" />
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black" style={{ backgroundColor: GREEN }}>
            {initials(name)}
          </span>
        </div>

        {/* Hero banner */}
        <div className="relative h-72 w-full overflow-hidden sm:h-96">
          {photoUrl ? (
            <img src={photoUrl} alt={name || "Artist"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${bannerHue}, 65%, 30%), ${BG})` }}>
              <span className="select-none text-[9rem] font-black leading-none text-white/10 sm:text-[13rem]">{initials(name)}</span>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 60%, ${BG} 100%)` }}
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-6 sm:px-10 sm:pb-8">
            <div className="flex items-center gap-1.5">
              <IconVerified className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs font-semibold text-white sm:text-sm">Verified Artist</span>
            </div>
            <h1 className="break-words text-4xl font-black leading-none text-white sm:text-7xl md:text-8xl">{name || "Your Name"}</h1>
            <p className="text-sm font-medium text-white/80 sm:text-base">
              {monthlyListeners.toLocaleString()} monthly listeners
              {role ? ` · ${role}` : ""}
            </p>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-5 px-6 py-6 sm:px-10">
          <button type="button" className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: GREEN }}>
            <IconPlay className="h-6 w-6 translate-x-0.5 text-black" />
          </button>
          {followHref && (
            <a
              href={followHref}
              className="rounded-full border border-zinc-500 px-8 py-2 text-sm font-bold text-white transition-transform hover:scale-105 hover:border-white"
            >
              Follow
            </a>
          )}
          <IconMore className="h-6 w-6 text-zinc-400 transition-colors hover:text-white" />
        </div>

        {/* About — bio + genres (skills) + monthly listeners, the way a
            real Spotify artist page bundles them together */}
        {(bio || skills?.length > 0) && (
          <section id="section-about" className="scroll-mt-20 px-6 pb-4 sm:px-10">
            <div className="rounded-lg p-5" style={{ backgroundColor: CARD }}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">About</h2>
              {bio && (
                <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: MUTED }}>
                  {bio}
                </p>
              )}
              <p className="mt-4 text-xs" style={{ color: MUTED }}>
                <span className="font-semibold text-white">{monthlyListeners.toLocaleString()}</span> monthly listeners
              </p>
              {skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: CARD_HOVER }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Sections, in the customer's chosen order */}
        {order.map((id) => (
          <div key={id}>{sections[id]}</div>
        ))}

        {/* Follow / contact */}
        <section className="px-6 pb-10 sm:px-10">
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: CARD }}>
            <p className="text-lg font-bold text-white">Like what you hear?</p>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Get in touch — new collabs always welcome.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {email && (
                <a href={`mailto:${email}`} className="rounded-full px-6 py-2 text-sm font-bold text-black" style={{ backgroundColor: GREEN }}>
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
              {links?.website && (
                <a
                  href={`https://${stripProtocol(links.website)}`}
                  className="flex items-center gap-2 rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white"
                >
                  <IconLink className="h-4 w-4" /> Website
                </a>
              )}
            </div>
          </div>
        </section>

        <footer className="px-6 pb-8 text-center text-xs sm:px-10" style={{ color: "#727272" }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </div>

      {/* Now-playing bar — decorative chrome, not a data claim, so the
          progress/volume fills are fixed visual proportions rather than
          invented numbers. Spans the full width, under the sidebar too,
          same as the real thing. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-white/10 px-4 py-3" style={{ backgroundColor: "#181818" }}>
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-64 sm:flex-none">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded text-sm font-bold text-white" style={{ backgroundColor: dotColor(name || "you") }}>
              {initials(name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{name || "Your Name"}</p>
            <p className="truncate text-xs" style={{ color: MUTED }}>
              {role || "Your Role"}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 flex-col items-center gap-2 sm:flex">
          <div className="flex items-center gap-5">
            <IconShuffle className="h-4 w-4 text-zinc-400" />
            <IconSkip className="h-4 w-4 text-zinc-300" dir="back" />
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <IconPlay className="h-3.5 w-3.5 translate-x-0.5 text-black" />
            </button>
            <IconSkip className="h-4 w-4 text-zinc-300" dir="forward" />
            <IconRepeat className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-zinc-700">
            <div className="h-full rounded-full bg-white" style={{ width: "35%" }} />
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex sm:w-64 sm:flex-none sm:justify-end">
          <IconVolume className="h-4 w-4 text-zinc-300" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-700">
            <div className="h-full rounded-full bg-white" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
