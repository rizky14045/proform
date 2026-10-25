"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeChange from "./theme-change";
import SidebarChange from "./sidebar-change";
import SidebarImage from "./sidebar-image";
import SelectLayout from "./select-layout";
import SelectTheme from "./select-theme";
import HeaderStyle from "./header-style";
import FooterStyle from "./footer-style";
import RtlSwitcher from "./rtl-switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import RadiusInit from "./radius";
import { Settings } from "@/components/svg";
import Link from "next/link";
import { useThemeStore } from "@/store";
import { themes } from "@/config/thems";
import { useTheme } from "next-themes";

const ThemeCustomize = ({
  trigger = (
    <div className="fixed ltr:right-4 rtl:left-4 bottom-14 z-50">
      <Button size="icon" className=" relative h-12 w-12  rounded-full ">
        <Settings className="h-7 w-7 animate-spin" />
      </Button>
    </div>
  ),
}) => {
  const { isRtl } = useThemeStore();

  const { theme, setTheme, resolvedTheme: mode } = useTheme();
  const { theme: config, setTheme: setConfig, layout } = useThemeStore();
  const newTheme = themes.find((theme) => theme.name === config);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={isRtl ? "left" : "right"}
        overlayClass="bg-transparent backdrop-blur-none"
        className="lg:w-3/4 w-full max-w-full md:max-w-sm px-6 pt-0 pb-6 dark:bg-[#262626]"
      >
        <SheetHeader className=" text-start border-b border-border -mx-6 px-6 py-4 shadow-sm md:shadow-none">
          <SheetTitle className=" text-base  font-medium ">
            Theme Customizer
          </SheetTitle>
        </SheetHeader>
        <SheetDescription className="hidden" />
        <ScrollArea className="h-[calc(100%-120px)] -mx-6 px-6">
          <div className=" space-y-8 mt-3">
            <SelectLayout />
            <SelectTheme />
            <RtlSwitcher />
            <ThemeChange />
            <SidebarChange />
            <SidebarImage />
            <RadiusInit />
            <HeaderStyle />
            <FooterStyle />
          </div>
        </ScrollArea>
        <SheetFooter className="  ">
          <div
            style={
              {
                "--theme-primary": `hsl(${
                  newTheme?.cssVars[mode === "dark" ? "dark" : "light"].primary
                })`,
              } as React.CSSProperties
            } className="w-full flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 py-4 gap-3 lg:flex justify-between hidden"
          >
            <Button asChild className="w-full bg-(--theme-primary) hover:bg-(--theme-primary)">
              <Link href="https://1.envato.market/vNaJR3">Buy Now</Link>
            </Button>
            <Button asChild className="w-full bg-(--theme-primary) hover:bg-(--theme-primary)">
              <Link
                href="https://themeforest.net/user/codeshaperbd/portfolio"
                target="__blank"
              >
                Our Portfolio
              </Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ThemeCustomize;
