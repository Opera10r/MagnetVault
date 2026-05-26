import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MagnetVault — Lead Magnet Landing Pages + PDF Delivery",
  description: "Create landing pages, auto-generate PDFs from your content, and deliver them to new subscribers instantly. Grow your email list on autopilot.",
  openGraph: {
    title: "MagnetVault — Turn Content Into Lead Magnets",
    description: "Beautiful landing pages. Instant PDF delivery. Subscriber analytics. Start free.",
    siteName: "MagnetVault",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
