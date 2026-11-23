import { z } from "zod";

const imagePath = z
  .string()
  .max(1000)
  .refine(
    (value) =>
      !value ||
      (/^\/(?:images\/articles|media\/articles)\/[a-zA-Z0-9_./ -]+$/.test(value) &&
        !value.includes("..")),
    "Upload an image using the photo button.",
  );
export const articleSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(200),
    slug: z
      .string()
      .min(1, "Add a web address.")
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens for the web address.",
      ),
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
