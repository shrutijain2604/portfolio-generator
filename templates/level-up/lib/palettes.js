// Color palette presets a customer can pick per template, so the same
// content can be restyled without touching layout. Each template that opts
// in defines its own palette set under its id — the color roles below
// (PAPER/INK/INK_SOFT/MUTED/ACCENT/POP/PALETTE) are Editorial's own naming,
// not a cross-template contract; a future template can shape its entries
// however its own design needs.
//
// `PALETTE` is the 4-color cycling set used for per-section/per-project
// spot-colors (project cover tiles, timeline dots, table-of-contents
// numerals) — kept separate from POP (the one masthead/CTA accent) so a
// palette can have a single bold "loud" color plus a calmer rotating set.

// PALETTE[1] doubles as the second stop of the role-text gradient (paired
// with POP) — chosen deliberately close to POP in hue for palettes meant to
// read as a bold gradient duotone, and identical to POP for the
// neo-brutalist/restrained-jewel palettes, where a flat single accent (no
// visible gradient) is the correct, on-theme result rather than a bug.
// PALETTE entries otherwise read as one cohesive family within a palette,
// not four unrelated accent colors.
export const EDITORIAL_PALETTES = [
  {
    id: "gilded",
    label: "Midnight Gold",
    description: "True black with rich gold — after-hours luxury, restrained and bold.",
    colors: {
      PAPER: "#0a0a0a",
      INK: "#f5efe0",
      INK_SOFT: "#d6c9a8",
      MUTED: "#8f8674",
      ACCENT: "#8a6a1f",
      POP: "#d4af37",
      PALETTE: ["#d4af37", "#8a6a1f", "#d4af37", "#8a6a1f"],
    },
  },
  {
    id: "void",
    label: "Void",
    description: "Neo-brutalist — true black and white with one acid-green accent.",
    colors: {
      PAPER: "#0a0a0a",
      INK: "#f5f5f5",
      INK_SOFT: "#cfcfcf",
      MUTED: "#8a8a8a",
      ACCENT: "#f5f5f5",
      POP: "#39ff88",
      PALETTE: ["#f5f5f5", "#39ff88", "#f5f5f5", "#39ff88"],
    },
  },
  {
    id: "heritage",
    label: "Heritage Red",
    description: "Warm broadsheet cream sweeping from masthead red into deep violet.",
    colors: {
      PAPER: "#faf6ee",
      INK: "#18100c",
      INK_SOFT: "#332a24",
      MUTED: "#7a6f63",
      ACCENT: "#2c3b57",
      POP: "#d1401f",
      PALETTE: ["#d1401f", "#e8734a", "#9a4bc4", "#5c3ba0"],
    },
  },
  {
    id: "cobalt",
    label: "Modern Cobalt",
    description: "Crisp cool white sweeping from cobalt through teal, gold and coral.",
    colors: {
      PAPER: "#f6f7fb",
      INK: "#0f1320",
      INK_SOFT: "#333a4d",
      MUTED: "#6b7284",
      ACCENT: "#334155",
      POP: "#2451e8",
      PALETTE: ["#2451e8", "#00b8a9", "#f6a300", "#ff3d6e"],
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Gradient duotone — violet melting into cyan, cool and electric.",
    colors: {
      PAPER: "#f8f7fc",
      INK: "#150f28",
      INK_SOFT: "#392f57",
      MUTED: "#7c7396",
      ACCENT: "#6d28d9",
      POP: "#06b6d4",
      PALETTE: ["#7c3aed", "#a855f7", "#06b6d4", "#0ea5e9"],
    },
  },
  {
    id: "citrus",
    label: "Citrus Blaze",
    description: "Gradient duotone — hot pink melting into gold, warm and energetic.",
    colors: {
      PAPER: "#fff8f0",
      INK: "#2b1608",
      INK_SOFT: "#4a2c14",
      MUTED: "#8a6f52",
      ACCENT: "#ff5e3a",
      POP: "#ff2f87",
      PALETTE: ["#ff2f87", "#ff5e3a", "#ffb100", "#ff8a3d"],
    },
  },
  {
    id: "sapphire",
    label: "Sapphire Noir",
    description: "Rich jewel minimalism — deep navy and gold, restrained and upscale.",
    colors: {
      PAPER: "#f4f5f8",
      INK: "#0b1220",
      INK_SOFT: "#28324a",
      MUTED: "#6b7690",
      ACCENT: "#1e3a8a",
      POP: "#c9a227",
      PALETTE: ["#1e3a8a", "#c9a227", "#1e3a8a", "#c9a227"],
    },
  },
  {
    id: "merlot",
    label: "Merlot",
    description: "Rich jewel minimalism — deep burgundy and rose gold, warm and restrained.",
    colors: {
      PAPER: "#f7f0ee",
      INK: "#1f0d10",
      INK_SOFT: "#3d1e22",
      MUTED: "#8a6e6e",
      ACCENT: "#5c1a2b",
      POP: "#c98a5e",
      PALETTE: ["#5c1a2b", "#c98a5e", "#5c1a2b", "#c98a5e"],
    },
  },
];

// Warm & Personal's own palette set — cozy, earthy hue families rather than
// Editorial's bold/graphic ones, but the same PAPER/INK/.../PALETTE shape,
// so it works with the same ThemeSwitcher and getPalette() unmodified.
export const WARM_PALETTES = [
  {
    id: "terracotta",
    label: "Terracotta",
    description: "Warm cream with terracotta, sage and honey — cozy and earthy.",
    colors: {
      PAPER: "#fdf5ec",
      INK: "#3d2c22",
      INK_SOFT: "#5c4636",
      MUTED: "#8a7a6d",
      ACCENT: "#c1704a",
      POP: "#c1704a",
      PALETTE: ["#c1704a", "#7c8a6e", "#c9a15a", "#a8687a"],
    },
  },
  {
    id: "sage",
    label: "Sage & Cream",
    description: "Soft botanical green on cream — calm and grounded.",
    colors: {
      PAPER: "#f6f4ec",
      INK: "#2e3b2e",
      INK_SOFT: "#445544",
      MUTED: "#7c8a78",
      ACCENT: "#5c7a52",
      POP: "#5c7a52",
      PALETTE: ["#5c7a52", "#c9a15a", "#a8687a", "#c1704a"],
    },
  },
  {
    id: "honey",
    label: "Honey Gold",
    description: "Warm golden accents on soft cream — bright and inviting.",
    colors: {
      PAPER: "#fdf8ec",
      INK: "#3d2f14",
      INK_SOFT: "#5c4a24",
      MUTED: "#8a7a52",
      ACCENT: "#c9922a",
      POP: "#c9922a",
      PALETTE: ["#c9922a", "#c1704a", "#5c7a52", "#a8687a"],
    },
  },
  {
    id: "blush",
    label: "Soft Blush",
    description: "Dusty rose on warm white — gentle and personal.",
    colors: {
      PAPER: "#fdf1ee",
      INK: "#3d2529",
      INK_SOFT: "#5c3a40",
      MUTED: "#8a7378",
      ACCENT: "#c1607a",
      POP: "#c1607a",
      PALETTE: ["#c1607a", "#c9922a", "#5c7a52", "#8a6ba8"],
    },
  },
  {
    id: "clay",
    label: "Clay & Rust",
    description: "Deep clay and rust on warm sand — earthy and grounded.",
    colors: {
      PAPER: "#f7ece3",
      INK: "#341c14",
      INK_SOFT: "#4d2c1f",
      MUTED: "#8a6b5a",
      ACCENT: "#a8492e",
      POP: "#a8492e",
      PALETTE: ["#a8492e", "#c9922a", "#6b5238", "#7c8a6e"],
    },
  },
  {
    id: "lagoon",
    label: "Warm Lagoon",
    description: "Teal with a warm coral pop — fresh, a little unexpected.",
    colors: {
      PAPER: "#f2f7f4",
      INK: "#1c3733",
      INK_SOFT: "#2f4d47",
      MUTED: "#6c8580",
      ACCENT: "#2e8577",
      POP: "#e0763f",
      PALETTE: ["#2e8577", "#e0763f", "#c9922a", "#4a6b8a"],
    },
  },
  {
    id: "cocoa",
    label: "Cocoa",
    description: "Deep cocoa brown with warm amber — a cozy dark mode.",
    colors: {
      PAPER: "#241a14",
      INK: "#f5ecdf",
      INK_SOFT: "#dcccb4",
      MUTED: "#9c8a72",
      ACCENT: "#e0a05a",
      POP: "#e0a05a",
      PALETTE: ["#e0a05a", "#c1704a", "#8a9a6e", "#c98a9e"],
    },
  },
];

// Dashboard's own palette set — modern SaaS-analytics hue families (a light
// neutral canvas the cards sit on top of, one primary brand accent, plus a
// semantic-adjacent 4-color set for status/tag visualizations) rather than
// Editorial's or Warm's, but the same PAPER/INK/.../PALETTE shape.
export const DASHBOARD_PALETTES = [
  {
    id: "indigo",
    label: "Indigo",
    description: "The classic — light neutral canvas, indigo primary.",
    colors: {
      PAPER: "#f4f5fa",
      INK: "#0f1222",
      INK_SOFT: "#33374d",
      MUTED: "#6b7086",
      ACCENT: "#4f46e5",
      POP: "#4f46e5",
      PALETTE: ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"],
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    description: "Fintech green on a cool light canvas — confident and clean.",
    colors: {
      PAPER: "#f2f8f5",
      INK: "#0b1f16",
      INK_SOFT: "#28453a",
      MUTED: "#5f7e72",
      ACCENT: "#059669",
      POP: "#059669",
      PALETTE: ["#059669", "#4f46e5", "#f59e0b", "#0ea5e9"],
    },
  },
  {
    id: "rose",
    label: "Rose",
    description: "Warm rose primary on a soft blush canvas — modern and creative.",
    colors: {
      PAPER: "#faf5f6",
      INK: "#26121a",
      INK_SOFT: "#4a2530",
      MUTED: "#8a6b73",
      ACCENT: "#e11d48",
      POP: "#e11d48",
      PALETTE: ["#e11d48", "#4f46e5", "#f59e0b", "#059669"],
    },
  },
  {
    id: "amber",
    label: "Amber",
    description: "Energetic amber on warm cream — bright and approachable.",
    colors: {
      PAPER: "#fbf7ee",
      INK: "#241a08",
      INK_SOFT: "#4a3714",
      MUTED: "#8a7554",
      ACCENT: "#d97706",
      POP: "#d97706",
      PALETTE: ["#d97706", "#4f46e5", "#e11d48", "#059669"],
    },
  },
  {
    id: "violet",
    label: "Violet",
    description: "Premium violet on a cool light canvas — polished and distinct.",
    colors: {
      PAPER: "#f6f4fb",
      INK: "#1a1130",
      INK_SOFT: "#3a2b5c",
      MUTED: "#7a6f96",
      ACCENT: "#7c3aed",
      POP: "#7c3aed",
      PALETTE: ["#7c3aed", "#059669", "#f59e0b", "#e11d48"],
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Clear sky blue on a cool canvas — crisp and technical.",
    colors: {
      PAPER: "#f2f7fa",
      INK: "#0a1f2e",
      INK_SOFT: "#1f3f52",
      MUTED: "#5c7c8c",
      ACCENT: "#0284c7",
      POP: "#0284c7",
      PALETTE: ["#0284c7", "#059669", "#f59e0b", "#7c3aed"],
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "A true dark-mode dashboard — near-black canvas, bright indigo.",
    colors: {
      PAPER: "#0d0e14",
      INK: "#eef0f7",
      INK_SOFT: "#c3c7d9",
      MUTED: "#7c8199",
      ACCENT: "#818cf8",
      POP: "#818cf8",
      PALETTE: ["#818cf8", "#34d399", "#fbbf24", "#f472b6"],
    },
  },
];

// Level Up's palette set. Each entry is a whole console: on top of the usual
// PAPER/INK/.../PALETTE shape it carries the four colors the level is built
// from, since this page is a side-scrolling world rather than a document.
// SKY_HI/SKY_LO are the sky at top and horizon, LAND/LAND_DEEP the terrain's
// lit face and the rock under it, FRAME the hard 2px panel edge. FRAME is a
// palette value rather than derived from INK and PAPER because a panel floats
// over the sky and has to separate from both.
//
// Contrast was measured, not eyeballed: body, label and accent text clears
// WCAG AA against the surface it sits on, and FRAME clears 3:1 against panel,
// both sky stops and terrain. Two consequences: MUTED is only used inside a
// panel, since it fails against open sky on three of the four palettes, and
// any hue filled behind text picks PAPER or INK by its own luminance (see
// onFill in LevelUpTemplate.js).
export const LEVEL_UP_PALETTES = [
  {
    id: "arcade",
    label: "Arcade Cabinet",
    description: "Cabinet-dark night sky with a neon-red marquee accent and a score-green pop.",
    colors: {
      PAPER: "#0c111e",
      INK: "#f4f7fd",
      INK_SOFT: "#c5cddf",
      MUTED: "#8b95ad",
      ACCENT: "#ff3355",
      POP: "#2fd07a",
      FRAME: "#b9c3d8",
      SKY_HI: "#080d1c",
      SKY_LO: "#22305c",
      LAND: "#1d2a4e",
      LAND_DEEP: "#121b36",
      PALETTE: ["#ff3355", "#4d8dff", "#2fd07a", "#ffc63d"],
    },
  },
  {
    id: "overworld",
    label: "Overworld",
    description: "Bright blue sky over green ground: the first level of a platformer, in daylight.",
    colors: {
      PAPER: "#fdfaf0",
      INK: "#17202b",
      INK_SOFT: "#33404f",
      MUTED: "#63707e",
      ACCENT: "#c62f26",
      POP: "#15629f",
      FRAME: "#17202b",
      SKY_HI: "#6cbdf0",
      SKY_LO: "#bfe4f8",
      LAND: "#3f9142",
      LAND_DEEP: "#2a6a2d",
      PALETTE: ["#c62f26", "#15629f", "#2f9e44", "#e07a00"],
    },
  },
  {
    id: "neon",
    label: "Neon Circuit",
    description: "Violet dusk and hot magenta over a cyan skyline: the late-night arcade run.",
    colors: {
      PAPER: "#100722",
      INK: "#f7efff",
      INK_SOFT: "#d0c2e8",
      MUTED: "#9284b0",
      ACCENT: "#ff2d8f",
      POP: "#2ad4ee",
      FRAME: "#c0b0dc",
      SKY_HI: "#12062a",
      SKY_LO: "#4f1156",
      LAND: "#2c0c3f",
      LAND_DEEP: "#1a0629",
      PALETTE: ["#ff2d8f", "#2ad4ee", "#a855f7", "#facc15"],
    },
  },
  {
    id: "manual",
    label: "Instruction Manual",
    description: "Cream booklet paper with spot red and blue: the printed manual, not the screen.",
    colors: {
      PAPER: "#f4efe2",
      INK: "#16161c",
      INK_SOFT: "#33333d",
      MUTED: "#65656f",
      ACCENT: "#cf2222",
      POP: "#1d4ed8",
      FRAME: "#16161c",
      SKY_HI: "#b3d2e8",
      SKY_LO: "#dbe9f2",
      LAND: "#ded1b3",
      LAND_DEEP: "#c2b193",
      PALETTE: ["#cf2222", "#1d4ed8", "#0f7b52", "#d18b00"],
    },
  },
];

// Templates that support palette selection, and which set they draw from —
// add an entry here when another template opts in.
const PALETTES_BY_TEMPLATE = {
  editorial: EDITORIAL_PALETTES,
  warm: WARM_PALETTES,
  dashboard: DASHBOARD_PALETTES,
  "level-up": LEVEL_UP_PALETTES,
};

export function getPalettesForTemplate(templateId) {
  return PALETTES_BY_TEMPLATE[templateId] || null;
}

// Falls back to the template's first palette for a missing or stale id
// (e.g. a draft saved before a palette existed, or one since removed) —
// same defensive pattern as normalizeSectionOrder in portfolioData.js.
export function getPalette(templateId, paletteId) {
  const palettes = getPalettesForTemplate(templateId);
  if (!palettes) return null;
  return palettes.find((p) => p.id === paletteId) || palettes[0];
}
