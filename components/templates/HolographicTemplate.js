"use client";

// Pure presentational component: renders portfolio `data` only, no state of
// its own, the same contract every template here follows (see
// EditorialTemplate.js's header comment for why).
//
// The look: holographic foil as a material, not science fiction. Real
// holograms are things people have actually held, a foil-stamped seal or a
// laminated card whose spectrum slides as it tilts, so this is pearl stock
// carrying one foil gradient. Every iridescent surface on the page (the name,
// the seal, the section numerals, the skill pills, the sheet edges and the
// light raking across them) is that same gradient at one shared position,
// held in `--iris`. Moving the pointer slides all of them together, which is
// the whole idea: one material, one light, one page.
//
// Two earlier builds are deliberately abandoned. The foil trading card deck
// was a dozen variations of one rounded card in a masonry column, and it also
// truncated real content. The volumetric projection that replaced it was
// dark, cyan, monospaced, and framed in bracketed panels, which is Level Up's
// wardrobe: two templates in one catalogue cannot dress the same. This one
// carries no monospace, no neon on black, and no hard corner anywhere: two
// radii, one hairline, one shadow, one gradient.
//
// Fixed built-in look, no customer palette picker, same reasoning as
// Terminal/Spotify/Retro Desktop: the subject is one iridescent material, and
// a hue picker would be picking a hue for the one thing defined by having all
// of them.
//
// No photo: the builder only offers photoUrl for warm/scrapbook/spotify (see
// EditForm.js's TEMPLATES_WITH_PHOTOS), so an <img> here could only ever
// resolve to the seeded /default-photo.jpg, which does not exist in this
// template's standalone app and 404s on every deployed copy. The seal carries
// the initials instead.

import { useEffect, useRef } from "react";
import { Manrope, Outfit } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { IconGithub, IconLinkedin, IconLink, IconMail, initials, stripProtocol } from "./shared";

