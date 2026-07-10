// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Rotations/colors for sticky notes and polaroids are derived from a hash
// of each item's own text (like dotColor), not Math.random() — random
// values would differ between the server render and the client hydration
// pass and trigger the same class of hydration bug fixed on the gallery
// cards earlier. Fresher-aware: Education stands in for Experience when
// there's no work history yet.
/* eslint-disable @next/next/no-img-element */

import { Caveat, Kalam } from "next/font/google";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, initials, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });
const kalam = Kalam({ subsets: ["latin"], weight: ["300", "400", "700"] });

const INK = "#3a3226";
const NOTE_COLORS = ["#f5e08a", "#f3c6d3", "#bcd8ec", "#c9e4c5", "#e7cba9"];
const ROTATIONS = [-3, 2, -1.5, 1.5, -2.5, 3, -1, 2.5];

function hashOf(seed) {
  let h = 0;
  const s = String(seed || "x");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function rotationFor(seed) {
  return ROTATIONS[hashOf(seed) % ROTATIONS.length];
}
function noteColorFor(seed) {
  return NOTE_COLORS[hashOf(seed) % NOTE_COLORS.length];
}

function PushPin({ color = "#e0433d" }) {
  return (
    <span
      className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${color})`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
      }}
    />
  );
}

function WashiTape({ className = "", color = "#f3c6d3", rotation = -4 }) {
  return (
    <div
      className={`pointer-events-none absolute h-5 w-24 opacity-80 ${className}`}
      style={{
        background: `repeating-linear-gradient(45deg, ${color}, ${color} 6px, ${color}cc 6px, ${color}cc 12px)`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }}
    />
  );
}

function StickyNote({ children, seed, className = "" }) {
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotationFor(seed)}deg)` }}>
      <PushPin color={dotColor(String(seed))} />
      <div className="p-4 shadow-md" style={{ backgroundColor: noteColorFor(seed) }}>
        {children}
      </div>
    </div>
  );
}

function Polaroid({ src, alt, caption, seed }) {
  return (
    <div className="bg-white p-3 pb-7 shadow-lg" style={{ transform: `rotate(${rotationFor(seed)}deg)` }}>
      {src ? (
        <img src={src} alt={alt || "photo"} className="h-40 w-full object-cover" />
      ) : (
        <div
          className="flex h-40 w-full items-center justify-center bg-[#f0ead9] text-4xl font-bold"
          style={{ color: dotColor(String(seed)) }}
        >
          {(alt || "?")[0]?.toUpperCase()}
        </div>
      )}
      {caption && (
        <p className={`${kalam.className} mt-2 text-center text-sm`} style={{ color: INK }}>
          {caption}
        </p>
      )}
    </div>
  );
}

function CodeClipping({ tags, seed }) {
  if (!tags?.length) return null;
  return (
    <div
      className="bg-[#1e2530] p-2.5 font-mono text-[11px] leading-relaxed text-emerald-300 shadow-md"
      style={{ transform: `rotate(${rotationFor(seed)}deg)` }}
    >
      <div className="text-zinc-500">{"// stack"}</div>
      <div>
        const stack = [{tags.map((t) => `"${t}"`).join(", ")}];
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className={`${caveat.className} text-4xl font-bold`} style={{ color: INK }}>
      {children}
    </h2>
  );
}

