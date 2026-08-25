# Your portfolio

This repository is your portfolio site. You own it. Nothing here depends on the service that generated it, and nobody else can change it or switch it off.

## Changing what your site says

Everything on the site comes from one file: **[`data/portfolio.js`](data/portfolio.js)**.

The quickest way to edit it, no tools required:

1. Open `data/portfolio.js` here on GitHub.
2. Click the pencil icon in the top right.
3. Make your change.
4. Scroll down and press **Commit changes**.

Your live site rebuilds itself and shows the change about a minute later.

If you would rather work locally:

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Edit the file, save, and the page updates as you type.

## What goes where

| In the file | On the site |
| --- | --- |
| `name`, `role`, `bio`, `email` | The header |
| `links` | Your GitHub, LinkedIn and website |
| `sectionOrder` | The order sections appear in, top to bottom |
| `experience` | Your roles, newest first |
| `projects` | Your work |
| `education`, `achievements`, `skills`, `codingProfiles` | The remaining sections |

A few things worth knowing:

- Text goes inside `"quotes"`, and every item in a list ends with a comma.
- To hide a section entirely, leave its list empty: `projects: [],`
- Rearranging the lines in `sectionOrder` rearranges the page.
- Nothing is ever lost. GitHub keeps every previous version of the file under the **History** button, so a bad edit is always one click from being undone.

## Deploying

The site is a standard [Next.js](https://nextjs.org) app with no database, no API keys and no environment variables. It runs anywhere that runs Next.js: Vercel, Netlify, Cloudflare, or your own server.

If it is already connected to Vercel, every commit you make deploys automatically and there is nothing further to do.

## Using your own domain

Add the domain in your host's dashboard and point your DNS at it. On Vercel that is **Project Settings, Domains**. The site does not care what address it is served from.

## Building it yourself

```bash
npm install
npm run build
npm run start
```
