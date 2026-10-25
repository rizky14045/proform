import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const timelineItemVariants = cva("timeline-item relative pb-10 ", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
const timelineVariants = cva(" flex grow  flex-col", {
  variants: {
    position: {
      right: "right",
      left: "left",
      alternate: "alternate",
      "alternate-reverse": "alternate-reverse",
    },
  },

  defaultVariants: {
    position: "right",
  },
});

interface CompoundVariant {
  variant: "ghost" | "outline" | "ping";
  color:
    | "default"
    | "primary"
    | "secondary"
    | "warning"
    | "destructive"
    | "success"
    | "info";
  className: string;
}

const dotVariants = cva(
  "  h-4 w-4  rounded-full flex  items-center justify-center",
  {
    variants: {
      color: {
        default: "bg-default-200",
        primary: "bg-primary",
        secondary: "bg-secondary",
        warning: "bg-warning",
        destructive: "bg-destructive",
        success: "bg-success",
        info: "bg-info",
      },
      variant: {
        ghost: "bg-transparent",
        outline: "bg-transparent  border-2 border-current",
        ping: "tm-dot-ping",
      },
    },
    compoundVariants: [
      ...[
        "destructive",
        "success",
        "info",
        "warning",
        "dark",
        "secondary",
        "primary",
      ].map((color) => ({
        variant: "outline",
        color,
        className: `border-${color}`,
      })),
      ...[
        "destructive",
        "success",
        "info",
        "warning",
        "dark",
        "secondary",
        "primary",
      ].map((color) => ({
        variant: "ping",
        className: `before:bg-${color}`,
      })),
    ] as CompoundVariant[],

    defaultVariants: {
      color: "default",
    },
  }
);

interface TimelineProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof timelineVariants> {
  children?: React.ReactNode;

  disabled?: boolean;
  current?: number;
  content?: string;
  icon?: boolean;
  alternativeLabel?: boolean;
  gap?: boolean;
  size?: any;
}

function Timeline({
  className,
  children,
  position,
  disabled,
  size,
  current,
  content,
  icon,
  alternativeLabel,
  gap,
  ...props
}: React.ComponentProps<"ol"> & TimelineProps) {
  const childItem = React.Children.toArray(children);
  return (
    <ol
      className={cn(timelineVariants({ position }), className, {
        "space-y-2": gap,
      })}
      {...props}
    >
      {childItem.map((child, index) => {
        const isLast = index === childItem.length - 1;
        const even = index % 2 === 0;
        const odd = index % 2 !== 0;
        return React.cloneElement(child as React.ReactElement, {
          ...props,
          isLast,

          disabled: disabled && !isLast,
          index: index,
          current: current,

          gap: gap,
          position: position,
          even: even,
          odd: odd,
          alternativeLabel: alternativeLabel,
          content: content,
        });
      })}
    </ol>
  );
}

interface TimelineItemProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof timelineItemVariants> {
  children?: React.ReactNode;

  isLast?: boolean;
  current?: number;
  index?: number;
  icon?: boolean;
  gap?: boolean;
  position?: string;
  even?: boolean;
  odd?: boolean;
  alternativeLabel?: boolean;
  content?: string;
  size?: string;
  disabled?: boolean;
}

function TimelineItem({
  className,
  children,
  variant,
  size,
  isLast,
  current,
  index,
  icon,
  gap,
  position,
  alternativeLabel,
  even,
  odd,
  content,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & TimelineItemProps) {
  return (
    <>
      <li
        className={cn(timelineItemVariants({ variant }), className, {
          "[&_.tm-separator]:right-0! [&_.tm-separator]:left-[unset]!  [&_.tm-content-wrapper]:text-right! [&_.tm-content-wrapper]:pr-8!":
            position === "left",
          "[&_.tm-separator]:ltr:left-0! [&_.tm-content-wrapper]:ltr:pl-8! [&_.tm-separator]:rtl:right-0! [&_.tm-separator]:rtl:left-[unset]!  [&_.tm-content-wrapper]:rtl:text-right! [&_.tm-content-wrapper]:rtl:pr-8!":
            position === "right" || position === undefined,
          "w-1/2 ":
            position === "alternate" || position === "alternate-reverse",
          "ml-auto! rtl:mr-auto!   [&_.tm-content-wrapper]:pl-8!  [&_.tm-content-wrapper]:rtl:pr-8! ":
            (position === "alternate" && even) ||
            (position === "alternate-reverse" && odd),
          "rtl:mr-auto! [&_.tm-separator]:right-[-17px]! [&_.tm-separator]:rtl:right-[-8px]!  [&_.tm-separator]:left-[unset]! [&_.tm-content-wrapper]:text-right! [&_.tm-content-wrapper]:pr-4! [&_.tm-content-wrapper]:rtl:pl-4!":
            (position === "alternate" && odd) ||
            (position === "alternate-reverse" && even),
          "[&_.tm-connector]:mt-2!": gap,
        })}
        {...props}
      >
        {children}
      </li>
    </>
  );
}

// time line separator

function TimelineSeparator({
  className,
  children,
  isLast,
  current,
  index,
  gap,
  position,
  even,
  odd,
  alternativeLabel,
  content,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  isLast?: boolean;
  current?: number;
  index?: number;
  gap?: boolean;
  position?: string;
  even?: boolean;
  odd?: boolean;
  alternativeLabel?: boolean;
  content?: string;
}) {
  return (
    <div
      className={cn(
        "absolute h-full top-[3px]  flex flex-col items-center tm-separator",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TimelineDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotVariants> {
  children?: React.ReactNode;

  color?:
    | "default"
    | "primary"
    | "secondary"
    | "warning"
    | "destructive"
    | "success"
    | "info";
  variant?: "ghost" | "outline" | "ping";
}

function TimelineDot({
  className,
  children,
  color,
  variant,
  ...props
}: React.ComponentProps<"div"> & TimelineDotProps) {
  return (
    <div className={cn(dotVariants({ color, variant }), className)} {...props}>
      <span>{children}</span>
    </div>
  );
}

function TimelineConnector({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grow w-[2px] bg-default-200 tm-connector ", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function TimelineContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("tm-content-wrapper", className)} {...props}>
      <div className="tm-content">{children}</div>
    </div>
  );
}

function TimelineOppositeContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("tm-opposite-content", className)} {...props}>
      {children}
    </div>
  );
}

export {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineOppositeContent,
};
