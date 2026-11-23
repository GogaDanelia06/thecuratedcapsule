import Link from "next/link";
import { databaseConfigured } from "@/lib/supabase/config";
import styles from "./page.module.css";
export const metadata = { title: "Editor sign in", robots: { index: false, follow: false } };
const messages: Record<string,string> = {
  credentials: "The email or password is incorrect. Please try again.",
  configuration: "The article database is not connected yet. The website administrator needs to finish setup.",
  access: "This account does not have editor access. Ask the website administrator to add you.",
  rate: "Too many sign-in attempts. Please wait a few minutes and try again.",
};
export default async function Login({searchParams}: {searchParams: Promise<{error?:string;next?:string}>}) {
  const params = await searchParams;
  const configured = databaseConfigured();
  return <main className={styles.page}><section className={styles.card}>
    <p className={styles.eyebrow}>THE CURATED CAPSULE · EDITOR</p><h1>Your next story starts here.</h1>
    <p>Write, preview, and publish with your editor account.</p>
    {(!configured || params.error) && <div role="alert" className={styles.error}>{messages[!configured ? "configuration" : params.error || "credentials"] || messages.credentials}</div>}
    <form action="/admin/session" method="post">
      <input type="hidden" name="next" value={params.next || "/admin"} />
      <label>Email<input name="email" type="email" autoComplete="username" required autoFocus /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button type="submit" disabled={!configured}>Sign in →</button>
    </form>
    <p className={styles.note}>Use your own email and password. Need access or a password reset? Contact the website administrator.</p>
    <Link href="/">← Back to the website</Link>
  </section></main>;
}
