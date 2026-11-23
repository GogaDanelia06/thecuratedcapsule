"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { articleSchema, type ArticleDocument, type Draft } from "@/lib/cms/schema";
import { productOptions } from "@/content/products";
import styles from "./studio.module.css";

export function ArticleEditor({initial}: {initial:Draft}) {
  const [document,setDocument] = useState(initial.document);
  const [saved,setSaved] = useState(initial);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [preview,setPreview] = useState(false);
  const [mobile,setMobile] = useState(false);
  const [confirm,setConfirm] = useState<"publish"|"unpublish"|null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const dirty = JSON.stringify(document) !== JSON.stringify(saved.document);
  const editor = useEditor({
    immediatelyRender:false,
    extensions:[StarterKit.configure({heading:{levels:[2,3]},link:{openOnClick:false}}),ImageExtension,Markdown],
    content:initial.document.body, contentType:"markdown",
    editorProps:{attributes:{"aria-label":"Article body",class:styles.prose}},
    onUpdate:({editor}) => setDocument(current => ({...current,body:editor.getMarkdown()})),
  });
  useEffect(() => { editor?.setEditable(!busy); },[editor,busy]);
  useEffect(() => {
    const warn = (event:BeforeUnloadEvent) => { if(dirty) {event.preventDefault();event.returnValue="";} };
    window.addEventListener("beforeunload",warn); return () => window.removeEventListener("beforeunload",warn);
  },[dirty]);
  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({type:"capsule-preview",document},window.location.origin);
    send();
    const ready = (event:MessageEvent) => { if(event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "capsule-preview-ready") send(); };
    window.addEventListener("message",ready);return () => window.removeEventListener("message",ready);
  },[document,preview]);
  const update = <K extends keyof ArticleDocument>(key:K,value:ArticleDocument[K]) => setDocument(current => ({...current,[key]:value}));
  async function save(action:"save"|"publish"|"unpublish") {
    setConfirm(null); setError(""); setMessage("");
    const valid = articleSchema.safeParse(document);
    if(!valid.success) {setError(valid.error.issues[0].message);return;}
    const snapshot = valid.data;
    setBusy(true);
    try {
      const response = await fetch("/admin/api/articles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:saved.id,revision:saved.revision,document:snapshot,action})});
      if(response.redirected) throw new Error("Your session expired. Keep this tab open and sign in again in another tab, then retry.");
      const result = await response.json();
      if(!response.ok) throw new Error(result.error || "Your changes could not be saved.");
      setSaved(result.draft);
      setDocument(snapshot);
      window.history.replaceState(null,"",`/admin/articles/${saved.id}`);
      setMessage(action === "publish" ? "Published. Your article is now live." : action === "unpublish" ? "Unpublished. Your article is now private." : "Draft saved. Your live website has not changed.");
    } catch(error) { setError(error instanceof Error ? error.message : "Connection lost. Your changes are still here; try saving again."); }
    finally {setBusy(false);}
  }
  async function upload(file:File | undefined,cover:boolean) {
    if(!file) return;
    setError("");setMessage("");
    if(file.size>4*1024*1024) {setError("Choose a photo smaller than 4 MB.");return;}
    setBusy(true);
    try {
      const body = new FormData();body.append("file",file);
      const response = await fetch("/admin/api/upload",{method:"POST",body});
      if(response.redirected) throw new Error("Your session expired. Sign in again in another tab and retry.");
      const result = await response.json();if(!response.ok) throw new Error(result.error || "Photo upload failed.");
      if(cover) update("cover",result.url);
      else editor?.chain().focus().setImage({src:result.url,alt:file.name.replace(/\.[^.]+$/,"")}).run();
      setMessage("Photo uploaded. Save your draft to keep it in this article.");
    } catch(error) {setError(error instanceof Error ? error.message : "Upload failed. Please try again.");}
    finally {setBusy(false);}
  }
  function link() {
    if(!editor) return;
    const url = window.prompt("Paste a link beginning with https://",editor.getAttributes("link").href || "https://");
    if(url === null) return;
    if(!url) {editor.chain().focus().unsetLink().run();return;}
    if(!/^https?:\/\//i.test(url)) {setError("Links must begin with https:// or http://.");return;}
    editor.chain().focus().extendMarkRange("link").setLink({href:url}).run();
  }
  const input = (key: "emphasis"|"kicker"|"dek"|"author"|"publishedAt"|"coverAlt",label:string,type="text") => <label className={styles.field}>{label}<input type={type} value={document[key]} onChange={event=>update(key,event.target.value)}/></label>;
  return <main className={styles.studio}>
    <header className={styles.topbar}><a href="/admin" onClick={event=>{if(dirty && !window.confirm("Leave without saving your changes?")) event.preventDefault();}} className={styles.brand}>← ALL ARTICLES<span>THE CURATED CAPSULE</span></a>
      <div className={styles.actions}><span className={styles.saveState}>{busy ? "Working…" : dirty ? "Unsaved changes" : saved.revision ? "Saved" : "New draft"}</span><button disabled={busy} onClick={()=>setPreview(!preview)}>{preview ? "Back to writing" : "Preview"}</button><button disabled={busy} onClick={()=>save("save")}>Save draft</button><button className={styles.primary} disabled={busy} onClick={()=>setConfirm("publish")}>{saved.published_revision ? "Publish changes" : "Publish"}</button></div>
    </header>
    <div className={styles.feedback} aria-live="polite">{error ? <p role="alert" className={styles.error}>{error} <a href="/admin/login" target="_blank" rel="noreferrer">Open sign-in ↗</a></p> : message ? <p className={styles.success}>{message}</p> : <p>{saved.published_revision ? "You are editing a draft. Readers see the last published version until you publish again." : "This article is private. Preview as often as you like before publishing."}</p>}</div>
    {preview ? <section className={styles.previewPanel}><div className={styles.previewTools}><div><strong>Live preview</strong><p>Includes your unsaved changes. Only you can see this.</p></div><div><button aria-pressed={!mobile} onClick={()=>setMobile(false)}>Desktop</button><button aria-pressed={mobile} onClick={()=>setMobile(true)}>Mobile</button></div></div><iframe ref={frame} title="Article website preview" src="/admin/preview" className={mobile ? styles.mobileFrame : styles.desktopFrame}/></section> : <div className={styles.editorGrid}>
      <section className={styles.writing}><p className={styles.eyebrow}>THE NEXT CHAPTER</p><label className={styles.titleLabel}>Article title<input disabled={busy} className={styles.titleInput} value={document.title} placeholder="A story worth sharing…" maxLength={200} onChange={event=>{const title=event.target.value;setDocument(current=>({...current,title,slug:saved.revision===0 && (!current.slug || current.slug===slugify(current.title)) ? slugify(title) : current.slug}));}}/></label>
        <div className={styles.toolbar} aria-label="Text formatting"><button type="button" disabled={busy} title="Bold" onClick={()=>editor?.chain().focus().toggleBold().run()}><b>B</b></button><button disabled={busy} title="Italic" onClick={()=>editor?.chain().focus().toggleItalic().run()}><i>I</i></button><button disabled={busy} onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()}>Heading</button><button disabled={busy} onClick={()=>editor?.chain().focus().toggleBulletList().run()}>Bullets</button><button disabled={busy} onClick={()=>editor?.chain().focus().toggleOrderedList().run()}>Numbered list</button><button disabled={busy} onClick={()=>editor?.chain().focus().toggleBlockquote().run()}>Quote</button><button disabled={busy} onClick={link}>Link</button><label className={styles.uploadLabel}>+ Photo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={event=>{upload(event.target.files?.[0],false);event.target.value="";}}/></label><button disabled={busy} title="Undo" onClick={()=>editor?.chain().focus().undo().run()}>↶</button><button disabled={busy} title="Redo" onClick={()=>editor?.chain().focus().redo().run()}>↷</button></div>
        <EditorContent editor={editor}/><p className={styles.hint}>Write here, select text to format it, or add photos with the toolbar.</p>
      </section>
      <aside className={styles.details}><fieldset disabled={busy}><legend>Article details</legend><span className={styles.badge}>{saved.published_revision === null ? "Private draft" : "Published article"}</span>
        <label className={styles.field}>Web address<input value={document.slug} maxLength={180} onChange={event=>update("slug",event.target.value)}/><small>/articles/{document.slug || "your-article"}</small>{saved.published_revision && <small>Changing this changes the live link when published.</small>}</label>
        {input("kicker","Category")}{input("dek","Subtitle")}{input("author","Author")}{input("publishedAt","Display date","date")}<p className={styles.hint}>The date is shown on the article. It does not schedule publishing.</p>{input("emphasis","Title words to italicize")}
        <div className={styles.field}><span>Cover photo</span>{document.cover && <><div className={styles.coverPreview}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={document.cover} alt={document.coverAlt || "Article cover"}/></div><button type="button" onClick={()=>update("cover","")}>Remove cover</button></>}<label className={styles.uploadLabel}>{document.cover ? "Replace photo" : "+ Upload cover"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event=>{upload(event.target.files?.[0],true);event.target.value="";}}/></label><small>JPG, PNG, WebP, or AVIF · up to 4 MB</small></div>
        {input("coverAlt","Describe the cover photo")}
        <details className={styles.products}><summary>Shop this article ({document.products.length})</summary>{productOptions.map(option=><label key={option.value}><input type="checkbox" checked={document.products.includes(option.value)} onChange={event=>update("products",event.target.checked ? [...document.products,option.value] : document.products.filter(value=>value!==option.value))}/>{option.label}</label>)}</details>
        {saved.published_revision !== null && <div className={styles.unpublish}><a href={`/articles/${saved.document.slug}`} target="_blank" rel="noreferrer">View published article ↗</a><button type="button" onClick={()=>setConfirm("unpublish")}>Unpublish article</button><small>Removes it from the public website and keeps your draft.</small></div>}
      </fieldset></aside>
    </div>}
    {confirm && <div className={styles.modalBackdrop}><section className={styles.modal} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">{confirm === "publish" ? "Ready for your readers?" : "Take this article offline?"}</h2><p>{confirm === "publish" ? "This version will become visible on the website immediately. You can continue editing a private draft afterward." : "Readers will no longer see this article. Your draft and photos will be kept."}</p><div className={styles.actions}><button autoFocus onClick={()=>setConfirm(null)}>Keep editing</button><button className={styles.primary} onClick={()=>save(confirm)}>{confirm === "publish" ? "Publish now" : "Unpublish"}</button></div></section></div>}
  </main>;
}
function slugify(value:string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,180); }
