import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./site-shell.module.css";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#content" className={styles.skipLink}>
        Skip to content
      </a>
      <div className={styles.page}>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
