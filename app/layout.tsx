import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/text-editor.css";
import { validateRequest } from "@/lib/lucia/auth";
import { SessionProvider } from "@/lib/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paper",
  description: "A fullstack notion clone with ai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await validateRequest();
  return (
    <html lang="en" className="p-0 m-0   ">
      <SessionProvider value={sessionData}>
        <body className={inter.className}>{children}</body>
      </SessionProvider>
    </html>
  );
}
