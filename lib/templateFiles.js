// The files copied into a customer's repository, and the one file generated
// rather than copied.
//
// .env.local, node_modules and .next all sit at a template's root, so the root
// is never walked: it is the fixed list below. Only subdirectories are walked,
// and none of them can hold a secret.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { HANDOFF_TEMPLATE_IDS } from "./handoffTemplates";

// Where the customer's own content lands in their repo. Generated from what
// they typed rather than copied, which is why "data" is absent from the list
// of walked directories below.
export const DATA_FILE = "data/portfolio.js";

const ROOT_FILES = [
  ".gitignore",
  "README.md",
  "jsconfig.json",
  "next.config.mjs",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
];

const COPIED_DIRS = ["app", "components", "lib", "public"];

// Allowlist rather than denylist, so an unforeseen asset type is sent as
// base64 and arrives intact instead of being mangled by a UTF-8 read. The only
// extensionless file is .gitignore.
const TEXT_EXTENSIONS = new Set([
  "", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css", ".md", ".txt", ".svg", ".html",
]);

// Both halves have to agree, or a template could be offered the handoff in the
// editor with no files behind it, or carry files nothing ever reaches.
export function supportsHandoff(templateId) {
  return HANDOFF_TEMPLATE_IDS.has(templateId);
}

// U+2028/U+2029 are legal in JSON but were long illegal in a JS string, and a
// resume pasted out of a PDF is where they turn up.
function toJsLiteral(value) {
  return JSON.stringify(value, null, 2)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// JSON.stringify, never interpolation: this is user input written into a
// source file, and concatenation here would be an injection bug.
export function buildDataFile(data) {
  return `// THIS FILE IS YOUR PORTFOLIO. Everything on your site comes from here.
//
// Edit it, commit, and your site rebuilds itself a minute later. Text goes in
// "quotes", every list item ends with a comma, and an empty list hides that
// section. GitHub's History button keeps every previous version, so a bad edit
// is always undoable. Full guide: README.md

const portfolio = ${toJsLiteral(data)};

export default portfolio;
`;
}

// Every file under one of the COPIED_DIRS, relative to the template root.
// Dotfiles are skipped: nothing a template needs starts with a dot below its
// root, and skipping them keeps a stray .DS_Store out of somebody's repo.
async function walk(root, relativeDir) {
  let entries;
  try {
    entries = await readdir(path.join(root, relativeDir), { withFileTypes: true });
  } catch (error) {
    // A template without a public/ directory is normal, and only three of them
    // have one. Anything else is a real problem and should not be swallowed.
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const found = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".")) return [];
      const relativePath = path.posix.join(relativeDir, entry.name);
      return entry.isDirectory() ? walk(root, relativePath) : [relativePath];
    })
  );

  return found.flat();
}

// Read off disk, so what ships is what is checked out rather than whatever was
// last pushed. next.config.mjs must name these paths under
// outputFileTracingIncludes, since the build cannot see a runtime path.
export async function readTemplateFiles(templateId) {
  if (!supportsHandoff(templateId)) {
    throw new Error(`Template "${templateId}" does not support the handoff.`);
  }

  const root = path.join(process.cwd(), "templates", templateId);
  const nested = await Promise.all(COPIED_DIRS.map((dir) => walk(root, dir)));
  const paths = [...ROOT_FILES, ...nested.flat()];

  return Promise.all(
    paths.map(async (relativePath) => {
      const text = TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
      const buffer = await readFile(path.join(root, relativePath));
      return {
        path: relativePath,
        content: text ? buffer.toString("utf8") : buffer.toString("base64"),
        encoding: text ? "utf-8" : "base64",
      };
    })
  );
}