// Outfit for display: geometric, close to circular, with no angular cut
// anywhere, which is what a foil surface wants. Manrope reads the body. No
// monospace at all, deliberately: a mono face is the strongest single signal
// of "terminal chrome", and four templates here already use one.
const display = Outfit({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--ir-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--ir-body" });

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

// Both forms spelled out rather than suffixed with an "s", which would turn
// "entry" into "entrys".
const SECTION_UNITS = {
  experience: ["role", "roles"],
  projects: ["project", "projects"],
  education: ["degree", "degrees"],
  achievements: ["entry", "entries"],
  skills: ["skill", "skills"],
  codingProfiles: ["profile", "profiles"],
};

const PEARL = "#f2f0f6";
const SHEET = "#ffffff";
const INK = "#141220";
const INK_SOFT = "#3c3849";
// Lightened no further than this: the usual #8b8697 is 3.9:1 against the
// pearl ground, which fails AA on the small text this colour carries.
const MUTED = "#696478";
const HAIRLINE = "rgba(20, 18, 32, 0.09)";
const SHADOW_REST = "0 20px 48px -24px rgba(20, 18, 32, 0.20)";
const SHADOW_LIFT = "0 38px 82px -28px rgba(20, 18, 32, 0.30)";

// The two radii the page is built from. Nothing else gets a corner: a pill for
// anything small, one generous curve for any surface.
const RADIUS_PLATE = "30px";

// The gutter the whole document hangs from: marginalia to its left, the spine
// on its edge, every surface to its right. One vertical alignment for the
// page, which is what the hero breaking off on its own margin was costing.
const GUTTER = "14rem";

// The foil stock itself. Kept as a CSS background rather than run through
// next/image because it is 25KB of decorative abstract colour with no intrinsic
// layout, so the optimizer has nothing to win and one plain URL behaves
// identically in the builder and in the standalone app. It is copied into both
// public directories on purpose: the standalone template apps ship no public
// folder, which is why other templates' wallpapers 404 once deployed.
const STOCK = "/holographic-bg.jpg";

// The stock is 547px wide and gets stretched across a desktop, which softens
// its own grain to mush, so a monochrome grain is laid back over it at native
// resolution. Inlined, so it costs no request and cannot be blocked.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23g)'/%3E%3C/svg%3E\")";

function plural(count, [one, many]) {
  return `${count} ${count === 1 ? one : many}`;
}

// One spectrum, two exposures. The hue order is identical in both, so a pale
// surface and a saturated one are visibly the same material caught at
// different angles rather than two unrelated gradients. Both ramps open and
// close on the same hue, which is what lets the gradient tile seamlessly, and
// tile it must: offsetting each pill along the spectrum by its own index runs
// off the end of a non-repeating gradient, and every pill past the tenth came
// out with no fill at all, reading as a ranking nobody entered.
const FOIL_PALE = [
  "hsl(184, 74%, 79%)",
  "hsl(206, 82%, 82%)",
  "hsl(232, 78%, 85%)",
  "hsl(278, 70%, 86%)",
  "hsl(320, 76%, 86%)",
  "hsl(354, 82%, 86%)",
  "hsl(38, 90%, 80%)",
  "hsl(160, 66%, 82%)",
  "hsl(184, 74%, 79%)",
];
const FOIL_DEEP = [
  "hsl(184, 58%, 31%)",
  "hsl(206, 60%, 38%)",
  "hsl(232, 52%, 45%)",
  "hsl(278, 46%, 46%)",
  "hsl(320, 52%, 43%)",
  "hsl(354, 58%, 44%)",
  "hsl(34, 62%, 38%)",
  "hsl(160, 48%, 32%)",
  "hsl(184, 58%, 31%)",
];

// `--iris` is the page's one shared parameter: where the spectrum sits on
// every foil surface. It drifts by itself until a pointer arrives and then
// follows it, so the material is alive on a phone and answerable on a desk.
// Registered with @property because a custom property is otherwise an
// un-interpolatable token and could not be animated at all.
//
// `--sx`/`--sy`/`--so` are per-sheet: where the light is raking across that
// one sheet, and how strongly. Every autoplaying animation sits inside
// `prefers-reduced-motion: no-preference`, so a reduced-motion preference
// never matches the rule and the still surface is already the finished state.
const TEMPLATE_CSS = `
@property --iris { syntax: "<number>"; inherits: true; initial-value: 50; }
.ir-display { font-family: var(--ir-display), ui-sans-serif, system-ui, sans-serif; }
.ir-body { font-family: var(--ir-body), ui-sans-serif, system-ui, sans-serif; }
.ir-foil, .ir-foil-deep {
  background-size: 340% 100%;
  background-position: calc(var(--iris) * 1%) 0;
  background-repeat: repeat;
}
.ir-foil { background-image: linear-gradient(100deg, ${FOIL_PALE.join(", ")}); }
.ir-foil-deep { background-image: linear-gradient(100deg, ${FOIL_DEEP.join(", ")}); }
.ir-foil-vertical {
  background-image: linear-gradient(180deg, ${FOIL_DEEP.join(", ")});
  background-size: 100% 260%;
  background-position: 0 calc(var(--iris) * 1%);
  background-repeat: repeat;
}
.ir-span-tight { background-size: 155% 100%; }
.ir-span-wide { background-size: 620% 100%; }
.ir-cut {
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ir-sheen {
  opacity: var(--so, 0);
  transition: opacity 340ms ease;
  -webkit-mask-image: radial-gradient(300px circle at var(--sx, 50%) var(--sy, 50%), #000, transparent 70%);
  mask-image: radial-gradient(300px circle at var(--sx, 50%) var(--sy, 50%), #000, transparent 70%);
}
.ir-plate { transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 420ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.ir-band { transition: transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1); transform: scaleX(0.14); transform-origin: left center; }
.ir-hit:hover .ir-plate, .ir-hit:focus-within .ir-plate { transform: translate3d(0, -5px, 24px); box-shadow: ${SHADOW_LIFT}; }
.ir-hit:hover .ir-band, .ir-hit:focus-within .ir-band { transform: scaleX(1); }
.ir-row { transition: background-color 320ms ease; }
.ir-row:hover { background-color: rgba(20, 18, 32, 0.022); }
.ir-wash, .ir-seal { transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes ir-drift { from { --iris: 4; } to { --iris: 96; } }
@keyframes ir-turn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: no-preference) {
  .ir-drift { animation: ir-drift 19s linear infinite alternate; }
  .ir-turn { animation: ir-turn 40s linear infinite; }
}
@media (prefers-reduced-motion: reduce) {
  .ir-plate, .ir-band, .ir-wash, .ir-seal, .ir-sheen { transition: none; }
  .ir-hit:hover .ir-plate, .ir-hit:focus-within .ir-plate { transform: none; }
}
`;

function IconArrowOut(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

// Every pointer-driven decoration here finds the page root by attribute rather
// than by counting parentElements, so moving a wrapper cannot silently break
// the effect.
function findRoot(node) {
  return node?.closest("[data-ir-root]") || null;
}

// The ground: a vertical fall from pearl to a deeper pearl, two soft discs of
// the one foil drifting against the pointer at different rates, and the grain
// over everything. Fixed and clipped by its own wrapper so it stays behind the
// viewport and can never widen the document, and kept outside the `@container`
// element on purpose, since a container context becomes the containing block
// for fixed descendants and would quietly turn this into a page-height layer.
function Ground() {
  const nearRef = useRef(null);
  const farRef = useRef(null);

  useEffect(() => {
    const near = nearRef.current;
    const far = farRef.current;
    const root = findRoot(near);
    if (!near || !far || !root) return undefined;

    function handleMove(event) {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      near.style.transform = `translate3d(${((0.5 - px) * 46).toFixed(1)}px, ${((0.5 - py) * 34).toFixed(1)}px, 0)`;
      far.style.transform = `translate3d(${((px - 0.5) * 16).toFixed(1)}px, ${((py - 0.5) * 12).toFixed(1)}px, 0)`;
    }

    root.addEventListener("mousemove", handleMove);
    return () => root.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Oversized and parallaxed, so the stock drifts behind the page and the
          drift never reaches an edge of the image. */}
      <div
        ref={nearRef}
        className="ir-wash absolute -inset-[7%]"
        style={{ backgroundImage: `url('${STOCK}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      {/* The veil. Unveiled, the darker bands of the stock put body copy at
          roughly 3:1, which fails AA; at this strength the softest ink on the
          page clears 7:1 and the material still plainly reads as foil. It
          drifts less than the stock does, so the sheen shifts across the
          material rather than the whole ground sliding as one board. */}
      <div
        ref={farRef}
        className="ir-wash absolute -inset-[7%]"
        style={{ background: "linear-gradient(178deg, rgba(255,255,255,0.69) 0%, rgba(255,255,255,0.61) 45%, rgba(255,255,255,0.67) 100%)" }}
      />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}

// The seal: a foil-stamped hologram, which is where most people have actually
// met one. Guilloche rays and concentric engraving under a slow specular
// sweep, tilting with the pointer wherever it is on the page, because the one
// thing a hologram does is answer the angle you hold it at.
function Seal({ name, size = 200 }) {
  const tiltRef = useRef(null);

  useEffect(() => {
    const tilt = tiltRef.current;
    const root = findRoot(tilt);
    if (!tilt || !root) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    function handleMove(event) {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      tilt.style.transform = `rotateX(${((0.5 - py) * 22).toFixed(1)}deg) rotateY(${((px - 0.5) * 26).toFixed(1)}deg)`;
    }

    root.addEventListener("mousemove", handleMove);
    return () => root.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div aria-hidden className="shrink-0" style={{ width: size, height: size, perspective: "800px" }}>
      <div ref={tiltRef} className="ir-seal relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        <div className="ir-foil-deep ir-span-tight absolute inset-0 rounded-full opacity-95" style={{ boxShadow: SHADOW_LIFT }} />
        <div
          className="absolute inset-0 rounded-full opacity-70"
          style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.42) 0deg 0.6deg, transparent 0.6deg 2.2deg)" }}
        />
        <div
          className="ir-turn absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.82), transparent 36%)" }}
        />
        <div className="absolute inset-[7%] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.55)" }} />
        <div className="ir-foil ir-span-tight absolute inset-[11%] rounded-full" style={{ backgroundPosition: "calc((var(--iris) + 34) * 1%) 0" }} />
        <div
          className="absolute inset-[11%] rounded-full opacity-60"
          style={{ background: "repeating-radial-gradient(circle, transparent 0 3px, rgba(255,255,255,0.34) 3px 4px)" }}
        />
        <div className="absolute inset-[23%] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.65)" }} />
        <div
          className="absolute inset-[28%] flex items-center justify-center rounded-full"
          style={{ backgroundColor: SHEET, boxShadow: "inset 0 3px 14px rgba(20,18,32,0.10)" }}
        >
          <span className="ir-display ir-foil-deep ir-span-tight ir-cut font-extrabold tracking-tight" style={{ fontSize: size * 0.25 }}>
            {initials(name)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Section mark: a large foil numeral, the name in ink, the real count, and one
// iridescent rule. Repeated verbatim for all six sections, which is most of
// what makes the page read as a single document.
function SectionMark({ index, label, count, unit }) {
  return (
    <header className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 @3xl:mb-0 @3xl:sticky @3xl:top-10 @3xl:block @3xl:self-start @3xl:pr-9 @3xl:text-right">
      <span className="ir-display ir-foil-deep ir-span-tight ir-cut block text-[clamp(2.2rem,4.6cqw,3.2rem)] font-extrabold leading-none tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2 className="ir-display text-[clamp(1.35rem,2.5cqw,1.6rem)] font-bold leading-tight tracking-[-0.02em] @3xl:mt-2" style={{ color: INK }}>
        {label}
      </h2>
      <span className="ir-body block text-[13px] font-medium @3xl:mt-1" style={{ color: MUTED }}>
        {plural(count, unit)}
      </span>
    </header>
  );
}

// The one surface primitive, and the only container on the page: a white
// sheet, one hairline, one shadow, one radius, a foil band along the top that
// draws itself out on hover, and a pool of foil light that rakes across the
// stock under the pointer. Every section sits on exactly one of these.
function Sheet({ children }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return undefined;

    // Written straight onto the node: light moving across a surface must not
    // re-render the page on every pixel of pointer movement. Same direct-DOM
    // approach CursorGlow.js established in this codebase.
    function handleMove(event) {
      const rect = sheet.getBoundingClientRect();
      sheet.style.setProperty("--sx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
      sheet.style.setProperty("--sy", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      sheet.style.setProperty("--so", "0.62");
    }
    function handleLeave() {
      sheet.style.setProperty("--so", "0");
    }

    sheet.addEventListener("mousemove", handleMove);
    sheet.addEventListener("mouseleave", handleLeave);
    return () => {
      sheet.removeEventListener("mousemove", handleMove);
      sheet.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="ir-hit" style={{ perspective: "1200px" }}>
      <div
        ref={sheetRef}
        className="ir-plate relative overflow-hidden"
        style={{ backgroundColor: SHEET, borderRadius: RADIUS_PLATE, border: `1px solid ${HAIRLINE}`, boxShadow: SHADOW_REST }}
      >
        <div aria-hidden className="ir-foil ir-sheen pointer-events-none absolute inset-0" />
        <div aria-hidden className="ir-foil-deep ir-span-tight ir-band absolute inset-x-0 top-0 h-[3px] opacity-80" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

// Rows inside a sheet are divided by the same hairline the sheet is edged
// with, never by a nested box: a card inside a card is the pattern this
// rebuild exists to be rid of.
function Row({ children, first = false }) {
  return (
    <div className="ir-row px-6 py-6 @2xl:px-9 @2xl:py-8" style={first ? undefined : { borderTop: `1px solid ${HAIRLINE}` }}>
      {children}
    </div>
  );
}

// A marker, in the one shape small things take here: a foil lozenge offset
// along the shared spectrum by its own index, so a list of them reads as one
// surface caught at slightly different angles.
function Mark({ index = 0, className = "h-1.5 w-4" }) {
  return (
    <span aria-hidden className={`ir-foil shrink-0 rounded-full ${className}`} style={{ backgroundPosition: `calc((var(--iris) + ${index * 11}) * 1%) 0` }} />
  );
}

// The two-column measure every entry section uses: meta left, substance right.
function Entry({ meta, children }) {
  return (
    <div className="grid gap-x-9 gap-y-3 @2xl:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="min-w-0">{meta}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Bullets({ lines, size = "15px" }) {
  return (
    <ul className="mt-5 space-y-3">
      {lines.map((line, j) => (
        <li key={j} className="flex min-w-0 gap-3.5">
          <Mark index={j} className="mt-[0.55em] h-1.5 w-4" />
          <span className="ir-body min-w-0 whitespace-pre-line break-words leading-relaxed" style={{ color: INK_SOFT, fontSize: size }}>
            {line}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Skills as one continuous sweep of the spectrum across many pills: each pill
// offsets the shared foil position by its place in the customer's own list, so
// the group reads as a single surface rather than a bag of coloured chips. Ink
// on the pale ramp keeps every label well clear of AA.
function SkillsSection({ skills }) {
  return (
    <Sheet>
      <Row first>
        <ul className="flex flex-wrap gap-2.5">
          {skills.map((skill, i) => (
            <li
              key={skill}
              className="ir-foil ir-display rounded-full px-4 py-2 text-[14.5px] font-semibold"
              style={{ backgroundPosition: `calc((var(--iris) + ${i * 9}) * 1%) 0`, color: INK, boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5)` }}
            >
              {skill}
            </li>
          ))}
        </ul>
      </Row>
    </Sheet>
  );
}

