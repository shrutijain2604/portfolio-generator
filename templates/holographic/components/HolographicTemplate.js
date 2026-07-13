"use client";

// Pure presentational component: renders portfolio `data` only, no state of
// its own — same contract every template here follows (see
// EditorialTemplate.js's header comment for why).
//
// The look: the whole portfolio as a collectible foil trading-card deck —
// a hero "cover" card up top, then one small card per experience/education/
// achievement/project entry in a masonry grid below (a "binder page"), each
// with a rainbow holographic sheen that tilts and shifts with the cursor.
// Fixed built-in look (no customer palette picker), same reasoning as
// Terminal/Spotify/Retro Desktop: the whole point is the shifting rainbow
// foil, not a single hue — a color picker would work against the effect,
// not add real choice.
//
// Deliberately NOT literal trading-card game chrome (no fake HP/attack
// stats, no energy-type icons) — that reads as derivative/gimmicky. What's
// borrowed is the *effect* (foil sheen, tilt, rarity-bordered card) and the
// *framing* (a "binder" of individually-collectible cards), with real
// portfolio content, kept tasteful rather than costume-y.

import { useEffect, useRef } from "react";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, tint, hexToRgb, initials, stripProtocol } from "./shared";
import CursorGlow from "./CursorGlow";

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

const INK = "#f4f1ff";
const INK_SOFT = "#c9c3e8";
const MUTED = "#8781a8";
const CARD_BG = "#100c1e";
const RARITY_COLORS = ["#ffd76a", "#5ec9f0", "#ff7bd1", "#8b93ff", "#6fe3b4"];

// Reusable tilt + holographic-sheen wrapper: one mousemove listener per
// card, mutating the card's own transform and the sheen layer's
// background-position *directly on the DOM node* via refs rather than
// React state — tracking the cursor should never re-render the (possibly
// large) template tree on every pixel of mouse movement. The exact same
// direct-DOM-mutation performance pattern CursorGlow.js already
// established in this codebase, applied to a tilt+sheen effect instead of
// a following glow.
function HoloCard({ children, className = "", tiltDegrees = 8 }) {
  const cardRef = useRef(null);
  const sheenRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return undefined;

    function handleMove(e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * tiltDegrees * 2;
      const rotateX = (0.5 - py) * tiltDegrees * 2;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      sheen.style.opacity = "1";
      sheen.style.backgroundPosition = `${px * 100}% ${py * 100}%`;
    }
    function handleLeave() {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      sheen.style.opacity = "0";
    }

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, [tiltDegrees]);

  return (
    <div ref={cardRef} className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}>
      {children}
      <div
        ref={sheenRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-color-dodge opacity-0 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, rgba(255,0,150,0.4) 32%, rgba(0,220,255,0.35) 42%, rgba(255,235,80,0.35) 52%, rgba(150,80,255,0.35) 62%, transparent 75%)",
          backgroundSize: "250% 250%",
        }}
      />
    </div>
  );
}

