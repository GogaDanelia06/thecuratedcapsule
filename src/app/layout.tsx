import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { site } from "@/lib/site";
import styles from "./layout.module.css";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni-moda",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: site.url,
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${jost.variable}`}>
      <body>
        <a href="#content" className={styles.skipLink}>
          Skip to content
        </a>
        <div className={styles.page}>
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
