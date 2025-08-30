import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
export const metadata: Metadata = {
  title: "AI workplace blog",
  description: "Main SEO Blog for project AI Workplace",
  openGraph: {
    title: "AI workplace blog",
    description: "Main SEO Blog for project AI Workplace",
    url: "",
    siteName: "AI workplace blog",
    type: "website"
  }
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" data-oid="b1jifow" suppressHydrationWarning>
      <body className="antialiased" data-oid="hqec2:a">
        {children}
        <Script type="module" strategy="afterInteractive" src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js" data-oid="zxbuq9a" />

      </body>
    </html>;
}