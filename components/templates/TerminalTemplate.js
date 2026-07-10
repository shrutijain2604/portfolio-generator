// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.

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

export default function TerminalTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;
  const user = slug(name);

  return (
    <div className="relative min-h-dvh bg-zinc-950 font-mono text-[14px] leading-relaxed text-zinc-300">
      <CursorGlow />

      {/* Window chrome */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-2.5 backdrop-blur">
        <TrafficLights />
        <span className="text-xs text-zinc-600">{user}@dev — zsh</span>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-10">
        {/* about */}
        <Block label="About">
          <p className="text-xl font-semibold text-white">{name || "Your Name"}</p>
          <p className="mt-1 text-emerald-400">{role || "Your Role"}</p>
          <p className="mt-3 max-w-xl leading-relaxed text-zinc-400">{bio}</p>
        </Block>

        {/* contact */}
        <Block label="Contact">
          <ul className="space-y-2 text-zinc-400">
            {email && (
              <li className="flex items-center gap-2.5">
                <IconMail className="h-4 w-4 text-zinc-600" />
                <a href={`mailto:${email}`} className="hover:text-zinc-100">
                  {email}
                </a>
              </li>
            )}
            {links?.github && (
              <li className="flex items-center gap-2.5">
                <IconGithub className="h-4 w-4 text-zinc-600" />
                <a href={`https://${stripProtocol(links.github)}`} className="hover:text-zinc-100">
                  {stripProtocol(links.github)}
                </a>
              </li>
            )}
            {links?.linkedin && (
              <li className="flex items-center gap-2.5">
                <IconLinkedin className="h-4 w-4 text-zinc-600" />
                <a href={`https://${stripProtocol(links.linkedin)}`} className="hover:text-zinc-100">
                  {stripProtocol(links.linkedin)}
                </a>
              </li>
            )}
            {links?.website && (
              <li className="flex items-center gap-2.5">
                <IconLink className="h-4 w-4 text-zinc-600" />
                <a href={`https://${stripProtocol(links.website)}`} className="hover:text-zinc-100">
                  {stripProtocol(links.website)}
                </a>
              </li>
            )}
          </ul>
        </Block>

        {/* skills */}
        {skills?.length > 0 && (
          <Block label="Skills">
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
          </Block>
        )}

        {/* coding profiles */}
        {codingProfiles?.length > 0 && (
          <Block label="Coding Profiles">
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
          </Block>
        )}

        {/* experience */}
        {experience?.length > 0 && (
          <Block label="Experience">
            <div className="space-y-6">
              {experience.map((job, i) => (
                <div key={i}>
                  <p className="text-zinc-200">
                    <span className="font-semibold text-white">{job.role}</span>{" "}
                    <span className="text-zinc-500">at</span> {job.company}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {job.start} — {job.end}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {job.bullets?.map((bullet, j) => (
                      <li key={j} className="flex gap-2 text-zinc-400">
                        <span className="text-zinc-700">·</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* education */}
        {education?.length > 0 && (
          <Block label="Education">
            <ul className="space-y-2.5">
              {education.map((edu, i) => (
                <li key={i} className="text-zinc-300">
                  <span className="font-semibold text-white">{edu.degree}</span>
                  <span className="text-zinc-500"> — {edu.school}</span>
                  <div className="text-xs text-zinc-600">
                    {edu.start} — {edu.end}
                  </div>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* achievements */}
        {achievements?.length > 0 && (
          <Block label="Achievements">
            <ul className="space-y-2">
              {achievements.map((item, i) => (
                <li key={i} className="flex gap-2 text-zinc-300">
                  <span className="text-zinc-700">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* projects */}
        {projects?.length > 0 && (
          <Block label="Projects">
            <div className="space-y-5">
              {projects.map((project, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white">
                        {project.name || "package-name"}
                      </span>
                      <span className="text-xs text-zinc-600">v{project.version || "1.0.0"}</span>
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

                  <p className="mt-2 text-zinc-400">{project.description}</p>

                  {project.highlights?.length > 0 && (
                    <ul className="mt-2.5 space-y-1">
                      {project.highlights.map((point, j) => (
                        <li key={j} className="flex gap-2 text-sm text-zinc-500">
                          <span className="text-zinc-700">·</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {project.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                    <div className="mt-3 flex flex-wrap gap-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
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
          </Block>
        )}

        {/* closing prompt */}
        <div className="border-t border-zinc-900 pt-8">
          <p className="flex items-center gap-2 text-[13px] text-zinc-500">
            <span>{user}@dev:~</span>
            <span className="text-emerald-500">$</span>
            <span className="inline-block h-4 w-2 animate-pulse bg-emerald-500" />
          </p>
        </div>

        <footer className="mt-10 border-t border-zinc-900 pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="mt-1 text-[10px] text-zinc-800">Made with Dev Portfolio Builder</p>
        </footer>
      </div>
    </div>
  );
}
