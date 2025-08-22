import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Portal Blog",
  description: "Exploring the latest developments in artificial intelligence, machine learning, and the future of technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
