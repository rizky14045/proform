import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { color, TColor } from "@/lib/type";
const radioVariants = cva(
  "aspect-square h-5 w-5 rounded-full border border-default-400  data-[state=checked]:text-default-700  ring-offset-background  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-default-100 disabled:border-default-400 disabled:opacity-50 [&_svg]:fill-current [&_svg]:text-current cursor-pointer",
  {
    variants: {
      color: {
        primary:
          "data-[state=checked]:border-primary data-[state=checked]:text-primary",
        info: "data-[state=checked]:border-info data-[state=checked]:text-info",
        warning:
          "data-[state=checked]:border-warning data-[state=checked]:text-warning",
        success:
          "data-[state=checked]:border-success data-[state=checked]:text-success",
        destructive:
          "data-[state=checked]:border-destructive data-[state=checked]:text-destructive",
        secondary:
          "data-[state=checked]:border-default-300 data-[state=checked]:text-default-300",
      },
      variant: {
        faded: "",
      },
      radius: {
        none: "",
        sm: "",
        base: "",
        md: "",
        lg: "",
        xl: "",
      },
      size: {
        xs: "h-[14px] w-[14px] [&_svg]:h-2.5 [&_svg]:w-2.5",
        sm: "h-4 w-4 [&_svg]:h-3 [&_svg]:w-3",
        md: "h-5 w-5 [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-6 w-6 [&_svg]:h-5 [&_svg]:w-5",
        xl: "h-7 w-7 [&_svg]:h-6 [&_svg]:w-6",
      },
    },
    compoundVariants: [],

    defaultVariants: {
      color: "primary",
      size: "md",
      radius: "base",
      variant: "faded",
    },
  }
);

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-wrap gap-x-6 gap-y-4", className)}
      {...props}
    />
  );
}

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  icon?: React.ReactNode;
  color?:
    | "primary"
    | "info"
    | "warning"
    | "success"
    | "destructive"
    | "secondary";
}

function RadioGroupItem({
  className,
  children,
  color,
  size,
  radius,
  variant,
  icon = <Circle />,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  RadioGroupItemProps) {
  return (
    <>
      {children ? (
        <div className="flex items-center  gap-2">
          <RadioGroupPrimitive.Item
            className={cn(
              radioVariants({ color, size, radius, variant }),
              className
            )}
            {...props}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              {icon}
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <Label
            htmlFor={props.id}
            className="font-normal text-default-600 cursor-pointer"
          >
            {children}
          </Label>
        </div>
      ) : (
        <RadioGroupPrimitive.Item
          className={cn(
            radioVariants({ color, size, radius, variant }),
            className
          )}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            {icon}
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
      )}
    </>
  );
}

export { RadioGroup, RadioGroupItem };
