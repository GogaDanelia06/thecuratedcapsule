"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { orderArticles, type Homepage } from "@/lib/cms/schema";
import { formatDate } from "@/lib/format";
import { deleteArticle, saveHomepage } from "./api";
import { ConfirmDialog } from "./confirm-dialog";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

type Filter = "all" | "live" | "draft";

const PAGE_SIZE = 12;

/** The card fields of one article; the dashboard never loads article text. */
export type ArticleRow = {
  id: string;
  revision: number;
  published_revision: number | null;
  updated_at: string;
  title: string;
  slug: string;
  kicker: string;
  dek: string;
  cover: string;
  publishedAt: string;
};

/** 1 … 4 5 6 … 20: the first, last and neighbouring pages, with gaps as null. */
function pageNumbers(current: number, pages: number) {
  const wanted = [...new Set([1, current - 1, current, current + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return wanted.flatMap((n, i) => (i > 0 && n - wanted[i - 1] > 1 ? [null, n] : [n]));
}

function status(draft: ArticleRow) {
  if (draft.published_revision === null) return { tone: "draft", label: "Draft" };
  if (draft.published_revision === draft.revision) return { tone: "live", label: "Live" };
  return { tone: "pending", label: "Live · new changes" };
}

const steps = [
  { title: "Write", text: "Click “New article”. Your work saves itself as you type." },
  { title: "Preview", text: "See exactly how it will look on the website, on desktop and phone." },
  {
    title: "Publish",
    text: "It appears on the site and in The Edit on the homepage straight away.",
  },
];

type ArticleListProps = { drafts: ArticleRow[]; homepage: Homepage; notice?: string };

export function ArticleList({
  drafts: initial,
  homepage: initialHomepage,
  notice: initialNotice,
}: ArticleListProps) {
  const [homepage, setHomepage] = useState(initialHomepage);
  const [drafts, setDrafts] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<ArticleRow | null>(null);
  const [page, setPage] = useState(1);
  const listTop = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(
    initialNotice ? { kind: "success", text: initialNotice } : null,
  );
  const dismiss = useCallback(() => setNotice(null), []);

  const live = drafts.filter((draft) => draft.published_revision !== null);
  // Same rule as the homepage: the chosen cover, or else the first article in The Edit.
  const coverSlug = homepage.coverArticle || orderArticles(live, homepage.editOrder)[0]?.slug;

  async function makeCover(draft: ArticleRow) {
    setBusy(true);
    try {
      const result = await saveHomepage({ ...homepage, coverArticle: draft.slug });
      setHomepage(result.homepage);
      setNotice({
        kind: "success",
        text: `“${draft.title}” is now the cover story.`,
        link: { href: "/", label: "View homepage ↗" },
      });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }
  const lastPublished = live[0];
  const counts: Record<Filter, number> = {
    all: drafts.length,
    live: live.length,
    draft: drafts.length - live.length,
  };
  const needle = query.trim().toLowerCase();
  const shown = drafts.filter((draft) => {
    const isLive = draft.published_revision !== null;
    if (filter === "live" && !isLive) return false;
    if (filter === "draft" && isLive) return false;
    const { title, kicker, dek } = draft;
    return !needle || [title, kicker, dek].some((text) => text.toLowerCase().includes(needle));
  });

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function goTo(next: number) {
    setPage(next);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function remove(draft: ArticleRow) {
    setConfirm(null);
    setBusy(true);
    try {
      await deleteArticle(draft.id);
      setDrafts((current) => current.filter(({ id }) => id !== draft.id));
      setNotice({ kind: "success", text: `“${draft.title}” was deleted.` });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={styles.stats}>
        <div>
          <strong>{counts.live}</strong>
          <span>Live on the website</span>
        </div>
        <div>
          <strong>{counts.draft}</strong>
          <span>Private {counts.draft === 1 ? "draft" : "drafts"}</span>
        </div>
        <div>
          <strong className={styles.statText}>{lastPublished ? lastPublished.title : "—"}</strong>
          <span>Latest edited live article</span>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className={styles.empty}>
          <h2>Your first story starts here.</h2>
          <p>Nothing goes live until you press Publish, so take your time.</p>
          <Link className={styles.primary} href="/admin/articles/new">
            + Write your first article
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.listTools} ref={listTop}>
            <div className={styles.tabs} role="tablist" aria-label="Show articles">
              {(["all", "live", "draft"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => {
                    setFilter(key);
                    setPage(1);
                  }}
                >
                  {{ all: "All", live: "Live", draft: "Drafts" }[key]}
                  <span className={styles.count}>{counts[key]}</span>
                </button>
              ))}
            </div>
            <input
              type="search"
              className={styles.search}
              placeholder="Search articles…"
              aria-label="Search articles"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>

          {shown.length === 0 ? (
            <p className={styles.noResults}>No articles match. Try another word or filter.</p>
          ) : (
            <ul className={styles.cardGrid}>
              {visible.map((draft) => {
                const { tone, label } = status(draft);
                const document = draft;
                const href = `/admin/articles/${draft.id}`;
                const isLive = draft.published_revision !== null;
                const isCover = isLive && document.slug === coverSlug;
                return (
                  <li key={draft.id} className={styles.articleCard}>
                    <Link href={href} className={styles.cardCover} tabIndex={-1} aria-hidden="true">
                      {document.cover ? (
                        // Drafts' photos need the editor's cookie, which next/image does not send.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={document.cover} alt="" />
                      ) : (
                        <span>{document.title || "Untitled"}</span>
                      )}
                      <span className={styles.status} data-tone={tone}>
                        {label}
                      </span>
                      {isCover && <span className={styles.coverRibbon}>★ Cover story</span>}
                    </Link>
                    <div className={styles.cardBody}>
                      <p className={styles.cardKicker}>{document.kicker || "Article"}</p>
                      <h2>
                        <Link href={href}>{document.title || "Untitled article"}</Link>
                      </h2>
                      {document.dek && <p className={styles.cardDek}>{document.dek}</p>}
                      <p className={styles.cardMeta}>Edited {formatDate(draft.updated_at)}</p>
                    </div>
                    <div className={styles.cardActions}>
                      <Link href={href} className={styles.primary}>
                        Edit
                      </Link>
                      {isLive && !isCover && (
                        <button
                          type="button"
                          className={styles.ghost}
                          disabled={busy}
                          title="Show this article as the big story at the top of the homepage"
                          onClick={() => makeCover(draft)}
                        >
                          ☆ Set as cover
                        </button>
                      )}
                      {isLive && (
                        <a
                          className={styles.ghost}
                          href={`/articles/${document.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className={styles.iconDanger}
                        disabled={busy}
                        aria-label={`Delete “${document.title}”`}
                        title="Delete"
                        onClick={() => setConfirm(draft)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {pages > 1 && (
            <nav className={styles.pager} aria-label="Pages">
              <span>
                {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, shown.length)} of{" "}
                {shown.length}
              </span>
              <button type="button" disabled={current === 1} onClick={() => goTo(current - 1)}>
                ← Previous
              </button>
              {pageNumbers(current, pages).map((number, index) =>
                number === null ? (
                  <span key={`gap-${index}`} aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === current ? "page" : undefined}
                    onClick={() => goTo(number)}
                  >
                    {number}
                  </button>
                ),
              )}
              <button type="button" disabled={current === pages} onClick={() => goTo(current + 1)}>
                Next →
              </button>
            </nav>
          )}
        </>
      )}

      <details className={styles.guide} open={drafts.length < 2}>
        <summary>How publishing works</summary>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.panelNote}>
          Editing a live article keeps readers on the published version until you press “Publish
          changes”. Unpublish takes an article offline without deleting it.
        </p>
      </details>

      {confirm && (
        <ConfirmDialog
          title="Delete this article?"
          body={`“${confirm.title}” will be removed${
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
