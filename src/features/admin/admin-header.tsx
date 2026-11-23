import Link from "next/link";
import styles from "./studio.module.css";

const sections = [
  { href: "/admin", label: "Articles" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/homepage", label: "Homepage" },
] as const;

type Section = (typeof sections)[number]["href"];

export function AdminHeader({ current }: { current: Section }) {
  return (
    <header className={styles.topbar}>
      <Link href="/admin" className={styles.brand}>
        THE CURATED CAPSULE <span>STUDIO</span>
      </Link>
      <nav aria-label="Studio sections" className={styles.sectionNav}>
        {sections.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Account">
        <form method="post" action="/admin/api/refresh">
          <button
            type="submit"
            className={styles.ghost}
            title="Show the latest content on the website now (useful after changes made directly in Supabase)"
          >
            ↻ Refresh website
          </button>
        </form>
        <a href="/" target="_blank" rel="noreferrer">
          View website ↗
        </a>
        <form method="post" action="/admin/session">
          <input type="hidden" name="action" value="logout" />
          <button type="submit">Sign out</button>
        </form>
      </nav>
    </header>
  );
}
