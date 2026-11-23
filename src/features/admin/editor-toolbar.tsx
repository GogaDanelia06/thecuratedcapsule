"use client";

import type { Editor } from "@tiptap/react";
import { PhotoInput } from "./photo-input";
import styles from "./studio.module.css";

type EditorToolbarProps = {
  editor: Editor | null;
  disabled: boolean;
  onPhoto: (file: File) => void;
  onError: (message: string) => void;
};

export function EditorToolbar({ editor, disabled, onPhoto, onError }: EditorToolbarProps) {
  const run = (command: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => {
    if (editor) command(editor.chain().focus()).run();
  };

  function editLink() {
    if (!editor) return;
    const url = window.prompt(
      "Paste a link beginning with https://",
      editor.getAttributes("link").href || "https://",
    );
    if (url === null) return;
    if (!url) return run((chain) => chain.unsetLink());
    if (!/^https?:\/\//i.test(url)) return onError("Links must begin with https:// or http://.");
    run((chain) => chain.extendMarkRange("link").setLink({ href: url }));
  }

  const buttons = [
    { label: <b>B</b>, title: "Bold", action: () => run((c) => c.toggleBold()) },
    { label: <i>I</i>, title: "Italic", action: () => run((c) => c.toggleItalic()) },
    { label: "Heading", action: () => run((c) => c.toggleHeading({ level: 2 })) },
    { label: "Bullets", action: () => run((c) => c.toggleBulletList()) },
    { label: "Numbered list", action: () => run((c) => c.toggleOrderedList()) },
    { label: "Quote", action: () => run((c) => c.toggleBlockquote()) },
    { label: "Link", action: editLink },
  ];

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
      {buttons.map(({ label, title, action }) => (
        <button
          key={title ?? String(label)}
          type="button"
          title={title}
          disabled={disabled}
          onClick={action}
        >
          {label}
        </button>
      ))}
      <PhotoInput label="+ Photo" disabled={disabled} onFile={onPhoto} />
      <button type="button" title="Undo" disabled={disabled} onClick={() => run((c) => c.undo())}>
        ↶
      </button>
      <button type="button" title="Redo" disabled={disabled} onClick={() => run((c) => c.redo())}>
        ↷
      </button>
    </div>
  );
}
