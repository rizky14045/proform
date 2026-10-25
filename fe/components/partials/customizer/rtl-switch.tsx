"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { themes } from "@/config/thems";
import { useThemeStore } from "@/store";
import { useRouter, usePathname } from "next/navigation";

const allThemes = [
  { key: "light", label: "Light", icon: "heroicons:sun" },
  { key: "dark", label: "Dark", icon: "heroicons:moon" },
];

const RtlSwitcher = () => {
  const router = useRouter();
  const { isRtl, setRtl } = useThemeStore();
  const pathname = usePathname();

  const handleDirectionChange = (rtl: boolean) => {
    if (pathname) {
      const lang = rtl ? "ar" : "en";
      setRtl(rtl);
      router.push(`/${lang}/${pathname.split("/")[2]}`);
    }
  };
    const { theme, setTheme, resolvedTheme: mode } = useTheme();
    const { theme: config, setTheme: setConfig } = useThemeStore();
    const newTheme = themes.find((theme) => theme.name === config);

  return (
    <div style={{
            "--theme-primary": `hsl(${newTheme?.cssVars[mode === "dark" ? "dark" : "light"].primary
              })`,
          } as React.CSSProperties
          }>
      <div className="mb-2 relative inline-block px-3 py-[3px] rounded-md before:bg-(--theme-primary) before:absolute before:top-0 before:left-0 before:w-full  before:h-full before:rounded before:opacity-10 before:z-[-1]  text-(--theme-primary)  text-xs font-medium">
        Direction
      </div>
      <div className="text-muted-foreground font-normal text-xs mb-4">
        Choose your direction
      </div>
      <div className=" grid grid-cols-2 gap-3">
        <button
          className={cn(
            "border border-border  flex  w-full text-center  text-default-400 items-center justify-center py-[14px]  px-10 rounded relative cursor-pointer",
            {
              "text-(--theme-primary) border-(--theme-primary)": !isRtl,
            }
          )}
          onClick={() => handleDirectionChange(false)}
        >
          Ltr
        </button>
        <button
          className={cn(
            "border border-border flex  w-full text-center items-center justify-center py-[14px]  px-10 rounded relative cursor-pointer text-default-400",
            {
              "text-(--theme-primary) border-(--theme-primary)": isRtl,
            }
          )}
          onClick={() => handleDirectionChange(true)}
        >
          Rtl
        </button>
      </div>
    </div>
  );
};

export default RtlSwitcher;
