"use client";

import { useState, useEffect, useRef } from "react";
import SectionOrderField from "./SectionOrderField";
import { normalizeSectionOrder } from "@/lib/portfolioData";

const RESUME_ACCEPT = ".pdf,.docx";

function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ResumeImport({ onImport }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    setFileName(file.name);
    setStatus("loading");
    setErrorMessage("");

    try {
      const body = new FormData();
      body.append("resume", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body });

      // Not every failure comes back as JSON. A request that never reaches the
      // route at all, because the platform rejected the upload as too large or
      // the function timed out, answers with an HTML error page instead, and
      // parsing that as JSON used to throw a SyntaxError whose message ("
      // Unexpected token '<'") was then shown to the customer as though it
      // were the explanation. Read the body once as text and decide from
      // there, so the message they see always describes what happened.
      const raw = await res.text();
      let result = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch {
        result = null;
      }

      if (!res.ok || !result) {
        throw new Error(
          result?.error ||
            (res.status === 413
              ? "That file is too large to upload. Please try one under 4MB."
              : res.status === 504
                ? "Reading that resume took too long and the server gave up. A shorter file usually works."
                : `The server couldn't process that upload (error ${res.status}). Please try again.`)
        );
      }

      onImport(result.data);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="ed-panel p-5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--home-accent)", color: "#ffffff" }}
        >
          <IconUpload className="h-4 w-4" />
        </span>
        <p className="text-[15px] font-semibold" style={{ color: "var(--home-strong)" }}>
          Import from a resume
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--home-dim)" }}>
        Upload a PDF or DOCX and we&rsquo;ll auto-fill everything below. Parsing isn&rsquo;t perfect, so review after.
      </p>

      <label
        className={`ed-primary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
          status === "loading" ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <IconUpload className="h-4 w-4" />
        {status === "loading" ? "Reading resume…" : "Choose file"}
        <input
          type="file"
          accept={RESUME_ACCEPT}
          onChange={handleFileChange}
          disabled={status === "loading"}
          className="sr-only"
        />
      </label>

      {status === "loading" && fileName && (
        <p className="mt-2 text-xs" style={{ color: "var(--home-dim)" }}>
          Parsing {fileName}…
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs font-medium" role="alert" style={{ color: "#a3341a" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function IconLayers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="m2 13 10 5 10-5" />
    </svg>
  );
}

// Reordering sections is a structural, page-wide control, not a content
// field — buried as just another FormSection between Links and Skills, it
// read as one more input to skim past. Giving it the same "distinct card"
// treatment as ResumeImport, right up top, is what makes it register as an
// actual feature worth trying rather than something to overlook.
function SectionOrderCard({ order, onChange }) {
  return (
    <div className="ed-panel p-5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--home-strong)", color: "var(--home-bg)" }}
        >
          <IconLayers className="h-4 w-4" />
        </span>
        <p className="text-[15px] font-semibold" style={{ color: "var(--home-strong)" }}>
          Reorder your sections
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: "var(--home-accent)", color: "#ffffff" }}
        >
          New
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--home-dim)" }}>
        Drag to change what flows first: lead with Projects if that&rsquo;s your strongest section, or Experience if
        that is. Intro and Contact always stay first and last.
      </p>
      <div className="mt-4">
        <SectionOrderField order={order} onChange={onChange} />
      </div>
    </div>
  );
}

function FormSection({ title, hint, children }) {
  return (
    <section className="ed-panel p-5">
      <h3 className="text-sm font-semibold" style={{ color: "var(--home-strong)" }}>
        {title}
      </h3>
      {hint && (
        <p className="mt-0.5 text-xs" style={{ color: "var(--home-dim)" }}>
          {hint}
        </p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--home-dim)" }}>
      {children}
    </span>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input {...props} className="ed-field px-3 py-2 text-sm" />
      {hint && (
        <span className="mt-1 block text-xs" style={{ color: "var(--home-faint)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea {...props} rows={3} className="ed-field px-3 py-2 text-sm" />
    </label>
  );
}

// A plain <input> whose value is `list.join(", ")`, re-parsed on every
// keystroke, fights the user: type a trailing comma to start the next item
// and the very next render reconstructs the value from the just-parsed
// array — which drops the empty trailing segment — silently erasing the
// comma you just typed. Keeps its own local text buffer while focused, and
// only commits (parses + calls onChange) on blur, so typing "React, " never
// gets fought mid-keystroke. Resyncs from `value` when it changes for a
// reason other than this field's own commit (e.g. resume import replacing
// the list), tracked via lastCommitted so an echo of our own update isn't
// mistaken for an external change.
function CommaListField({ label, hint, value, onChange }) {
  const [text, setText] = useState(() => value.join(", "));
  const lastCommitted = useRef(value.join(", "));

  useEffect(() => {
    const joined = value.join(", ");
    if (joined !== lastCommitted.current) {
      setText(joined);
      lastCommitted.current = joined;
    }
  }, [value]);

  function commit(raw) {
    const next = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    lastCommitted.current = next.join(", ");
    onChange(next);
  }

  return (
    <Field
      label={label}
      hint={hint}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
    />
  );
}

function RemovableRow({ onRemove, children }) {
  return (
    <div
      className="relative rounded-xl border p-4"
      style={{ borderColor: "var(--home-rule)", background: "rgba(20, 54, 93, 0.035)" }}
    >
      <button
        type="button"
        onClick={onRemove}
        className="ed-focus absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-sm transition-colors hover:bg-[rgba(216,92,39,0.12)] hover:text-[var(--home-accent)]"
        style={{ color: "var(--home-faint)" }}
        aria-label="Remove"
      >
        ✕
      </button>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="ed-add ed-focus w-full py-2.5 text-sm font-medium">
      {children}
    </button>
  );
}

// Templates that actually render a photo (person or project image) — every
// other template ignores photoUrl/project.image entirely, so those fields
// only appear in the form when the selected template is one of these.
// Showing them unconditionally for every template is what made the field
// look "broken" for anyone not on one of these three.
const TEMPLATES_WITH_PHOTOS = new Set(["warm", "scrapbook", "spotify"]);

// Artist Profile is the only template with a player bar, so it is the only one
// with anywhere to put a song. Same gating rule as the photo fields above: a
// field nothing renders looks broken to whoever is filling it in.
const TEMPLATES_WITH_NOW_PLAYING = new Set(["spotify"]);

export default function EditForm({ data, onChange, templateId }) {
  const set = (patch) => onChange({ ...data, ...patch });
  const showPhotoFields = TEMPLATES_WITH_PHOTOS.has(templateId);
  const showNowPlaying = TEMPLATES_WITH_NOW_PLAYING.has(templateId);

  const setLink = (key, value) =>
    set({ links: { ...data.links, [key]: value } });

  const setNowPlaying = (key, value) =>
    set({ nowPlaying: { ...data.nowPlaying, [key]: value } });

  // A resume import is an authoritative snapshot, not a patch — it replaces
  // these fields exactly as extracted, including empty ones. Falling back to
  // "keep the existing value when the resume has none" sounds safer, but the
  // form starts pre-filled with placeholder demo data, and that fallback
  // can't tell the difference between "the user already typed something
  // real" and "this is still the untouched Ada Lovelace sample" — so an
  // empty Experience section in the resume ended up keeping fake jobs
  // instead of actually being empty. photoUrl isn't part of `imported` at
  // all, so it's untouched either way.
  const importResume = (imported) =>
    set({
      name: imported.name,
      role: imported.role,
      bio: imported.bio,
      email: imported.email,
      links: imported.links,
      skills: imported.skills,
      codingProfiles: imported.codingProfiles,
      experience: imported.experience,
      education: imported.education,
      achievements: imported.achievements,
      projects: imported.projects,
    });

  const setAchievements = (raw) =>
    set({
      achievements: raw.split("\n").filter((line) => line.trim().length > 0),
    });

  const updateCodingProfile = (index, patch) => {
    const next = data.codingProfiles.map((p, i) => (i === index ? { ...p, ...patch } : p));
    set({ codingProfiles: next });
  };

  const addCodingProfile = () =>
    set({ codingProfiles: [...data.codingProfiles, { platform: "", url: "" }] });

  const removeCodingProfile = (index) =>
    set({ codingProfiles: data.codingProfiles.filter((_, i) => i !== index) });

  const updateExperience = (index, patch) => {
    const next = data.experience.map((job, i) =>
      i === index ? { ...job, ...patch } : job
    );
    set({ experience: next });
  };

  const updateExperienceBullets = (index, raw) => {
    updateExperience(index, {
      bullets: raw.split("\n").filter((line) => line.trim().length > 0),
    });
  };

  const addExperience = () =>
    set({
      experience: [
        ...data.experience,
        { company: "", role: "", start: "", end: "", image: "", bullets: [] },
      ],
    });

  const removeExperience = (index) =>
    set({ experience: data.experience.filter((_, i) => i !== index) });

  const updateEducation = (index, patch) => {
    const next = data.education.map((edu, i) => (i === index ? { ...edu, ...patch } : edu));
    set({ education: next });
  };

  const addEducation = () =>
    set({
      education: [...data.education, { school: "", degree: "", start: "", end: "" }],
    });

  const removeEducation = (index) =>
    set({ education: data.education.filter((_, i) => i !== index) });

  const updateProject = (index, patch) => {
    const next = data.projects.map((p, i) => (i === index ? { ...p, ...patch } : p));
    set({ projects: next });
  };

  const updateProjectHighlights = (index, raw) => {
    updateProject(index, {
      highlights: raw.split("\n").filter((line) => line.trim().length > 0),
    });
  };

  const addProject = () =>
    set({
      projects: [
        ...data.projects,
        {
          name: "",
          version: "",
          status: "Active",
          image: "",
          description: "",
          tags: [],
          link: "",
          demo: "",
          highlights: [],
        },
      ],
    });

  const removeProject = (index) =>
    set({ projects: data.projects.filter((_, i) => i !== index) });

  return (
    <div className="space-y-6">
      <ResumeImport onImport={importResume} />

      <SectionOrderCard
        order={normalizeSectionOrder(data.sectionOrder)}
        onChange={(sectionOrder) => set({ sectionOrder })}
      />

      <FormSection title="Basic info">
        <Field
          label="Name"
          value={data.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <Field
          label="Role / Title"
          value={data.role}
          onChange={(e) => set({ role: e.target.value })}
        />
        <TextArea
          label="Bio"
          value={data.bio}
          onChange={(e) => set({ bio: e.target.value })}
        />
        <Field
          label="Email"
          value={data.email}
          onChange={(e) => set({ email: e.target.value })}
        />
        {showPhotoFields && (
          <Field
            label="Photo URL (optional)"
            hint="A casual, decent-quality photo works best — a stiff corporate headshot undercuts the vibe."
            value={data.photoUrl || ""}
            onChange={(e) => set({ photoUrl: e.target.value })}
          />
        )}
        {showNowPlaying && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Now playing: song (optional)"
              hint="Shown in the player bar. Nothing actually plays. Leave both blank and it reads Frank Sinatra, My Way."
              value={data.nowPlaying?.track || ""}
              onChange={(e) => setNowPlaying("track", e.target.value)}
            />
            <Field
              label="Now playing: artist (optional)"
              value={data.nowPlaying?.artist || ""}
              onChange={(e) => setNowPlaying("artist", e.target.value)}
            />
            <div className="sm:col-span-2">
              <Field
                label="Now playing: link (optional)"
                hint="Point the title at the song, on YouTube or anywhere else. Left blank, the title is just text."
                value={data.nowPlaying?.url || ""}
                onChange={(e) => setNowPlaying("url", e.target.value)}
              />
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Links">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field
            label="GitHub"
            value={data.links.github}
            onChange={(e) => setLink("github", e.target.value)}
          />
          <Field
            label="LinkedIn"
            value={data.links.linkedin}
            onChange={(e) => setLink("linkedin", e.target.value)}
          />
          <Field
            label="Website"
            value={data.links.website}
            onChange={(e) => setLink("website", e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Skills" hint="Comma-separated.">
        <CommaListField label="Skills" value={data.skills} onChange={(skills) => set({ skills })} />
      </FormSection>

      <FormSection title="Coding profiles" hint="Optional — LeetCode, Codeforces, HackerRank, Kaggle, whatever you use.">
        {data.codingProfiles.map((profile, i) => (
          <RemovableRow key={i} onRemove={() => removeCodingProfile(i)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Platform"
                value={profile.platform}
                onChange={(e) => updateCodingProfile(i, { platform: e.target.value })}
              />
              <Field
                label="Profile URL"
                value={profile.url}
                onChange={(e) => updateCodingProfile(i, { url: e.target.value })}
              />
            </div>
          </RemovableRow>
        ))}
        <AddButton onClick={addCodingProfile}>+ Add coding profile</AddButton>
      </FormSection>

      <FormSection title="Experience">
        {data.experience.map((job, i) => (
          <RemovableRow key={i} onRemove={() => removeExperience(i)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Company"
                value={job.company}
                onChange={(e) => updateExperience(i, { company: e.target.value })}
              />
              <Field
                label="Role"
                value={job.role}
                onChange={(e) => updateExperience(i, { role: e.target.value })}
              />
              <Field
                label="Start"
                value={job.start}
                onChange={(e) => updateExperience(i, { start: e.target.value })}
              />
              <Field
                label="End"
                value={job.end}
                onChange={(e) => updateExperience(i, { end: e.target.value })}
              />
            </div>
            {showPhotoFields && (
              <Field
                label="Image URL (optional)"
                hint="A photo or screenshot worth sharing from this role — a shipped feature, a team moment, an award. Leave blank to skip."
                value={job.image || ""}
                onChange={(e) => updateExperience(i, { image: e.target.value })}
              />
            )}
            <TextArea
              label="Highlights (one per line)"
              value={job.bullets.join("\n")}
              onChange={(e) => updateExperienceBullets(i, e.target.value)}
            />
          </RemovableRow>
        ))}
        <AddButton onClick={addExperience}>+ Add experience</AddButton>
      </FormSection>

      <FormSection title="Education">
        {data.education.map((edu, i) => (
          <RemovableRow key={i} onRemove={() => removeEducation(i)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="School"
                value={edu.school}
                onChange={(e) => updateEducation(i, { school: e.target.value })}
              />
              <Field
                label="Degree"
                value={edu.degree}
                onChange={(e) => updateEducation(i, { degree: e.target.value })}
              />
              <Field
                label="Start"
                value={edu.start}
                onChange={(e) => updateEducation(i, { start: e.target.value })}
              />
              <Field
                label="End"
                value={edu.end}
                onChange={(e) => updateEducation(i, { end: e.target.value })}
              />
            </div>
          </RemovableRow>
        ))}
        <AddButton onClick={addEducation}>+ Add education</AddButton>
      </FormSection>

      <FormSection title="Achievements / Certifications" hint="One per line.">
        <TextArea
          label="Achievements"
          value={(data.achievements || []).join("\n")}
          onChange={(e) => setAchievements(e.target.value)}
        />
      </FormSection>

      <FormSection title="Projects">
        {data.projects.map((project, i) => (
          <RemovableRow key={i} onRemove={() => removeProject(i)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="Name"
                value={project.name}
                onChange={(e) => updateProject(i, { name: e.target.value })}
              />
              <Field
                label="Version"
                value={project.version}
                onChange={(e) => updateProject(i, { version: e.target.value })}
              />
              <Field
                label="Status (Active / Archived / WIP)"
                value={project.status}
                onChange={(e) => updateProject(i, { status: e.target.value })}
              />
            </div>
            {showPhotoFields && (
              <Field
                label="Image URL (optional)"
                hint="Leave blank to show a soft placeholder instead."
                value={project.image || ""}
                onChange={(e) => updateProject(i, { image: e.target.value })}
              />
            )}
            <TextArea
              label="Description"
              value={project.description}
              onChange={(e) => updateProject(i, { description: e.target.value })}
            />
            <TextArea
              label="Highlights (one per line)"
              value={(project.highlights || []).join("\n")}
              onChange={(e) => updateProjectHighlights(i, e.target.value)}
            />
            <CommaListField
              label="Tags (comma-separated)"
              value={project.tags}
              onChange={(tags) => updateProject(i, { tags })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Repo link"
                value={project.link}
                onChange={(e) => updateProject(i, { link: e.target.value })}
              />
              <Field
                label="Live demo link"
                value={project.demo}
                onChange={(e) => updateProject(i, { demo: e.target.value })}
              />
            </div>
          </RemovableRow>
        ))}
        <AddButton onClick={addProject}>+ Add project</AddButton>
      </FormSection>
    </div>
  );
}
