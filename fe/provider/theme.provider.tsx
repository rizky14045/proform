"use client";
import dynamic from "next/dynamic";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store";

const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  }
);
import { type ThemeProviderProps } from "next-themes/dist/types";

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme, radius } = useThemeStore();
  return (
    <div
      style={
        {
          "--radius": `${radius}rem`,
        } as React.CSSProperties
      }
      className={cn("theme-" + theme)}
    >
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </div>
  );
}

export default memo(ThemeProvider);
