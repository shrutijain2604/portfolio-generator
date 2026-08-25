// The exact set of files that gets copied into a customer's repository, and
// the one file that is generated rather than copied.
//
// This is an explicit allowlist, not a directory walk, and that is the whole
// point. templates/<id>/ on a developer machine also contains .env.local with
// this project's Supabase keys in it, a .next build directory, and a
// node_modules tree. Walking the directory would push all three into somebody
// else's public repository the first time anyone deployed. A list can only
// ever ship what it names.
//
// Adding a file to a template means adding it here too, or it silently will
// not reach the customer.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { HANDOFF_TEMPLATE_IDS } from "./handoffTemplates";

// Where the customer's own content lands in their repo. Generated from what
// they typed rather than copied, so it is deliberately absent from the copy
// lists below.
export const DATA_FILE = "data/portfolio.js";

const CHANGELOG_FILES = [
  ".gitignore",
  "README.md",
  "app/globals.css",
  "app/layout.js",
  "app/page.js",
  "components/ChangelogTemplate.js",
  "components/CursorGlow.js",
  "components/DeployLog.js",
  "components/DeployedAgo.js",
  "components/shared.js",
  "jsconfig.json",
  "lib/portfolioData.js",
  "next.config.mjs",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
];

// Only templates whose standalone app reads data/portfolio.js belong here. A
// template still reading its content from the database has nothing to gain
// from this path and must not be listed until it is converted.
export const HANDOFF_TEMPLATES = {
  changelog: CHANGELOG_FILES,
};

// Both halves have to agree, or a template could be offered the handoff in the
// editor with no file list behind it, or carry a list nothing ever reaches.
export function supportsHandoff(templateId) {
  return HANDOFF_TEMPLATE_IDS.has(templateId) && Object.hasOwn(HANDOFF_TEMPLATES, templateId);
}

// U+2028 and U+2029 are legal inside a JSON string but were, for years, not
// legal inside a JavaScript string literal. Modern engines accept them, but a
// resume pasted out of a PDF is exactly where they turn up, and the cost of
// escaping them is nothing next to a customer's site failing to build over an
// invisible character.
function toJsLiteral(value) {
  return JSON.stringify(value, null, 2)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// The customer's content, written as a commented module rather than raw JSON
// so the file they are told to edit explains itself when they open it.
// JSON.stringify, never string interpolation: this is user input being written
// into a source file, and concatenation here would be an injection bug.
export function buildDataFile(data) {
  return `// ─────────────────────────────────────────────────────────────────────────
// THIS FILE IS YOUR PORTFOLIO.
//
// Everything on your live site comes from here. Change something, commit it,
// and your site rebuilds itself with the change. There is nothing else to
// update and no account to sign in to.
//
// Editing it in the browser:
//   1. Click the pencil icon at the top right of this file on GitHub.
//   2. Make your change.
//   3. Scroll down and press "Commit changes".
//   Your site updates on its own about a minute later.
//
// Editing it on your machine:
//   npm install && npm run dev   then open http://localhost:3000
//
// A few rules so the site keeps building:
//   - Text goes inside "quotes".
//   - Every item in a list ends with a comma.
//   - Hide a section by leaving its list empty, like: "projects": []
//   - If you break something, GitHub keeps every past version of this file
//     under the "History" button, so nothing is ever lost.
// ─────────────────────────────────────────────────────────────────────────

const portfolio = ${toJsLiteral(data)};

export default portfolio;
`;
}

// Read straight off disk rather than fetched from this project's own GitHub
// repo. Locally that is the only version that exists, and it means what gets
// handed over is what is actually checked out rather than whatever was last
// pushed, so a template edit can be tested before it ships.
export async function readTemplateFiles(templateId) {
  const list = HANDOFF_TEMPLATES[templateId];
  if (!list) throw new Error(`No handoff file list for template "${templateId}".`);

  const root = path.join(process.cwd(), "templates", templateId);

  return Promise.all(
    list.map(async (relativePath) => ({
      path: relativePath,
      content: await readFile(path.join(root, relativePath), "utf8"),
    }))
  );
}
