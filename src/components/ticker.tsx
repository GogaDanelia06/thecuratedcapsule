import type { TickerItem } from "@/content/front-page";
import { cx } from "@/lib/cx";
import styles from "./ticker.module.css";

const copies = [0, 1, 2];

type TickerProps = {
  items: readonly TickerItem[];
};

export function Ticker({ items }: TickerProps) {
  return (
    <div className={styles.ticker}>
      {copies.map((copy) => (
        <ul key={copy} className={styles.track} aria-hidden={copy > 0 || undefined}>
          {items.map((item) => (
            <li key={item.text} className={cx(item.tone && styles[item.tone])}>
              {item.text}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
