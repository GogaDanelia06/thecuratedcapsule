import "server-only";
import { cache } from "react";
import { databaseConfigured } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/server";
import { articleSchema, orderArticles } from "@/lib/cms/schema";
import { renderArticle } from "@/lib/cms/render";
import { getHomepage, getProductsById } from "./catalog";

const summarySchema = articleSchema.pick({
  slug: true,
  title: true,
  emphasis: true,
  kicker: true,
  dek: true,
  publishedAt: true,
  cover: true,
  coverAlt: true,
});

export type ArticleSummary = ReturnType<typeof summarySchema.parse>;

// Lists only need the card fields; leaving the body out keeps each cached
// response small however many articles are published.
const summaryColumns = [
  "slug",
  ...Object.keys(summarySchema.shape)
    .filter((key) => key !== "slug")
    .map((key) => `${key}:document->>${key}`),
].join(",");

/** Published articles in the order chosen on the Homepage tab. */
export const getArticles = cache(async (): Promise<ArticleSummary[]> => {
  if (!databaseConfigured()) return [];
  const { data, error } = await publicClient()
    .from("articles")
    .select(summaryColumns)
    .order("published_at", { ascending: false });
  if (error) throw new Error("Published articles could not be loaded.", { cause: error });
  const { editOrder } = await getHomepage();
  return orderArticles(
    data.map((row) => summarySchema.parse(row)),
    editOrder,
  );
});

export const getArticle = cache(async (slug: string) => {
  if (!databaseConfigured()) return undefined;
  const { data, error } = await publicClient()
    .from("articles")
    .select("document")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("This article could not be loaded.", { cause: error });
  if (!data) return undefined;
  const document = articleSchema.parse(data.document);
  return { ...renderArticle(document), products: await getProductsById(document.products) };
});

export function articlePath(article: { slug: string }) {
  return `/articles/${article.slug}` as const;
}
