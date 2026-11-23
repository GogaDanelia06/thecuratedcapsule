"use client";

import { productOptions } from "@/content/products";
import type { ArticleDocument } from "@/lib/cms/schema";
import { PhotoInput } from "./photo-input";
import styles from "./studio.module.css";

type TextKey = "emphasis" | "kicker" | "dek" | "author" | "publishedAt" | "coverAlt";

type ArticleDetailsProps = {
  document: ArticleDocument;
  published: boolean;
  liveUrl: string;
  isNew: boolean;
  disabled: boolean;
  update: <K extends keyof ArticleDocument>(key: K, value: ArticleDocument[K]) => void;
  onCover: (file: File) => void;
  onUnpublish: () => void;
  onDelete: () => void;
};

export function ArticleDetails({
  document,
  published,
  liveUrl,
  isNew,
  disabled,
  update,
  onCover,
  onUnpublish,
  onDelete,
}: ArticleDetailsProps) {
  const field = (key: TextKey, label: string, hint?: string, type = "text") => (
    <label className={styles.field}>
      {label}
      <input
        type={type}
        value={document[key]}
        onChange={(event) => update(key, event.target.value)}
      />
      {hint && <small>{hint}</small>}
    </label>
  );

  function toggleProduct(value: string, checked: boolean) {
    update(
      "products",
      checked ? [...document.products, value] : document.products.filter((id) => id !== value),
    );
  }

  return (
    <aside className={styles.details}>
      <fieldset disabled={disabled}>
        <section className={styles.panel}>
          <h2>Cover photo</h2>
          {document.cover ? (
            <div className={styles.coverPreview}>
              {/* Drafts' photos need the editor's cookie, which next/image does not send. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={document.cover} alt={document.coverAlt || "Article cover"} />
            </div>
          ) : (
            <div className={styles.coverEmpty}>No cover yet</div>
          )}
          <div className={styles.coverActions}>
            <PhotoInput
              label={document.cover ? "Replace photo" : "+ Upload cover"}
              onFile={onCover}
            />
            {document.cover && (
              <button type="button" onClick={() => update("cover", "")}>
                Remove
              </button>
            )}
          </div>
          {field("coverAlt", "Describe the photo", "Read aloud to blind readers.")}
        </section>

        <section className={styles.panel}>
          <h2>Details</h2>
          {field("dek", "Subtitle")}
          {field("kicker", "Category", "Small label above the title, e.g. “Ski season”.")}
          {field("emphasis", "Italic words", "Words from the title shown in italics.")}
          {field("author", "Author")}
          {field(
            "publishedAt",
            "Date shown",
            "Displayed on the article; it does not schedule it.",
            "date",
          )}
          <label className={styles.field}>
            Web address
            <input
              value={document.slug}
              maxLength={180}
              onChange={(event) => update("slug", event.target.value)}
            />
            <small>thecuratedcapsule.com/articles/{document.slug || "…"}</small>
          </label>
        </section>

        <section className={styles.panel}>
          <details className={styles.products}>
            <summary>Shop this article ({document.products.length})</summary>
            {productOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={document.products.includes(option.value)}
                  onChange={(event) => toggleProduct(option.value, event.target.checked)}
                />
                {option.label}
              </label>
            ))}
          </details>
        </section>

        <section className={styles.panel}>
          <h2>Manage</h2>
          {published && (
            <a className={styles.panelLink} href={liveUrl} target="_blank" rel="noreferrer">
              View on website ↗
            </a>
          )}
          <div className={styles.manageActions}>
            {published && (
              <button type="button" onClick={onUnpublish}>
                Unpublish
              </button>
            )}
            <button type="button" className={styles.danger} onClick={onDelete}>
              {isNew ? "Discard" : "Delete article"}
            </button>
          </div>
        </section>
      </fieldset>
    </aside>
  );
}
