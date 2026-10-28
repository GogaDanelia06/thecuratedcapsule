import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./cover.module.css";

type CoverProps = {
  photo: { src: StaticImageData | string; alt: string };
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
        placeholder={typeof photo.src === "string" ? "empty" : "blur"}
        sizes="(min-width: 1640px) 1640px, 100vw"
        className={styles.photo}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
