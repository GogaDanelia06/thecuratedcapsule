import { site } from "@/lib/site";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.wordmark}>{site.name}</p>
      <p className={styles.disclosure}>
        The Curated Capsule participates in retailer affiliate programmes and earns a percentage of
        qualifying purchases made through links on this site. Editorial picks are chosen
        independently; placement is never sold. Photography from Unsplash, for layout purposes.
      </p>
    </footer>
  );
}
