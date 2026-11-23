import Link from "next/link";
import { Prism } from "@/components/prism";
import { getArticles } from "@/content/articles";
import { getHomepage } from "@/content/catalog";
import { behindTheStory } from "@/content/front-page";
import styles from "./behind-the-story.module.css";

export async function BehindTheStory() {
  // The newest article's cover leads the spinning prism.
  const [latest] = await getArticles();
  const { coverArticle } = await getHomepage();
  const storySlug = coverArticle || latest?.slug;
  const [front, right, back] = behindTheStory.faces;
  const faces = [
    latest?.cover ? { src: latest.cover, alt: latest.coverAlt } : front,
    right,
    back,
  ] as const;

  return (
    <section aria-labelledby="behind-the-story-title" className={styles.section}>
      <Prism faces={faces} caption={behindTheStory.caption} motion="spin" />
      <div className={styles.copy}>
        <p className={styles.label}>{behindTheStory.label}</p>
        <h2 id="behind-the-story-title" className={styles.title}>
          {behindTheStory.title}
        </h2>
        <p className={styles.body}>{behindTheStory.body}</p>
        <Link href={storySlug ? `/articles/${storySlug}` : "/articles"} className={styles.more}>
          Continue reading
        </Link>
      </div>
    </section>
  );
}
