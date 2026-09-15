import { BuyLink } from "@/components/buy-link";
import { Section, SectionNote } from "@/components/section";
import { priceDrops } from "@/content/front-page";
import { getProduct } from "@/content/products";
import { formatChange, formatPrice, relativeChange } from "@/lib/format";
import styles from "./price-drops.module.css";

export function PriceDrops() {
  return (
    <Section
      id="price-drops"
      title="Price drops"
      className={styles.section}
      aside={<SectionNote>Tracked across forty retailers</SectionNote>}
    >
      <ul className={styles.list}>
        {priceDrops.map(({ productId, was }) => {
          const product = getProduct(productId);

          return (
            <li key={productId} className={styles.row}>
              <div className={styles.piece}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.brand}>{product.brand}</p>
              </div>
              <p className={styles.was}>
                <span className="sr-only">Was </span>
                <s>{formatPrice(was)}</s>
              </p>
              <p className={styles.now}>
                <span className="sr-only">Now </span>
                {formatPrice(product.price)} · {formatChange(relativeChange(was, product.price))}
              </p>
              <BuyLink product={product} className={styles.buy} />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
