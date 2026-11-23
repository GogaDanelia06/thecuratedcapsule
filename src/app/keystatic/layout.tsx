import KeystaticApp from "./keystatic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export default function KeystaticLayout() {
  return (
    <>
      <KeystaticApp />
      <details
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 100,
          width: "min(360px, calc(100vw - 40px))",
          background: "#fffdf8",
          color: "#14130f",
          border: "1px solid #bbb5aa",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 6px 30px #0002",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Editing guide & sign out</summary>
        <p style={{ marginTop: 12 }}>
          Write your article, save it, then use the preview icon next to Save to see the website
          layout. Preview shows saved changes, including new photos.
        </p>
        <p style={{ marginTop: 12 }}>
          Saving on <strong>main</strong> starts publishing. To work privately, create a branch
          using the branch menu before editing. Preview that branch, then merge it into main when
          ready.
        </p>
        <p style={{ marginTop: 12 }}>
          GitHub sign-in connects the editor to your articles. Use your own authorized account. It
          is separate from your admin password.
        </p>
        <form method="post" action="/admin/session" style={{ marginTop: 12 }}>
          <input type="hidden" name="action" value="logout" />
          <button style={{ textDecoration: "underline" }}>Sign out of admin</button>
        </form>
      </details>
    </>
  );
}
