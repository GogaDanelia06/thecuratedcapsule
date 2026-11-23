"use client";

import styles from "./studio.module.css";

export const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif";

type PhotoInputProps = {
  label: string;
  disabled?: boolean;
  onFile: (file: File) => void;
};

export function PhotoInput({ label, disabled, onFile }: PhotoInputProps) {
  return (
    <label className={styles.uploadLabel}>
      {label}
      <input
        type="file"
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
