# The Curated Capsule

A shoppable fashion magazine built with Next.js 16 (App Router), React 19 and TypeScript.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the development server (Turbopack) |
| `pnpm build`     | Create a production build                |
| `pnpm start`     | Serve the production build               |
| `pnpm lint`      | Lint with ESLint                         |
| `pnpm typecheck` | Generate route types and run `tsc`       |
| `pnpm format`    | Format with Prettier                     |

## Environment

Copy `.env.example` to `.env.local`.

| Variable                 | Purpose                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Absolute origin for canonical URLs and Open Graph images. Falls back to the Vercel production domain, then `http://localhost:3000` |
| `NEWSLETTER_WEBHOOK_URL` | Optional endpoint that receives `{ email }` when a reader subscribes                                                               |

## Owner article editor

Articles, products and the homepage (cover story and Shop the look) are managed at
`/admin` and stored in a Supabase database, together with photos and editor logins. Published changes appear on the site immediately,
with no redeploy.

### One-time setup

1. Create a Supabase project. In **Authentication → Sign In / Providers**, turn off
   **Allow new users to sign up**.
2. Copy the project URL and the **publishable** key from **Project Settings → API Keys**
   into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, in
   `.env.local` and in the Vercel project's environment variables. Never use the secret key.
3. In the Supabase **SQL editor**, run these files in order:
   `supabase/migrations/202611230001_article_cms.sql`, `supabase/seed.sql`,
   `supabase/migrations/202611230002_delete_article.sql`,
   `supabase/migrations/202611230003_products_and_homepage.sql` and
   `supabase/seed-products-and-homepage.sql`. The site build reads products from the
   database, so run them before deploying.
4. Add each editor in **Authentication → Users → Add user** (tick **Auto Confirm User**),
   then run `supabase/add-editor.sql` with their email.

Without the database variables the site builds and runs with no articles, and `/admin`
explains that setup is unfinished.

### Scale

Public pages are cached (incremental static regeneration): readers get pages from Vercel's
network, and the database is only queried when an article is published or unpublished, or
at most once a minute, so changes made directly in Supabase appear on their own. Published photos are served with a one-year cache. Only the
signed-in editor talks to the database directly.

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
├── content/        Typed editorial data: products, stories, front page, published articles
├── features/
│   ├── admin/      Article studio: editor, toolbar, details, preview, publish dialog
│   ├── article/    Public article header, body and preview
│   ├── front-page/ Front page sections
│   ├── newsletter/ Signup form and server action
│   └── story/      Article header, body blocks, shop aside, read next
├── lib/            Helpers; cms/ (article schema, rendering) and supabase/ (database clients)
└── styles/         Shared CSS Modules composed by feature styles
```

## Notes

- Styling uses CSS Modules with design tokens defined in `src/app/globals.css`; shared type, control and motion styles are reused through `composes`.
- Retailer URLs in `src/content/products.ts` use reserved `.example` domains and need replacing with real affiliate links.
- Photography is from Unsplash and used for layout purposes.
