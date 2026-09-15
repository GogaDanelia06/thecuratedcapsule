import Image from "next/image";
import { BuyLink } from "@/components/buy-link";
import { getProduct, type ProductId } from "@/content/products";
import { formatPrice } from "@/lib/format";
import styles from "./story-shop.module.css";

export function StoryShop({ productIds }: { productIds: readonly ProductId[] }) {
  return (
    <aside id="shop-this-story" aria-labelledby="shop-this-story-title" className={styles.shop}>
      <h2 id="shop-this-story-title" className={styles.heading}>
        Shop this story
      </h2>
      <ul className={styles.products}>
        {productIds.map(getProduct).map((product) => (
          <li key={product.id} className={styles.product}>
            <div className={styles.media}>
              <Image
                src={product.photo.src}
                alt={product.photo.alt}
                fill
                placeholder="blur"
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
