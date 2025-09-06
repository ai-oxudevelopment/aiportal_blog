import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Workplace Blog",
  description: "Your source for AI workplace insights, research, and industry updates",
  openGraph: {
    title: "AI Workplace Blog",
    description: "Your source for AI workplace insights, research, and industry updates",
    url: "",
    siteName: "AI Workplace Blog",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Script 
          type="module" 
          strategy="afterInteractive" 
          src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js" 
        />
      </body>
    </html>
  );
}