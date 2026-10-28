import Link from "next/link";
import { site } from "@/lib/site";
import styles from "./site-header.module.css";

const sections = [
  { label: "Outfits", href: "/#shop-the-look" },
  { label: "The Edit", href: "/#trending" },
  { label: "Runway", href: "/#runway-to-resale" },
  { label: "Articles", href: "/articles" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.masthead}>
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
