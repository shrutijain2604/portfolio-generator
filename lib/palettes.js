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

// Warm & Personal's own palette set: cozy, earthy hue families rather than
// Editorial's bold/graphic ones, but the same PAPER/INK/.../PALETTE shape,
// so it works with the same ThemeSwitcher and getPalette() unmodified.
//
// Three extra roles on top of that shape, because this template's whole
// design is a room lit by one sun: SKY_HI and SKY_LO are the sky seen
// through its window (high and at the horizon), and SUN is the light's own
// color. The template derives all four times of day from those three by
// mixing them toward white or toward night in CSS, so a palette never has
// to spell out four skies, and PAPER/INK stay untouched across every hour,
// which is what keeps text contrast identical whatever the light is doing.
export const WARM_PALETTES = [
  {
    id: "terracotta",
    label: "Terracotta",
    description: "Warm cream with terracotta, sage and honey: cozy and earthy.",
    colors: {
      PAPER: "#fdf5ec",
      INK: "#3d2c22",
      INK_SOFT: "#5c4636",
      MUTED: "#7d6d60",
      ACCENT: "#c1704a",
      POP: "#c1704a",
      PALETTE: ["#c1704a", "#7c8a6e", "#c9a15a", "#a8687a"],
      SKY_HI: "#7fa8c9",
      SKY_LO: "#e8bd93",
      SUN: "#f0a35c",
    },
  },
  {
    id: "sage",
    label: "Sage & Cream",
    description: "Soft botanical green on cream: calm and grounded.",
    colors: {
      PAPER: "#f6f4ec",
      INK: "#2e3b2e",
      INK_SOFT: "#445544",
      MUTED: "#657262",
      ACCENT: "#5c7a52",
      POP: "#5c7a52",
      PALETTE: ["#5c7a52", "#c9a15a", "#a8687a", "#c1704a"],
      SKY_HI: "#8fb7c9",
      SKY_LO: "#dfe3c2",
      SUN: "#e8c579",
    },
  },
  {
    id: "honey",
    label: "Honey Gold",
    description: "Warm golden accents on soft cream: bright and inviting.",
    colors: {
      PAPER: "#fdf8ec",
      INK: "#3d2f14",
      INK_SOFT: "#5c4a24",
      MUTED: "#7f7049",
      ACCENT: "#c9922a",
      POP: "#c9922a",
      PALETTE: ["#c9922a", "#c1704a", "#5c7a52", "#a8687a"],
      SKY_HI: "#9dc0d6",
      SKY_LO: "#f2d9a0",
      SUN: "#f5b74f",
    },
  },
  {
    id: "blush",
    label: "Soft Blush",
    description: "Dusty rose on warm white: gentle and personal.",
    colors: {
      PAPER: "#fdf1ee",
      INK: "#3d2529",
      INK_SOFT: "#5c3a40",
      MUTED: "#7f686d",
      ACCENT: "#c1607a",
      POP: "#c1607a",
      PALETTE: ["#c1607a", "#c9922a", "#5c7a52", "#8a6ba8"],
      SKY_HI: "#b6a6c9",
      SKY_LO: "#f2c7c7",
      SUN: "#f2a882",
    },
  },
  {
    id: "clay",
    label: "Clay & Rust",
    description: "Deep clay and rust on warm sand: earthy and grounded.",
    colors: {
      PAPER: "#f7ece3",
      INK: "#341c14",
      INK_SOFT: "#4d2c1f",
      MUTED: "#826454",
      ACCENT: "#a8492e",
      POP: "#a8492e",
      PALETTE: ["#a8492e", "#c9922a", "#6b5238", "#7c8a6e"],
      SKY_HI: "#8f9ec2",
      SKY_LO: "#e0b394",
      SUN: "#e8834a",
    },
  },
  {
    id: "lagoon",
    label: "Warm Lagoon",
    description: "Teal with a warm coral pop: fresh, a little unexpected.",
    colors: {
      PAPER: "#f2f7f4",
      INK: "#1c3733",
      INK_SOFT: "#2f4d47",
      MUTED: "#5b7570",
      ACCENT: "#2e8577",
      POP: "#e0763f",
      PALETTE: ["#2e8577", "#e0763f", "#c9922a", "#4a6b8a"],
      SKY_HI: "#7fc0c2",
      SKY_LO: "#d9e8dd",
      SUN: "#f09055",
    },
  },
  {
    id: "cocoa",
    label: "Cocoa",
    description: "Deep cocoa brown with warm amber: a cozy dark mode.",
    colors: {
      PAPER: "#241a14",
      INK: "#f5ecdf",
      INK_SOFT: "#dcccb4",
      MUTED: "#9c8a72",
      ACCENT: "#e0a05a",
      POP: "#e0a05a",
      PALETTE: ["#e0a05a", "#c1704a", "#8a9a6e", "#c98a9e"],
      SKY_HI: "#4a3f63",
      SKY_LO: "#7a5a52",
      SUN: "#e0a05a",
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

// Level Up's own palette set. Each entry is a whole console: on top of the
// usual PAPER/INK/.../PALETTE shape it carries the four colors the level
// itself is built from, because this template's page is a side-scrolling
// world rather than a document on a background. SKY_HI and SKY_LO are the
// sky at the top of the screen and at the horizon, LAND and LAND_DEEP are
// the terrain's lit face and the rock under it, and FRAME is the hard 2px
// edge every panel wears. FRAME is a palette value rather than a mix of INK
// and PAPER because a panel here floats over the sky, not over PAPER: it has
// to separate from both, and on the dark palettes that means a light edge
// where a derived one would have been another dark tone.
//
// Every pair was checked rather than eyeballed: all body, label and accent
// text clears WCAG AA (4.5:1) against the surface it actually sits on, and
// FRAME clears 3:1 against the panel, both sky stops and the terrain. Two
// consequences are baked into the template. MUTED is only ever used inside a
// panel, since it fails against the open sky on three of the four palettes;
// and any hue used as a solid fill behind text picks PAPER or INK by that
// hue's own luminance (see onFill in LevelUpTemplate.js) instead of assuming
// PAPER, because the greens and golds here are light enough to need dark
// text on them.
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

// Prism's own palette set — this aesthetic (blurred gradient blobs behind
// frosted-glass cards) naturally invites color variety, same reasoning as
// Editorial/Warm/Dashboard opting in. `PALETTE` doubles as the blob gradient
// stops here (see PrismTemplate.js), so each entry reads as one cohesive
// gradient family rather than four unrelated accents. Deliberately named
// distinctly from Editorial's own `"aurora"` palette id below — a
// coincidental, unrelated reuse of the word under a different template,
// not the same thing, so these use their own names instead.
export const PRISM_PALETTES = [
  {
    id: "violetdream",
    label: "Violet Dream",
    description: "Violet melting into cyan on near-black — the classic aurora borealis pairing.",
    colors: {
      PAPER: "#0f0b1f",
      INK: "#f3f0ff",
      INK_SOFT: "#d8d0f0",
      MUTED: "#9089b8",
      ACCENT: "#8b5cf6",
      POP: "#22d3ee",
      PALETTE: ["#8b5cf6", "#a78bfa", "#22d3ee", "#67e8f9"],
    },
  },
  {
    id: "sunsetblush",
    label: "Sunset Blush",
    description: "Hot pink melting into gold on deep plum — warm and glowing.",
    colors: {
      PAPER: "#1a0f14",
      INK: "#fdf2f6",
      INK_SOFT: "#eccbd8",
      MUTED: "#a4899a",
      ACCENT: "#ec4899",
      POP: "#f59e0b",
      PALETTE: ["#ec4899", "#fb7185", "#f59e0b", "#fbbf24"],
    },
  },
  {
    id: "emeraldtide",
    label: "Emerald Tide",
    description: "Emerald melting into teal on deep sea-black — cool and lush.",
    colors: {
      PAPER: "#08151a",
      INK: "#eefdf9",
      INK_SOFT: "#bfe8dc",
      MUTED: "#7fa89c",
      ACCENT: "#10b981",
      POP: "#06b6d4",
      PALETTE: ["#10b981", "#34d399", "#06b6d4", "#22d3ee"],
    },
  },
  {
    id: "cosmicnoir",
    label: "Cosmic Noir",
    description: "Restrained deep-space slate and ice blue — minimal and premium.",
    colors: {
      PAPER: "#050507",
      INK: "#f2f3f7",
      INK_SOFT: "#c7c9d6",
      MUTED: "#7d8096",
      ACCENT: "#64748b",
      POP: "#60a5fa",
      PALETTE: ["#64748b", "#94a3b8", "#60a5fa", "#38bdf8"],
    },
  },
  {
    id: "daylightmist",
    label: "Daylight Mist",
    description: "Soft lavender-white daylight aurora — the light-mode option, gentle and airy.",
    colors: {
      PAPER: "#f5f3ff",
      INK: "#1e1b2e",
      INK_SOFT: "#413a5c",
      MUTED: "#8b83a8",
      ACCENT: "#7c3aed",
      POP: "#ec4899",
      PALETTE: ["#7c3aed", "#ec4899", "#f59e0b", "#06b6d4"],
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
  prism: PRISM_PALETTES,
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
