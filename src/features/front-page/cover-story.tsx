import Link from "next/link";
import { Cover } from "@/components/cover";
import { Headline } from "@/components/headline";
import { articlePath, getArticle, getArticles } from "@/content/articles";
import { getHomepage } from "@/content/catalog";
import { photos } from "@/content/photos";
import { pluralize, spellCount } from "@/lib/format";
import styles from "./cover-story.module.css";

/** The homepage hero: the article chosen as cover story in the admin, or the newest one. */
export async function CoverStory() {
  const { coverArticle } = await getHomepage();
  const slug = coverArticle || (await getArticles())[0]?.slug;
  const article = slug ? await getArticle(slug) : undefined;
  if (!article) return null;

  const href = articlePath(article);
  const count = article.products.length;

  return (
    <section aria-labelledby="cover-story-title">
      <Cover
        photo={article.cover ? { src: article.cover, alt: article.coverAlt } : photos.silhouette}
        variant="front"
      >
        <p className={styles.kicker}>{article.kicker || "The cover story"}</p>
        <h1 id="cover-story-title" className={styles.title}>
          <Headline text={article.title} emphasis={article.emphasis || undefined} />
        </h1>
        {article.dek && <p className={styles.summary}>{article.dek}</p>}
        <div className={styles.actions}>
          <Link href={href} className={styles.primary}>
            Read the story
          </Link>
          {count > 0 && (
            <Link href={`${href}#shop-this-story`} className={styles.secondary}>
              Shop {spellCount(count)} {pluralize(count, "piece")}
            </Link>
          )}
        </div>
        <p className={styles.byline}>
          {article.author && <>Words by {article.author} · </>}
          {article.readingTime}
          {count > 0 && " · affiliate links"}
        </p>
      </Cover>
    </section>
  );
}
