"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg  p-4  flex md:items-center items-start space-x-4 rtl:space-x-reverse ",
  {
    variants: {
      color: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary  text-secondary-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground ",
        dark: "bg-gray-950 text-slate-50 ",
      },
      variant: {
        outline: "border border-current bg-background ",
        soft: "text-current bg-current/10 border-current    ",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "default",
        className: " text-primary  bg-transparent ",
      },
      {
        variant: "outline",
        color: "destructive",
        className: " text-destructive  bg-transparent ",
      },
      {
        variant: "outline",
        color: "success",
        className: " text-success  bg-transparent ",
      },
      {
        variant: "outline",
        color: "info",
        className: " text-info  bg-transparent ",
      },
      {
        variant: "outline",
        color: "warning",
        className: " text-warning  bg-transparent ",
      },
      {
        variant: "outline",
        color: "dark",
        className: " text-dark  bg-transparent ",
      },

      {
        variant: "outline",
        color: "secondary",
        className: " text-default-700 dark:text-default-400  bg-transparent ",
      },
      // soft

      {
        variant: "soft",
        color: "info",
        className: "text-info",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success",
      },
      {
        variant: "soft",
        color: "default",
        className: "text-primary",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "text-card-foreground bg-secondary/40",
      },
    ],
    defaultVariants: {
      color: "default",
    },
  }
);

// Define interface for variant props
interface AlertVariantProps extends VariantProps<typeof alertVariants> {}

// Define interface for remaining HTML attributes
interface AlertHTMLProps extends React.HTMLAttributes<HTMLDivElement> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Merge both interfaces to create final AlertProps
type AlertProps = AlertVariantProps & AlertHTMLProps;

function Alert({
  className,
  color,
  variant,
  dismissible,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };
  return !dismissed ? (
    <div
      role="alert"
      className={cn(alertVariants({ color, variant }), className)}
      {...props}
      {...props}
    >
      {children}
      {dismissible && (
        <button onClick={handleDismiss} className=" grow-0 cursor-pointer">
          <Icon icon="heroicons:x-mark" className="w-5 h-5" />
        </button>
      )}
    </div>
  ) : null;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "mb-2 font-medium leading-none tracking-tight grow text-lg",
        className
      )}
      {...props}
    />
  );
}


function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed grow", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
