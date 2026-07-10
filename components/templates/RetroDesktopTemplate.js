"use client";

// Pure presentational component in spirit — it still renders only from the
// `data` prop with no data of its own — but unlike the other templates it
// keeps one small piece of local UI state: which window is currently
// focused. Desktop icons and taskbar buttons are genuinely clickable and
// switch between real "windows" instead of everything being statically
// stacked (which made the icons/taskbar decorative and useless). Fresher-
// aware: Experience.txt falls back to Education when there's no work history.

import { useState } from "react";
import { IconGithub, IconLinkedin, IconLink, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const RAISED = "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";
const SUNKEN = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf";
const TITLEBAR = "linear-gradient(90deg, #000080, #1084d0)";

function IconFolder({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M2 9a2 2 0 0 1 2-2h8l3 3h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" fill="#ffd75e" stroke="#8a6d1a" strokeWidth="1" />
    </svg>
  );
}

function IconFile({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M7 2h13l7 7v21a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
      <path d="M20 2v7h7" fill="none" stroke="#6b7280" strokeWidth="1" />
      <path d="M10 15h12M10 19h12M10 23h8" stroke="#1084d0" strokeWidth="1.4" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M9 10h14l-1.2 17a2 2 0 0 1-2 1.8H12.2a2 2 0 0 1-2-1.8L9 10Z" fill="#d1d5db" stroke="#4b5563" strokeWidth="1" />
      <path d="M6 10h20M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" fill="none" stroke="#4b5563" strokeWidth="1.4" />
    </svg>
  );
}

function IconEnvelope({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <rect x="3" y="7" width="26" height="19" fill="#ffffff" stroke="#4b5563" strokeWidth="1" />
      <path d="M3 8l13 10L29 8" fill="none" stroke="#1084d0" strokeWidth="1.6" />
    </svg>
  );
}

function IconRibbon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="12" r="8" fill="#ffcf40" stroke="#a8801f" strokeWidth="1" />
      <path d="M11 18 8 29l8-4 8 4-3-11" fill="#e0433d" stroke="#9c2b26" strokeWidth="1" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="13" fill="#ffffff" stroke="#1084d0" strokeWidth="1.5" />
      <circle cx="16" cy="10.5" r="1.8" fill="#1084d0" />
      <rect x="14.3" y="14" width="3.4" height="11" rx="1" fill="#1084d0" />
    </svg>
  );
}

function IconWinFlag({ className }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <rect x="1" y="1" width="8" height="8" fill="#f35325" />
      <rect x="11" y="1" width="8" height="8" fill="#81bc06" />
      <rect x="1" y="11" width="8" height="8" fill="#05a6f0" />
      <rect x="11" y="11" width="8" height="8" fill="#ffba08" />
    </svg>
  );
}

function TitleBarButton({ children, onClick }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex h-4 w-4 items-center justify-center bg-[#c0c0c0] text-[9px] font-bold leading-none text-black"
      style={{ boxShadow: RAISED }}
    >
      {children}
    </Tag>
  );
}

function Window({ icon, title, children, onClose }) {
  return (
    <div className="bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
      <div className="flex items-center justify-between gap-2 px-1.5 py-1" style={{ background: TITLEBAR }}>
        <div className="flex min-w-0 items-center gap-1.5 text-white">
          {icon}
          <span className="truncate text-xs font-bold">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <TitleBarButton>_</TitleBarButton>
          <TitleBarButton>□</TitleBarButton>
          <TitleBarButton onClick={onClose}>×</TitleBarButton>
        </div>
      </div>
      <div className="bg-[#c0c0c0] p-3">{children}</div>
    </div>
  );
}

