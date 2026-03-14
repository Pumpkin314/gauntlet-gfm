import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/nav/site-footer";
import { SiteNav } from "@/components/nav/site-nav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GoFundMe Reimagined",
  description:
    "A reimagined crowdfunding platform — discover fundraisers, donate, and make a difference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SiteNav />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
