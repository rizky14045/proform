import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const dialogVariants = cva(
  " fixed  left-1/2 top-1/2 z-9999 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2  bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg grid gap-4",
  {
    variants: {
      size: {
        xs: "md:max-w-[332px] w-[90%]",
        sm: "md:max-w-[384px] w-[90%]",
        md: "md:max-w-[444px] w-[90%]",
        lg: "md:max-w-[536px] w-[90%]",
        xl: "md:max-w-[628px] w-[90%]",
        "2xl": "md:max-w-[720px] w-[90%]",
        "3xl": "md:max-w-[812px] w-[90%]",
        "4xl": "md:max-w-[904px] w-[90%]",
        "5xl": "md:max-w-[996px] w-[90%]",
        full: "h-screen max-w-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed  z-999  inset-0  bg-black/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ",
        className
      )}
      {...props}
    />
  );
}


function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
      {...props}
    />
  );
}


function DialogContent({
  className,
  children,
  size,
  overlayClass,
  overlayScroll = false,
  hiddenCloseIcon = false,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";
  overlayClass?: string;
  overlayScroll?: boolean;
  hiddenCloseIcon?: boolean;
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClass} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogVariants({ size }), className)}
        {...props}
      >
        <DialogTitle className="sr-only">Dialog Title</DialogTitle>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer"
            >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}



function DialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left  relative",
      className
    )}
      {...props}
    />
  );
}


function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 ",
      className
    )}
      {...props}
    />
  );
}



function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}



export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
