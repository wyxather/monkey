"use client";

import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useRouter } from "next/navigation";

export function Providers(props: React.PropsWithChildren<ThemeProviderProps>) {
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push}>
      <ThemeProvider {...props}>{props.children}</ThemeProvider>
    </NextUIProvider>
  );
}
