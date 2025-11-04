import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind Channel Pro - Empowering Minds, Growing Businesses",
  description: "Transform your business with Mind Channel's innovative solutions. AI-powered support, business growth strategies, and professional consulting services.",
  keywords: "business solutions, AI consulting, mind channel, business growth, professional services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
