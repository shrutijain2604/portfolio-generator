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

// Level Up's own palette set — deliberately just two entries. This template
// reads as a game HUD, and the natural "themes" for a HUD are the same
// light/dark modes as a phone's system appearance, not a wide color choice —
// so unlike Editorial/Warm/Dashboard, more entries here would be scope
// creep, not a feature. Same PAPER/INK/.../PALETTE shape as the others so it
// still works with the existing ThemeSwitcher/getPalette() unmodified; each
// swatch's conic sweep just reads as a small dark-panel or light-panel
// preview, the same pattern iOS/Android use for their own appearance picker.
export const LEVEL_UP_PALETTES = [
  {
    id: "dark",
    label: "Dark Mode",
    description: "Deep-space HUD — near-black canvas, electric violet accent.",
    colors: {
      PAPER: "#0a0c12",
      INK: "#f3f5fa",
      INK_SOFT: "#c7ccdb",
      MUTED: "#7b8299",
      ACCENT: "#07a096",
      POP: "#07a096",
      PALETTE: ["#12151f", "#07a096", "#0a0c12", "#22d3ee"],
    },
  },
  {
    id: "light",
    label: "Light Mode",
    description: "Clean daylight HUD — crisp white canvas, same violet accent.",
    colors: {
      PAPER: "#f5f6fb",
      INK: "#12141f",
      INK_SOFT: "#31364a",
      MUTED: "#6b7086",
      ACCENT: "#07a096",
      POP: "#07a096",
      PALETTE: ["#ffffff", "#07a096", "#f5f6fb", "#0891b2"],
    },
  },
];

// Scrapbook's own palette set — vintage as in "1960s-70s travel poster and
// Kodachrome film," not "faded sepia photograph": warm aged-paper
// backgrounds paired with genuinely saturated, punchy accents (burnt
// orange, hot pink, mustard, emerald, cobalt). An earlier pass here went
// fully desaturated/muted for "vintage" and it just read as dull — the
// actual vintage-but-vibrant reference point is mid-century poster art and
// old film-print color casts, which are bold, not washed out. Same
// PAPER/INK/.../PALETTE shape as the others, plus one addition: CARD, a
// warm-paper (or, for the dark palette, near-black) tone every board card
// sits on — distinct from PAPER since a masonry grid of cards needs its
// own consistent surface color regardless of how tinted the page
// background is.
export const SCRAPBOOK_PALETTES = [
  {
    id: "sunkissed",
    label: "Sunkissed Kodak",
    description: "Vivid burnt orange, gold and hot pink — 1970s Kodachrome, not faded.",
    colors: {
      PAPER: "#f5e6c8",
      INK: "#2b1f12",
      INK_SOFT: "#4a3620",
      MUTED: "#8a7355",
      ACCENT: "#e8542e",
      POP: "#f0a202",
      CARD: "#fff8e8",
      PALETTE: ["#e8542e", "#f0a202", "#0a9396", "#e83e8c"],
    },
  },
  {
    id: "riviera",
    label: "Riviera Summer",
    description: "Turquoise, coral and sunny yellow — a bold Mediterranean travel poster.",
    colors: {
      PAPER: "#f2ead2",
      INK: "#1c2b3a",
      INK_SOFT: "#33475c",
      MUTED: "#7891a0",
      ACCENT: "#0fa3b1",
      POP: "#f25c54",
      CARD: "#fffdf5",
      PALETTE: ["#0fa3b1", "#f25c54", "#f4d35e", "#ee6c9b"],
    },
  },
  {
    id: "citrus",
    label: "Citrus Grove",
    description: "Punchy orange, lime and magenta — bright and juicy.",
    colors: {
      PAPER: "#f6ecc9",
      INK: "#2e2a12",
      INK_SOFT: "#4f4622",
      MUTED: "#8c8256",
      ACCENT: "#e85d04",
      POP: "#8bc53f",
      CARD: "#fffbea",
      PALETTE: ["#e85d04", "#8bc53f", "#ffb703", "#d90368"],
    },
  },
  {
    id: "mustardmagenta",
    label: "Mustard & Magenta",
    description: "Bold mustard and raspberry magenta with teal — retro and confident.",
    colors: {
      PAPER: "#f3e6c4",
      INK: "#2a1f14",
      INK_SOFT: "#4a3826",
      MUTED: "#8c7a5c",
      ACCENT: "#d4a017",
      POP: "#c9184a",
      CARD: "#fdf6e3",
      PALETTE: ["#d4a017", "#c9184a", "#087f8c", "#f4845f"],
    },
  },
  {
    id: "botanicalpop",
    label: "Botanical Pop",
    description: "Emerald, hot pink and cobalt — a vivid vintage botanical print.",
    colors: {
      PAPER: "#eef0dd",
      INK: "#1a2e1c",
      INK_SOFT: "#33452f",
      MUTED: "#748067",
      ACCENT: "#1e8a5f",
      POP: "#e83e8c",
      CARD: "#fbfdf3",
      PALETTE: ["#1e8a5f", "#e83e8c", "#f4a900", "#3a6ea5"],
    },
  },
  {
    id: "neonnight",
    label: "Neon Nightfall",
    description: "A dark plum canvas with hot pink, gold and teal — vintage neon signage.",
    colors: {
      PAPER: "#1c1420",
      INK: "#f5ecd8",
      INK_SOFT: "#d8c9ae",
      MUTED: "#9a8a72",
      ACCENT: "#ff5da2",
      POP: "#ffd23f",
      CARD: "#241b28",
      PALETTE: ["#ff5da2", "#ffd23f", "#22d3c5", "#7c5cff"],
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
  scrapbook: SCRAPBOOK_PALETTES,
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
