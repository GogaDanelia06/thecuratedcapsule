import { useSyncExternalStore } from "react";
import { isProductId, type ProductId } from "@/content/products";

const storageKey = "the-curated-capsule:saved";
const noProducts: readonly ProductId[] = [];
const listeners = new Set<() => void>();

let fallbackValue: string | null = null;
let snapshotSource: string | null = null;
let snapshot: readonly ProductId[] = noProducts;

function read() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return fallbackValue;
  }
}

function write(value: string) {
  fallbackValue = value;
  try {
    window.localStorage.setItem(storageKey, value);
    return true;
  } catch {
    return false;
  }
}

function parse(value: string | null): readonly ProductId[] {
  if (!value) return noProducts;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isProductId))] : noProducts;
  } catch {
    return noProducts;
  }
}

function getSnapshot() {
  const source = read();
  if (source !== snapshotSource) {
    snapshotSource = source;
    snapshot = parse(source);
  }
  return snapshot;
}

function getServerSnapshot() {
  return noProducts;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(next: (ids: readonly ProductId[]) => readonly ProductId[]) {
  write(JSON.stringify(next(getSnapshot())));
  listeners.forEach((listener) => listener());
}

export function useSavedProductIds() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleSaved(id: ProductId) {
  update((ids) => (ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id]));
}

export function removeSaved(id: ProductId) {
  update((ids) => ids.filter((savedId) => savedId !== id));
}
