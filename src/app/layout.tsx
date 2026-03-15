import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { SiteFooter } from "@/components/nav/site-footer";
import { SiteNav } from "@/components/nav/site-nav";

const dmSans = DM_Sans({
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
      <body className={`${dmSans.variable} antialiased`}>
        <AnalyticsProvider>
          <SiteNav />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <SiteFooter />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
