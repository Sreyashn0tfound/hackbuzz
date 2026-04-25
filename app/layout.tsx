import type { Metadata, Viewport } from "next";
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

// 👇 1. ADDED PROPER METADATA
export const metadata: Metadata = {
  title: "Hackbuzz 2026 | The Hive",
  description: "24 hours of pure building, insane energy, and a ₹40,000 prize pool.",
};

// 👇 2. ADDED THE MISSING VIEWPORT BLOCK FOR MOBILE
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      {/* 👇 3. ADDED font-sans BACK IN */}
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}