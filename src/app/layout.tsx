import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lavenir — Track your assets. Know your growth.",
  description: "Portfolio tracking for Indonesian investors. Track stocks, crypto, mutual funds and cash in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
