// Pure presentational component: renders portfolio `data` only, no state of
// its own. Every template follows this contract so the editor can swap
// templates without touching the user's entered data.
//
// Every HUD number here is derived from real inputs, not invented: level
// tracks years of experience (or role count as a fallback), XP is a
// non-literal growth visual built from real content counts, and
// achievement "rarity" is computed from how complete a project actually is
// (has a live demo, has documented highlights) rather than assigned at
// random.

import { Press_Start_2P, VT323 } from "next/font/google";
import { IconGithub, IconLinkedin, IconLink, IconMail, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400" });
const vt323 = VT323({ subsets: ["latin"], weight: "400" });

const BG = "#0c0e14";
const PANEL = "#151824";
const BORDER = "#2a2f40";
const GREEN = "#4ade80";
const GOLD = "#ffd166";
const GOLD_DIM = "#ffb74d";
const TEXT = "#d7dae3";
const TEXT_BRIGHT = "#f2f3f5";
const MUTED = "#9aa5b4";

const RARITY = {
  common: { border: "#4b5566", glow: "none", color: "#9aa5b4", label: "COMMON" },
  rare: { border: "#3b82c4", glow: "0 0 10px rgba(59,130,196,0.35)", color: "#7cc1f5", label: "RARE" },
  legendary: { border: "#c98a2e", glow: "0 0 14px rgba(255,183,77,0.4)", color: GOLD_DIM, label: "LEGENDARY" },
};

function IconTrophy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.2M17 5h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.2" />
    </svg>
  );
}

function IconBolt(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 15 9l7 1-5.2 5 1.3 7-6.1-3.4L5.9 22l1.3-7L2 10l7-1 3-6.5Z" />
    </svg>
  );
}

function SectionHeading({ icon, children }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <span className={`${pressStart.className} text-xs`} style={{ color: TEXT_BRIGHT }}>
        {children}
      </span>
    </div>
  );
}

function IconBook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

function IconSword(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m14.5 3.5 6 6L9 21l-5 1 1-5 9.5-9.5Z" />
      <path d="m13 5 6 6" />
    </svg>
  );
}

function TimelineList({ items, accent }) {
  return (
    <div className="relative space-y-6 border-l-2 pl-6" style={{ borderColor: `${accent}44` }}>
      {items.map((item, i) => (
        <div key={i} className="relative">
          <span
            className="absolute -left-[31px] top-1 h-3 w-3 rounded-sm"
            style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}88` }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-lg" style={{ color: TEXT_BRIGHT }}>
              {item.title}
              {item.subtitle && <span style={{ color: MUTED }}> — {item.subtitle}</span>}
            </span>
            <span className="text-sm" style={{ color: MUTED }}>
              {item.start} – {item.end}
            </span>
          </div>
          {item.lines?.length > 0 && (
            <ul className="mt-1.5 space-y-1">
              {item.lines.map((line, j) => (
                <li key={j} className="flex gap-2 text-base leading-snug" style={{ color: MUTED }}>
                  <span style={{ color: accent }}>▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function XPBar({ xp, xpToNext }) {
  const pct = Math.min(100, (xp / xpToNext) * 100);
  return (
    <div>
      <div className={`${vt323.className} mb-1 flex justify-between text-base`} style={{ color: GOLD }}>
        <span>
          XP {xp} / {xpToNext}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-sm" style={{ background: "#1e2230", border: `2px solid ${BORDER}` }}>
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`,
            boxShadow: "0 0 8px rgba(255,209,102,0.5)",
          }}
        />
      </div>
    </div>
  );
}

