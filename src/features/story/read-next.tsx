import Link from "next/link";
import { Prism, type FacePhoto } from "@/components/prism";
import styles from "./read-next.module.css";

type ReadNextProps = {
  teaser: {
    title: string;
    summary: string;
    faces: readonly [FacePhoto, FacePhoto, FacePhoto];
    caption: readonly string[];
    href?: string;
    linkLabel?: string;
  };
};

export function ReadNext({ teaser }: ReadNextProps) {
  return (
    <section aria-labelledby="read-next-title" className={styles.section}>
      <Prism faces={teaser.faces} caption={teaser.caption} motion="scroll" />
      <div className={styles.copy}>
        <p className={styles.label}>Read next</p>
        <h2 id="read-next-title" className={styles.title}>
          {teaser.title}
        </h2>
        <p className={styles.summary}>{teaser.summary}</p>
        <Link href={teaser.href ?? "/"} className={styles.more}>
          {teaser.linkLabel ?? "Back to the front"}
        </Link>
      </div>
    </section>
  );
}
