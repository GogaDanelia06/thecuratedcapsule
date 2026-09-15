import Link from "next/link";
import { Cover } from "@/components/cover";
import { Headline } from "@/components/headline";
import { coverStory, storyPath } from "@/content/stories";
import styles from "./cover-story.module.css";

export function CoverStory() {
  const href = storyPath(coverStory);

  return (
    <section aria-labelledby="cover-story-title">
      <Cover photo={coverStory.cover} variant="front">
        <p className={styles.kicker}>{coverStory.kicker}</p>
        <h1 id="cover-story-title" className={styles.title}>
          <Headline text={coverStory.title} emphasis={coverStory.emphasis} />
        </h1>
        <p className={styles.summary}>{coverStory.summary}</p>
        <div className={styles.actions}>
          <Link href={href} className={styles.primary}>
            Read the story
          </Link>
          <Link href={`${href}#shop-this-story`} className={styles.secondary}>
            Shop six pieces
          </Link>
        </div>
        <p className={styles.byline}>
          Words by {coverStory.author} · {coverStory.readingTime} · affiliate links
        </p>
      </Cover>
    </section>
  );
}
