import Image from "next/image";
import Link from "next/link";
import { Section, SectionNote } from "@/components/section";
import { trending } from "@/content/front-page";
import { getProduct } from "@/content/products";
import { coverStory, storyPath } from "@/content/stories";
import { formatChange, formatPrice } from "@/lib/format";
import styles from "./trending.module.css";

export function Trending() {
  return (
    <Section
      id="trending"
      title="The Edit"
      aside={<SectionNote>Ranked by saves · updated hourly</SectionNote>}
    >
      <ol className={styles.grid}>
        {trending.map((pick, index) => {
          const product = getProduct(pick.productId);

          return (
            <li key={pick.productId} className={styles.card}>
              <div className={styles.media}>
                <Image
                  src={product.photo.src}
                  alt={product.photo.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1100px) 25vw, (min-width: 560px) 50vw, 100vw"
                  className={styles.image}
                />
              </div>
              <p className={styles.meta}>
                <span>
                  {String(index + 1).padStart(2, "0")} · {pick.category}
                </span>
                <span className={styles.growth}>
                  {formatChange(pick.savesGrowth)}
                  <span className="sr-only"> in saves</span>
                </span>
              </p>
              <h3 className={styles.title}>
                <Link href={storyPath(coverStory)} className={styles.link}>
                  {pick.title}
                </Link>
              </h3>
              <p className={styles.blurb}>{pick.blurb}</p>
              <div className={styles.footer}>
                <span className={styles.price}>{formatPrice(product.price)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
