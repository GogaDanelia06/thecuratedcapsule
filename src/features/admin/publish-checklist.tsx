import type { ArticleDocument } from "@/lib/cms/schema";
import styles from "./studio.module.css";

export function countWords(markdown: string) {
  return markdown
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** What publishing needs (required) and what makes the article look its best (nice to have). */
export function checklist(document: ArticleDocument) {
  const words = countWords(document.body);
  return [
    { label: "Title", done: document.title.trim().length > 0, required: true },
    { label: "Article text", done: words > 0, required: true },
    {
      label: "Photo description",
      done: !document.cover || document.coverAlt.trim().length > 0,
      required: true,
      hint: "Needed when there is a cover photo.",
    },
    { label: "Cover photo", done: Boolean(document.cover), hint: "Shown on the homepage card." },
    { label: "Subtitle", done: document.dek.trim().length > 0 },
    { label: "Category", done: document.kicker.trim().length > 0 },
  ];
}

export function PublishChecklist({ document }: { document: ArticleDocument }) {
  const items = checklist(document);
  const missing = items.filter((item) => item.required && !item.done).length;

  return (
    <section className={styles.panel}>
      <h2>Before you publish</h2>
      <p className={styles.panelNote}>
        {missing === 0
          ? "Ready to publish."
          : `${missing} required ${missing === 1 ? "item" : "items"} left.`}
      </p>
      <ul className={styles.checklist}>
        {items.map(({ label, done, required, hint }) => (
          <li key={label} data-done={done || undefined}>
            <span aria-hidden="true">{done ? "✓" : required ? "!" : "○"}</span>
            <span>
              {label}
              {!required && <em> · optional</em>}
              {!done && hint && <small>{hint}</small>}
            </span>
            <span className={styles.visuallyHidden}>{done ? "done" : "not done"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
