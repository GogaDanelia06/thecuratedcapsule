"use client";

import { useCallback, useEffect, useState } from "react";
import { homepageSchema, orderArticles, type Homepage, type Product } from "@/lib/cms/schema";
import { formatPrice } from "@/lib/format";
import { saveHomepage, uploadPhoto } from "./api";
import { PhotoInput } from "./photo-input";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

type PublishedArticle = {
  slug: string;
  title: string;
  kicker: string;
  cover: string;
  publishedAt: string;
};

type HomepageEditorProps = {
  initial: Homepage;
  catalog: Product[];
  articles: PublishedArticle[];
};

export function HomepageEditor({ initial, catalog, articles }: HomepageEditorProps) {
  const [homepage, setHomepage] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);

  const dirty = JSON.stringify(homepage) !== JSON.stringify(saved);
  const { look } = homepage;
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const pieces = look.pieces.filter((piece) => byId.has(piece.productId));
  const available = catalog.filter(
    (product) => !look.pieces.some((p) => p.productId === product.id),
  );
  const ordered = orderArticles(articles, homepage.editOrder);
  const coverSlug = homepage.coverArticle || ordered[0]?.slug;
  const total = pieces.reduce((sum, piece) => sum + (byId.get(piece.productId)?.price ?? 0), 0);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setLook = (change: Partial<Homepage["look"]>) =>
    setHomepage((current) => ({ ...current, look: { ...current.look, ...change } }));

  const setPieces = (next: Homepage["look"]["pieces"]) => setLook({ pieces: next });

  /** Moves an article in The Edit; the whole list is saved so the order is fixed. */
  function moveArticle(index: number, by: number) {
    const slugs = ordered.map((article) => article.slug);
    const [slug] = slugs.splice(index, 1);
    slugs.splice(index + by, 0, slug);
    setHomepage((current) => ({ ...current, editOrder: slugs }));
  }

  function move(index: number, by: number) {
    const next = [...pieces];
    const [piece] = next.splice(index, 1);
    next.splice(index + by, 0, piece);
    setPieces(next);
  }

  async function upload(file: File) {
    setBusy(true);
    try {
      setLook({ photo: (await uploadPhoto(file)).url });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    // Drop pieces whose product was deleted elsewhere.
    const editOrder = homepage.editOrder.length ? ordered.map((article) => article.slug) : [];
    const valid = homepageSchema.safeParse({ ...homepage, editOrder, look: { ...look, pieces } });
    if (!valid.success) {
      return setNotice({ kind: "error", text: valid.error.issues[0].message });
    }
    if (valid.data.look.photo && !valid.data.look.photoAlt.trim()) {
      return setNotice({ kind: "error", text: "Describe the look photo before saving." });
    }
    setBusy(true);
    setNotice(null);
    try {
      const result = await saveHomepage(valid.data);
      setHomepage(result.homepage);
      setSaved(result.homepage);
      setNotice({
        kind: "success",
        text: "Homepage updated. It's live now.",
        link: { href: "/", label: "View homepage ↗" },
      });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={styles.saveBar}>
        <span className={styles.status} data-tone={busy ? "busy" : dirty ? "dirty" : "live"}>
          {busy ? "Saving…" : dirty ? "Unsaved changes" : "Live on the website"}
        </span>
        <button type="button" disabled={!dirty} onClick={() => setHomepage(saved)}>
          Undo changes
        </button>
        <button type="button" className={styles.primary} disabled={busy || !dirty} onClick={save}>
          Save & publish
        </button>
      </div>

      <section className={styles.panel}>
        <h2>Cover story & The Edit</h2>
        <p className={styles.panelNote}>
          The ★ cover story is the big story at the top of the homepage. The list below is the order
          of the cards in The Edit, left to right. New articles appear first until you move them.
        </p>
        <label className={styles.field}>
          Cover story
          <select
            value={homepage.coverArticle}
            onChange={(event) =>
              setHomepage((current) => ({ ...current, coverArticle: event.target.value }))
            }
          >
            <option value="">Automatic: the first article in The Edit</option>
            {articles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title}
              </option>
            ))}
          </select>
        </label>

        {ordered.length === 0 ? (
          <p className={styles.panelNote}>Publish an article and it will appear here.</p>
        ) : (
          <ol className={styles.pieceList} aria-label="Order of The Edit">
            {ordered.map((article, index) => {
              const isCover = article.slug === coverSlug;
              return (
                <li key={article.slug}>
                  <span className={styles.pieceThumb}>
                    {article.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.cover} alt="" />
                    )}
                  </span>
                  <div className={styles.pieceText}>
                    <strong>
                      <span className={styles.position}>{index + 1}</span> {article.title}
                    </strong>
                    <span>{[article.kicker, article.publishedAt].filter(Boolean).join(" · ")}</span>
                  </div>
                  <div className={styles.pieceActions}>
                    {isCover ? (
                      <span className={styles.coverBadge}>★ Cover</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.makeCover}
                        onClick={() =>
                          setHomepage((current) => ({ ...current, coverArticle: article.slug }))
                        }
                      >
                        ☆ Make cover
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Move ${article.title} earlier`}
                      disabled={index === 0}
                      onClick={() => moveArticle(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${article.title} later`}
                      disabled={index === ordered.length - 1}
                      onClick={() => moveArticle(index, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Shop the look</h2>
        <p className={styles.panelNote}>
          One outfit photo and the pieces in it. Readers can buy the whole look or single pieces.
        </p>
        <div className={styles.lookGrid}>
          <div>
            {look.photo ? (
              <div className={styles.coverPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={look.photo} alt="" className={styles.lookPhoto} />
                <div className={styles.coverActions}>
                  <PhotoInput onFile={upload} disabled={busy}>
                    Replace
                  </PhotoInput>
                </div>
              </div>
            ) : (
              <PhotoInput dropzone onFile={upload} disabled={busy}>
                <strong>{busy ? "Uploading…" : "Drop the outfit photo here"}</strong>
                <span>or click to choose · up to 4 MB</span>
              </PhotoInput>
            )}
            <label className={styles.field}>
              Caption
              <input
                value={look.caption}
                maxLength={200}
                placeholder="Look 12 · buy it whole or piece by piece"
                onChange={(event) => setLook({ caption: event.target.value })}
              />
            </label>
            {look.photo && (
              <label className={styles.field}>
                Describe the photo
                <input
                  value={look.photoAlt}
                  maxLength={500}
                  onChange={(event) => setLook({ photoAlt: event.target.value })}
                />
                <small>Read aloud to people using screen readers.</small>
              </label>
            )}
          </div>

          <div>
            <p className={styles.lookTotal}>
              {pieces.length} {pieces.length === 1 ? "piece" : "pieces"} · {formatPrice(total)}{" "}
              total
            </p>
            <ol className={styles.pieceList}>
              {pieces.map((piece, index) => {
                const product = byId.get(piece.productId)!;
                return (
                  <li key={piece.productId}>
                    <span className={styles.pieceThumb}>
                      {product.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.photo} alt="" />
                      )}
                    </span>
                    <div className={styles.pieceText}>
                      <strong>{product.name}</strong>
                      <span>
                        {[product.brand, formatPrice(product.price)].filter(Boolean).join(" · ")}
                      </span>
                      <input
                        aria-label={`Note for ${product.name}`}
                        placeholder="Short note, e.g. “runs long”"
                        value={piece.note}
                        maxLength={120}
                        onChange={(event) =>
                          setPieces(
                            pieces.map((p, i) =>
                              i === index ? { ...p, note: event.target.value } : p,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className={styles.pieceActions}>
                      <button
                        type="button"
                        aria-label={`Move ${product.name} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${product.name} down`}
                        disabled={index === pieces.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.iconDanger}
                        aria-label={`Remove ${product.name} from the look`}
                        onClick={() => setPieces(pieces.filter((_, i) => i !== index))}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <label className={styles.field}>
              Add a piece
              <select
                value=""
                disabled={available.length === 0}
                onChange={(event) =>
                  event.target.value &&
                  setPieces([...pieces, { productId: event.target.value, note: "" }])
                }
              >
                <option value="">
                  {available.length ? "Choose a product…" : "Every product is already in the look"}
                </option>
                {available.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.brand && ` · ${product.brand}`} · {formatPrice(product.price)}
                  </option>
                ))}
              </select>
              <small>Missing a product? Add it on the Products tab first.</small>
            </label>
          </div>
        </div>
      </section>
      <Toast notice={notice} onDismiss={dismiss} />
    </>
  );
}
