import { photos, type Photo } from "./photos";
import type { ProductId } from "./products";

export type StoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "figure"; photo: Photo; caption: string }
  | { type: "quote"; text: string };

export type StoryTeaser = {
  title: string;
  summary: string;
  faces: readonly [Photo, Photo, Photo];
  caption: readonly string[];
};

export type Story = {
  slug: string;
  kicker: string;
  title: string;
  emphasis?: string;
  summary: string;
  dek: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  cover: Photo;
  body: readonly StoryBlock[];
  products: readonly ProductId[];
  readNext: StoryTeaser;
};

export const coverStory: Story = {
  slug: "liquid-metal-is-wearing-off-on-everyone",
  kicker: "The cover story",
  title: "Liquid metal is wearing off on everyone",
  emphasis: "everyone",
  summary:
    "Nine houses sent chrome down the runway this season, and resale moved inside a week. We tracked what sold, what it costs now, and the six pieces worth the money.",
  dek: "Nine houses sent chrome down the runway. One week later, resale prices told us which pieces people actually wanted.",
  author: "the Curated Capsule desk",
  publishedAt: "2026-09-12",
  readingTime: "six minutes",
  cover: photos.silhouette,
  body: [
    {
      type: "paragraph",
      text: "Chrome arrived all at once. Nine collections, four cities, the same treatment: coated leather, foiled jersey, hardware finished to a mirror. That kind of consensus usually means a fabric mill got there first, and this season it was two of them.",
    },
    {
      type: "paragraph",
      text: "What interested us was not the runway but the week after. Resale listings for coated outerwear rose 412% in saves, and the pieces that moved fastest were the plainest ones — a single-breasted blazer, an unlined trench, a cuff. The heavily embellished looks sat.",
    },
    {
      type: "figure",
      photo: photos.windswept,
      caption: "Backstage, look 12 — the silhouette that resold fastest",
    },
    {
      type: "quote",
      text: "The pieces people bought were the ones they could wear on a Tuesday.",
    },
    {
      type: "paragraph",
      text: "Price is doing the sorting. Below about $400 the finish reads as a material choice; above it, as a costume. The blazer sold through three colourways at $385 while the same silhouette in embossed calf, at $1,100, is still in stock everywhere we checked.",
    },
    {
      type: "paragraph",
      text: "If you buy one thing, buy the outerwear. Coated surfaces hold their value because they cannot be washed and therefore cannot be worn badly — resale condition stays high. Jersey in the same finish degrades in a season.",
    },
    {
      type: "paragraph",
      text: "The cuff is the cheap entry and the one we would skip. It photographs well and costs about $11 to produce, which is a separate story we are working on.",
    },
  ],
  products: ["blazer", "trench"],
  readNext: {
    title: "Six pieces that held their value",
    summary:
      "We priced every look from the spring shows against today's resale listings. Six held, the rest lost a third.",
    faces: [photos.redSky, photos.satinSlip, photos.graphicDuo],
    caption: ["Keep", "scrolling"],
  },
};

export const stories: readonly Story[] = [coverStory];

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}

export function storyPath(story: Pick<Story, "slug">) {
  return `/stories/${story.slug}` as const;
}
