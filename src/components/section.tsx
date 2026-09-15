import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./section.module.css";

type SectionProps = {
  id: string;
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({ id, title, aside, className, children }: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className={cx(styles.section, className)}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function SectionNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
