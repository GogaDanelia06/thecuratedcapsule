import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <p className={styles.label}>Error 404</p>
      <h1 className={styles.title}>This piece sold out</h1>
      <p className={styles.body}>The page you were looking for has moved or never existed.</p>
      <Link href="/" className={styles.more}>
        Back to the front
      </Link>
    </section>
  );
}
