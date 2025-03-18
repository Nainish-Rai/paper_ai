import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/text-editor.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "../styles/globals.css";
import "../styles/text-editor.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/auth/provider";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paper AI",
  description: "Your modern Next.js application with theme support",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <AuthProvider>
              <QueryProvider>{children}</QueryProvider>
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
