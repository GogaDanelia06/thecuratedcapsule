import Markdoc, { Tag, type Node } from "@markdoc/markdoc";
import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import { pluralize, spellCount } from "@/lib/format";
import { isProductId } from "./products";

const reader = createReader(process.cwd(), config);

export async function getArticles() {
  const entries = await reader.collections.articles.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticle(slug: string) {
  const entry = await reader.collections.articles.read(slug);
  if (!entry) return undefined;

  const { node } = await entry.content();
  // Markdoc wraps the document in its own <article>; the page already has one.
  const tree = Markdoc.transform(node);
  return {
    ...entry,
    slug,
    content: Tag.isTag(tree) ? tree.children : tree,
    readingTime: readingTime(node),
    products: entry.products.filter(isProductId),
  };
}

export function articlePath(article: { slug: string }) {
  return `/articles/${article.slug}` as const;
}

function readingTime(node: Node) {
  let words = 0;
  for (const child of node.walk()) {
    if (child.type === "text") words += String(child.attributes.content).split(/\s+/).length;
  }
  const minutes = Math.max(1, Math.round(words / 220));
  return `${spellCount(minutes)} ${pluralize(minutes, "minute")}`;
}
