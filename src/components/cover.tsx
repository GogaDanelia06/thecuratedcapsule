import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/content/photos";
import { cx } from "@/lib/cx";
import styles from "./cover.module.css";

type CoverProps = {
  photo: Photo;
  variant: "front" | "story";
  children: ReactNode;
};

export function Cover({ photo, variant, children }: CoverProps) {
  return (
    <div className={cx(styles.cover, styles[variant])}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        loading="eager"
        fetchPriority="high"
        placeholder="blur"
        sizes="(min-width: 1640px) 1640px, 100vw"
        className={styles.photo}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
