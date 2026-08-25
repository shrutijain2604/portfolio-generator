// Which templates hand over a repository containing the customer's content.
//
// Split out from lib/templateFiles.js so the editor can import it: that module
// reads from the filesystem, and pulling node:fs into a client component
// breaks the build. The file lists live there, the ids live here, and there is
// still one place to add a template to.

export const HANDOFF_TEMPLATE_IDS = new Set(["changelog"]);
