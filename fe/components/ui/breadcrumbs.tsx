import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";

const breadcrumbItemsVariants = cva(
  " flex gap-1 items-center transition  underline-offset-4 ",
  {
    variants: {
      color: {
        default:
          "text-default-600 hover:default-600/80 data-[state=active]:text-primary aria-[current=page]:text-primary",
        primary:
          "text-primary/80 hover:text-primary/60 data-[state=active]:text-primary aria-[current=page]:text-primary",
        success:
          "text-success/80 hover:text-success/60 data-[state=active]:text-success aria-[current=page]:text-success",
        info: "text-info/80 hover:text-info/60 data-[state=active]:text-info aria-[current=page]:text-info",
        warning:
          "text-warning/80  hover:text-warning/60 data-[state=active]:text-warning aria-[current=page]:text-warning",
        destructive:
          "text-destructive/80  hover:text-destructive/60 data-[state=active]:text-destructive aria-[current=page]:text-destructive",
      },

      underline: {
        none: "no-underline",
        hover: "hover:underline",
        always: "underline",
        active: "active:underline",
        focus: "focus:underline",
      },
      size: {
        md: "text-base",
        sm: "text-sm",
        lg: "text-lg",
      },
    },

    defaultVariants: {
      color: "default",
      size: "sm",
      underline: "none",
    },
  }
);
const breadcrumbsVariants = cva(" flex flex-wrap list-none max-w-fit ", {
  variants: {
    variant: {
      default: "default-style",
      solid: " bg-muted p-3 rounded",
      bordered: "border-2 border-border rounded p-3",
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

interface BreadcrumbsProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof breadcrumbsVariants> {
  maxItems?: number;
  itemsBeforeCollapse?: any;
  itemsAfterCollapse?: any;
  renderEllipsis?: React.ReactNode;
  separator?: React.ReactNode;
  itemClasses?: string;
  disabled?: boolean;
  variant?: "solid" | "default" | "bordered";
  underline?: string;
  ellipsisClass?: string;
  size?: any;
  color?: any;
  islast?: boolean;
  iscurrent?: boolean;
}
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({
  className,
  children,
  color,
  islast,
  href,
  size,
  disabled,
  underline,
  startContent,
  endContent,
  separator,
  iscurrent,
  onAction,
  modifier,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & BreadcrumbItemProps) {
  const ariaCurrent = iscurrent ? "page" : null;
  const dataState = iscurrent ? "active" : null;
  const dataDisabled = disabled && !iscurrent ? "true" : null;

  const handleClick = () => {
    if (onAction && !iscurrent) {
      onAction(children);
    }
  };
  return (
    <li className="inline-flex items-center">
      <span
        className={cn(
          breadcrumbItemsVariants({ color, size, underline }),
          className,
          {
            "cursor-pointer": (!iscurrent && onAction) || !islast,
            "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed":
              disabled && !iscurrent,
          }
        )}
        aria-current={ariaCurrent ?? undefined}
        data-state={dataState}
        data-disabled={dataDisabled}
        onClick={handleClick}
        {...props}
      >
        {startContent && <span>{startContent}</span>}
        {href ? <Link href={href}>{children}</Link> : children}
        {endContent && <span>{endContent}</span>}
        {!islast && separator && (
          <span className="separator px-1 cursor-default">{separator}</span>
        )}
      </span>
    </li>
  );
}

function BreadcrumbLink({
  asChild,
  className,
  islast,
  iscurrent,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  asChild?: boolean;
  islast?: boolean;
  iscurrent?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({
  className,
  islast,
  iscurrent,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & {
  islast?: boolean;
  iscurrent?: boolean;
}) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  islast,
  iscurrent,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  islast?: boolean;
  iscurrent?: boolean;
}) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        <Icon icon="heroicons:chevron-right" className="rtl:rotate-180" />
      )}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  islast,
  iscurrent,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & {
  islast?: boolean;
  iscurrent?: boolean;
}) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <Icon icon="heroicons:ellipsis-horizontal" className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

interface BreadcrumbItemProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof breadcrumbsVariants> {
  color?: any;
  size?: any;
  islast?: boolean;
  href?: string;
  disabled?: boolean;
  underline?:
    | "none"
    | "hover"
    | "always"
    | "active"
    | "focus"
    | null
    | undefined;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  separator?: React.ReactNode;
  iscurrent?: boolean;
  onAction?: (value: React.ReactNode) => void;
  modifier?: "solid" | "default" | "bordered";
}

function Breadcrumbs({
  className,
  children,
  maxItems,
  itemsBeforeCollapse,
  itemsAfterCollapse,
  color,
  size,
  disabled,
  separator = (
    <Icon icon="heroicons:chevron-right" className="rtl:rotate-180" />
  ),
  variant,
  underline,
  renderEllipsis,
  ellipsisClass,
  itemClasses,
  ...props
}: React.ComponentPropsWithoutRef<"ol"> & BreadcrumbsProps) {

  const { islast, iscurrent, ...restProps } = props;
  const breadcrumbItems = React.Children.toArray(children);
  const totalItems = breadcrumbItems.length;

  let visibleItems: React.ReactNode[] = breadcrumbItems;
  if (maxItems && totalItems > maxItems) {
    const visibleBefore = Math.min(
      itemsBeforeCollapse,
      totalItems - itemsAfterCollapse
    );
    const visibleAfter = Math.min(
      itemsAfterCollapse,
      totalItems - visibleBefore
    );
    visibleItems = [
      ...breadcrumbItems.slice(0, visibleBefore),
      null, // Placeholder for ellipsis
      ...breadcrumbItems.slice(totalItems - visibleAfter),
    ];
  }
  return (
    <ol className={cn(breadcrumbsVariants({ variant }), className)} {...restProps}>
      {visibleItems.map((child, index) => {
        const islast = index === visibleItems.length - 1;

        const iscurrent =
          islast || (child as React.ReactElement)?.props?.iscurrent;
        if (child === null) {
          return (
            <li
              key={`breadcrumb-ellipsis-${index}`}
              className={cn("flex items-center", {
                "  gap-1 text-base": renderEllipsis,
              })}
            >
              {renderEllipsis ? (
                <div
                  className={cn(
                    "flex gap-1 text-default-600 items-center ",
                    ellipsisClass
                  )}
                >
                  {renderEllipsis}
                  <span className="separator px-1 self-center">
                    {separator ? (
                      separator
                    ) : (
                      <Icon icon="heroicons:chevron-right" />
                    )}
                  </span>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex gap-1 text-default-600  text-base",
                    ellipsisClass
                  )}
                >
                  <span>
                    <Icon icon="heroicons:ellipsis-horizontal" />
                  </span>
                  <span className="separator px-1 self-center">
                    {separator ? (
                      separator
                    ) : (
                      <Icon icon="heroicons:chevron-right" />
                    )}
                  </span>
                </div>
              )}
            </li>
          );
        }
        return React.cloneElement(child as React.ReactElement, {
          ...props,
          islast,
          iscurrent,
          disabled: disabled && !islast,
          separator: separator,
          underline,
          className: cn(
            breadcrumbItemsVariants({ color, size }),
            (child as React.ReactElement).props.className,
            itemClasses
          ),
        });
      })}
    </ol>
  );
}

Breadcrumbs.displayName = "Breadcrumbs";

BreadcrumbItem.displayName = "BreadcrumbItem";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Breadcrumbs,
  BreadcrumbItem,
};
