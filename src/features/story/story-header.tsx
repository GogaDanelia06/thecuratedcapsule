import Link from "next/link";
import { Cover } from "@/components/cover";
import { Headline } from "@/components/headline";
import type { Story } from "@/content/stories";
import { formatDate } from "@/lib/format";
import styles from "./story-header.module.css";

export function StoryHeader({ story }: { story: Story }) {
  return (
    <header>
      <Cover photo={story.cover} variant="story">
        <Link href="/" className={styles.back}>
          ← Back to the front
        </Link>
        <h1 className={styles.title}>
          <Headline text={story.title} emphasis={story.emphasis} />
        </h1>
        <p className={styles.dek}>{story.dek}</p>
        <p className={styles.byline}>
          By {story.author} ·{" "}
          <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time> ·{" "}
          {story.readingTime}
        </p>
      </Cover>
    </header>
  );
}
