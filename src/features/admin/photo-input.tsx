"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./studio.module.css";

export const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif";

type PhotoInputProps = {
  children: ReactNode;
  disabled?: boolean;
  onFile: (file: File) => void;
  /** Large drag-and-drop area instead of a button. */
  dropzone?: boolean;
  className?: string;
};

/** A styled photo picker; the native file input is visually hidden but keyboard-usable. */
export function PhotoInput({ children, disabled, onFile, dropzone, className }: PhotoInputProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      className={cx(dropzone ? styles.dropzone : styles.photoButton, className)}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onDragOver={(event) => {
        if (!dropzone || disabled) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        if (!dropzone || disabled) return;
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      {children}
      <input
        type="file"
        className={styles.visuallyHidden}
        accept={PHOTO_TYPES}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so choosing the same file again still triggers an upload.
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
