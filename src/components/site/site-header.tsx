import Link from "next/link";
import { coverStory, storyPath } from "@/content/stories";
import { Capsule } from "@/features/capsule/capsule";
import { site } from "@/lib/site";
import styles from "./site-header.module.css";

const sections = [
  { label: "Trending", href: "/#trending" },
  { label: "Cover story", href: storyPath(coverStory) },
  { label: "Shop the look", href: "/#shop-the-look" },
  { label: "The edit", href: "/#the-edit" },
  { label: "Price drops", href: "/#price-drops" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.masthead}>
        <p className={styles.issue}>{site.issue}</p>
        <Link href="/" className={styles.wordmark}>
          {site.name}
        </Link>
        <div className={styles.utilities}>
          <p className={styles.disclosure}>Shoppable · we earn a commission</p>
          <Capsule />
        </div>
      </div>
      <nav aria-label="Sections" className={styles.nav}>
        <ul className={styles.links}>
          {sections.map((section) => (
            <li key={section.label}>
              <Link href={section.href} className={styles.link}>
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
