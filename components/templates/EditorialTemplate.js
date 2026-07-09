// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Fresher-aware: when there's no work experience, Education is promoted
// into the slot Experience would normally occupy, and Projects carries the
// page as the main event — nothing renders as an empty placeholder section.

import { Fraunces } from "next/font/google";
import { stripProtocol, dotColor } from "./shared";
import CursorGlow from "./CursorGlow";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const INK = "#1c1c1a";
const INK_SOFT = "#3a3a36";
const MUTED = "#7a7a70";
const PAPER = "#faf7f0";
const ACCENT = "#33415c";
const POP = "#c1432e"; // bold masthead red — the one "loud" color on the page

// A small curated palette, brightened up a notch from the original quiet
// set, so sections and case studies each get their own bold identity color.
const PALETTE = ["#c1432e", "#1d6f8c", "#3f7d3a", "#8a4f9e"]; // red, teal, green, purple

function SectionTitle({ children, accent = ACCENT, number }) {
  return (
    <div className="relative flex items-center gap-3">
      {number && (
        <span
          className={`${fraunces.className} pointer-events-none absolute -left-1 -top-9 text-7xl font-bold sm:-top-10 sm:text-8xl`}
          style={{ color: accent, opacity: 0.1 }}
        >
          {number}
        </span>
      )}
      <span className="relative h-2 w-10 rounded-full" style={{ backgroundColor: accent }} />
      <h2
        className={`${fraunces.className} relative text-3xl font-semibold tracking-tight`}
        style={{ color: INK }}
      >
        {children}
      </h2>
    </div>
  );
}

