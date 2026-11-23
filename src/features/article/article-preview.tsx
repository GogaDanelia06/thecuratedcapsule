import type { ArticleDocument } from "@/lib/cms/schema";
import { renderArticle } from "@/lib/cms/render";
import { isProductId } from "@/content/products";
import { ArticleHeader } from "./article-header";
import { ArticleBody } from "./article-body";
import { StoryShop } from "@/features/story/story-shop";
import { cx } from "@/lib/cx";
import styles from "@/app/(site)/articles/[slug]/page.module.css";
export function ArticlePreview({ document }: { document: ArticleDocument }) {
  const article = renderArticle({
    ...document,
    title: document.title || "Your article title",
    publishedAt: document.publishedAt || new Date().toISOString().slice(0, 10),
  });
  const products = document.products.filter(isProductId);
  return (
    <article>
      <ArticleHeader article={article} />
      <div className={cx(styles.layout, products.length > 0 && styles.withShop)}>
        <ArticleBody content={article.content} />
        {products.length > 0 && <StoryShop productIds={products} />}
      </div>
    </article>
  );
}
