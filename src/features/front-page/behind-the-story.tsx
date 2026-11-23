import Link from "next/link";
import { Prism } from "@/components/prism";
import { getArticles } from "@/content/articles";
import { getHomepage } from "@/content/catalog";
import styles from "./behind-the-story.module.css";

/** The spinning photo box and short text, edited on the admin's Homepage tab. */
export async function BehindTheStory() {
  const { behindTheStory, coverArticle } = await getHomepage();
  const { label, title, body, caption, link, photos } = behindTheStory;
  // "Continue reading" goes to the chosen article, else the cover story, else the newest.
  const slug = link || coverArticle || (await getArticles())[0]?.slug;

  return (
    <section aria-labelledby="behind-the-story-title" className={styles.section}>
      <Prism faces={photos} caption={caption.split("\n")} motion="spin" />
      <div className={styles.copy}>
        {label && <p className={styles.label}>{label}</p>}
        <h2 id="behind-the-story-title" className={styles.title}>
          {title}
        </h2>
        {body && <p className={styles.body}>{body}</p>}
        <Link href={slug ? `/articles/${slug}` : "/articles"} className={styles.more}>
          Continue reading
        </Link>
      </div>
    </section>
  );
}
