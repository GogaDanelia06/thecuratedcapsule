import Link from "next/link";
import styles from "./page.module.css";
export const metadata = { title: "Editor sign in", robots: { index: false, follow: false } };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>THE CURATED CAPSULE · EDITOR</p>
        <h1>Your next story starts here.</h1>
        <p>Sign in to write, preview, and manage your articles.</p>
        {params.error && (
          <div role="alert" className={styles.error}>
            {params.error === "configuration"
              ? "Editor access has not been configured. Contact the website administrator."
              : "The username or password is incorrect. Please try again."}
          </div>
        )}
        <form action="/admin/session" method="post">
          <input type="hidden" name="next" value={params.next || "/keystatic"} />
          <label>
            Username
            <input name="username" autoComplete="username" required autoFocus />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Continue to editor →</button>
        </form>
        <p className={styles.note}>
          Your admin sign-in lasts seven days. You may also be asked to connect your GitHub account,
          which gives the editor permission to save your articles.
        </p>
        <Link href="/">← Back to the website</Link>
      </section>
    </main>
  );
}
