/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) spins up a worker by dynamically importing a
  // sibling file at runtime. Bundling it moves that file without updating
  // the import, breaking resume parsing — so load it via native Node
  // `require` instead, unbundled.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
