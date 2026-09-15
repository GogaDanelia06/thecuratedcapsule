import Image from "next/image";
import type { StoryBlock } from "@/content/stories";
import styles from "./story-body.module.css";

export function StoryBody({ blocks }: { blocks: readonly StoryBlock[] }) {
  return (
    <div className={styles.body}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index} className={styles.paragraph}>
                {block.text}
              </p>
            );
          case "figure":
            return (
              <figure key={index} className={styles.figure}>
                <div className={styles.frame}>
                  <Image
                    src={block.photo.src}
                    alt={block.photo.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1100px) 760px, 100vw"
                    className={styles.image}
                  />
                </div>
                <figcaption className={styles.caption}>{block.caption}</figcaption>
              </figure>
            );
          case "quote":
            return (
              <blockquote key={index} className={styles.quote}>
                <p>{block.text}</p>
              </blockquote>
            );
        }
      })}
    </div>
  );
}
