export const site = {
  name: "The Curated Capsule",
  description:
    "A shoppable fashion magazine tracking what is trending, what holds its value on resale and what just dropped in price.",
  issue: "Issue 14 · September",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
