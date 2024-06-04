import "server-only";

import "@/styles/globals.css";

import { NavigationBar } from "@/components/client/navigation_bar";
import { Providers } from "@/components/client/providers";
import { getUserSession } from "@/utilities/server/auth";
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
  const user = await getUserSession();
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body>
        <Providers attribute="class" defaultTheme="dark">
          {user && <NavigationBar />}
          <main>{children}</main>
          <footer />
        </Providers>
      </body>
    </html>
  );
}
