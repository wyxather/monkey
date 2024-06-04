import "server-only";

import "@/styles/globals.css";

import { Providers } from "@/components/client/providers";
import { Navbar } from "@/components/server/navbar";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "monkey",
  description: "expense tracker",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body>
        <Providers attribute="class" defaultTheme="dark">
          <Navbar />
          <main>{children}</main>
          <footer />
        </Providers>
      </body>
    </html>
  );
}
