# Dev Portfolio Builder

Pick a template, fill in one form, watch your portfolio come alive — live, in your browser.

Nine visually distinct templates (git-log dark mode, a magazine-style editorial layout, a Windows-95 desktop, a Spotify-style artist profile, and more) all read from the same shared data, so switching templates never means retyping anything.

## Features

- **9 templates**, each with its own layout, tone, and interactivity — not five reskins of the same card.
- **Live preview** — a resizable split-pane editor shows your real content rendered in the chosen template as you type.
- **Resume import** — upload a PDF/DOCX and have the form auto-filled (deterministic regex for email/GitHub/LinkedIn, Gemini for everything else). Always reviewable/editable afterward — parsing isn't perfect.
- **Autosave** — your draft persists to `localStorage`, so a refresh never loses your work.
- **Honest data** — every stat, chip, and "achievement" shown in a template is derived from what you actually entered. Nothing is fabricated.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Resume import (optional)

Resume import calls the Gemini API and needs a free API key:

1. Grab one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Copy `.env.example` to `.env.local` and paste it in:
   ```
   GEMINI_API_KEY=your-key-here
   ```
3. Restart `npm run dev`.

Everything else in the app works without this key — it's only needed for the resume-import feature.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Google Gemini](https://ai.google.dev) for resume parsing, via `@google/genai`
- `pdf-parse` / `mammoth` for resume text extraction

## Project structure

```
app/                    routes: landing page, editor, resume-parse API route
components/             editor UI (form, live-preview shell, resume import)
components/templates/   the template components themselves
lib/portfolioData.js    shared data schema every template renders from
```
