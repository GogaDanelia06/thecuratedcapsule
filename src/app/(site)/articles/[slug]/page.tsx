import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlePath, getArticle, getArticles } from "@/content/articles";
import { ArticleBody } from "@/features/article/article-body";
import { ArticleHeader } from "@/features/article/article-header";
import { StoryShop } from "@/features/story/story-shop";
import { cx } from "@/lib/cx";
import styles from "./page.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.dek || undefined,
    alternates: { canonical: articlePath(article) },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.dek || undefined,
      publishedTime: article.publishedAt,
      images: article.cover ? [{ url: article.cover, alt: article.coverAlt }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const hasProducts = article.products.length > 0;

  return (
    <article>
      <ArticleHeader article={article} />
      <div className={cx(styles.layout, hasProducts && styles.withShop)}>
        <ArticleBody content={article.content} />
        {hasProducts && <StoryShop productIds={article.products} />}
      </div>
    </article>
  );
}
