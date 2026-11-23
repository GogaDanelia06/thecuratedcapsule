# The Curated Capsule

A shoppable fashion magazine built with Next.js 16 (App Router), React 19 and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the development server (Turbopack) |
| `npm run build`     | Create a production build                |
| `npm run start`     | Serve the production build               |
| `npm run lint`      | Lint with ESLint                         |
| `npm run typecheck` | Generate route types and run `tsc`       |
| `npm run format`    | Format with Prettier                     |

## Environment

Copy `.env.example` to `.env.local`.

| Variable                 | Purpose                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Absolute origin for canonical URLs and Open Graph images. Falls back to the Vercel production domain, then `http://localhost:3000` |
| `NEWSLETTER_WEBHOOK_URL` | Optional endpoint that receives `{ email }` when a reader subscribes                                                               |

## Owner article editor

Articles are written and published at `/admin` and stored in a Supabase database
(articles, photos and editor logins). Published changes appear on the site immediately,
with no redeploy. Products remain managed in code.

### One-time setup

1. Create a Supabase project. In **Authentication → Sign In / Providers**, turn off
   **Allow new users to sign up**.
2. Copy the project URL and the **publishable** key from **Project Settings → API Keys**
   into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, in
   `.env.local` and in the Vercel project's environment variables. Never use the secret key.
3. In the Supabase **SQL editor**, run `supabase/migrations/202611230001_article_cms.sql`,
   then `supabase/seed.sql` (imports the articles from `src/content/articles`).
4. Add each editor in **Authentication → Users → Add user** (tick **Auto Confirm User**),
   then run `supabase/add-editor.sql` with their email.

Without the database variables the site still shows the articles in `src/content/articles`,
and `/admin` explains that setup is unfinished. Regenerate the seed after editing those
files with `node scripts/articles-to-sql.mjs`.

### Writing

Editors sign in at `/admin/login`. Drafts are private; **Preview** shows unsaved changes
on the real article layout, and **Publish** makes the current version public. Editing a
published article keeps readers on the last published version until it is published again.
Uploaded photos are converted to WebP and stay private until an article using them is published.

## Structure

```
src/
├── app/            Routes, root layout, metadata and global tokens
├── assets/photos/  Editorial photography, imported statically for next/image
├── components/     Shared presentational components (cover, prism, ticker, section, site chrome)
├── content/        Typed editorial data: products, stories, front page, resale records
├── features/
│   ├── capsule/    Saved pieces: localStorage-backed store, save toggle, drawer dialog
│   ├── front-page/ Front page sections
│   ├── newsletter/ Signup form and server action
│   └── story/      Article header, body blocks, shop aside, read next
├── lib/            Formatting, class name and site configuration helpers
└── styles/         Shared CSS Modules composed by feature styles
```

## Notes

- Styling uses CSS Modules with design tokens defined in `src/app/globals.css`; shared type, control and motion styles are reused through `composes`.
- Saved pieces persist per browser in `localStorage` and stay in sync across tabs.
- Retailer URLs in `src/content/products.ts` use reserved `.example` domains and need replacing with real affiliate links.
- Photography is from Unsplash and used for layout purposes.
