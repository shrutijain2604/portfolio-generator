// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Fresher-aware, same pattern as Editorial: Education stands in for
// Experience when there's no work history yet.
/* eslint-disable @next/next/no-img-element */

import { Nunito } from "next/font/google";
import { IconGithub, IconLinkedin, IconLink, IconMail, initials, stripProtocol } from "./shared";
import CursorGlow from "./CursorGlow";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const PAPER = "#fdf5ec";
const INK = "#4a3c34";
const MUTED = "#8a7a6d";
const ACCENT = "#c1704a";

function SectionLabel({ children }) {
  return (
    <h2 className="text-2xl font-extrabold" style={{ color: INK }}>
      {children}
    </h2>
  );
}

function TimelineList({ items }) {
  return (
    <div className="relative mt-8 space-y-8 border-l-2 pl-6" style={{ borderColor: `${ACCENT}33` }}>
      {items.map((item, i) => (
        <div key={i} className="relative">
          <span
            className="absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4"
            style={{ backgroundColor: ACCENT, "--tw-ring-color": PAPER }}
          />
          <p className="font-bold" style={{ color: INK }}>
            {item.title}
          </p>
          <p className="text-sm" style={{ color: MUTED }}>
            {item.subtitle} · {item.start} – {item.end}
          </p>
          {item.text && (
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: INK }}>
              {item.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactPill({ href, icon, label }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: "white", color: INK, border: `1px solid ${ACCENT}33` }}
    >
      <span style={{ color: ACCENT }}>{icon}</span>
      {label}
    </a>
  );
}

export default function WarmTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;
  const firstName = (name || "there").trim().split(/\s+/)[0];

  const educationBlock = education?.length > 0 && (
    <section className="mt-16">
      <SectionLabel>Where I studied</SectionLabel>
      <TimelineList
        items={education.map((edu) => ({
          title: edu.degree,
          subtitle: edu.school,
          start: edu.start,
          end: edu.end,
        }))}
      />
    </section>
  );

  return (
    <div className={`relative min-h-full ${nunito.className}`} style={{ backgroundColor: PAPER, color: INK }}>
      <CursorGlow colorRgb="193, 112, 74" size={550} />

      <div className="relative mx-auto max-w-xl px-6 py-20 sm:px-10 sm:py-24">
        {/* Header */}
        <header className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name || "Portrait"}
              className="h-28 w-28 shrink-0 rounded-full object-cover shadow-md"
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl font-extrabold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #e0a06f)` }}
            >
              {initials(name)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: INK }}>
              Hi, I&rsquo;m {firstName} 👋
            </h1>
            <p className="mt-1 text-lg font-bold" style={{ color: ACCENT }}>
              {role || "Your Role"}
            </p>
          </div>
        </header>

        <p className="mt-8 text-center text-[17px] leading-relaxed sm:text-left" style={{ color: INK }}>
          {bio}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
          {email && <ContactPill href={`mailto:${email}`} icon={<IconMail className="h-4 w-4" />} label="Email" />}
          {links?.github && (
            <ContactPill
              href={`https://${stripProtocol(links.github)}`}
              icon={<IconGithub className="h-4 w-4" />}
              label="GitHub"
            />
          )}
          {links?.linkedin && (
            <ContactPill
              href={`https://${stripProtocol(links.linkedin)}`}
              icon={<IconLinkedin className="h-4 w-4" />}
              label="LinkedIn"
            />
          )}
          {links?.website && (
            <ContactPill
              href={`https://${stripProtocol(links.website)}`}
              icon={<IconLink className="h-4 w-4" />}
              label="Website"
            />
          )}
        </div>

        {/* Skills */}
        {skills?.length > 0 && (
          <section className="mt-16">
            <SectionLabel>Things I enjoy working with</SectionLabel>
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-3.5 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: `${ACCENT}16`, color: INK }}
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
            <SectionLabel>Where I practice</SectionLabel>
            <div className="mt-5 flex flex-wrap gap-3">
              {codingProfiles.map((profile, i) => (
                <ContactPill
                  key={i}
                  href={`https://${stripProtocol(profile.url)}`}
                  icon={<IconLink className="h-4 w-4" />}
                  label={profile.platform}
                />
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section className="mt-16">
            <SectionLabel>Things I&rsquo;ve built</SectionLabel>
            <div className="mt-6 space-y-6">
              {projects.map((project, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl shadow-sm"
                  style={{ backgroundColor: "white", border: `1px solid ${ACCENT}22` }}
                >
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="h-44 w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-28 w-full items-center justify-center text-4xl"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)` }}
                    >
                      🛠️
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold" style={{ color: INK }}>
                      {project.name || "Project name"}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed" style={{ color: INK }}>
                      {project.description}
                    </p>
                    {project.tags?.length > 0 && (
                      <p className="mt-3 text-xs font-semibold" style={{ color: MUTED }}>
                        {project.tags.join(" · ")}
                      </p>
                    )}
                    {(project.link || project.demo) && (
                      <p className="mt-3 text-sm font-bold">
                        {project.link && (
                          <a href={`https://${stripProtocol(project.link)}`} style={{ color: ACCENT }}>
                            Code
                          </a>
                        )}
                        {project.link && project.demo && (
                          <span className="mx-2" style={{ color: MUTED }}>
                            ·
                          </span>
                        )}
                        {project.demo && (
                          <a href={`https://${stripProtocol(project.demo)}`} style={{ color: ACCENT }}>
                            Live
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience-aware ordering: Education stands in for Experience
            when there's no work history yet (fresher-friendly). */}
        {hasExperience ? (
          <>
            <section className="mt-16">
              <SectionLabel>Where I&rsquo;ve worked</SectionLabel>
              <TimelineList
                items={experience.map((job) => ({
                  title: `${job.role} at ${job.company}`,
                  subtitle: job.company,
                  start: job.start,
                  end: job.end,
                  text: job.bullets?.join(" "),
                }))}
              />
            </section>
            {educationBlock}
          </>
        ) : (
          educationBlock
        )}

        {/* Achievements */}
        {achievements?.length > 0 && (
          <section className="mt-16">
            <SectionLabel>A few highlights</SectionLabel>
            <ul className="mt-5 space-y-2 text-[15px] leading-relaxed" style={{ color: INK }}>
              {achievements.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span style={{ color: ACCENT }}>♥</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Closing */}
        <section className="mt-20 rounded-3xl p-8 text-center" style={{ backgroundColor: `${ACCENT}0f` }}>
          <p className="text-xl font-extrabold" style={{ color: INK }}>
            Say hello 👋
          </p>
          <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
            I&rsquo;d love to hear from you — about a role, a project, or just to say hi.
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: ACCENT }}
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
