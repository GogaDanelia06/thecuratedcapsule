import Image from "next/image";
import { BuyLink } from "@/components/buy-link";
import { lookOfTheWeek } from "@/content/front-page";
import { getProduct } from "@/content/products";
import { formatPrice, pluralize, spellCount } from "@/lib/format";
import styles from "./shop-the-look.module.css";

export function ShopTheLook() {
  const pieces = lookOfTheWeek.pieces.map((piece) => ({
    note: piece.note,
    product: getProduct(piece.productId),
  }));
  const total = pieces.reduce((sum, { product }) => sum + product.price, 0);

  return (
    <section id="shop-the-look" aria-labelledby="shop-the-look-title" className={styles.section}>
      <figure className={styles.figure}>
        <div className={styles.photo}>
          <Image
            src={lookOfTheWeek.photo.src}
            alt={lookOfTheWeek.photo.alt}
            fill
            placeholder="blur"
            sizes="(min-width: 1640px) 780px, (min-width: 720px) 50vw, 100vw"
            className={styles.image}
          />
        </div>
        <figcaption className={styles.caption}>{lookOfTheWeek.caption}</figcaption>
      </figure>

      <div className={styles.details}>
        <h2 id="shop-the-look-title" className={styles.title}>
          Shop the look
        </h2>
        <p className={styles.summary}>
          {spellCount(pieces.length)} {pluralize(pieces.length, "piece")} · {formatPrice(total)}{" "}
          total
        </p>
        <ul className={styles.pieces}>
          {pieces.map(({ product, note }) => (
            <li key={product.id} className={styles.piece}>
              <div className={styles.thumbnail}>
                <Image
                  src={product.photo.src}
                  alt={product.photo.alt}
                  fill
                  sizes="78px"
                  className={styles.thumbnailImage}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.note}>
                  {product.brand} · {note}
                </p>
              </div>
              <div className={styles.actions}>
                <span className={styles.price}>{formatPrice(product.price)}</span>
                <BuyLink product={product} className={styles.buy} />
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.disclosure}>
          We earn a percentage on each of these. It does not affect what you pay, and we never take
          payment for placement.
        </p>
      </div>
    </section>
  );
}
