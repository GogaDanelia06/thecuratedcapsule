"use client";

import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";
import { getProduct, type ProductId } from "@/content/products";
import { formatPrice, pluralize } from "@/lib/format";
import { removeSaved, useSavedProductIds } from "./saved-products";
import styles from "./capsule-dialog.module.css";

type CapsuleDialogProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

export function CapsuleDialog({ id, open, onClose }: CapsuleDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const products = useSavedProductIds().map(getProduct);
  const total = products.reduce((sum, product) => sum + product.price, 0);
  const titleId = `${id}-title`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function remove(event: MouseEvent<HTMLButtonElement>, productId: ProductId) {
    const item = event.currentTarget.closest("li");
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    removeSaved(productId);
    (neighbour?.querySelector("button") ?? titleRef.current)?.focus();
  }

  function openRetailers() {
    for (const product of products) {
      window.open(product.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 ref={titleRef} id={titleId} tabIndex={-1} className={styles.title}>
            My capsule
          </h2>
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </header>

        <div className={styles.body}>
          {products.length === 0 ? (
            <p className={styles.empty}>
              Nothing saved yet. Tap <em>Save</em> on any piece and it collects here — we will tell
              you when the price drops.
            </p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id} className={styles.item}>
                  <div className={styles.thumbnail}>
                    <Image src={product.photo.src} alt={product.photo.alt} fill sizes="74px" />
                  </div>
                  <div className={styles.details}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <p className={styles.brand}>{product.brand}</p>
                  </div>
                  <div className={styles.side}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={(event) => remove(event, product.id)}
                    >
                      Remove<span className="sr-only"> {product.name}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <p className={styles.summary}>
            <span className={styles.count}>
              {products.length} {pluralize(products.length, "piece")} · total
            </span>
            <span className={styles.total}>{formatPrice(total)}</span>
          </p>
          <button
            type="button"
            className={styles.buyAll}
            disabled={products.length === 0}
            onClick={openRetailers}
          >
            Buy all at retailers
          </button>
          <p className={styles.disclosure}>
            Opens each retailer in turn. We earn a commission on qualifying purchases; your price is
            unchanged.
          </p>
        </footer>
      </div>
    </dialog>
  );
}
