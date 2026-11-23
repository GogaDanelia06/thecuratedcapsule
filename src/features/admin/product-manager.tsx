"use client";

import { useCallback, useState } from "react";
import { productSchema, type Product } from "@/lib/cms/schema";
import { slugify } from "@/lib/cms/slug";
import { formatPrice } from "@/lib/format";
import { deleteProduct, saveProduct, uploadPhoto } from "./api";
import { ConfirmDialog } from "./confirm-dialog";
import { PhotoInput } from "./photo-input";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

const blank: Product = { id: "", name: "", brand: "", price: 0, photo: "", photo_alt: "", url: "" };

type Editing = { product: Product; isNew: boolean };

export function ProductManager({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);

  const needle = query.trim().toLowerCase();
  const shown = products.filter(
    ({ name, brand }) => !needle || `${name} ${brand}`.toLowerCase().includes(needle),
  );

  function saved(product: Product, isNew: boolean) {
    setProducts((current) =>
      (isNew ? [...current, product] : current.map((p) => (p.id === product.id ? product : p)))
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditing(null);
    setNotice({ kind: "success", text: `“${product.name}” saved. The website is updated.` });
  }

  function removed(product: Product) {
    setProducts((current) => current.filter((p) => p.id !== product.id));
    setEditing(null);
    setNotice({ kind: "success", text: `“${product.name}” deleted.` });
  }

  return (
    <>
      <div className={styles.listTools}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search products…"
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className={styles.primary}
          onClick={() => setEditing({ product: blank, isNew: true })}
        >
          + Add product
        </button>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <h2>No products yet.</h2>
          <p>Add the pieces you link to: photo, name, brand, price and the shop link.</p>
        </div>
      ) : shown.length === 0 ? (
        <p className={styles.noResults}>No products match “{query}”.</p>
      ) : (
        <ul className={styles.productGrid}>
          {shown.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className={styles.productTile}
                onClick={() => setEditing({ product, isNew: false })}
              >
                <span className={styles.productPhoto}>
                  {product.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.photo} alt="" />
                  ) : (
                    <span>No photo</span>
                  )}
                </span>
                <strong>{product.name}</strong>
                <span>
                  {[product.brand, formatPrice(product.price)].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductForm
          key={editing.product.id || "new"}
          {...editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
          onDeleted={removed}
        />
      )}
      <Toast notice={notice} onDismiss={dismiss} />
    </>
  );
}

type ProductFormProps = Editing & {
  onClose: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
  onDeleted: (product: Product) => void;
};

function ProductForm({ product, isNew, onClose, onSaved, onDeleted }: ProductFormProps) {
  const [draft, setDraft] = useState(product);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function run(task: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await task();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    // New products get a permanent code from their name; articles refer to it.
    const candidate = { ...draft, id: isNew ? slugify(draft.name).slice(0, 80) : draft.id };
    const valid = productSchema.safeParse(candidate);
    if (!valid.success) return setError(valid.error.issues[0].message);
    if (valid.data.photo && !valid.data.photo_alt.trim()) {
      return setError("Describe the photo so screen-reader users know what it shows.");
    }
    return run(async () => {
      const { product: saved } = await saveProduct(valid.data, isNew ? "create" : "update");
      onSaved(saved, isNew);
    });
  }

  return (
    <div
      className={styles.drawerBackdrop}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className={styles.drawer}
        aria-labelledby="product-form-title"
        onSubmit={save}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
      >
        <header>
          <h2 id="product-form-title">{isNew ? "Add a product" : "Edit product"}</h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <fieldset disabled={busy}>
          {draft.photo ? (
            <div className={styles.coverPreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.photo} alt="" />
              <div className={styles.coverActions}>
                <PhotoInput
                  onFile={(file) => run(async () => update("photo", (await uploadPhoto(file)).url))}
                >
                  Replace
                </PhotoInput>
                <button type="button" onClick={() => update("photo", "")}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <PhotoInput
              dropzone
              onFile={(file) => run(async () => update("photo", (await uploadPhoto(file)).url))}
            >
              <strong>{busy ? "Uploading…" : "Drop the product photo here"}</strong>
              <span>or click to choose · up to 4 MB</span>
            </PhotoInput>
          )}

          <label className={styles.field}>
            Product name
            <input
              autoFocus
              value={draft.name}
              maxLength={200}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Brand
              <input
                value={draft.brand}
                maxLength={120}
                onChange={(event) => update("brand", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              Price (USD)
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={draft.price}
                onChange={(event) => update("price", Math.round(Number(event.target.value)))}
              />
            </label>
          </div>
          <label className={styles.field}>
            Shop link
            <input
              type="url"
              placeholder="https://"
              value={draft.url}
              onChange={(event) => update("url", event.target.value)}
            />
            <small>Where the Buy button takes readers.</small>
          </label>
          {draft.photo && (
            <label className={styles.field}>
              Describe the photo
              <input
                value={draft.photo_alt}
                maxLength={500}
                onChange={(event) => update("photo_alt", event.target.value)}
              />
              <small>Read aloud to people using screen readers.</small>
            </label>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </fieldset>

        <footer>
          {!isNew && (
            <button
              type="button"
              className={styles.danger}
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add product" : "Save changes"}
          </button>
        </footer>
      </form>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this product?"
          body={`“${product.name}” will disappear from every article and from Shop the look. This cannot be undone.`}
          cancelLabel="Cancel"
          actions={[
            {
              label: "Delete forever",
              tone: "danger",
              onClick: () => {
                setConfirmDelete(false);
                void run(async () => {
                  await deleteProduct(product.id);
                  onDeleted(product);
                });
              },
            },
          ]}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
