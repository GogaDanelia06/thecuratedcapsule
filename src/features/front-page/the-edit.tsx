import Image from "next/image";
import Link from "next/link";
import { Section, SectionNote } from "@/components/section";
import { theEdit } from "@/content/front-page";
import { coverStory, storyPath } from "@/content/stories";
import { pluralize, spellCount } from "@/lib/format";
import styles from "./the-edit.module.css";

export function TheEdit() {
  return (
    <Section
      id="the-edit"
      title="The edit"
      aside={
        <SectionNote>
          This week · {spellCount(theEdit.length)} {pluralize(theEdit.length, "read")}
        </SectionNote>
      }
    >
      <ul className={styles.grid}>
        {theEdit.map((teaser) => (
          <li key={teaser.title} className={styles.teaser}>
            <div className={styles.media}>
              <Image
                src={teaser.photo.src}
                alt={teaser.photo.alt}
                fill
                placeholder="blur"
                sizes="(min-width: 1100px) 25vw, (min-width: 560px) 50vw, 100vw"
                className={styles.image}
              />
            </div>
            <p className={styles.kicker}>{teaser.kicker}</p>
            <h3 className={styles.title}>
              <Link href={storyPath(coverStory)} className={styles.link}>
                {teaser.title}
              </Link>
            </h3>
          </li>
        ))}
      </ul>
    </Section>
  );
}
