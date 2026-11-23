"use client";

import ImageExtension from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { articleSchema, type ArticleDocument, type Draft } from "@/lib/cms/schema";
import { slugify } from "@/lib/cms/slug";
import { deleteArticle, sameDocument, saveArticle, uploadPhoto, type SaveAction } from "./api";
import { ArticleDetails } from "./article-details";
import { ConfirmDialog, type DialogAction } from "./confirm-dialog";
import { EditorToolbar } from "./editor-toolbar";
import { PreviewPanel } from "./preview-panel";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

type Dialog = "publish" | "unpublish" | "delete" | "leave";

export function ArticleEditor({ initial }: { initial: Draft }) {
  const [document, setDocument] = useState(initial.document);
  // The draft as the server last confirmed it, and the document that was saved with it.
  const [saved, setSaved] = useState(initial);
  const [savedDocument, setSavedDocument] = useState(initial.document);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [preview, setPreview] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const dirty = !sameDocument(document, savedDocument);
  const isNew = saved.revision === 0;
  const published = saved.published_revision !== null;
  const live = published && saved.published_revision === saved.revision;
  const liveUrl = `/articles/${saved.document.slug}`;
  const dismiss = useCallback(() => setNotice(null), []);
  // Set just before navigating away on purpose, so the tab-close warning stays quiet.
  const leaving = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      ImageExtension,
      Markdown,
    ],
    content: initial.document.body,
    contentType: "markdown",
    editorProps: { attributes: { "aria-label": "Article body", class: styles.prose } },
    onUpdate: ({ editor }) =>
      setDocument((current) => ({ ...current, body: editor.getMarkdown() })),
  });

  useEffect(() => {
    editor?.setEditable(!busy);
  }, [editor, busy]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!leaving.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function leave(url: string) {
    leaving.current = true;
    window.location.assign(url);
  }

  const update = <K extends keyof ArticleDocument>(key: K, value: ArticleDocument[K]) =>
    setDocument((current) => ({ ...current, [key]: value }));

  /** Runs one server call with the editor locked. Returns false if it failed. */
  async function work(task: () => Promise<Notice | null>) {
    setNotice(null);
    setBusy(true);
    try {
      setNotice(await task());
      return true;
    } catch (error) {
      const text = error instanceof Error ? error.message : "Something went wrong. Try again.";
      setNotice({ kind: "error", text });
      return false;
    } finally {
      setBusy(false);
    }
  }

  function save(action: SaveAction) {
    setDialog(null);
    const valid = articleSchema.safeParse(document);
    if (!valid.success) {
      setNotice({ kind: "error", text: valid.error.issues[0].message });
      return Promise.resolve(false);
    }
    const snapshot = valid.data;
    return work(async () => {
      const { draft } = await saveArticle(saved, snapshot, action);
      setSaved(draft);
      setSavedDocument(snapshot);
      setDocument(snapshot);
      // A new article lives at /admin/articles/new until its first save.
      window.history.replaceState(null, "", `/admin/articles/${draft.id}`);
      const url = `/articles/${snapshot.slug}`;
      if (action === "publish") {
        return {
          kind: "success",
          text: "Published. It's live on the website now.",
          link: { href: url, label: "View article ↗" },
        };
      }
      if (action === "unpublish") {
        return { kind: "success", text: "Unpublished. Readers can no longer see this article." };
      }
      return {
        kind: "success",
        text: published
          ? "Draft saved. Readers still see the published version until you publish again."
          : "Draft saved. Only you can see it.",
      };
    });
  }

  async function saveAndLeave() {
    if (await save("save")) leave("/admin");
  }

  function remove() {
    setDialog(null);
    if (isNew) return leave("/admin");
    return work(async () => {
      await deleteArticle(saved.id);
      leave("/admin?deleted=1");
      return null;
    });
  }

  function upload(file: File, target: "cover" | "body") {
    if (file.size > MAX_PHOTO_BYTES) {
      setNotice({ kind: "error", text: "Choose a photo smaller than 4 MB." });
      return;
    }
    return work(async () => {
      const { url } = await uploadPhoto(file);
      if (target === "cover") update("cover", url);
      else {
        const alt = file.name.replace(/\.[^.]+$/, "");
        editor?.chain().focus().setImage({ src: url, alt }).run();
      }
      return { kind: "success", text: "Photo added. Save or publish to keep it." };
    });
  }

  function setTitle(title: string) {
    setDocument((current) => {
      // Until the first save, keep the web address in step with the title,
      // unless the editor has typed their own.
      const followsTitle = !current.slug || current.slug === slugify(current.title);
      const slug = isNew && followsTitle ? slugify(title) : current.slug;
      return { ...current, title, slug };
    });
  }

  const status = busy
    ? { tone: "busy", label: "Saving…" }
    : dirty
      ? { tone: "dirty", label: "Unsaved changes" }
      : live
        ? { tone: "live", label: "Published · live" }
        : published
          ? { tone: "pending", label: "Saved · changes not published" }
          : isNew
            ? { tone: "draft", label: "New article" }
            : { tone: "draft", label: "Private draft" };

  const dialogs: Record<Dialog, { title: string; body: string; actions: DialogAction[] }> = {
    publish: {
      title: "Ready for your readers?",
      body: "This version will appear on the website straight away. You can keep editing afterwards; readers only see changes when you publish again.",
      actions: [{ label: "Publish now", tone: "primary", onClick: () => save("publish") }],
    },
    unpublish: {
      title: "Take this article offline?",
      body: "Readers will no longer see it. Your draft and photos are kept, and you can publish it again any time.",
      actions: [{ label: "Unpublish", tone: "danger", onClick: () => save("unpublish") }],
    },
    delete: {
      title: "Delete this article?",
      body: published
        ? "It will be removed from the website and from your list. This cannot be undone."
        : "It will be removed from your list. This cannot be undone.",
      actions: [{ label: "Delete forever", tone: "danger", onClick: remove }],
    },
    leave: {
      title: "Save before leaving?",
      body: "You have changes that are not saved yet.",
      actions: [
        { label: "Leave without saving", tone: "danger", onClick: () => leave("/admin") },
        { label: "Save draft & leave", tone: "primary", onClick: saveAndLeave },
      ],
    },
  };

  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <a
          href="/admin"
          className={styles.back}
          onClick={(event) => {
            if (dirty) {
              event.preventDefault();
              setDialog("leave");
            }
          }}
        >
          ← All articles
        </a>
        <span className={styles.status} data-tone={status.tone} role="status">
          {status.label}
        </span>
        <div className={styles.actions}>
          <button type="button" disabled={busy} onClick={() => setPreview(!preview)}>
            {preview ? "Back to writing" : "Preview"}
          </button>
          <button type="button" disabled={busy || (!dirty && !isNew)} onClick={() => save("save")}>
            Save draft
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={busy || (live && !dirty)}
            onClick={() => setDialog("publish")}
          >
            {live && !dirty ? "Published ✓" : published ? "Publish changes" : "Publish"}
          </button>
        </div>
      </header>

      {preview ? (
        <PreviewPanel document={document} />
      ) : (
        <div className={styles.editorGrid}>
          <section className={styles.writing}>
            <label className={styles.titleLabel}>
              Title
              <input
                disabled={busy}
                className={styles.titleInput}
                value={document.title}
                placeholder="A story worth sharing…"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <EditorToolbar
              editor={editor}
              disabled={busy}
              onPhoto={(file) => upload(file, "body")}
              onError={(text) => setNotice({ kind: "error", text })}
            />
            <EditorContent editor={editor} />
          </section>
          <ArticleDetails
            document={document}
            published={published}
            liveUrl={liveUrl}
            isNew={isNew}
            disabled={busy}
            update={update}
            onCover={(file) => upload(file, "cover")}
            onUnpublish={() => setDialog("unpublish")}
            onDelete={() => setDialog("delete")}
          />
        </div>
      )}

      {dialog && (
        <ConfirmDialog
          {...dialogs[dialog]}
          cancelLabel={dialog === "leave" ? "Keep editing" : "Cancel"}
          onCancel={() => setDialog(null)}
        />
      )}
      <Toast notice={notice} onDismiss={dismiss} />
    </main>
  );
}
