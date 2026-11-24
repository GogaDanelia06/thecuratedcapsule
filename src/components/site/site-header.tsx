import Link from "next/link";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import styles from "./site-header.module.css";

const sections = [
  { label: "Outfits", href: "/outfits" },
  { label: "The Edit", href: "/articles" },
  { label: "Runway", href: "/runway" },
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
              <NavLink href={section.href} className={styles.link}>
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
