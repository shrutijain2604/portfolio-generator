// Inline SVG marks for the landing page. Kept local to the page rather than
// pulling an icon dependency: this is the whole set the surface needs, and a
// template subapp never imports it, so it costs nothing a customer inherits.
// Every mark is decorative here, sitting beside a real text label, so the
// caller is responsible for aria-hidden.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function ArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
    </svg>
  );
}

export function GitHubMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.7a10.3 10.3 0 0 0-3.26 20.07c.52.1.7-.22.7-.49v-1.9c-2.86.62-3.46-1.2-3.46-1.2-.47-1.2-1.15-1.52-1.15-1.52-.93-.64.07-.63.07-.63 1.03.07 1.58 1.06 1.58 1.06.92 1.58 2.4 1.12 2.99.86.09-.67.36-1.13.65-1.39-2.28-.26-4.68-1.14-4.68-5.08 0-1.12.4-2.04 1.05-2.76-.1-.26-.45-1.3.1-2.72 0 0 .86-.27 2.8 1.06a9.8 9.8 0 0 1 5.1 0c1.94-1.33 2.8-1.06 2.8-1.06.55 1.42.2 2.46.1 2.72.65.72 1.05 1.64 1.05 2.76 0 3.95-2.4 4.82-4.7 5.07.37.32.7.94.7 1.9v2.82c0 .27.18.6.71.49A10.3 10.3 0 0 0 12 1.7Z" />
    </svg>
  );
}

export function VercelMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3 22.5 21H1.5L12 3Z" />
    </svg>
  );
}
