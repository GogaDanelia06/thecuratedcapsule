import { BuyLink } from "@/components/buy-link";
import { SiteImage } from "@/components/site-image";
import { getHomepage, getProductsById } from "@/content/catalog";
import { formatPrice, pluralize, spellCount } from "@/lib/format";
import styles from "./shop-the-look.module.css";

export async function ShopTheLook() {
  const { look } = await getHomepage();
  const products = await getProductsById(look.pieces.map((piece) => piece.productId));
  const notes = new Map(look.pieces.map((piece) => [piece.productId, piece.note]));
  const pieces = products.map((product) => ({ product, note: notes.get(product.id) ?? "" }));
  if (!look.photo && pieces.length === 0) return null;
  const total = pieces.reduce((sum, { product }) => sum + product.price, 0);

  return (
    <section id="shop-the-look" aria-labelledby="shop-the-look-title" className={styles.section}>
      <figure className={styles.figure}>
        <div className={styles.photo}>
          <SiteImage
            src={look.photo}
            alt={look.photoAlt}
            sizes="(min-width: 1640px) 780px, (min-width: 720px) 50vw, 100vw"
            className={styles.image}
          />
        </div>
        {look.caption && <figcaption className={styles.caption}>{look.caption}</figcaption>}
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
                <SiteImage
                  src={product.photo}
                  alt={product.photo_alt}
                  sizes="78px"
                  className={styles.thumbnailImage}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.note}>{[product.brand, note].filter(Boolean).join(" · ")}</p>
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
