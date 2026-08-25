/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) spins up a worker by dynamically importing a
  // sibling file at runtime. Bundling it moves that file without updating
  // the import, breaking resume parsing, so load it via native Node
  // `require` instead, unbundled.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  // Files that only exist at runtime behind something the build cannot see.
  // `next build` traces each route with @vercel/nft, which reads static
  // `import`, `require` and `fs` calls; a deployed function contains only what
  // that trace found. Everything below was missing in production while working
  // locally, where the whole tree is on disk regardless of the trace.
  //
  // Verifying a change here means copying .next/standalone somewhere outside
  // this repo and running it there. Run in place and Node walks up into the
  // project's own node_modules, which hides exactly the omissions this is
  // meant to catch.
  //
  // Keep the patterns narrow. A wider glob over templates/ would sweep
  // templates/<id>/.env.local, which holds this project's Supabase keys, into
  // the deployed bundle, and avoiding exactly that is why lib/templateFiles.js
  // copies from an allowlist instead of walking a directory.
  outputFileTracingIncludes: {
    "/api/parse-resume": [
      // pdfjs reaches for @napi-rs/canvas on Node to polyfill DOMMatrix,
      // ImageData and Path2D. Missing, it warns and then throws "DOMMatrix is
      // not defined" while the module is still initialising, so the route
      // failed to load at all and every upload got a 500 regardless of file
      // type. The binary is per-platform and resolved from the build machine,
      // so the second pattern has to stay a wildcard.
      "node_modules/@napi-rs/canvas/**/*",
      "node_modules/@napi-rs/canvas-*/**/*",
      // Needed to resolve the `pdfjs-dist/legacy/build/pdf.mjs` subpath: the
      // ESM resolver reads the package manifest before it will hand back a
      // file inside the package.
      "node_modules/pdfjs-dist/package.json",
      // The worker is loaded with `import(<computed url>)`, opaque to static
      // analysis. Without it parsing failed with "Setting up fake worker
      // failed" once the module above finally loaded.
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
    // The tracer picks up templates/<id>/ from the readFile call in
    // lib/templateFiles.js, but it skips dotfiles, so .gitignore alone was
    // absent and reading the allowlist threw ENOENT. Named explicitly rather
    // than matched with a dot-glob, and by wildcard on the template id so this
    // keeps holding as more templates gain a handoff.
    "/api/github/create-repo": ["templates/*/.gitignore"],
  },
};

export default nextConfig;
