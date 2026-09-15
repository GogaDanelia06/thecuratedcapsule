function resolveSiteUrl() {
  const origin = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]
    .map((value) => value?.trim())
    .find(Boolean);

  if (!origin) return new URL("http://localhost:3000");

  const href = /^https?:\/\//i.test(origin) ? origin : `https://${origin}`;

  if (!URL.canParse(href)) {
    throw new Error(
      `Invalid site URL "${origin}". Set NEXT_PUBLIC_SITE_URL to an absolute URL such as https://thecuratedcapsule.com.`,
    );
  }

  return new URL(href);
}

export const site = {
  name: "The Curated Capsule",
  description:
    "A shoppable fashion magazine tracking what is trending, what holds its value on resale and what just dropped in price.",
  issue: "Issue 14 · September",
  url: resolveSiteUrl(),
} as const;
