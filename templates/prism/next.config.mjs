/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app is nested inside the builder repo (as templates/prism/) for
  // local development, which has its own lockfile alongside the parent
  // one — without this, Turbopack guesses the wrong workspace root. Once
  // Vercel clones just this subdirectory into its own repo, there's no
  // parent lockfile anymore and this becomes a no-op.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
