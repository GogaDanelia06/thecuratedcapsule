"use client";

import { useEffect } from "react";
import styles from "./studio.module.css";

export type Notice = {
  kind: "success" | "error";
  text: string;
  link?: { href: string; label: string };
};

type ToastProps = { notice: Notice | null; onDismiss: () => void };

/** Pop-up confirmation in the corner. Successes fade after a few seconds; errors stay. */
export function Toast({ notice, onDismiss }: ToastProps) {
  useEffect(() => {
    if (notice?.kind !== "success") return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div className={styles.toastRegion} aria-live="polite">
      {notice && (
        <div
          className={styles.toast}
          data-kind={notice.kind}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          <span className={styles.toastIcon} aria-hidden="true">
            {notice.kind === "success" ? "✓" : "!"}
          </span>
          <p>
            {notice.text}
            {notice.link && (
              <>
                {" "}
                <a href={notice.link.href} target="_blank" rel="noreferrer">
                  {notice.link.label}
                </a>
              </>
            )}
          </p>
          <button type="button" aria-label="Dismiss" onClick={onDismiss}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
