// Which templates hand over a repository containing the customer's content.
//
// Split out from lib/templateFiles.js so the editor can import it: that module
// reads from the filesystem, and pulling node:fs into a client component
// breaks the build. The file lists live there, the ids live here, and there is
// still one place to add a template to.

// Every template now ships its own data/portfolio.js and reads from it, so
// every template can be handed over. Keep this in step with templates/<id>/:
// an id here with no directory behind it fails at the point a customer is
// waiting on a repository.
export const HANDOFF_TEMPLATE_IDS = new Set([
  "changelog",
  "dashboard",
  "editorial",
  "holographic",
  "level-up",
  "newspaper",
  "prism",
  "retro-desktop",
  "scrapbook",
  "spotify",
  "terminal",
  "warm",
]);
