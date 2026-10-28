import Link from "next/link";
import { Cover } from "@/components/cover";
import { formatDate } from "@/lib/format";
import styles from "./article-header.module.css";

type ArticleHeaderProps = {
  article: {
    kicker: string;
    title: string;
    dek: string;
    author: string;
    publishedAt: string;
    readingTime: string;
    cover: string | null;
    coverAlt: string;
  };
};

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const content = (
    <>
      <Link href="/articles" className={styles.back}>
        ← All articles
      </Link>
      {article.kicker && <p className={styles.kicker}>{article.kicker}</p>}
      <h1 className={styles.title}>{article.title}</h1>
      {article.dek && <p className={styles.dek}>{article.dek}</p>}
      <p className={styles.byline}>
        {article.author && <>By {article.author} · </>}
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> ·{" "}
        {article.readingTime}
      </p>
    </>
  );

  return (
    <header>
      {article.cover ? (
        <Cover photo={{ src: article.cover, alt: article.coverAlt }} variant="story">
          {content}
        </Cover>
      ) : (
        <div className={styles.plain}>{content}</div>
      )}
    </header>
  );
}
