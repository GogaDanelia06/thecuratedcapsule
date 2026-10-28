import Image, { type StaticImageData } from "next/image";
import { cx } from "@/lib/cx";
import { ScrollTurn } from "./scroll-turn";
import styles from "./prism.module.css";

type FacePhoto = { src: StaticImageData | string; alt: string };

type PrismProps = {
  faces: readonly [FacePhoto, FacePhoto, FacePhoto];
  caption: readonly string[];
  motion: "spin" | "scroll";
};

export function Prism({ faces, caption, motion }: PrismProps) {
  const [front, right, back] = faces;

  const prism = (
    <div className={styles.prism}>
      <PhotoFace photo={front} className={styles.front} />
      <PhotoFace photo={right} className={styles.right} />
      <PhotoFace photo={back} className={styles.back} />
      <div className={cx(styles.face, styles.left)}>
        <p className={styles.caption}>{caption.join("\n")}</p>
      </div>
    </div>
  );

  if (motion === "scroll") {
    return (
      <ScrollTurn className={cx(styles.stage, styles.scroll)} aria-hidden>
        {prism}
      </ScrollTurn>
    );
  }

  return (
    <div className={cx(styles.stage, styles.spin)} aria-hidden>
      <div className={styles.float}>{prism}</div>
    </div>
  );
}

function PhotoFace({ photo, className }: { photo: FacePhoto; className: string }) {
  return (
    <div className={cx(styles.face, className)}>
      <Image src={photo.src} alt="" fill sizes="260px" />
    </div>
  );
}
