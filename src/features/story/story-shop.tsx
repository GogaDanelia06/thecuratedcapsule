import { BuyLink } from "@/components/buy-link";
import { SiteImage } from "@/components/site-image";
import type { Product } from "@/lib/cms/schema";
import { formatPrice } from "@/lib/format";
import styles from "./story-shop.module.css";

export function StoryShop({ products }: { products: readonly Product[] }) {
  return (
    <aside id="shop-this-story" aria-labelledby="shop-this-story-title" className={styles.shop}>
      <h2 id="shop-this-story-title" className={styles.heading}>
        Shop this story
      </h2>
      <ul className={styles.products}>
        {products.map((product) => (
          <li key={product.id} className={styles.product}>
            <div className={styles.media}>
              <SiteImage
                src={product.photo}
                alt={product.photo_alt}
                sizes="330px"
                className={styles.image}
              />
            </div>
            <h3 className={styles.name}>{product.name}</h3>
            <p className={styles.meta}>
              {product.brand} · {formatPrice(product.price)}
            </p>
            <BuyLink product={product} className={styles.buy}>
              Buy at {product.brand}
            </BuyLink>
          </li>
        ))}
      </ul>
      <p className={styles.disclosure}>
        We earn a commission on these links. Your price is unchanged.
      </p>
    </aside>
  );
}
