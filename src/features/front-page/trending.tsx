import Image from "next/image";
import Link from "next/link";
import { Section, SectionNote } from "@/components/section";
import { articlePath, getArticles } from "@/content/articles";
import { formatDate, pluralize, spellCount } from "@/lib/format";
import styles from "./trending.module.css";

/** The Edit: every published article, newest first, four across and scrolling beyond that. */
export async function Trending() {
  const articles = await getArticles();
  if (articles.length === 0) return null;

  return (
    <Section
      id="trending"
      title="The Edit"
      aside={
        <SectionNote>
          Latest · {spellCount(articles.length)} {pluralize(articles.length, "story", "stories")}
          {articles.length > 4 && " · scroll for more →"}
        </SectionNote>
      }
    >
      <ol className={styles.rail} tabIndex={0} aria-label="Articles">
        {articles.map((article, index) => (
          <li key={article.slug} className={styles.card}>
            <div className={styles.media}>
              {article.cover ? (
                <Image
                  src={article.cover}
                  unoptimized={article.cover.startsWith("/media/articles/")}
                  alt={article.coverAlt}
                  fill
                  sizes="(min-width: 1100px) 25vw, (min-width: 560px) 45vw, 80vw"
                  className={styles.image}
                />
              ) : (
                <span className={styles.placeholder} aria-hidden="true">
                  {article.title}
                </span>
              )}
            </div>
            <p className={styles.meta}>
              <span>
                {String(index + 1).padStart(2, "0")}
                {article.kicker && ` · ${article.kicker}`}
              </span>
            </p>
            <h3 className={styles.title}>
              <Link href={articlePath(article)} className={styles.link}>
                {article.title}
              </Link>
            </h3>
            {article.dek && <p className={styles.blurb}>{article.dek}</p>}
            <div className={styles.footer}>
              <span className={styles.read}>Read the article</span>
              <time dateTime={article.publishedAt} className={styles.date}>
                {formatDate(article.publishedAt)}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
