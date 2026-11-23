"use client";
import { useEffect, useState } from "react";
import { ArticlePreview } from "@/features/article/article-preview";
import { emptyArticle, type ArticleDocument } from "@/lib/cms/schema";
export function LivePreview() {
  const [document, setDocument] = useState<ArticleDocument>(emptyArticle);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === window.parent &&
        event.data?.type === "capsule-preview"
      )
        setDocument(event.data.document);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "capsule-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <ArticlePreview document={document} />;
}
