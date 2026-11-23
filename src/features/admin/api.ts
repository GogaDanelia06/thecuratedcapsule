import type { ArticleDocument, Draft, Homepage, Product } from "@/lib/cms/schema";

export type SaveAction = "save" | "publish" | "unpublish";

/** Calls an admin API route and returns its JSON, or throws a readable error. */
async function call<T>(url: string, method: string, body: BodyInit, fallback: string): Promise<T> {
  const headers: HeadersInit =
    typeof body === "string" ? { "Content-Type": "application/json" } : {};
  let response: Response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch {
    throw new Error("No connection. Your changes are still here; try again in a moment.");
  }
  // The proxy redirects to the sign-in page when the session has expired.
  if (response.redirected || response.status === 401) {
    throw new Error("Your session expired. Sign in again in another tab, then retry.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || fallback);
  return result;
}

export function saveArticle(draft: Draft, document: ArticleDocument, action: SaveAction) {
  return call<{ draft: Draft }>(
    "/admin/api/articles",
    "POST",
    JSON.stringify({ id: draft.id, revision: draft.revision, document, action }),
    "Your changes could not be saved.",
  );
}

export function deleteArticle(id: string) {
  return call<{ deleted: true }>(
    "/admin/api/articles",
    "DELETE",
    JSON.stringify({ id }),
    "The article could not be deleted.",
  );
}

export function uploadPhoto(file: File) {
  const body = new FormData();
  body.append("file", file);
  return call<{ url: string }>("/admin/api/upload", "POST", body, "Photo upload failed.");
}

export function saveProduct(product: Product, mode: "create" | "update") {
  return call<{ product: Product }>(
    "/admin/api/products",
    "POST",
    JSON.stringify({ mode, product }),
    "The product could not be saved.",
  );
}

export function deleteProduct(id: string) {
  return call<{ deleted: true }>(
    "/admin/api/products",
    "DELETE",
    JSON.stringify({ id }),
    "The product could not be deleted.",
  );
}

export function saveHomepage(homepage: Homepage) {
  return call<{ homepage: Homepage }>(
    "/admin/api/homepage",
    "POST",
    JSON.stringify(homepage),
    "The homepage could not be saved.",
  );
}

/** Compares two articles regardless of key order (the database reorders JSON keys). */
export function sameDocument(a: ArticleDocument, b: ArticleDocument) {
  const keys = Object.keys(a).sort();
  return JSON.stringify(a, keys) === JSON.stringify(b, keys);
}
