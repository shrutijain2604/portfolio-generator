/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) spins up a worker by dynamically importing a
  // sibling file at runtime. Bundling it moves that file without updating
  // the import, breaking resume parsing, so load it via native Node
  // `require` instead, unbundled.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  // Two files that only exist at runtime behind something the build cannot
  // see. `next build` traces each route with @vercel/nft, which reads static
  // `import`, `require` and `fs` calls; a deployed function contains only what
  // that trace found. Both of these were missing in production while working
  // locally, where the whole tree is on disk regardless of the trace.
  //
  // Keep the patterns narrow. A wider glob over templates/ would sweep
  // templates/<id>/.env.local, which holds this project's Supabase keys, into
  // the deployed bundle, and avoiding exactly that is why lib/templateFiles.js
  // copies from an allowlist instead of walking a directory.
  outputFileTracingIncludes: {
    // pdfjs loads its worker with `import(<computed url>)`, which is opaque to
    // static analysis, so the worker never got traced. Without it every upload
    // failed with "Setting up fake worker failed".
    "/api/parse-resume": ["node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    // The tracer picks up templates/<id>/ from the readFile call in
    // lib/templateFiles.js, but it skips dotfiles, so .gitignore alone was
    // absent and reading the allowlist threw ENOENT. Named explicitly rather
    // than matched with a dot-glob, and by wildcard on the template id so this
    // keeps holding as more templates gain a handoff.
    "/api/github/create-repo": ["templates/*/.gitignore"],
  },
};

export default nextConfig;
