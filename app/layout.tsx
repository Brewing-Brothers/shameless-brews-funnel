import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shameless Brews — Homegrown Hand-Pressed Organic Juice",
  description:
    "Cold-pressed organic juice in reusable glass jars. Homegrown citrus from Carmichael, CA. No additives, no sugar, no preservatives. Real juice, nothing fake.",
  keywords: [
    "organic juice",
    "cold pressed juice",
    "Carmichael CA",
    "glass jar juice",
    "homegrown citrus",
    "fresh juice delivery",
  ],
  openGraph: {
    title: "Shameless Brews — Homegrown Hand-Pressed Organic Juice",
    description:
      "Cold-pressed organic juice in reusable glass jars. From our trees to your jar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
