"use client";

import { productOptions } from "@/content/products";
import type { ArticleDocument } from "@/lib/cms/schema";
import { PhotoInput } from "./photo-input";
import { PublishChecklist } from "./publish-checklist";
import styles from "./studio.module.css";

type TextKey = "emphasis" | "kicker" | "dek" | "author" | "publishedAt" | "coverAlt";

type ArticleDetailsProps = {
  document: ArticleDocument;
  published: boolean;
  liveUrl: string;
  isNew: boolean;
  uploading: boolean;
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
  uploading,
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
      <PublishChecklist document={document} />

      <section className={styles.panel}>
        <h2>Cover photo</h2>
        <p className={styles.panelNote}>Shown at the top of the article and on the homepage.</p>
        {document.cover ? (
          <div className={styles.coverPreview}>
            {/* Drafts' photos need the editor's cookie, which next/image does not send. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={document.cover} alt={document.coverAlt || "Article cover"} />
            <div className={styles.coverActions}>
              <PhotoInput onFile={onCover} disabled={uploading}>
                Replace
              </PhotoInput>
              <button type="button" onClick={() => update("cover", "")}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <PhotoInput dropzone onFile={onCover} disabled={uploading}>
            <strong>{uploading ? "Uploading…" : "Drop a photo here"}</strong>
            <span>or click to choose · JPG, PNG, WebP · up to 4 MB</span>
          </PhotoInput>
        )}
        {document.cover &&
          field("coverAlt", "Describe the photo", "Read aloud to people using screen readers.")}
      </section>

      <section className={styles.panel}>
        <h2>Details</h2>
        {field("kicker", "Category", "Small label above the title, e.g. “Ski season”.")}
        {field("emphasis", "Italic words", "Words from the title to show in italics.")}
        {field("author", "Author")}
        {field(
          "publishedAt",
          "Date shown",
          "Displayed on the article. It does not schedule it.",
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
          <summary>
            Shop this article
            <span className={styles.count}>{document.products.length}</span>
          </summary>
          <p className={styles.panelNote}>Shown beside the article with a Buy button.</p>
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
    </aside>
  );
}
