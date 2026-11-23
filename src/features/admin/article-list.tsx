"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { Draft } from "@/lib/cms/schema";
import { formatDate } from "@/lib/format";
import { deleteArticle } from "./api";
import { ConfirmDialog } from "./confirm-dialog";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

function status(draft: Draft) {
  if (draft.published_revision === null) return { tone: "draft", label: "Draft" };
  if (draft.published_revision === draft.revision) return { tone: "live", label: "Live" };
  return { tone: "pending", label: "Live · unpublished changes" };
}

type ArticleListProps = { drafts: Draft[]; justDeleted: boolean };

export function ArticleList({ drafts: initial, justDeleted }: ArticleListProps) {
  const [drafts, setDrafts] = useState(initial);
  const [confirm, setConfirm] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(
    justDeleted ? { kind: "success", text: "Article deleted." } : null,
  );
  const dismiss = useCallback(() => setNotice(null), []);

  async function remove(draft: Draft) {
    setConfirm(null);
    setBusy(true);
    try {
      await deleteArticle(draft.id);
      setDrafts((current) => current.filter(({ id }) => id !== draft.id));
      setNotice({ kind: "success", text: `“${draft.document.title}” was deleted.` });
    } catch (error) {
      const text = error instanceof Error ? error.message : "The article could not be deleted.";
      setNotice({ kind: "error", text });
    } finally {
      setBusy(false);
    }
  }

  const live = drafts.filter((draft) => draft.published_revision !== null).length;

  return (
    <>
      {drafts.length === 0 ? (
        <div className={styles.empty}>
          <h2>Your first story starts here.</h2>
          <p>Click “New article” to start writing. Nothing goes live until you publish.</p>
        </div>
      ) : (
        <>
          <p className={styles.summary}>
            {drafts.length} {drafts.length === 1 ? "article" : "articles"} · {live} live ·{" "}
            {drafts.length - live} {drafts.length - live === 1 ? "draft" : "drafts"}
          </p>
          <ul className={styles.articleList}>
            {drafts.map((draft) => {
              const { tone, label } = status(draft);
              const { document } = draft;
              return (
                <li key={draft.id} className={styles.articleRow}>
                  <Link href={`/admin/articles/${draft.id}`} className={styles.thumb}>
                    {document.cover ? (
                      // Drafts' photos need the editor's cookie, which next/image does not send.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={document.cover} alt="" />
                    ) : (
                      <span aria-hidden="true">{document.title.charAt(0) || "?"}</span>
                    )}
                  </Link>
                  <div className={styles.rowText}>
                    <span className={styles.status} data-tone={tone}>
                      {label}
                    </span>
                    <h2>
                      <Link href={`/admin/articles/${draft.id}`}>
                        {document.title || "Untitled article"}
                      </Link>
                    </h2>
                    <p>
                      {document.kicker || "Article"} · edited {formatDate(draft.updated_at)}
                    </p>
                  </div>
                  <div className={styles.rowActions}>
                    <Link href={`/admin/articles/${draft.id}`} className={styles.primary}>
                      Edit
                    </Link>
                    {draft.published_revision !== null && (
                      <a href={`/articles/${document.slug}`} target="_blank" rel="noreferrer">
                        View ↗
                      </a>
                    )}
                    <button
                      type="button"
                      className={styles.danger}
                      disabled={busy}
                      onClick={() => setConfirm(draft)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete this article?"
          body={`“${confirm.document.title}” will be removed${
            confirm.published_revision !== null ? " from the website and" : ""
          } from your list. This cannot be undone.`}
          cancelLabel="Cancel"
          actions={[{ label: "Delete forever", tone: "danger", onClick: () => remove(confirm) }]}
          onCancel={() => setConfirm(null)}
        />
      )}
      <Toast notice={notice} onDismiss={dismiss} />
    </>
  );
}
