import Link from "next/link";
import { site } from "@/lib/site";
import styles from "./site-header.module.css";

const sections = [
  { label: "Outfits", href: "/#shop-the-look" },
  { label: "The Edit", href: "/#the-edit" },
  { label: "Runway", href: "/#runway-to-resale" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.masthead}>
        <p className={styles.issue}>{site.issue}</p>
        <Link href="/" className={styles.wordmark}>
          {site.name}
        </Link>
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
