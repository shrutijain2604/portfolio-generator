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

// Templates that support palette selection, and which set they draw from —
// add an entry here when another template opts in.
const PALETTES_BY_TEMPLATE = {
  editorial: EDITORIAL_PALETTES,
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
