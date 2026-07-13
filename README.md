# Dev Portfolio Builder

Pick a template, fill in one form, watch your portfolio come alive — live, in your browser.

12 visually distinct templates (git-log dark mode, a magazine-style editorial layout, a Windows-95 desktop, a Spotify-style artist profile, a foil trading-card deck, and more) all read from the same shared data, so switching templates never means retyping anything.

## Features

- **12 templates**, each with its own layout, tone, and interactivity — not a dozen reskins of the same card: Changelog, Terminal, Editorial Minimal, Warm & Personal, Dashboard, Level Up, Retro Desktop, Digital Scrapbook, Artist Profile (Spotify-style), Front Page (newspaper), Prism (aurora glassmorphism), and Holographic (foil trading-card deck).
- **Live preview** — a resizable split-pane editor shows your real content rendered in the chosen template as you type.
- **Resume import** — upload a PDF/DOCX and have the form auto-filled (deterministic regex for email/GitHub/LinkedIn, Gemini for everything else). Always reviewable/editable afterward — parsing isn't perfect.
- **Autosave** — your draft persists to `localStorage`, so a refresh never loses your work.
- **Honest data** — every stat, chip, and "achievement" shown in a template is derived from what you actually entered. Nothing is fabricated.
- **Deploy my portfolio** — saves your data to Supabase and hands off to Vercel's clone flow, which creates a real repo and deployment under *your own* GitHub/Vercel accounts — no login to this app required, no ongoing hosting dependency on it either. Currently wired up for Changelog, Terminal, Editorial, Warm, Dashboard, Level Up, Retro Desktop, Scrapbook, and Spotify; Front Page, Prism, and Holographic each still need their own `templates/<id>/` standalone app before they can go live the same way.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` in the project root (never committed) with:

```
# Optional — only needed for resume import. Free key at https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Optional — only needed for the "Deploy my portfolio" flow. From your
# Supabase project's Settings -> API.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

The editor, live preview, and every template work with none of these set — they're only needed for resume import and the deploy pipeline, respectively. If using Supabase, run `supabase/schema.sql` in your project's SQL editor first.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Google Gemini](https://ai.google.dev) for resume parsing, via `@google/genai`
- `pdf-parse` / `mammoth` for resume text extraction
- [Supabase](https://supabase.com) for portfolio storage behind the deploy flow

## Project structure

```
app/                          routes: landing page, editor, resume-parse and
                               portfolio-save API routes, the /deployed
                               success page
app/live/[id]/                dev-only harness proving the fetch-by-id
                               pattern before a template gets its own repo
components/                   editor UI (form, live-preview shell, resume import)
components/templates/         the template components, rendered inside the editor
lib/portfolioData.js          shared data schema every template renders from
lib/supabase.js, portfolios.js  Supabase clients + the publish-on-deploy logic
supabase/schema.sql            run this in your Supabase project's SQL editor
templates/<name>/              standalone, self-contained Next.js apps — one
                               per template, each deployable on its own via
                               Vercel's clone flow. Not part of the main app's
                               build; each has its own package.json.
```
