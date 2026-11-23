import { z } from "zod";

/** Site images: files in public/images or photos uploaded through the admin. */
export const IMAGE_PATH =
  /^\/(?:images\/(?:articles|products|looks|homepage)|media\/articles)\/[a-zA-Z0-9_./ -]+$/;

export function isImagePath(value: unknown): value is string {
  return typeof value === "string" && IMAGE_PATH.test(value) && !value.includes("..");
}

const imagePath = z
  .string()
  .max(1000)
  .refine((value) => !value || isImagePath(value), "Upload an image using the photo button.");

const slug = (label: string) =>
  z
    .string()
    .min(1, `Add a ${label}.`)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `Use lowercase letters, numbers and hyphens for the ${label}.`,
    );

export const articleSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(200),
    slug: slug("web address"),
    emphasis: z.string().max(200),
    kicker: z.string().max(100),
    dek: z.string().max(1000),
    author: z.string().max(150),
    publishedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
      .refine((value) => {
        const date = new Date(`${value}T12:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
      }, "Choose a valid date."),
    cover: imagePath,
    coverAlt: z.string().max(500),
    products: z.array(z.string().max(100)).max(30),
    body: z.string().max(200_000),
  })
  .strict();
export const saveSchema = z
  .object({
    id: z.uuid(),
    revision: z.number().int().min(0),
    action: z.enum(["save", "publish", "unpublish"]),
    document: articleSchema,
  })
  .strict();
export type ArticleDocument = z.infer<typeof articleSchema>;
export type Draft = {
  id: string;
  document: ArticleDocument;
  revision: number;
  published_revision: number | null;
  updated_at: string;
};
export function emptyArticle(): ArticleDocument {
  return {
    title: "",
    slug: "",
    emphasis: "",
    kicker: "",
    dek: "",
    author: "The Curated Capsule",
    publishedAt: new Date().toISOString().slice(0, 10),
    cover: "",
    coverAlt: "",
    products: [],
    body: "",
  };
}

export const productSchema = z
  .object({
    id: slug("product code").max(80),
    name: z.string().trim().min(1, "Add the product name.").max(200),
    brand: z.string().trim().max(120),
    price: z.number().int("Use a whole number for the price.").min(0).max(1_000_000),
    photo: imagePath,
    photo_alt: z.string().max(500),
    url: z
      .string()
      .trim()
      .max(2000)
      .regex(/^https?:\/\//i, "The shop link must start with https://"),
  })
  .strict();

export type Product = z.infer<typeof productSchema>;

const facePhoto = z.object({ src: imagePath, alt: z.string().max(500) }).strict();

/** The "Behind the story" section: a spinning box of three photos beside a short text. */
export const behindTheStorySchema = z
  .object({
    label: z.string().max(60),
    title: z.string().trim().min(1, "Add a title for Behind the story.").max(160),
    body: z.string().max(600),
    caption: z.string().max(60),
    link: z.string().max(180),
    photos: z.tuple([facePhoto, facePhoto, facePhoto]),
  })
  .strict();

export type BehindTheStory = z.infer<typeof behindTheStorySchema>;

export const defaultBehindTheStory: BehindTheStory = {
  label: "Behind the story",
  title: "A season that agreed with itself",
  body: "Four cities, one finish. When the mills get there first, the runway follows — and the resale market tells you which pieces people actually wanted to wear on a Tuesday.",
  caption: "Look 12,\nfive pieces",
  link: "",
  photos: [
    {
      src: "/images/homepage/behind-front.jpg",
      alt: "Model in a grey tailored coat and cropped top photographed from below",
    },
    {
      src: "/images/homepage/behind-side.jpg",
      alt: "Model in a burgundy blazer and black leather gloves seated inside a glass box",
    },
    {
      src: "/images/homepage/behind-back.jpg",
      alt: "Portrait of a man in a red football shirt",
    },
  ],
};

const lookPiece = z.object({ productId: z.string().max(80), note: z.string().max(120) }).strict();

export const homepageSchema = z
  .object({
    coverArticle: z.string().max(180),
    /** Article web addresses in the order The Edit shows them; set by hand in the admin. */
    editOrder: z.array(z.string().max(180)).max(500).default([]),
    behindTheStory: behindTheStorySchema.default(defaultBehindTheStory),
    look: z
      .object({
        photo: imagePath,
        photoAlt: z.string().max(500),
        caption: z.string().max(200),
        pieces: z.array(lookPiece).max(12, "A look can have up to 12 pieces."),
        /** Pieces taken out of the look but kept, with their notes, to put back later. */
        setAside: z.array(lookPiece).max(50).default([]),
      })
      .strict(),
  })
  .strict();

export type Homepage = z.infer<typeof homepageSchema>;

export const emptyHomepage: Homepage = {
  coverArticle: "",
  editOrder: [],
  behindTheStory: defaultBehindTheStory,
  look: { photo: "", photoAlt: "", caption: "", pieces: [], setAside: [] },
};

/**
 * Puts articles in the hand-picked order. Articles not in the list yet (newly
 * published) come first, newest date first, so a new story is always visible.
 */
export function orderArticles<T extends { slug: string; publishedAt: string }>(
  articles: readonly T[],
  editOrder: readonly string[],
): T[] {
  const position = new Map(editOrder.map((slug, index) => [slug, index]));
  const unplaced = articles
    .filter((article) => !position.has(article.slug))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const placed = articles
    .filter((article) => position.has(article.slug))
    .sort((a, b) => position.get(a.slug)! - position.get(b.slug)!);
  return [...unplaced, ...placed];
}