// Soft, sparse colored light in the void — this dark cosmic canvas needs
// some ambient fill of its own, same reasoning as PrismTemplate.js's
// AuroraBlobs (a flat dark background reads as empty on a wide desktop
// viewport), just more restrained/less saturated to fit a foil-card
// aesthetic rather than a full aurora wash. Sized in `vw` so the coverage
// scales with viewport width; drift is gated behind `prefers-reduced-
// motion: no-preference` like every other animated effect in this file.
function AmbientGlow({ colors }) {
  const [c1, c2, c3] = colors;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes holo-drift-1 { 0%, 100% { transform: translate(-6%, -8%); } 50% { transform: translate(5%, 6%); } }
        @keyframes holo-drift-2 { 0%, 100% { transform: translate(8%, 5%); } 50% { transform: translate(-5%, -6%); } }
        @keyframes holo-drift-3 { 0%, 100% { transform: translate(-4%, 6%); } 50% { transform: translate(6%, -8%); } }
        @media (prefers-reduced-motion: no-preference) {
          .holo-blob-1 { animation: holo-drift-1 30s ease-in-out infinite; }
          .holo-blob-2 { animation: holo-drift-2 34s ease-in-out infinite; }
          .holo-blob-3 { animation: holo-drift-3 26s ease-in-out infinite; }
        }
      `}</style>
      <div className="holo-blob-1 absolute -left-[12%] top-[5%] h-[45vw] w-[45vw] rounded-full blur-3xl" style={{ background: c1, opacity: 0.14 }} />
      <div className="holo-blob-2 absolute -right-[12%] top-[35%] h-[42vw] w-[42vw] rounded-full blur-3xl" style={{ background: c2, opacity: 0.12 }} />
      <div className="holo-blob-3 absolute -bottom-[15%] left-[25%] h-[48vw] w-[48vw] rounded-full blur-3xl" style={{ background: c3, opacity: 0.13 }} />
    </div>
  );
}

function RarityBorder({ color, children, className = "" }) {
  return (
    <div
      className={`rounded-3xl p-[2px] ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${tint(color, 0)} 40%, ${CARD_BG} 70%, ${color})` }}
    >
      <div className="rounded-[calc(1.5rem-2px)]" style={{ backgroundColor: CARD_BG }}>
        {children}
      </div>
    </div>
  );
}

function EntryCard({ accent, eyebrow, title, subtitle, meta, body, tags, links }) {
  return (
    <HoloCard className="mb-6 break-inside-avoid">
      <RarityBorder color={accent}>
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
            {eyebrow}
          </p>
          <p className="mt-2 break-words text-base font-bold" style={{ color: INK }}>
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 break-words text-[12.5px]" style={{ color: MUTED }}>
              {subtitle}
            </p>
          )}
          {meta && (
            <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
              {meta}
            </p>
          )}
          {body && (
            <p className="mt-3 whitespace-pre-line break-words text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
              {body}
            </p>
          )}
          {tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: tint(dotColor(tag), 22), color: "#fff" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {links?.length > 0 && (
            <p className="mt-3 text-xs">
              {links.map((link, i) => (
                <span key={link.href}>
                  {i > 0 && <span style={{ color: MUTED }}> · </span>}
                  <a href={link.href} className="underline underline-offset-4" style={{ color: accent }}>
                    {link.label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </RarityBorder>
    </HoloCard>
  );
}

function ChipsCard({ accent, eyebrow, children }) {
  // A regular (non-spanning) column item, same as EntryCard — see
  // PrismTemplate.js's masonry comment: mixing a `column-span: all` item
  // into a multi-column flow is a known cross-browser rendering quirk that
  // opens large, unpredictable gaps around it.
  return (
    <HoloCard className="mb-6 break-inside-avoid">
      <RarityBorder color={accent}>
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
            {eyebrow}
          </p>
          <div className="mt-3">{children}</div>
        </div>
      </RarityBorder>
    </HoloCard>
  );
}

export default function HolographicTemplate({ data }) {
  const { name, role, bio, email, photoUrl, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // One card per entry (a "binder page" of individually-collectible cards),
  // grouped by section but flattened into a single ordered list so the
  // masonry grid below can size every card to its own content — see
  // PrismTemplate.js's own masonry comment for why a CSS grid (which forces
  // every card in a row to match its tallest neighbor) isn't used here.
  const entryCards = [];
  (sectionOrder || []).forEach((id, sectionIndex) => {
    const accent = RARITY_COLORS[sectionIndex % RARITY_COLORS.length];
    if (id === "experience" && experience?.length > 0) {
      experience.forEach((job, i) =>
        entryCards.push(
          <EntryCard
            key={`experience-${i}`}
            accent={accent}
            eyebrow={SECTION_LABELS.experience}
            title={job.role || "Role"}
            subtitle={job.company}
            meta={`${job.start} — ${job.end}`}
            body={job.bullets?.[0]}
          />
        )
      );
    }
    if (id === "education" && education?.length > 0) {
      education.forEach((edu, i) =>
        entryCards.push(
          <EntryCard
            key={`education-${i}`}
            accent={accent}
            eyebrow={SECTION_LABELS.education}
            title={edu.degree || "Degree"}
            subtitle={edu.school}
            meta={`${edu.start}–${edu.end}`}
          />
        )
      );
    }
    if (id === "achievements" && achievements?.length > 0) {
      achievements.forEach((item, i) =>
        entryCards.push(<EntryCard key={`achievement-${i}`} accent={accent} eyebrow="Achievement" title={item} />)
      );
    }
    if (id === "projects" && projects?.length > 0) {
      projects.forEach((project, i) =>
        entryCards.push(
          <EntryCard
            key={`project-${i}`}
            accent={accent}
            eyebrow={SECTION_LABELS.projects}
            title={project.name || "Project"}
            body={project.description}
            tags={project.tags}
            links={[
              project.link && { label: "Source", href: `https://${stripProtocol(project.link)}` },
              project.demo && { label: "Live", href: `https://${stripProtocol(project.demo)}` },
            ].filter(Boolean)}
          />
        )
      );
    }
    if (id === "skills" && skills?.length > 0) {
      entryCards.push(
        <ChipsCard key="skills" accent={accent} eyebrow={SECTION_LABELS.skills}>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ backgroundColor: tint(dotColor(skill), 20), color: "#fff", border: `1px solid ${tint(dotColor(skill), 45)}` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </ChipsCard>
      );
    }
    if (id === "codingProfiles" && codingProfiles?.length > 0) {
      entryCards.push(
        <ChipsCard key="codingProfiles" accent={accent} eyebrow={SECTION_LABELS.codingProfiles}>
          <div className="flex flex-wrap gap-2">
            {codingProfiles.map((profile, i) => (
              <a
                key={profile.platform + i}
                href={`https://${stripProtocol(profile.url)}`}
                className="rounded-full px-3 py-1 text-[12px] font-semibold underline-offset-4 hover:underline"
                style={{ backgroundColor: tint(dotColor(profile.platform), 20), color: "#fff", border: `1px solid ${tint(dotColor(profile.platform), 45)}` }}
              >
                {profile.platform}
              </a>
            ))}
          </div>
        </ChipsCard>
      );
    }
  });

  const statLine = [
    experience?.length > 0 && `${experience.length} role${experience.length > 1 ? "s" : ""}`,
    projects?.length > 0 && `${projects.length} project${projects.length > 1 ? "s" : ""}`,
    skills?.length > 0 && `${skills.length} skill${skills.length > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ backgroundColor: "#030208" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top, #1a1330 0%, #030208 70%)" }} />
      <AmbientGlow colors={[RARITY_COLORS[3], RARITY_COLORS[2], RARITY_COLORS[1]]} />
      <CursorGlow colorRgb={hexToRgb("#8b93ff")} size={600} />

      <div className="relative mx-auto max-w-[1800px] px-6 py-16 sm:px-10 sm:py-20 xl:px-16">
        {/* Hero cover card — a horizontal layout on wide screens (photo
            left, text block right) instead of just stretching a centered
            column wider, which would have left the extra width as empty
            padding either side of the text rather than actually using it. */}
        <HoloCard tiltDegrees={6} className="mx-auto max-w-3xl lg:max-w-5xl">
          <RarityBorder color={RARITY_COLORS[0]}>
            <div className="flex flex-col items-center gap-6 px-8 py-10 text-center lg:flex-row lg:items-center lg:px-16 lg:py-14 lg:text-left">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-20 w-20 shrink-0 rounded-full border-2 object-cover lg:h-36 lg:w-36" style={{ borderColor: RARITY_COLORS[0] }} />
              ) : (
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold text-white lg:h-36 lg:w-36 lg:text-3xl"
                  style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[1]}, ${RARITY_COLORS[3]})`, borderColor: RARITY_COLORS[0] }}
                >
                  {initials(name)}
                </div>
              )}
              <div className="min-w-0 lg:flex-1">
                <h1 className="break-words text-3xl font-bold tracking-tight lg:text-5xl" style={{ color: INK }}>
                  {name || "Your Name"}
                </h1>
                <p
                  className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ backgroundColor: tint(RARITY_COLORS[0], 20), color: RARITY_COLORS[0] }}
                >
                  {role || "Your Role"}
                </p>
                {bio && (
                  <p className="mt-4 max-w-2xl break-words whitespace-pre-line text-[13.5px] leading-relaxed lg:text-[15px]" style={{ color: INK_SOFT }}>
                    {bio}
                  </p>
                )}
                {statLine && (
                  <p className="mt-5 border-t pt-4 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ borderColor: `${MUTED}33`, color: MUTED }}>
                    {statLine}
                  </p>
                )}
              </div>
            </div>
          </RarityBorder>
        </HoloCard>

        {/* The deck */}
        {entryCards.length > 0 && <div className="mt-14 columns-1 sm:columns-2 sm:gap-6 lg:columns-3 2xl:columns-4">{entryCards}</div>}

        {/* Closing contact */}
        {contactItems.length > 0 && (
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {contactItems.map(({ label, href, Icon }, i) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-75"
                  style={{
                    color: "#fff",
                    borderColor: tint(RARITY_COLORS[0], 45),
                    backgroundColor: i === 0 ? tint(RARITY_COLORS[0], 18) : "transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-xs" style={{ color: MUTED }}>
          <p>
            © {new Date().getFullYear()} {name || "Your Name"}
          </p>
          <p className="mt-1 opacity-70">Made with Dev Portfolio Builder</p>
        </footer>
      </div>
    </div>
  );
}