function ExperienceSection({ experience }) {
  return (
    <Sheet>
      {experience.map((job, i) => (
        <Row key={`${job.company}-${job.role}-${i}`} first={i === 0}>
          <Entry
            meta={
              <p className="ir-body text-[13.5px] font-medium" style={{ color: MUTED }}>
                {[job.start, job.end].filter(Boolean).join(" to ")}
              </p>
            }
          >
            <h3 className="ir-display break-words text-[19px] font-bold leading-snug" style={{ color: INK }}>
              {job.role || "Role"}
            </h3>
            {job.company && (
              <p className="ir-body mt-1 break-words text-[14px] font-semibold" style={{ color: INK_SOFT }}>
                {job.company}
              </p>
            )}
            {job.bullets?.length > 0 && <Bullets lines={job.bullets} />}
          </Entry>
        </Row>
      ))}
    </Sheet>
  );
}

function ProjectsSection({ projects }) {
  return (
    <Sheet>
      {projects.map((project, i) => (
        <Row key={`${project.name}-${i}`} first={i === 0}>
          <Entry
            meta={
              <>
                {project.version && (
                  <p className="ir-body text-[13.5px] font-medium tabular-nums" style={{ color: MUTED }}>
                    {project.version}
                  </p>
                )}
                {project.status && (
                  <p
                    className="ir-body mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold"
                    style={{ backgroundColor: PEARL, color: INK_SOFT }}
                  >
                    <Mark index={i} className="h-2 w-2" />
                    {project.status}
                  </p>
                )}
              </>
            }
          >
            <h3 className="ir-display break-words text-[20px] font-bold leading-snug" style={{ color: INK }}>
              {project.name || "Project"}
            </h3>
            {project.description && (
              <p className="ir-body mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
                {project.description}
              </p>
            )}
            {project.highlights?.length > 0 && <Bullets lines={project.highlights} size="14.5px" />}
            {project.tags?.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="ir-body rounded-full px-3 py-1 text-[12.5px] font-semibold"
                    style={{ backgroundColor: PEARL, color: INK_SOFT, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {(project.link || project.demo) && (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                {project.link && (
                  <a
                    href={`https://${stripProtocol(project.link)}`}
                    className="ir-body inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 outline-none hover:underline focus-visible:underline"
                    style={{ color: INK }}
                  >
                    Source <IconArrowOut className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}
                {project.demo && (
                  <a
                    href={`https://${stripProtocol(project.demo)}`}
                    className="ir-body inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 outline-none hover:underline focus-visible:underline"
                    style={{ color: INK }}
                  >
                    Live <IconArrowOut className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}
              </div>
            )}
          </Entry>
        </Row>
      ))}
    </Sheet>
  );
}

function EducationSection({ education }) {
  return (
    <Sheet>
      {education.map((edu, i) => (
        <Row key={`${edu.school}-${i}`} first={i === 0}>
          <Entry
            meta={
              <p className="ir-body text-[13.5px] font-medium" style={{ color: MUTED }}>
                {[edu.start, edu.end].filter(Boolean).join(" to ")}
              </p>
            }
          >
            <h3 className="ir-display break-words text-[18px] font-bold leading-snug" style={{ color: INK }}>
              {edu.degree || "Degree"}
            </h3>
            {edu.school && (
              <p className="ir-body mt-1 break-words text-[14.5px]" style={{ color: INK_SOFT }}>
                {edu.school}
              </p>
            )}
          </Entry>
        </Row>
      ))}
    </Sheet>
  );
}

function AchievementsSection({ achievements }) {
  return (
    <Sheet>
      <Row first>
        <ul className="space-y-5">
          {achievements.map((item, i) => (
            <li key={i} className="flex min-w-0 gap-4">
              <Mark index={i} className="mt-[0.5em] h-2 w-8" />
              <p className="ir-body min-w-0 break-words text-[15.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                {item}
              </p>
            </li>
          ))}
        </ul>
      </Row>
    </Sheet>
  );
}

function ProfilesSection({ codingProfiles }) {
  return (
    <Sheet>
      <Row first>
        <ul className="flex flex-wrap gap-2.5">
          {codingProfiles.map((profile, i) => (
            <li key={`${profile.platform}-${i}`}>
              <a
                href={`https://${stripProtocol(profile.url)}`}
                className="group flex items-center gap-3 rounded-full py-2 pl-2 pr-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: PEARL, "--tw-ring-color": INK_SOFT, "--tw-ring-offset-color": SHEET }}
              >
                <Mark index={i} className="h-7 w-7" />
                <span className="ir-display text-[15px] font-semibold" style={{ color: INK }}>
                  {profile.platform}
                </span>
                <span className="ir-body max-w-[13rem] truncate text-[13px]" style={{ color: MUTED }}>
                  {stripProtocol(profile.url)}
                </span>
                <IconArrowOut
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: MUTED }}
                />
              </a>
            </li>
          ))}
        </ul>
      </Row>
    </Sheet>
  );
}

export default function HolographicTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const rootRef = useRef(null);

  const entries = {
    experience: experience || [],
    projects: projects || [],
    education: education || [],
    achievements: achievements || [],
    skills: skills || [],
    codingProfiles: codingProfiles || [],
  };

  // Only sections holding content get a mark, so a sparse portfolio reads as a
  // short document rather than as a run of empty frames.
  const sections = (sectionOrder || []).filter((id) => entries[id]?.length > 0);

  // Friendly labels ("GitHub", not the raw URL): these only ever render as the
  // closing block's buttons, which read better as a short action name than as
  // a handle. Deliberately the page's only contact block.
  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // The pointer takes the drift over on its first move and keeps it. `--iris`
  // is written straight onto the root, and every foil surface on the page
  // reads that one inherited property, so this single write slides all of them
  // without re-rendering anything.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    function handleMove(event) {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      root.classList.remove("ir-drift");
      root.style.setProperty("--iris", (4 + px * 92).toFixed(1));
    }

    root.addEventListener("mousemove", handleMove);
    return () => root.removeEventListener("mousemove", handleMove);
  }, []);

  function renderSection(id) {
    if (id === "experience") return <ExperienceSection experience={experience} />;
    if (id === "projects") return <ProjectsSection projects={projects} />;
    if (id === "skills") return <SkillsSection skills={skills} />;
    if (id === "education") return <EducationSection education={education} />;
    if (id === "achievements") return <AchievementsSection achievements={achievements} />;
    if (id === "codingProfiles") return <ProfilesSection codingProfiles={codingProfiles} />;
    return null;
  }

  return (
    // `overflow-x-clip`, not `overflow-hidden`: clip keeps the washes from
    // widening the page without making this a scroll container.
    <div ref={rootRef} data-ir-root className="ir-drift relative min-h-dvh overflow-x-clip" style={{ backgroundColor: PEARL, color: INK }}>
      <style>{TEMPLATE_CSS}</style>
      <Ground />

      {/* The container context sits here with the padding on the wrapper
          inside it: an element cannot match a container query against itself,
          so variants placed on the container element never fire. Measuring the
          content column rather than the window is what lets this fit the
          builder's half-width preview pane as well as a full page. */}
      <div className={`${display.variable} ${body.variable} ir-body @container relative mx-auto w-full max-w-[1120px]`}>
        <div className="px-6 py-14 @2xl:px-12 @2xl:py-20 @5xl:px-16">
          <header className="@3xl:grid @3xl:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="mb-8 flex justify-start @3xl:mb-0 @3xl:justify-end @3xl:pr-9">
              <Seal name={name} size={188} />
            </div>
            <div className="relative min-w-0 @3xl:pl-10">
              <div className="relative">
                {/* Ink, not foil. With the stock carrying the iridescence, a
                    foil-cut name is two iridescent things competing over the
                    same area; crisp type over coloured material gives the page
                    a hierarchy instead. */}
                <h1
                  className="ir-display break-words text-[clamp(2.5rem,7cqw,4.7rem)] font-extrabold leading-[0.94] tracking-[-0.035em]"
                  style={{ color: INK }}
                >
                  {name || "Your Name"}
                </h1>
                {/* The name printed on gloss: a mirrored copy under the real
                    one, faded out inside its own height so it reads as a
                    reflection in the stock and never as a second heading. */}
                <span
                  aria-hidden
                  className="ir-display pointer-events-none absolute inset-x-0 top-full block select-none break-words text-[clamp(2.5rem,7cqw,4.7rem)] font-extrabold leading-[0.94] tracking-[-0.035em] opacity-[0.13] blur-[1px]"
                  style={{
                    color: INK,
                    transform: "scaleY(-1)",
                    transformOrigin: "top center",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 42%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 42%)",
                  }}
                >
                  {name || "Your Name"}
                </span>
              </div>
              <div className="mt-8 @3xl:mt-10">
                <p className="ir-display break-words text-[clamp(1.2rem,2.6cqw,1.7rem)] font-semibold tracking-[-0.015em]" style={{ color: INK }}>
                  {role || "Your Role"}
                </p>
                {bio && (
                  <p className="ir-body mt-5 max-w-[54ch] whitespace-pre-line break-words text-[16px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {bio}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="relative mt-20 @2xl:mt-24">
            {/* The spine: one iridescent thread on the gutter's edge that
                every section hangs from. It is the page's only vertical line,
                and it is what makes six blocks read as one document. Laid in a
                white channel because a two pixel foil line over foil stock is
                invisible, and cut from the vertical ramp, because a two pixel
                slice of a gradient that runs horizontally shows exactly one
                colour, which is how this came out a flat blue-grey at first. */}
            <div
              aria-hidden
              className="absolute bottom-0 top-0 hidden w-[7px] rounded-full @3xl:block"
              style={{ left: `calc(${GUTTER} - 2.5px)`, backgroundColor: "rgba(255,255,255,0.62)" }}
            >
              <div className="ir-foil-vertical absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full opacity-90" />
            </div>
            {sections.length > 0 && (
              <main className="relative">
                {sections.map((id, i) => (
                  <section key={id} className="pt-14 first:pt-0 @3xl:grid @3xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:pt-20">
                    <SectionMark index={i} label={SECTION_LABELS[id]} count={entries[id].length} unit={SECTION_UNITS[id]} />
                    <div className="min-w-0 @3xl:pl-10">{renderSection(id)}</div>
                  </section>
                ))}
              </main>
            )}
          </div>

          {contactItems.length > 0 && (
            <section className="pt-24 @3xl:grid @3xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:pt-28">
              <div />
              <div className="min-w-0 @3xl:pl-10">
                <h2 className="ir-display text-[clamp(1.9rem,4.6cqw,2.9rem)] font-extrabold tracking-[-0.035em]" style={{ color: INK }}>
                  Get in touch
                </h2>
                <ul className="mt-8 flex flex-wrap items-center gap-3">
                  {contactItems.map(({ label, href, Icon }, i) => (
                    <li key={href}>
                      <a
                        href={href}
                        className={`ir-body inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[14.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                          i === 0 ? "ir-foil ir-span-tight" : ""
                        }`}
                        style={{
                          backgroundColor: i === 0 ? undefined : SHEET,
                          border: `1px solid ${HAIRLINE}`,
                          boxShadow: SHADOW_REST,
                          color: INK,
                          "--tw-ring-color": INK_SOFT,
                          "--tw-ring-offset-color": PEARL,
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <footer className="mt-24 flex flex-wrap items-center justify-between gap-3 pt-7" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            <p className="ir-body text-[13px]" style={{ color: MUTED }}>
              © {new Date().getFullYear()} {name || "Your Name"}
            </p>
            <p className="ir-body text-[13px]" style={{ color: MUTED }}>
              Made with Dev Portfolio Builder
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
