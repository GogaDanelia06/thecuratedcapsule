import Image from "next/image";
import { newsletterPhoto } from "@/content/front-page";
import { NewsletterForm } from "./newsletter-form";
import styles from "./newsletter.module.css";

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-title" className={styles.newsletter}>
      <Image
        src={newsletterPhoto.src}
        alt=""
        fill
        placeholder="blur"
        sizes="(min-width: 1640px) 1640px, 100vw"
        className={styles.photo}
      />
      <div>
        <h2 id="newsletter-title" className={styles.title}>
          One letter. Friday. Everything that moved.
        </h2>
        <p className={styles.body}>
          Trend ranks, restocks and price drops on the pieces you saved.
        </p>
      </div>
      <NewsletterForm />
    </section>
  );
}
