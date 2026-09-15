"use client";

import { getProduct, type ProductId } from "@/content/products";
import { toggleSaved, useSavedProductIds } from "./saved-products";
import styles from "./save-button.module.css";

type SaveButtonProps = {
  productId: ProductId;
};

export function SaveButton({ productId }: SaveButtonProps) {
  const isSaved = useSavedProductIds().includes(productId);

  return (
    <button
      type="button"
      className={styles.save}
      aria-pressed={isSaved}
      onClick={() => toggleSaved(productId)}
    >
      {isSaved ? "Saved" : "Save"}
      <span className="sr-only"> {getProduct(productId).name}</span>
    </button>
  );
}
