import Markdoc, { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import { isImagePath, type ArticleDocument } from "./schema";

function safeUrl(value: unknown, image = false) {
  if (typeof value !== "string") return false;
  if (image) return isImagePath(value);
  return /^(https?:\/\/|mailto:|\/[^/\\]|#)/i.test(value) && !/[\u0000-\u001f]/.test(value);
}

function sanitize(node: RenderableTreeNode | RenderableTreeNode[]) {
  if (Array.isArray(node)) {
    node.forEach(sanitize);
    return;
  }
  if (!Tag.isTag(node)) return;
  if (node.name === "a" && !safeUrl(node.attributes.href)) delete node.attributes.href;
  if (node.name === "img" && !safeUrl(node.attributes.src, true)) {
    node.name = "span";
    node.attributes = {};
    node.children = [];
  }
  node.children.forEach(sanitize);
}
export function renderArticle(document: ArticleDocument) {
  const tree = Markdoc.transform(Markdoc.parse(document.body));
  sanitize(tree);
  const words = document.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return {
    ...document,
    cover: document.cover || null,
    readingTime: `${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
    content: Tag.isTag(tree) ? tree.children : tree,
  };
}
