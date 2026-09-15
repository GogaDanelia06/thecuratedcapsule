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

| Variable                 | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Absolute origin used for canonical URLs and Open Graph images        |
| `NEWSLETTER_WEBHOOK_URL` | Optional endpoint that receives `{ email }` when a reader subscribes |

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
