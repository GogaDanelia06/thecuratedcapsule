import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section, SectionNote } from "@/components/section";
import { articlePath, getArticles } from "@/content/articles";
import { formatDate, pluralize, spellCount } from "@/lib/format";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Articles",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <Section
      id="articles"
      title="Articles"
      aside={
        <SectionNote>
          {spellCount(articles.length)} {pluralize(articles.length, "read")}
        </SectionNote>
      }
      className={styles.section}
    >
      <ul className={styles.grid}>
        {articles.map((article) => (
          <li key={article.slug} className={styles.card}>
            <div className={styles.media}>
              {article.cover ? (
                <Image
                  src={article.cover}
                  alt={article.coverAlt}
                  fill
                  sizes="(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={styles.image}
                />
              ) : (
                <span className={styles.placeholder} aria-hidden="true">
                  {article.title}
                </span>
              )}
            </div>
            {article.kicker && <p className={styles.kicker}>{article.kicker}</p>}
            <h2 className={styles.title}>
              <Link href={articlePath(article)} className={styles.link}>
                {article.title}
              </Link>
            </h2>
            {article.dek && <p className={styles.dek}>{article.dek}</p>}
            <p className={styles.date}>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
