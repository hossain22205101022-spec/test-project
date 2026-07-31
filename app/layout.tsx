import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicLayout from "@/app/components/PublicLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StyleFeed — Discover, Shop, and Share Style Inspiration",
    template: "%s | StyleFeed",
  },
  description:
    "Discover trending fashion and lifestyle content from top creators. Shop curated products and share your favorite styles.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://stylefeed.com"
  ),
  openGraph: {
    type: "website",
    siteName: "StyleFeed",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-bg min-h-screen flex flex-col`}>
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  );
}
