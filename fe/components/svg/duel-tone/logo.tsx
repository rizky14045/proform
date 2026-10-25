import React from "react";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: number;
  height?: number;
}

function Logo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} {...props}>
      <img
        src="/logo.png"
        alt="INTERLOGS Logo"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default Logo;
