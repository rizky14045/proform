import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";

function Pagination({
  isDisabled,
  className,
  ...props
}: React.ComponentProps<"nav"> & { isDisabled?: boolean }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        "mx-auto flex w-full justify-center",
        isDisabled,
        className
      )}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, radius, ...props  }: React.ComponentProps<"li"> & { radius?: string }) {
  return <li data-slot="pagination-item" className={cn("", className, radius)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
    className={cn("gap-1 ltr:pl-2.5 rtl:pr-2.5", className)}
      {...props}
    >
    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
    <span>Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
    className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
    <span>Next</span>
    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
    </span>
  )
}


export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
