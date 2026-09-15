import Link from "next/link";
import { Prism } from "@/components/prism";
import { behindTheStory } from "@/content/front-page";
import { coverStory, storyPath } from "@/content/stories";
import styles from "./behind-the-story.module.css";

export function BehindTheStory() {
  return (
    <section aria-labelledby="behind-the-story-title" className={styles.section}>
      <Prism faces={behindTheStory.faces} caption={behindTheStory.caption} motion="spin" />
      <div className={styles.copy}>
        <p className={styles.label}>{behindTheStory.label}</p>
        <h2 id="behind-the-story-title" className={styles.title}>
          {behindTheStory.title}
        </h2>
        <p className={styles.body}>{behindTheStory.body}</p>
        <Link href={storyPath(coverStory)} className={styles.more}>
          Continue reading
        </Link>
      </div>
    </section>
  );
}
