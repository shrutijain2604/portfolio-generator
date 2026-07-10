"use client";

import { useState, useEffect, useRef } from "react";
import SectionOrderField from "./SectionOrderField";
import { normalizeSectionOrder } from "@/lib/portfolioData";

const RESUME_ACCEPT = ".pdf,.docx";

function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2 13.8 8.2 20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

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
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong while reading that resume.");
      onImport(result.data);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-white p-5 shadow-sm dark:border-red-900/40 dark:from-red-950/20 dark:via-zinc-900 dark:to-zinc-900">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl"
        style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
      />

      <p className="relative mt-3 text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
        Import from a resume
      </p>
      <p className="relative mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Upload a PDF or DOCX and we&rsquo;ll auto-fill everything below. Parsing isn&rsquo;t perfect — review after.
      </p>

      <label
        className={`relative mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 ${
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
          className="hidden"
        />
      </label>

      {status === "loading" && fileName && (
        <p className="relative mt-2 text-xs text-zinc-500 dark:text-zinc-400">Parsing {fileName}…</p>
      )}
      {status === "error" && <p className="relative mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
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
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-white p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
      />
      <div className="relative flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <IconLayers className="h-4 w-4" />
        </span>
        <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">Reorder your sections</p>
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </span>
      </div>
      <p className="relative mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Drag to change what flows first — lead with Projects if that&rsquo;s your strongest section, or Experience if
        that is. Intro and Contact always stay first and last.
      </p>
      <div className="relative mt-4">
        <SectionOrderField order={order} onChange={onChange} />
      </div>
    </div>
  );
}

function FormSection({ title, hint, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      {hint && <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>}
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <textarea
        {...props}
        rows={3}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
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
    <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
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
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
    >
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

export default function EditForm({ data, onChange, templateId }) {
  const set = (patch) => onChange({ ...data, ...patch });
  const showPhotoFields = TEMPLATES_WITH_PHOTOS.has(templateId);

  const setLink = (key, value) =>
    set({ links: { ...data.links, [key]: value } });

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
