import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Runway",
  alternates: { canonical: "/runway" },
};

export default function RunwayPage() {
  return (
    <section className={styles.soon}>
      <p className={styles.label}>Runway</p>
      <h1 className={styles.title}>Coming soon</h1>
      <p className={styles.body}>
        From the runway to resale: the shows, and the pieces people actually kept wearing.
      </p>
      <Link href="/articles" className={styles.more}>
        Read The Edit meanwhile
      </Link>
    </section>
  );
}
