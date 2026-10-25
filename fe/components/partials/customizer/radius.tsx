import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store";
import { cn } from "@/lib/utils";

import { themes } from "@/config/thems";
import { useTheme } from "next-themes";

const RadiusInit = () => {
  const { radius, setRadius } = useThemeStore();

  const { resolvedTheme: mode } = useTheme();
  const { theme: config, setTheme: setConfig } = useThemeStore();
  const newTheme = themes.find((theme) => theme.name === config);

  const primaryColor = `hsl(${
    newTheme?.cssVars[mode === "dark" ? "dark" : "light"].primary
  })`;

  return (
    <div
      style={
        {
          "--theme-primary": primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="mb-2 relative inline-block px-3 py-[3px] rounded before:bg-(--theme-primary) before:absolute before:top-0 before:left-0 before:w-full  before:h-full before:rounded before:opacity-10 before:z-[-1]  text-(--theme-primary)  text-xs font-medium">
        Rounded
      </div>
      <div className="grid grid-cols-5 gap-2">
        {["0", "0.3", "0.5", "0.75", "1.0"].map((value) => {
          return (
            <Button
              variant="outline"
              key={value}
              onClick={() => setRadius(parseFloat(value))}
              className={cn(
                "border border-(--theme-primary) hover:border-(theme-primary) text-(--theme-primary) hover:text-primary-foreground hover:!bg-(--theme-primary)",
                {
                  "bg-(--theme-primary) text-primary-foreground":
                    radius === parseFloat(value),
                }
              )}
            >
              {value}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default RadiusInit;
