"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { PhotoInput } from "./photo-input";
import styles from "./studio.module.css";

type Chain = ReturnType<Editor["chain"]>;

type EditorToolbarProps = {
  editor: Editor | null;
  onPhoto: (file: File) => void;
  onError: (message: string) => void;
};

type Tool = {
  label: ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  action: () => void;
};

export function EditorToolbar({ editor, onPhoto, onError }: EditorToolbarProps) {
  // Re-render only when the formatting under the cursor changes.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bullets: editor?.isActive("bulletList") ?? false,
      numbers: editor?.isActive("orderedList") ?? false,
      quote: editor?.isActive("blockquote") ?? false,
      link: editor?.isActive("link") ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  });

  const run = (command: (chain: Chain) => Chain) => {
    if (editor) command(editor.chain().focus()).run();
  };

  function editLink() {
    if (!editor) return;
    const url = window.prompt(
      "Paste the web address for this link (starting with https://). Leave empty to remove it.",
      editor.getAttributes("link").href || "https://",
    );
    if (url === null) return;
    if (!url || url === "https://")
      return run((chain) => chain.extendMarkRange("link").unsetLink());
    if (!/^https?:\/\//i.test(url)) return onError("Links must begin with https:// or http://.");
    run((chain) => chain.extendMarkRange("link").setLink({ href: url }));
  }

  const groups: Tool[][] = [
    [
      {
        label: <b>B</b>,
        title: "Bold (⌘B)",
        active: state?.bold,
        action: () => run((c) => c.toggleBold()),
      },
      {
        label: <i>I</i>,
        title: "Italic (⌘I)",
        active: state?.italic,
        action: () => run((c) => c.toggleItalic()),
      },
      { label: "Link", title: "Add or edit a link", active: state?.link, action: editLink },
    ],
    [
      {
        label: "H2",
        title: "Section heading",
        active: state?.h2,
        action: () => run((c) => c.toggleHeading({ level: 2 })),
      },
      {
        label: "H3",
        title: "Small heading",
        active: state?.h3,
        action: () => run((c) => c.toggleHeading({ level: 3 })),
      },
      {
        label: "❝",
        title: "Pull quote",
        active: state?.quote,
        action: () => run((c) => c.toggleBlockquote()),
      },
    ],
    [
      {
        label: "•",
        title: "Bulleted list",
        active: state?.bullets,
        action: () => run((c) => c.toggleBulletList()),
      },
      {
        label: "1.",
        title: "Numbered list",
        active: state?.numbers,
        action: () => run((c) => c.toggleOrderedList()),
      },
      { label: "—", title: "Divider line", action: () => run((c) => c.setHorizontalRule()) },
    ],
    [
      {
        label: "↶",
        title: "Undo (⌘Z)",
        disabled: !state?.canUndo,
        action: () => run((c) => c.undo()),
      },
      {
        label: "↷",
        title: "Redo (⇧⌘Z)",
        disabled: !state?.canRedo,
        action: () => run((c) => c.redo()),
      },
    ],
  ];

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
      {groups.map((tools, index) => (
        <div key={index} className={styles.toolGroup}>
          {tools.map(({ label, title, active, disabled, action }) => (
            <button
              key={title}
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={active}
              disabled={!editor || disabled}
              onClick={action}
            >
              {label}
            </button>
          ))}
        </div>
      ))}
      <PhotoInput onFile={onPhoto} disabled={!editor} className={styles.toolPhoto}>
        + Photo
      </PhotoInput>
    </div>
  );
}