export default function LevelUpTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;

  const yearsXp = computeYearsOfExperience(experience);
  const level = Math.max(1, yearsXp || experience?.length || 1);

  const xp =
    (skills?.length || 0) * 100 +
    (projects?.length || 0) * 300 +
    (experience?.length || 0) * 500 +
    (achievements?.length || 0) * 200 +
    yearsXp * 150;
  const xpToNext = Math.max(1000, Math.ceil((xp + 1) / 1000) * 1000);

  const builderScore =
    (projects?.length || 0) * 150 +
    (experience?.length || 0) * 300 +
    (skills?.length || 0) * 40 +
    (achievements?.length || 0) * 120 +
    yearsXp * 80;

  // Rarity is computed from how complete a project entry actually is — a
  // live demo, a repo link, and 2+ documented highlights — not assigned
  // at random.
  function projectRarity(p) {
    const completeness = (p.demo ? 1 : 0) + (p.link ? 1 : 0) + (p.highlights?.length >= 2 ? 1 : 0);
    return completeness >= 3 ? "legendary" : completeness >= 1 ? "rare" : "common";
  }

  const educationBlock = education?.length > 0 && (
    <div className="mb-8">
      <SectionHeading icon={<IconBook className="h-4 w-4" style={{ color: GREEN }} />}>
        ORIGIN STORY
      </SectionHeading>
      <div className="rounded-md p-4" style={{ background: PANEL, border: `2px solid ${BORDER}` }}>
        <TimelineList
          accent={GREEN}
          items={education.map((edu) => ({
            title: edu.degree,
            subtitle: edu.school,
            start: edu.start,
            end: edu.end,
          }))}
        />
      </div>
    </div>
  );

  return (
    <div className={`relative min-h-full ${vt323.className}`} style={{ backgroundColor: BG, color: TEXT }}>
      <CursorGlow colorRgb="74, 222, 128" size={450} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8">
        {/* HUD top bar */}
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md p-4"
          style={{ background: PANEL, border: `2px solid ${BORDER}` }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`${pressStart.className} flex h-14 w-14 items-center justify-center rounded-sm text-xs`}
              style={{ background: "#1e2230", border: `2px solid ${GREEN}`, color: GREEN }}
            >
              LV{level}
            </div>
            <div>
              <div className={`${pressStart.className} mb-1 text-sm`} style={{ color: TEXT_BRIGHT }}>
                {name || "Your Name"}
              </div>
              <div className="text-lg" style={{ color: MUTED }}>
                {role || "Your Role"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm" style={{ color: MUTED }}>
              BUILDER SCORE
            </div>
            <div
              className={`${pressStart.className} text-2xl`}
              style={{ color: GOLD, textShadow: "0 0 12px rgba(255,209,102,0.5)" }}
            >
              {builderScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* About */}
        {bio && (
          <div className="mb-8">
            <SectionHeading icon={<IconStar className="h-4 w-4" style={{ color: GREEN }} />}>ABOUT</SectionHeading>
            <div className="rounded-md p-4" style={{ background: PANEL, border: `2px solid ${BORDER}` }}>
              <p className="text-lg leading-relaxed" style={{ color: TEXT }}>
                {bio}
              </p>
            </div>
          </div>
        )}

        {/* XP bar */}
        <div className="mb-8">
          <XPBar xp={xp} xpToNext={xpToNext} />
        </div>

        {/* stat sheet */}
        {skills?.length > 0 && (
          <div className="mb-8">
            <SectionHeading icon={<IconBolt className="h-4 w-4" style={{ color: GREEN }} />}>
              STAT SHEET
            </SectionHeading>
            <div className="rounded-md p-4" style={{ background: PANEL, border: `2px solid ${BORDER}` }}>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-base"
                    style={{ background: "#1e2230", border: `1px solid ${GREEN}55`, color: TEXT }}
                  >
                    <IconStar className="h-3.5 w-3.5" style={{ color: GREEN }} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* coding profiles */}
        {codingProfiles?.length > 0 && (
          <div className="mb-8">
            <SectionHeading icon={<IconBolt className="h-4 w-4" style={{ color: GREEN }} />}>
              CODING PROFILES
            </SectionHeading>
            <div className="rounded-md p-4" style={{ background: PANEL, border: `2px solid ${BORDER}` }}>
              <div className="flex flex-wrap gap-2.5">
                {codingProfiles.map((profile, i) => (
                  <a
                    key={i}
                    href={`https://${stripProtocol(profile.url)}`}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-base"
                    style={{ background: "#1e2230", border: `1px solid ${GREEN}55`, color: TEXT }}
                  >
                    <IconStar className="h-3.5 w-3.5" style={{ color: GREEN }} />
                    {profile.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quest Log — full project detail, not just a one-line trophy */}
        {projects?.length > 0 && (
          <div className="mb-8">
            <SectionHeading icon={<IconSword className="h-4 w-4" style={{ color: GOLD }} />}>
              QUEST LOG
            </SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((project, i) => {
                const r = RARITY[projectRarity(project)];
                return (
                  <div
                    key={i}
                    className="rounded-md p-4"
                    style={{ background: PANEL, border: `2px solid ${r.border}`, boxShadow: r.glow }}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-lg" style={{ color: TEXT_BRIGHT }}>
                        {project.name || "Untitled project"}
                      </span>
                      <span className={pressStart.className} style={{ fontSize: "8px", color: r.color }}>
                        {r.label}
                      </span>
                    </div>
                    <p className="text-base leading-snug" style={{ color: MUTED }}>
                      {project.description}
                    </p>
                    {project.tags?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-sm px-2 py-0.5 text-xs"
                            style={{ background: "#1e2230", color: MUTED }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.link || project.demo) && (
                      <p className="mt-2.5 text-sm">
                        {project.link && (
                          <a href={`https://${stripProtocol(project.link)}`} style={{ color: GREEN }}>
                            Source
                          </a>
                        )}
                        {project.link && project.demo && (
                          <span className="mx-2" style={{ color: MUTED }}>
                            ·
                          </span>
                        )}
                        {project.demo && (
                          <a href={`https://${stripProtocol(project.demo)}`} style={{ color: GREEN }}>
                            Live
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience-aware ordering: Origin Story (education) stands in
            for the Mission Log when there's no work history yet. */}
        {hasExperience ? (
          <>
            <div className="mb-8">
              <SectionHeading icon={<IconSword className="h-4 w-4" style={{ color: GREEN }} />}>
                MISSION LOG
              </SectionHeading>
              <div className="rounded-md p-4" style={{ background: PANEL, border: `2px solid ${BORDER}` }}>
                <TimelineList
                  accent={GREEN}
                  items={experience.map((job) => ({
                    title: job.role,
                    subtitle: job.company,
                    start: job.start,
                    end: job.end,
                    lines: job.bullets,
                  }))}
                />
              </div>
            </div>
            {educationBlock}
          </>
        ) : (
          educationBlock
        )}

        {/* Achievements Unlocked — the user's own flagged milestones */}
        {achievements?.length > 0 && (
          <div className="mb-8">
            <SectionHeading icon={<IconTrophy className="h-4 w-4" style={{ color: GOLD }} />}>
              ACHIEVEMENTS UNLOCKED
            </SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((text, i) => (
                <div
                  key={i}
                  className="rounded-md p-3.5"
                  style={{ background: PANEL, border: `2px solid ${RARITY.legendary.border}`, boxShadow: RARITY.legendary.glow }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-lg" style={{ color: TEXT_BRIGHT }}>
                      Milestone
                    </span>
                    <span className={pressStart.className} style={{ fontSize: "8px", color: RARITY.legendary.color }}>
                      {RARITY.legendary.label}
                    </span>
                  </div>
                  <p className="text-base leading-snug" style={{ color: MUTED }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-md p-6 text-center" style={{ background: PANEL, border: `2px solid ${GREEN}44` }}>
          <p className={`${pressStart.className} text-sm`} style={{ color: GREEN }}>
            RECRUIT ME
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-bold"
              style={{ background: GREEN, color: "#0c0e14" }}
            >
              <IconMail className="h-4 w-4" />
              Send an email
            </a>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-5">
            {links?.github && (
              <a href={`https://${stripProtocol(links.github)}`} className="flex items-center gap-2 text-base" style={{ color: MUTED }}>
                <IconGithub className="h-4 w-4" />
                {stripProtocol(links.github)}
              </a>
            )}
            {links?.linkedin && (
              <a href={`https://${stripProtocol(links.linkedin)}`} className="flex items-center gap-2 text-base" style={{ color: MUTED }}>
                <IconLinkedin className="h-4 w-4" />
                {stripProtocol(links.linkedin)}
              </a>
            )}
            {links?.website && (
              <a href={`https://${stripProtocol(links.website)}`} className="flex items-center gap-2 text-base" style={{ color: MUTED }}>
                <IconLink className="h-4 w-4" />
                {stripProtocol(links.website)}
              </a>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm" style={{ color: `${MUTED}99` }}>
          © {new Date().getFullYear()} {name || "Your Name"} · Made with Dev Portfolio Builder
        </footer>
      </div>
    </div>
  );
}
