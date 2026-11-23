"use client";

import { cx } from "@/lib/cx";
import styles from "./studio.module.css";

export type DialogAction = {
  label: string;
  onClick: () => void;
  tone?: "primary" | "danger";
};

type ConfirmDialogProps = {
  title: string;
  body: string;
  /** Extra buttons, shown after "Keep editing" (which always cancels). */
  actions: DialogAction[];
  onCancel: () => void;
  cancelLabel?: string;
};

export function ConfirmDialog({
  title,
  body,
  actions,
  onCancel,
  cancelLabel = "Keep editing",
}: ConfirmDialogProps) {
  return (
    <div
      className={styles.modalBackdrop}
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <section
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        onKeyDown={(event) => event.key === "Escape" && onCancel()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-body">{body}</p>
        <div className={styles.modalActions}>
          <button type="button" autoFocus onClick={onCancel}>
            {cancelLabel}
          </button>
          {actions.map(({ label, onClick, tone }) => (
            <button
              key={label}
              type="button"
              className={cx(
                tone === "primary" && styles.primary,
                tone === "danger" && styles.danger,
              )}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
