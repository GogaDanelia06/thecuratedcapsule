import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import React from "react";
import styles from "./article-body.module.css";

export function ArticleBody({ content }: { content: RenderableTreeNode | RenderableTreeNode[] }) {
  return <div className={styles.body}>{Markdoc.renderers.react(content, React)}</div>;
}
