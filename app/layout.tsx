import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "yesmad",
  description:
    "Discover and track job listings across multiple ATS platforms. Filter by role type, mark applications, and export to CSV.",
  keywords: [
    "ats search",
    "job search",
    "job tracker",
    "data analyst jobs",
    "job board",
  ],
  openGraph: {
    title: "yesmad",
    description:
      "Fetch and track open roles from multiple ATS platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
