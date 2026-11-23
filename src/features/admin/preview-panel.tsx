"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleDocument } from "@/lib/cms/schema";
import styles from "./studio.module.css";

/** Shows the unsaved article in the real site layout, inside a same-origin iframe. */
export function PreviewPanel({ document }: { document: ArticleDocument }) {
  const [mobile, setMobile] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage(
        { type: "capsule-preview", document },
        window.location.origin,
      );
    send();
    // The iframe announces itself once loaded; answer with the current draft.
    const onReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "capsule-preview-ready"
      ) {
        send();
      }
    };
    window.addEventListener("message", onReady);
    return () => window.removeEventListener("message", onReady);
  }, [document]);

  return (
    <section className={styles.previewPanel}>
      <div className={styles.previewTools}>
        <div>
          <strong>Live preview</strong>
          <p>Includes your unsaved changes. Only you can see this.</p>
        </div>
        <div>
          <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>
            Desktop
          </button>
          <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}>
            Mobile
          </button>
        </div>
      </div>
      <iframe
        ref={frame}
        title="Article website preview"
        src="/admin/preview"
        className={mobile ? styles.mobileFrame : styles.desktopFrame}
      />
    </section>
  );
}
