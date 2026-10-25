import * as React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  merged?: boolean;
}

function InputGroup({ className, merged, ...props }: InputGroupProps) {
  return (
    <div
      className={cn(
        "flex relative flex-wrap items-stretch w-full group input-group  ltr:flex-row rtl:flex-row-reverse",
        className,
        {
          merged: merged,
        }
      )}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("first:*:rounded-r-none last:*:rounded-l-none", className)}
      {...props}
    />
  );
}

function InputGroupText({ className, color, ...props }: React.ComponentProps<"div"> & { color?: "info" | "primary" | "success" | "destructive" | "warning" }) {
  return (
    <div
      className={cn(
      "border border-default-300 text-default-500 text-sm font-normal  bg-background flex items-center justify-center px-3 first:border-r-0 last:border-l-0 first:rounded-l-md last:rounded-r-md group-focus-within:border-primary ring-primary  transition duration-300",
      className,
      {
        "border-info/50 group-focus-within:border-info-700 ring-info-700":
          color === "info",
        "border-primary/50 group-focus-within:border-primary-700 ring-primary-700":
          color === "primary",
        "border-success/50 group-focus-within:border-success-700 ring-success-700":
          color === "success",
        "border-destructive/50 group-focus-within:border-destructive-700 ring-destructive-700":
          color === "destructive",
        "border-warning/50 group-focus-within:border-warning-700 ring-warning-700":
          color === "warning",
      }
    )}
    {...props}
    />
  );
}



export { InputGroup, InputGroupButton, InputGroupText };
