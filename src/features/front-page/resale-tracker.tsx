"use client";

import { useState } from "react";
import { Section } from "@/components/section";
import { resaleScaleMax, seasons, type ResaleRecord } from "@/content/resale";
import { cx } from "@/lib/cx";
import { formatChange, formatPrice, relativeChange } from "@/lib/format";
import styles from "./resale-tracker.module.css";

export function ResaleTracker() {
  const [seasonId, setSeasonId] = useState(seasons[0].id);
  const season = seasons.find(({ id }) => id === seasonId) ?? seasons[0];

  return (
    <Section
      id="runway-to-resale"
      title="Runway to resale"
      className={styles.section}
      aside={
        <div role="group" aria-label="Season" className={styles.seasons}>
          {seasons.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === season.id}
              className={styles.season}
              onClick={() => setSeasonId(id)}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <p className={styles.intro}>
        What each piece cost at retail, and what it trades for today. Measured against verified
        resale listings, updated weekly.
      </p>

      <div className={styles.legend}>
        <span className={styles.legendPiece}>The piece</span>
        <ul className={styles.key}>
          <li className={cx(styles.keyItem, styles.keyRetail)}>Retail at launch</li>
          <li className={cx(styles.keyItem, styles.keyUp)}>Resale up</li>
          <li className={cx(styles.keyItem, styles.keyDown)}>Resale down</li>
        </ul>
        <span className={styles.legendChange}>Change</span>
      </div>

      <ol>
        {season.records.map((record, index) => (
          <ResaleRow key={index} record={record} />
        ))}
      </ol>

      <p className={styles.footnote}>
        Scale runs to {formatPrice(resaleScaleMax)}. Resale figures are median sold prices across
        four marketplaces, last thirty days.
      </p>
    </Section>
  );
}

function ResaleRow({ record }: { record: ResaleRecord }) {
  const { retail, resale } = record;
  const change = relativeChange(retail, resale);
  const position = (price: number) => `${((price / resaleScaleMax) * 100).toFixed(2)}%`;

  return (
    <li className={cx(styles.row, change < 0 ? styles.down : styles.up)}>
      <div className={styles.piece}>
        <h3 className={styles.name}>{record.name}</h3>
        <p className={styles.brand}>{record.brand}</p>
      </div>
      <div
        role="img"
        aria-label={`Retail ${formatPrice(retail)}, resale ${formatPrice(resale)}`}
        className={styles.track}
        style={{
          "--retail": position(retail),
          "--resale": position(resale),
          "--low": position(Math.min(retail, resale)),
          "--high": position(Math.max(retail, resale)),
        }}
      >
        <span className={styles.range} />
        <span className={styles.retailDot} />
        <span className={styles.resaleDot} />
        <span className={styles.retailPrice}>{formatPrice(retail)}</span>
        <span className={styles.resalePrice}>{formatPrice(resale)}</span>
      </div>
      <p className={styles.change}>{formatChange(change)}</p>
    </li>
  );
}
