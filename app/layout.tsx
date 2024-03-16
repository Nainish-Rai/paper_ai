import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/text-editor.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paper",
  description: "A fullstack notion clone with ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
