/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfjs loads its worker by dynamically importing a sibling file. Bundling
  // moves that file without updating the import, so load it unbundled.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

  // A deployed function contains only what @vercel/nft traced from static
  // import/require/fs calls, so anything reached at runtime must be named here.
  // Verify changes by running .next/standalone from OUTSIDE this repo: in
  // place, Node walks up to the project's node_modules and hides omissions.
  outputFileTracingIncludes: {
    "/api/parse-resume": [
      // pdfjs polyfills DOMMatrix from @napi-rs/canvas and throws during module
      // init without it. The binary is per-platform, hence the wildcard.
      "node_modules/@napi-rs/canvas/**/*",
      "node_modules/@napi-rs/canvas-*/**/*",
      // The ESM resolver reads the manifest before returning a subpath file.
      "node_modules/pdfjs-dist/package.json",
      // Loaded via import(<computed url>), invisible to static analysis.
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
    // lib/templateFiles.js reads these at request time from a runtime path.
    // Every pattern reaches into a subdirectory or names a root file by
    // extension, never a template root wholesale: .env.local, node_modules and
    // .next all sit at the root. Widening these to templates/*/** ships keys.
    "/api/github/create-repo": [
      "templates/*/.gitignore",
      "templates/*/README.md",
      "templates/*/*.json",
      "templates/*/*.mjs",
      "templates/*/app/**/*",
      "templates/*/components/**/*",
      "templates/*/lib/**/*",
      "templates/*/public/**/*",
    ],
  },
};

export default nextConfig;
