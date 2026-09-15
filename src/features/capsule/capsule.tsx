"use client";

import { useId, useState } from "react";
import { CapsuleDialog } from "./capsule-dialog";
import { useSavedProductIds } from "./saved-products";
import styles from "./capsule.module.css";

export function Capsule() {
  const [isOpen, setOpen] = useState(false);
  const count = useSavedProductIds().length;
  const dialogId = useId();

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <span className={styles.possessive}>My </span>capsule ({count})
      </button>
      <CapsuleDialog id={dialogId} open={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}