function TimelineEntry({ title, subtitle, start, end, lines }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-sans text-[15px] font-semibold" style={{ color: INK }}>
          {title}
          {subtitle && <span className="font-normal" style={{ color: MUTED }}> — {subtitle}</span>}
        </p>
        <p className="font-sans text-xs" style={{ color: MUTED }}>
          {start} — {end}
        </p>
      </div>
      {lines?.length > 0 && (
        <div className="mt-2 space-y-1 font-sans text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditorialTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;

  const educationBlock = education?.length > 0 && (
    <section className="mt-20">
      <SectionTitle accent={PALETTE[3]} number="05">Education</SectionTitle>
      <div className="mt-8 space-y-8">
        {education.map((edu, i) => (
          <TimelineEntry
            key={i}
            title={edu.degree}
            subtitle={edu.school}
            start={edu.start}
            end={edu.end}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="relative min-h-full" style={{ backgroundColor: PAPER, color: INK }}>
      <CursorGlow colorRgb="193, 67, 46" size={550} />
      <div className="relative mx-auto max-w-xl px-6 py-20 sm:px-8 sm:py-28">
        {/* Header */}
        <header>
          <div className="flex items-center justify-between border-b-4 pb-3" style={{ borderColor: POP }}>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: POP }}>
              The Portfolio Edition
            </span>
            <span className="font-sans text-[11px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
              No. 01
            </span>
          </div>
          <h1
            className={`${fraunces.className} mt-6 text-5xl font-semibold tracking-tight sm:text-6xl`}
            style={{ color: INK }}
          >
            {name || "Your Name"}
          </h1>
          <p
            className={`${fraunces.className} mt-3 text-xl italic`}
            style={{ color: POP }}
          >
            {role || "Your Role"}
          </p>
          <p
            className="mt-8 max-w-md font-sans text-[17px] leading-relaxed"
            style={{ color: INK_SOFT }}
          >
            {bio}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-1 font-sans text-sm" style={{ color: MUTED }}>
            {[
              email && { label: email, href: `mailto:${email}` },
              links?.github && { label: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}` },
              links?.linkedin && { label: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}` },
              links?.website && { label: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}` },
            ]
              .filter(Boolean)
              .map((item, i, arr) => (
                <span key={item.href}>
                  <a href={item.href} className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current" style={{ color: MUTED }}>
                    {item.label}
                  </a>
                  {i < arr.length - 1 && <span className="mx-2">·</span>}
                </span>
              ))}
          </div>
        </header>

        {/* Skills */}
        {skills?.length > 0 && (
          <section className="mt-20">
            <SectionTitle accent={PALETTE[2]} number="01">Skills</SectionTitle>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 rounded-full px-3.5 py-1.5 font-sans text-[14px] font-semibold"
                  style={{ backgroundColor: `${dotColor(skill)}1f`, color: INK }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor(skill) }} />
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Coding Profiles */}
        {codingProfiles?.length > 0 && (
          <section className="mt-20">
            <SectionTitle accent={PALETTE[1]} number="02">Coding Profiles</SectionTitle>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {codingProfiles.map((profile, i) => (
                <a
                  key={i}
                  href={`https://${stripProtocol(profile.url)}`}
                  className="flex items-center gap-2 rounded-full px-3.5 py-1.5 font-sans text-[14px] font-semibold"
                  style={{ backgroundColor: `${dotColor(profile.platform)}1f`, color: INK }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} />
                  {profile.platform}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Selected Work */}
        {projects?.length > 0 && (
          <section className="relative mt-20">
            <SectionTitle accent={PALETTE[0]} number="03">Selected Work</SectionTitle>
            <div className="mt-10 space-y-16">
              {projects.map((project, i) => {
                const projectAccent = PALETTE[i % PALETTE.length];
                return (
                <article key={i}>
                  <div
                    className="flex aspect-[16/9] w-full items-end rounded-sm p-5"
                    style={{ background: `linear-gradient(135deg, ${projectAccent}, ${projectAccent}cc)` }}
                  >
                    <span className={`${fraunces.className} text-5xl font-bold italic text-white/50`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3
                    className={`${fraunces.className} mt-6 text-2xl font-semibold`}
                    style={{ color: INK }}
                  >
                    {project.name || "Project name"}
                  </h3>

                  <p className="mt-3 font-sans text-[16px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {project.description}
                  </p>

                  {project.highlights?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {project.highlights.map((point, j) => (
                        <p key={j} className={`${fraunces.className} text-[15px] italic`} style={{ color: MUTED }}>
                          {point}
                        </p>
                      ))}
                    </div>
                  )}

                  {project.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide"
                          style={{ backgroundColor: `${dotColor(tag)}1f`, color: dotColor(tag) }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {(project.link || project.demo) && (
                    <p className="mt-3 font-sans text-sm">
                      {project.link && (
                        <a
                          href={`https://${stripProtocol(project.link)}`}
                          className="underline underline-offset-4"
                          style={{ color: projectAccent }}
                        >
                          Source
                        </a>
                      )}
                      {project.link && project.demo && <span className="mx-2" style={{ color: MUTED }}>·</span>}
                      {project.demo && (
                        <a
                          href={`https://${stripProtocol(project.demo)}`}
                          className="underline underline-offset-4"
                          style={{ color: projectAccent }}
                        >
                          Live
                        </a>
                      )}
                    </p>
                  )}
                </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience-aware ordering: Education stands in for Experience
            when there's no work history yet (fresher-friendly). */}
        {hasExperience ? (
          <>
            <section className="mt-20">
              <SectionTitle accent={PALETTE[1]} number="04">Experience</SectionTitle>
              <div className="mt-8 space-y-10">
                {experience.map((job, i) => (
                  <TimelineEntry
                    key={i}
                    title={job.role}
                    subtitle={job.company}
                    start={job.start}
                    end={job.end}
                    lines={job.bullets}
                  />
                ))}
              </div>
            </section>
            {educationBlock}
          </>
        ) : (
          educationBlock
        )}

        {achievements?.length > 0 && (
          <section className="mt-20">
            <SectionTitle accent={PALETTE[2]} number="06">Achievements</SectionTitle>
            <ul className="mt-6 space-y-2 font-sans text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
              {achievements.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span style={{ color: PALETTE[i % PALETTE.length] }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Closing */}
        <section className="mt-24 border-t-4 pt-12" style={{ borderColor: POP }}>
          <p className={`${fraunces.className} text-3xl font-semibold italic`} style={{ color: INK }}>
            Let&rsquo;s talk.
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block font-sans text-sm font-semibold underline underline-offset-4"
              style={{ color: POP }}
            >
              {email}
            </a>
          )}
        </section>

        <footer className="mt-16 border-t pt-6" style={{ borderColor: `${ACCENT}15` }}>
          <p className="font-sans text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="mt-1 font-sans text-[10px]" style={{ color: `${MUTED}99` }}>
            Made with Dev Portfolio Builder
          </p>
        </footer>
      </div>
    </div>
  );
}
