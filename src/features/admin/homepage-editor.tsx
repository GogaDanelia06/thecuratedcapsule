"use client";

import { useCallback, useEffect, useState } from "react";
import {
  homepageSchema,
  orderArticles,
  productSchema,
  type Homepage,
  type Product,
} from "@/lib/cms/schema";
import { formatPrice } from "@/lib/format";
import { saveHomepage, saveProduct, uploadPhoto } from "./api";
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

  // Shop links and photos changed here are saved to the products themselves.
  const [products, setProducts] = useState(catalog);
  const [productEdits, setProductEdits] = useState<
    Record<string, Partial<Pick<Product, "url" | "photo">>>
  >({});

  const dirty =
    JSON.stringify(homepage) !== JSON.stringify(saved) || Object.keys(productEdits).length > 0;
  const { look } = homepage;
  const byId = new Map(
    products.map((product) => [product.id, { ...product, ...productEdits[product.id] }]),
  );
  const pieces = look.pieces.filter((piece) => byId.has(piece.productId));
  const available = products.filter(
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

  const behind = homepage.behindTheStory;
  const setBehind = (change: Partial<Homepage["behindTheStory"]>) =>
    setHomepage((current) => ({
      ...current,
      behindTheStory: { ...current.behindTheStory, ...change },
    }));
  const setFace = (index: number, change: Partial<Homepage["behindTheStory"]["photos"][number]>) =>
    setBehind({
      photos: behind.photos.map((photo, i) =>
        i === index ? { ...photo, ...change } : photo,
      ) as Homepage["behindTheStory"]["photos"],
    });

  const setLook = (change: Partial<Homepage["look"]>) =>
    setHomepage((current) => ({ ...current, look: { ...current.look, ...change } }));

  const setPieces = (next: Homepage["look"]["pieces"]) => setLook({ pieces: next });
  const setAside = look.setAside.filter((piece) => byId.has(piece.productId));

  const editProduct = (id: string, change: Partial<Pick<Product, "url" | "photo">>) =>
    setProductEdits((current) => ({ ...current, [id]: { ...current[id], ...change } }));

  /** Takes a piece out of the look but keeps it, with its note, in "Set aside". */
  function setPieceAside(index: number) {
    const piece = pieces[index];
    setLook({
      pieces: pieces.filter((_, i) => i !== index),
      setAside: [piece, ...setAside.filter((p) => p.productId !== piece.productId)],
    });
  }

  function putBack(productId: string) {
    const piece = setAside.find((p) => p.productId === productId);
    if (!piece) return;
    setLook({
      pieces: [...pieces, piece],
      setAside: setAside.filter((p) => p.productId !== productId),
    });
  }

  /** Replaces a piece with another product, keeping its place and note. */
  function swap(index: number, productId: string) {
    setLook({
      pieces: pieces.map((piece, i) => (i === index ? { ...piece, productId } : piece)),
      setAside: setAside.filter((p) => p.productId !== productId),
    });
  }

  function addPiece(productId: string) {
    const kept = setAside.find((p) => p.productId === productId);
    setLook({
      pieces: [...pieces, kept ?? { productId, note: "" }],
      setAside: setAside.filter((p) => p.productId !== productId),
    });
  }

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

  async function upload(
    file: File,
    apply: (url: string) => void = (url) => setLook({ photo: url }),
  ) {
    setBusy(true);
    try {
      apply((await uploadPhoto(file)).url);
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    // Drop pieces whose product was deleted elsewhere.
    const editOrder = homepage.editOrder.length ? ordered.map((article) => article.slug) : [];
    const valid = homepageSchema.safeParse({
      ...homepage,
      editOrder,
      look: { ...look, pieces, setAside },
    });
    if (!valid.success) {
      return setNotice({ kind: "error", text: valid.error.issues[0].message });
    }
    if (valid.data.look.photo && !valid.data.look.photoAlt.trim()) {
      return setNotice({ kind: "error", text: "Describe the look photo before saving." });
    }
    const changedProducts = [];
    for (const id of Object.keys(productEdits)) {
      const product = productSchema.safeParse(byId.get(id));
      if (!product.success) {
        const name = byId.get(id)?.name ?? "a product";
        return setNotice({ kind: "error", text: `${name}: ${product.error.issues[0].message}` });
      }
      changedProducts.push(product.data);
    }
    setBusy(true);
    setNotice(null);
    try {
      for (const product of changedProducts) {
        const { product: stored } = await saveProduct(product, "update");
        setProducts((current) => current.map((p) => (p.id === stored.id ? stored : p)));
        setProductEdits((current) => {
          const next = { ...current };
          delete next[stored.id];
          return next;
        });
      }
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
        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            setHomepage(saved);
            setProductEdits({});
          }}
        >
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
        <h2>Behind the story</h2>
        <p className={styles.panelNote}>
          The turning box with three photos and the short text beside it. The caption is printed on
          the dark side of the box.
        </p>
        <div className={styles.faceGrid}>
          {(["Front", "Side", "Back"] as const).map((name, index) => {
            const photo = behind.photos[index];
            return (
              <div key={name}>
                <p className={styles.faceName}>{name} photo</p>
                {photo.src ? (
                  <div className={styles.coverPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt="" className={styles.facePhoto} />
                    <div className={styles.coverActions}>
                      <PhotoInput
                        disabled={busy}
                        onFile={(file) => upload(file, (url) => setFace(index, { src: url }))}
                      >
                        Replace
                      </PhotoInput>
                    </div>
                  </div>
                ) : (
                  <PhotoInput
                    dropzone
                    disabled={busy}
                    onFile={(file) => upload(file, (url) => setFace(index, { src: url }))}
                  >
                    <strong>Drop a photo</strong>
                    <span>or click to choose</span>
                  </PhotoInput>
                )}
                <label className={styles.field}>
                  Describe it
                  <input
                    value={photo.alt}
                    maxLength={500}
                    onChange={(event) => setFace(index, { alt: event.target.value })}
                  />
                </label>
              </div>
            );
          })}
        </div>

        <label className={styles.field}>
          Caption on the box
          <textarea
            rows={2}
            value={behind.caption}
            maxLength={60}
            onChange={(event) => setBehind({ caption: event.target.value })}
          />
          <small>Press Enter to start a second line, e.g. “Look 12,” then “five pieces”.</small>
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            Title
            <input
              value={behind.title}
              maxLength={160}
              onChange={(event) => setBehind({ title: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            Small label
            <input
              value={behind.label}
              maxLength={60}
              onChange={(event) => setBehind({ label: event.target.value })}
            />
          </label>
        </div>
        <label className={styles.field}>
          Text
          <textarea
            rows={3}
            value={behind.body}
            maxLength={600}
            onChange={(event) => setBehind({ body: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          “Continue reading” goes to
          <select value={behind.link} onChange={(event) => setBehind({ link: event.target.value })}>
            <option value="">The cover story</option>
            {articles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title}
              </option>
            ))}
          </select>
        </label>
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
                const swaps = available.filter((p) => p.id !== product.id);
                return (
                  <li key={piece.productId}>
                    <PhotoInput
                      bare
                      className={styles.pieceThumb}
                      disabled={busy}
                      onFile={(file) =>
                        upload(file, (url) => editProduct(product.id, { photo: url }))
                      }
                    >
                      {product.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.photo} alt="" />
                      )}
                      <span className={styles.thumbHint}>Change photo</span>
                    </PhotoInput>
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
                      <input
                        type="url"
                        aria-label={`Shop link for ${product.name}`}
                        placeholder="Shop link, https://…"
                        value={product.url}
                        onChange={(event) => editProduct(product.id, { url: event.target.value })}
                      />
                      <select
                        aria-label={`Swap ${product.name} for another product`}
                        value=""
                        disabled={swaps.length === 0}
                        onChange={(event) => event.target.value && swap(index, event.target.value)}
                      >
                        <option value="">⇄ Swap for another product…</option>
                        {swaps.map((other) => (
                          <option key={other.id} value={other.id}>
                            {other.name}
                            {other.brand && ` · ${other.brand}`} · {formatPrice(other.price)}
                          </option>
                        ))}
                      </select>
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
                        className={styles.setAsideButton}
                        title="Take it out of the look but keep it below, ready to put back"
                        onClick={() => setPieceAside(index)}
                      >
                        Set aside
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className={styles.panelNote}>
              Shop links and photos changed here are saved to the product, so they update everywhere
              it appears.
            </p>
            <label className={styles.field}>
              Add a piece
              <select
                value=""
                disabled={available.length === 0}
                onChange={(event) => event.target.value && addPiece(event.target.value)}
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

            {setAside.length > 0 && (
              <div className={styles.setAsideTray}>
                <p className={styles.faceName}>
                  Set aside · {setAside.length} · not shown on the website
                </p>
                <ul>
                  {setAside.map((piece) => {
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
                          <span>{piece.note || "No note"}</span>
                        </div>
                        <button type="button" onClick={() => putBack(piece.productId)}>
                          ↺ Put back
                        </button>
                        <button
                          type="button"
                          className={styles.iconDanger}
                          aria-label={`Forget ${product.name}`}
                          title="Remove from this list (the product itself is kept)"
                          onClick={() =>
                            setLook({
                              setAside: setAside.filter((p) => p.productId !== piece.productId),
                            })
                          }
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      <Toast notice={notice} onDismiss={dismiss} />
    </>
  );
}
