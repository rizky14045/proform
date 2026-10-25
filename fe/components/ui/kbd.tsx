import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const kbdVariants = cva(
  "px-3 h-8 inline-flex border border-border leading-none [&>abbr]:leading-none border-default-300 space-x-0.5 items-center font-medium text-center bg-default-100 text-default-600 rounded-xl",
  {
    variants: {
      variant: {
        default: "iam-default",
      },
      size: {
        sm: "h-7 text-xs [&>abbr]:text-sm rounded-lg",
        md: "text-sm [&>abbr]:text-lg",
        lg: "px-4 h-9 [&>abbr]:text-xl text-base",
        xl: "px-4 h-10 [&>abbr]:text-2xl text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default";
  keys: string[];
}

function Kbd({ className, keys, children, variant, size, ...props }: KbdProps) {
  const kbdKeysMap: Record<string, string> = {
    command: "⌘",
    shift: "⇧",
    ctrl: "⌃",
    option: "⌥",
    enter: "↵",
    delete: "⌫",
    escape: "⎋",
    tab: "⇥",
    capslock: "⇪",
    up: "↑",
    right: "→",
    down: "↓",
    left: "←",
    pageup: "⇞",
    pagedown: "⇟",
    home: "↖",
    end: "↘",
    help: "?",
    space: "␣",
  };

  const getKeys = keys.map((key) => {
    const keyLabel = kbdKeysMap[key] ?? key.toUpperCase();
    return (
      <abbr
        key={key}
        title={`key-${key}`}
        className="no-underline leading-none"
      >
        {keyLabel}
      </abbr>
    );
  });

  return (
    <kbd
      data-slot="kbd"
      role="kbd"
      className={cn(kbdVariants({ variant, size }), className)}
      {...props}
    >
      {getKeys}
      {children && <span className="leading-none">{children}</span>}
    </kbd>
  );
}

export { Kbd };
