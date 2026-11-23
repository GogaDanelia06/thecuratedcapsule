"use client";

import ImageExtension from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { articleSchema, type ArticleDocument, type Draft } from "@/lib/cms/schema";
import { slugify } from "@/lib/cms/slug";
import { deleteArticle, sameDocument, saveArticle, uploadPhoto, type SaveAction } from "./api";
import { ArticleDetails } from "./article-details";
import { ConfirmDialog, type DialogAction } from "./confirm-dialog";
import { EditorToolbar } from "./editor-toolbar";
import { PreviewPanel } from "./preview-panel";
import { checklist, countWords } from "./publish-checklist";
import styles from "./studio.module.css";
import { Toast, type Notice } from "./toast";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const AUTOSAVE_DELAY_MS = 2000;

type Dialog = "publish" | "unpublish" | "delete" | "leave";

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export function ArticleEditor({ initial }: { initial: Draft }) {
  const [document, setDocument] = useState(initial.document);
  // The draft as the server last confirmed it, and the document saved with it.
  const [saved, setSaved] = useState(initial);
  const [savedDocument, setSavedDocument] = useState(initial.document);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<SaveAction | "delete" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [preview, setPreview] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  // Saves run one after another so an autosave and a publish never race on the revision.
  const latest = useRef(initial);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  // Set just before navigating away on purpose, so the tab-close warning stays quiet.
  const leaving = useRef(false);
  const titleField = useRef<HTMLTextAreaElement>(null);

  const parsed = articleSchema.safeParse(document);
  const dirty = !sameDocument(parsed.success ? parsed.data : document, savedDocument);
  const isNew = saved.revision === 0;
  const published = saved.published_revision !== null;
  const live = published && saved.published_revision === saved.revision && !dirty;
  const words = countWords(document.body);
  const missing = checklist(document).filter((item) => item.required && !item.done);
  const dismiss = useCallback(() => setNotice(null), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      ImageExtension,
      Markdown,
      Placeholder.configure({
        placeholder:
          "Start writing here. Select words to make them bold or italic, use H2 for section headings and “+ Photo” to add a picture. Your work saves automatically.",
      }),
    ],
    content: initial.document.body,
    contentType: "markdown",
    editorProps: {
      attributes: { "aria-label": "Article text", class: styles.prose },
    },
    onUpdate: ({ editor }) =>
      setDocument((current) => ({ ...current, body: editor.getMarkdown() })),
  });

  // Grow the title box to fit long titles.
  useLayoutEffect(() => {
    const field = titleField.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [document.title, preview]);

  function persist(action: SaveAction, snapshot: ArticleDocument) {
    const run = async () => {
      setSaving(true);
      try {
        const { draft } = await saveArticle(latest.current, snapshot, action);
        latest.current = draft;
        setSaved(draft);
        setSavedDocument(snapshot);
        setSavedAt(new Date());
        // A new article lives at /admin/articles/new until its first save.
        window.history.replaceState(null, "", `/admin/articles/${draft.id}`);
      } finally {
        setSaving(false);
      }
    };
    const next = queue.current.then(run, run);
    queue.current = next.catch(() => {});
    return next;
  }

  // Autosave a couple of seconds after the last change. Only valid drafts are
  // saved; a failed autosave waits for the next edit instead of retrying.
  const autosave = useEffectEvent(() => {
    const result = articleSchema.safeParse(document);
    if (!result.success) return;
    persist("save", result.data).catch((error: Error) => {
      setNotice({ kind: "error", text: `Not saved: ${error.message}` });
    });
  });
  useEffect(() => {
    if (!dirty || running) return;
    const timer = setTimeout(autosave, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [document, dirty, running]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!leaving.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ⌘S / Ctrl+S saves straight away.
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void save("save");
    }
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  function leave(url: string) {
    leaving.current = true;
    window.location.assign(url);
  }

  const update = <K extends keyof ArticleDocument>(key: K, value: ArticleDocument[K]) =>
    setDocument((current) => ({ ...current, [key]: value }));

  /** Saves, publishes or unpublishes on request, with a notification. Returns success. */
  async function save(action: SaveAction) {
    setDialog(null);
    const result = articleSchema.safeParse(document);
    if (!result.success) {
      setNotice({ kind: "error", text: result.error.issues[0].message });
      return false;
    }
    setNotice(null);
    setRunning(action);
    try {
      await persist(action, result.data);
      const url = `/articles/${result.data.slug}`;
      setNotice(
        action === "publish"
          ? {
              kind: "success",
              text: "Published! It's live on the website now.",
              link: { href: url, label: "View article ↗" },
            }
          : action === "unpublish"
            ? { kind: "success", text: "Unpublished. Readers can no longer see this article." }
            : { kind: "success", text: "Saved." },
      );
      return true;
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
      return false;
    } finally {
      setRunning(null);
    }
  }

  async function remove() {
    setDialog(null);
    if (isNew) return leave("/admin");
    setRunning("delete");
    try {
      await queue.current;
      await deleteArticle(latest.current.id);
      leave("/admin?deleted=1");
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
      setRunning(null);
    }
  }

  async function upload(file: File, target: "cover" | "body") {
    if (file.size > MAX_PHOTO_BYTES) {
      setNotice({ kind: "error", text: "That photo is over 4 MB. Choose a smaller one." });
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadPhoto(file);
      if (target === "cover") update("cover", url);
      else {
        const alt = file.name.replace(/\.[^.]+$/, "");
        editor?.chain().focus().setImage({ src: url, alt }).run();
      }
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    } finally {
      setUploading(false);
    }
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

  async function goBack() {
    if (!dirty) return leave("/admin");
    // Valid changes are simply saved on the way out.
    if (parsed.success && (await save("save"))) return leave("/admin");
    setDialog("leave");
  }

  const status =
    running === "publish"
      ? { tone: "busy", label: "Publishing…" }
      : saving
        ? { tone: "busy", label: "Saving…" }
        : dirty
          ? { tone: "dirty", label: parsed.success ? "Editing…" : "Not saved yet" }
          : live
            ? { tone: "live", label: "Live on the website" }
            : published
              ? { tone: "pending", label: "Saved · changes not published yet" }
              : isNew
                ? { tone: "draft", label: "New article" }
                : { tone: "draft", label: "Private draft" };

  const dialogs: Record<Dialog, { title: string; body: string; actions: DialogAction[] }> = {
    publish: {
      title: published ? "Publish your changes?" : "Ready for your readers?",
      body: published
        ? "Readers will see this new version straight away."
        : "This article will appear on the website and in The Edit on the homepage straight away. You can keep editing afterwards.",
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
      title: "Leave without saving?",
      body: parsed.success
        ? "Your latest changes could not be saved."
        : `This article can't be saved yet: ${parsed.error.issues[0].message}`,
      actions: [{ label: "Leave anyway", tone: "danger", onClick: () => leave("/admin") }],
    },
  };

  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <div className={styles.topbarStart}>
          <a
            href="/admin"
            className={styles.back}
            onClick={(event) => {
              event.preventDefault();
              void goBack();
            }}
          >
            ← All articles
          </a>
          <span className={styles.status} data-tone={status.tone} role="status">
            {status.label}
          </span>
          {savedAt && !dirty && !saving && (
            <span className={styles.savedAt}>at {time.format(savedAt)}</span>
          )}
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => setPreview(!preview)}>
            {preview ? "Back to writing" : "Preview"}
          </button>
          {published && (
            <a
              className={styles.ghost}
              href={`/articles/${saved.document.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View live ↗
            </a>
          )}
          <button
            type="button"
            className={styles.primary}
            disabled={running !== null || live || missing.length > 0}
            title={
              missing.length
                ? `Still needed: ${missing.map((item) => item.label).join(", ")}`
                : undefined
            }
            onClick={() => setDialog("publish")}
          >
            {live ? "Published ✓" : published ? "Publish changes" : "Publish"}
          </button>
        </div>
      </header>

      {preview ? (
        <PreviewPanel document={document} />
      ) : (
        <div className={styles.editorGrid}>
          <section className={styles.writing}>
            <div className={styles.paper}>
              <p className={styles.paperKicker}>{document.kicker || "Article"}</p>
              <textarea
                ref={titleField}
                className={styles.titleInput}
                aria-label="Title"
                rows={1}
                value={document.title}
                placeholder="Give your story a title"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  // Titles are one line; Enter moves on to the text.
                  if (event.key === "Enter") {
                    event.preventDefault();
                    editor?.commands.focus("start");
                  }
                }}
              />
              <input
                className={styles.dekInput}
                aria-label="Subtitle"
                value={document.dek}
                placeholder="Add a subtitle (optional)"
                maxLength={1000}
                onChange={(event) => update("dek", event.target.value)}
              />
              <EditorToolbar
                editor={editor}
                onPhoto={(file) => upload(file, "body")}
                onError={(text) => setNotice({ kind: "error", text })}
              />
              <EditorContent editor={editor} />
            </div>
            <footer className={styles.writingFooter}>
              <span>
                {words} {words === 1 ? "word" : "words"} · about{" "}
                {Math.max(1, Math.round(words / 220))} min read
              </span>
              <span>Saves automatically · ⌘S to save now</span>
            </footer>
          </section>
          <ArticleDetails
            document={document}
            published={published}
            liveUrl={`/articles/${saved.document.slug}`}
            isNew={isNew}
            uploading={uploading}
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