function DesktopIcon({ icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-20 flex-col items-center gap-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center">{icon}</div>
      <span
        className="px-1 text-[11px] text-white"
        style={{
          textShadow: active ? "none" : "1px 1px 1px #000",
          backgroundColor: active ? "#000080" : "transparent",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function TaskbarButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap px-3 py-1 text-[11px] text-black"
      style={{ boxShadow: active ? SUNKEN : RAISED, backgroundColor: active ? "#dfdfdf" : "#c0c0c0" }}
    >
      {label}
    </button>
  );
}

export default function RetroDesktopTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects } = data;
  const hasExperience = experience && experience.length > 0;
  const yearsXp = computeYearsOfExperience(experience);
  const clock = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const firstName = (name || "About").trim().split(/\s+/)[0];

  const resumeText = hasExperience
    ? experience
        .map(
          (job) =>
            `${job.role || "Role"} — ${job.company || "Company"}\n${job.start || ""} - ${job.end || ""}\n${(job.bullets || [])
              .map((b) => `  - ${b}`)
              .join("\n")}`
        )
        .join("\n\n")
    : (education || [])
        .map((edu) => `${edu.degree || "Degree"} — ${edu.school || "School"}\n${edu.start || ""} - ${edu.end || ""}`)
        .join("\n\n");

  const sections = [
    {
      id: "about",
      label: `${firstName}_Me.txt`,
      icon: <IconFile className="h-8 w-8" />,
      titleIcon: <IconFile className="h-4 w-4" />,
      title: `${firstName}_Me.txt - Notepad`,
      content: (
        <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
          {`${name || "Your Name"}\n${role || "Your Role"}\n\n${bio || ""}`}
        </div>
      ),
    },
    resumeText && {
      id: "resume",
      label: "Experience.txt",
      icon: <IconFile className="h-8 w-8" />,
      titleIcon: <IconFile className="h-4 w-4" />,
      title: "Experience.txt - Notepad",
      content: (
        <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
          {resumeText}
          {yearsXp > 0 && `\n\n(${yearsXp} yrs experience)`}
        </div>
      ),
    },
    projects?.length > 0 && {
      id: "projects",
      label: "Projects",
      icon: <IconFolder className="h-8 w-8" />,
      titleIcon: <IconFolder className="h-4 w-4" />,
      title: "Projects",
      content: (
        <div className="bg-white" style={{ boxShadow: SUNKEN }}>
          <div className="flex items-center justify-between border-b border-[#808080] bg-[#dfdfdf] px-2 py-1 text-[11px] font-bold text-black">
            <span>Name</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[#e5e5e5]">
            {projects.map((project, i) => (
              <div key={i} className={i % 2 === 1 ? "bg-[#f4f4f4] px-2 py-2" : "px-2 py-2"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <IconFile className="h-4 w-4" />
                    <span className="text-xs font-semibold text-black">{project.name || "project"}</span>
                    <span className="text-[10px] text-gray-500">v{project.version || "1.0.0"}</span>
                  </div>
                  {project.status && (
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color:
                          project.status.toLowerCase() === "active"
                            ? "#0a7d2c"
                            : project.status.toLowerCase() === "archived"
                              ? "#6b7280"
                              : "#a8710a",
                      }}
                    >
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 pl-5 text-xs text-gray-700">{project.description}</p>
                {project.tags?.length > 0 && (
                  <p className="mt-1 pl-5 text-[10px] text-gray-500">{project.tags.join(", ")}</p>
                )}
                {(project.link || project.demo) && (
                  <p className="mt-1 pl-5 text-[10px]">
                    {project.link && (
                      <a href={`https://${stripProtocol(project.link)}`} className="text-[#1084d0] underline">
                        Source
                      </a>
                    )}
                    {project.link && project.demo && " · "}
                    {project.demo && (
                      <a href={`https://${stripProtocol(project.demo)}`} className="text-[#1084d0] underline">
                        Live
                      </a>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    skills?.length > 0 && {
      id: "skills",
      label: "Skills.txt",
      icon: <IconFile className="h-8 w-8" />,
      titleIcon: <IconFile className="h-4 w-4" />,
      title: "Skills.txt - Notepad",
      content: (
        <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
          {skills.map((s) => `- ${s}`).join("\n")}
        </div>
      ),
    },
    codingProfiles?.length > 0 && {
      id: "coding-profiles",
      label: "CodingProfiles.txt",
      icon: <IconFile className="h-8 w-8" />,
      titleIcon: <IconFile className="h-4 w-4" />,
      title: "CodingProfiles.txt - Notepad",
      content: (
        <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
          {codingProfiles.map((p) => `- ${p.platform}: ${stripProtocol(p.url)}`).join("\n")}
        </div>
      ),
    },
    achievements?.length > 0 && {
      id: "achievements",
      label: "Achievements.txt",
      icon: <IconRibbon className="h-8 w-8" />,
      titleIcon: <IconRibbon className="h-4 w-4" />,
      title: "Achievements.txt - Notepad",
      content: (
        <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
          {achievements.map((a) => `* ${a}`).join("\n")}
        </div>
      ),
    },
    {
      id: "contact",
      label: "Contact.txt",
      icon: <IconEnvelope className="h-8 w-8" />,
      titleIcon: <IconEnvelope className="h-4 w-4" />,
      title: "Contact_Me.txt - Notepad",
      content: (
        <>
          <div className="bg-white p-3 text-xs text-black" style={{ boxShadow: SUNKEN }}>
            <div className="space-y-1">
              {email && <p>Email: {email}</p>}
              {links?.github && <p>GitHub: {stripProtocol(links.github)}</p>}
              {links?.linkedin && <p>LinkedIn: {stripProtocol(links.linkedin)}</p>}
              {links?.website && <p>Website: {stripProtocol(links.website)}</p>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {email && (
              <a href={`mailto:${email}`} className="bg-[#c0c0c0] px-4 py-1 text-xs font-bold text-black" style={{ boxShadow: RAISED }}>
                Send Email
              </a>
            )}
            {links?.github && (
              <a
                href={`https://${stripProtocol(links.github)}`}
                className="flex items-center gap-1.5 bg-[#c0c0c0] px-3 py-1 text-xs font-bold text-black"
                style={{ boxShadow: RAISED }}
              >
                <IconGithub className="h-3.5 w-3.5" /> GitHub
              </a>
            )}
            {links?.linkedin && (
              <a
                href={`https://${stripProtocol(links.linkedin)}`}
                className="flex items-center gap-1.5 bg-[#c0c0c0] px-3 py-1 text-xs font-bold text-black"
                style={{ boxShadow: RAISED }}
              >
                <IconLinkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
            {links?.website && (
              <a
                href={`https://${stripProtocol(links.website)}`}
                className="flex items-center gap-1.5 bg-[#c0c0c0] px-3 py-1 text-xs font-bold text-black"
                style={{ boxShadow: RAISED }}
              >
                <IconLink className="h-3.5 w-3.5" /> Website
              </a>
            )}
          </div>
        </>
      ),
    },
  ].filter(Boolean);

  const [activeId, setActiveId] = useState(sections[0].id);
  const [binOpen, setBinOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const active = sections.find((s) => s.id === activeId) || sections[0];

  // Real counts only — no invented stats, same rule as every other template.
  const tipParts = [
    projects?.length > 0 && `${projects.length} project${projects.length === 1 ? "" : "s"}`,
    skills?.length > 0 && `${skills.length} skill${skills.length === 1 ? "" : "s"}`,
    achievements?.length > 0 && `${achievements.length} achievement${achievements.length === 1 ? "" : "s"}`,
  ].filter(Boolean);

  return (
    <div
      className="relative flex h-dvh flex-col"
      style={{ background: "radial-gradient(140% 100% at 30% 0%, #0a9a9a 0%, #007575 55%, #005f5f 100%)" }}
    >
      {/* Diagonal texture + vignette so the desktop reads as a textured
          fill, not a flat teal rectangle. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 8px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, transparent 45%, rgba(0,0,0,0.28) 100%)" }}
      />
      <CursorGlow colorRgb="120, 220, 255" size={550} />

      {/* Scrollable desktop area — the taskbar below lives outside this,
          as a plain (non-growing) flex item, so it always stays put at the
          bottom of the view instead of trailing the active window's
          content height. */}
      <div className="relative flex-1 overflow-y-auto px-6 pb-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
        {/* Welcome dialog — classic Windows 95 startup screen */}
        {welcomeOpen && (
          <div className="mb-8">
            <Window icon={<IconInfo className="h-4 w-4" />} title="Welcome" onClose={() => setWelcomeOpen(false)}>
              <div className="flex gap-4">
                <IconInfo className="h-12 w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-black">
                    Welcome to {name ? `${name}'s` : "this"} Desktop!
                  </p>
                  {role && <p className="mt-0.5 text-xs text-gray-700">{role}</p>}
                  <div className="mt-3 border-t border-[#808080] pt-3">
                    <p className="text-xs font-bold text-black">Tip of the day:</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700">
                      {tipParts.length > 0
                        ? `This desktop has ${tipParts.join(", ")} to explore — click an icon or a taskbar button to open it.`
                        : "Click an icon or a taskbar button below to open a window."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] text-black">
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white" style={{ boxShadow: SUNKEN }} />
                  Show this welcome screen next time
                </label>
                <button
                  type="button"
                  onClick={() => setWelcomeOpen(false)}
                  className="bg-[#c0c0c0] px-6 py-1 text-xs font-bold text-black"
                  style={{ boxShadow: RAISED }}
                >
                  OK
                </button>
              </div>
            </Window>
          </div>
        )}

        {/* Desktop icons */}
        <div className="mb-8 flex select-none flex-wrap gap-2">
          {sections.map((s) => (
            <DesktopIcon
              key={s.id}
              icon={s.icon}
              label={s.label}
              active={activeId === s.id && !binOpen}
              onClick={() => {
                setBinOpen(false);
                setActiveId(s.id);
              }}
            />
          ))}
          <DesktopIcon
            icon={<IconTrash className="h-8 w-8" />}
            label="Recycle Bin"
            active={binOpen}
            onClick={() => setBinOpen(true)}
          />
        </div>

        {/* The one open window */}
        {binOpen ? (
          <Window icon={<IconTrash className="h-4 w-4" />} title="Recycle Bin">
            <p className="bg-white p-3 text-xs text-gray-500" style={{ boxShadow: SUNKEN }}>
              This folder is empty.
            </p>
          </Window>
        ) : (
          <Window icon={active.titleIcon} title={active.title}>
            {active.content}
          </Window>
        )}
        </div>
      </div>

      {/* Taskbar — a plain shrink-0 flex item, not sticky, so its position
          never depends on how tall the active window's content is. */}
      <div className="flex shrink-0 items-center gap-2 bg-[#c0c0c0] px-2 py-1" style={{ boxShadow: RAISED }}>
        <span className="flex items-center gap-1.5 bg-[#c0c0c0] px-2.5 py-1 text-xs font-bold text-black" style={{ boxShadow: RAISED }}>
          <IconWinFlag className="h-4 w-4" /> Start
        </span>
        <div className="h-6 w-px bg-[#808080]" />
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {sections.map((s) => (
            <TaskbarButton
              key={s.id}
              label={s.label}
              active={activeId === s.id && !binOpen}
              onClick={() => {
                setBinOpen(false);
                setActiveId(s.id);
              }}
            />
          ))}
        </div>
        <div className="whitespace-nowrap bg-[#dfdfdf] px-3 py-1 text-[11px] text-black" style={{ boxShadow: SUNKEN }}>
          {clock}
        </div>
      </div>
    </div>
  );
}
