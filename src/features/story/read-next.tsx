import Link from "next/link";
import { Prism } from "@/components/prism";
import type { StoryTeaser } from "@/content/stories";
import styles from "./read-next.module.css";

export function ReadNext({ teaser }: { teaser: StoryTeaser }) {
  return (
    <section aria-labelledby="read-next-title" className={styles.section}>
      <Prism faces={teaser.faces} caption={teaser.caption} motion="scroll" />
      <div className={styles.copy}>
        <p className={styles.label}>Read next</p>
        <h2 id="read-next-title" className={styles.title}>
          {teaser.title}
        </h2>
        <p className={styles.summary}>{teaser.summary}</p>
        <Link href="/" className={styles.more}>
          Back to the front
        </Link>
      </div>
    </section>
  );
}
