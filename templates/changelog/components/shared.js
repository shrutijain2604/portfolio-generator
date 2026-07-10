// Small building blocks shared across templates: icons, and the
// deterministic color/initials helpers used to style skill/tag chips
// and avatar badges without any fabricated data.

export const LANGUAGE_COLORS = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  python: "#3572A5",
  java: "#b07219",
  go: "#00ADD8",
  rust: "#dea584",
  ruby: "#701516",
  php: "#4F5D95",
  html: "#e34c26",
  css: "#563d7c",
  react: "#61dafb",
  "react.js": "#61dafb",
  "node.js": "#3c873a",
  node: "#3c873a",
  vue: "#41b883",
  swift: "#F05138",
  kotlin: "#A97BFF",
  "c++": "#f34b7d",
  "c#": "#178600",
  sql: "#e38c00",
  graphql: "#e10098",
  docker: "#384d54",
  aws: "#ff9900",
  postgresql: "#336791",
  mongodb: "#4DB33D",
};

export function dotColor(label) {
  const key = label.trim().toLowerCase();
  if (LANGUAGE_COLORS[key]) return LANGUAGE_COLORS[key];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 65%, 60%)`;
}

export function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function stripProtocol(url) {
  return (url || "").replace(/^https?:\/\//, "");
}

export function parseYear(value) {
  if (!value) return null;
  const s = String(value).trim().toLowerCase();
  if (["present", "current", "now", "ongoing"].includes(s)) return new Date().getFullYear();
  const match = s.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

export function computeYearsOfExperience(experience) {
  let total = 0;
  (experience || []).forEach((job) => {
    const start = parseYear(job.start);
    const end = parseYear(job.end);
    if (start && end && end >= start) total += end - start;
  });
  return total;
}

export function IconGithub(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.88 10.95.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.53-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.57.23 2.73.11 3.02.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function IconLinkedin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export function IconLink(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.37-1.37" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function TrafficLights() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </div>
  );
}