export default function ScrapbookTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;
  const yearsXp = computeYearsOfExperience(experience);

  const educationBlock = education?.length > 0 && (
    <section className="relative mt-16">
      <SectionTitle>Where I studied</SectionTitle>
      <div className="relative mt-8 space-y-8 pl-8">
        <div className="absolute bottom-2 left-3 top-2 border-l-2 border-dashed" style={{ borderColor: `${INK}44` }} />
        {education.map((edu, i) => (
          <div key={i} className="relative">
            <span
              className="absolute -left-[27px] top-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: dotColor(edu.school || String(i)) }}
            />
            <StickyNote seed={`edu-${edu.school}-${i}`} className="max-w-sm">
              <p className={`${kalam.className} font-bold`} style={{ color: INK }}>
                {edu.degree || "Degree"}
              </p>
              <p className="text-sm" style={{ color: INK }}>
                {edu.school}
              </p>
              <p className="mt-1 text-xs opacity-70" style={{ color: INK }}>
                {edu.start} – {edu.end}
              </p>
            </StickyNote>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div
      className="relative min-h-dvh"
      style={{ background: "radial-gradient(150% 120% at 22% 0%, #faf3e0 0%, #e8d4a8 42%, #c9a86e 78%, #a9824f 100%)" }}
    >
      {/* Corkboard speckle texture — layered dots instead of a flat fill. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(101,67,33,0.16) 0 1px, transparent 1px), radial-gradient(circle at 60% 70%, rgba(101,67,33,0.13) 0 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, rgba(101,67,33,0.11) 0 1px, transparent 1px), radial-gradient(circle at 40% 85%, rgba(101,67,33,0.1) 0 1.2px, transparent 1.2px)",
          backgroundSize: "38px 38px, 54px 54px, 66px 66px, 47px 47px",
        }}
      />
      <CursorGlow colorRgb="230, 165, 90" size={550} />

      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:px-10">
        {/* Header */}
        <header className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {photoUrl ? (
            <Polaroid src={photoUrl} alt={name} caption={null} seed="header-photo" />
          ) : (
            <div className="relative" style={{ transform: `rotate(${rotationFor("header-avatar")}deg)` }}>
              <div
                className="flex h-24 w-24 items-center justify-center bg-white text-2xl font-bold shadow-lg"
                style={{ color: dotColor(name || "you") }}
              >
                {initials(name)}
              </div>
            </div>
          )}
          <div className="relative min-w-0">
            <WashiTape className="-left-3 -top-2" color="#bcd8ec" rotation={-6} />
            <h1 className={`${caveat.className} relative text-6xl font-bold leading-none`} style={{ color: INK }}>
              {name || "Your Name"}
            </h1>
            <p className={`${kalam.className} mt-2 text-xl`} style={{ color: INK }}>
              {role || "Your Role"}
            </p>
          </div>
        </header>

        {bio && (
          <div
            className="relative mt-8 max-w-xl p-5 shadow-sm"
            style={{
              backgroundColor: "#fffdf7",
              backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 27px, #cfe0ea 27px 28px)",
              transform: "rotate(-0.6deg)",
            }}
          >
            <p className={`${kalam.className} text-[17px] leading-[28px]`} style={{ color: INK }}>
              {bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Things I reach for</SectionTitle>
            <div className="mt-6 flex flex-wrap gap-3">
              {skills.map((skill, i) => (
                <span
                  key={skill}
                  className={`${kalam.className} inline-block px-3 py-1.5 text-sm font-bold shadow-sm`}
                  style={{
                    backgroundColor: noteColorFor(skill),
                    color: INK,
                    transform: `rotate(${rotationFor(skill)}deg)`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Coding profiles */}
        {codingProfiles?.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Where I compete</SectionTitle>
            <div className="mt-6 flex flex-wrap gap-3">
              {codingProfiles.map((profile, i) => (
                <a
                  key={i}
                  href={`https://${stripProtocol(profile.url)}`}
                  className={`${kalam.className} inline-block px-3 py-1.5 text-sm font-bold shadow-sm`}
                  style={{
                    backgroundColor: noteColorFor(profile.platform),
                    color: INK,
                    transform: `rotate(${rotationFor(profile.platform)}deg)`,
                  }}
                >
                  {profile.platform}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Pages from the project log</SectionTitle>
            <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
              {projects.map((project, i) => (
                <div key={i} className="space-y-4">
                  <Polaroid
                    src={project.image}
                    alt={project.name}
                    caption={project.name || "project"}
                    seed={`proj-${project.name}-${i}`}
                  />
                  <StickyNote seed={`proj-note-${project.name}-${i}`}>
                    <p className={`${kalam.className} whitespace-pre-line text-sm leading-relaxed`} style={{ color: INK }}>
                      {project.description}
                    </p>
                    {project.status && (
                      <p className={`${kalam.className} mt-2 text-xs font-bold uppercase`} style={{ color: INK }}>
                        status: {project.status}
                      </p>
                    )}
                    {(project.link || project.demo) && (
                      <p className={`${kalam.className} mt-2 text-sm`} style={{ color: INK }}>
                        {project.link && (
                          <a href={`https://${stripProtocol(project.link)}`} className="underline">
                            → source
                          </a>
                        )}
                        {project.link && project.demo && "  "}
                        {project.demo && (
                          <a href={`https://${stripProtocol(project.demo)}`} className="underline">
                            → live demo
                          </a>
                        )}
                      </p>
                    )}
                  </StickyNote>
                  <CodeClipping tags={project.tags} seed={`proj-code-${project.name}-${i}`} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience-aware ordering: Education stands in for Experience
            when there's no work history yet (fresher-friendly). */}
        {hasExperience ? (
          <>
            <section className="relative mt-16">
              <SectionTitle>Where I&rsquo;ve worked</SectionTitle>
              <div className="relative mt-8 space-y-8 pl-8">
                <div className="absolute bottom-2 left-3 top-2 border-l-2 border-dashed" style={{ borderColor: `${INK}44` }} />
                {experience.map((job, i) => (
                  <div key={i} className="relative">
                    <span
                      className="absolute -left-[27px] top-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: dotColor(job.company || String(i)) }}
                    />
                    <StickyNote seed={`job-${job.company}-${i}`} className="max-w-md">
                      <p className={`${kalam.className} font-bold`} style={{ color: INK }}>
                        {job.role} @ {job.company}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: INK }}>
                        {job.start} – {job.end}
                      </p>
                      {job.bullets?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {job.bullets.map((b, j) => (
                            <li key={j} className={`${kalam.className} text-sm`} style={{ color: INK }}>
                              → {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </StickyNote>
                  </div>
                ))}
              </div>
              {yearsXp > 0 && (
                <p className={`${kalam.className} mt-4 pl-8 text-sm opacity-70`} style={{ color: INK }}>
                  ({yearsXp} years and counting)
                </p>
              )}
            </section>
            {educationBlock}
          </>
        ) : (
          educationBlock
        )}

        {/* Achievements */}
        {achievements?.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Little wins worth remembering</SectionTitle>
            <div className="mt-6 space-y-3">
              {achievements.map((item, i) => (
                <div key={i} className="relative inline-block w-full max-w-lg">
                  <WashiTape className="-left-2 -top-2" color={noteColorFor(item)} rotation={rotationFor(`tape-${item}`)} />
                  <div className="bg-white/90 p-3 pl-5 shadow-sm" style={{ transform: `rotate(${rotationFor(item)}deg)` }}>
                    <p className={`${kalam.className} text-[15px]`} style={{ color: INK }}>
                      ★ {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact — a postcard */}
        <section className="mt-16">
          <div className="relative bg-white p-6 shadow-lg" style={{ transform: "rotate(-0.5deg)" }}>
            <div
              className="absolute right-4 top-4 flex h-12 w-10 items-center justify-center border-2 border-dashed text-[9px] font-bold"
              style={{ borderColor: `${INK}55`, color: `${INK}88` }}
            >
              STAMP
            </div>
            <p className={`${caveat.className} text-4xl font-bold`} style={{ color: INK }}>
              Let&rsquo;s connect!
            </p>
            <div className={`${kalam.className} mt-3 space-y-1 text-[15px]`} style={{ color: INK }}>
              {email && <p>{email}</p>}
              {links?.github && <p>{stripProtocol(links.github)}</p>}
              {links?.linkedin && <p>{stripProtocol(links.linkedin)}</p>}
              {links?.website && <p>{stripProtocol(links.website)}</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={`${kalam.className} inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm`}
                  style={{ backgroundColor: NOTE_COLORS[0], color: INK }}
                >
                  <IconMail className="h-4 w-4" /> say hi
                </a>
              )}
              {links?.github && (
                <a
                  href={`https://${stripProtocol(links.github)}`}
                  className={`${kalam.className} inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm`}
                  style={{ backgroundColor: NOTE_COLORS[2], color: INK }}
                >
                  <IconGithub className="h-4 w-4" /> github
                </a>
              )}
              {links?.linkedin && (
                <a
                  href={`https://${stripProtocol(links.linkedin)}`}
                  className={`${kalam.className} inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm`}
                  style={{ backgroundColor: NOTE_COLORS[3], color: INK }}
                >
                  <IconLinkedin className="h-4 w-4" /> linkedin
                </a>
              )}
              {links?.website && (
                <a
                  href={`https://${stripProtocol(links.website)}`}
                  className={`${kalam.className} inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm`}
                  style={{ backgroundColor: NOTE_COLORS[4], color: INK }}
                >
                  <IconLink className="h-4 w-4" /> website
                </a>
              )}
            </div>
          </div>
        </section>

        <footer className={`${kalam.className} mt-12 text-center text-sm opacity-60`} style={{ color: INK }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </div>
    </div>
  );
}
