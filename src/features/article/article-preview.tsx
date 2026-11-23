import type { ArticleDocument, Product } from "@/lib/cms/schema";
import { renderArticle } from "@/lib/cms/render";
import { ArticleHeader } from "./article-header";
import { ArticleBody } from "./article-body";
import { StoryShop } from "@/features/story/story-shop";
import { cx } from "@/lib/cx";
import styles from "@/app/(site)/articles/[slug]/page.module.css";
type ArticlePreviewProps = { document: ArticleDocument; catalog: readonly Product[] };

export function ArticlePreview({ document, catalog }: ArticlePreviewProps) {
  const article = renderArticle({
    ...document,
    title: document.title || "Your article title",
    publishedAt: document.publishedAt || new Date().toISOString().slice(0, 10),
  });
  const products = document.products.flatMap((id) => catalog.find((p) => p.id === id) ?? []);
  return (
    <article>
      <ArticleHeader article={article} />
      <div className={cx(styles.layout, products.length > 0 && styles.withShop)}>
        <ArticleBody content={article.content} />
        {products.length > 0 && <StoryShop products={products} />}
      </div>
    </article>
  );
}
