"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "dark";
  hover?: boolean;
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-midnight/80 border-frost-blue",
      highlight: "bg-midnight/90 border-gold",
      dark: "bg-background/90 border-santa-red",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border-4 p-4 pixel-shadow",
          variants[variant],
          hover && "pixel-hover-lift cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PixelCard.displayName = "PixelCard";

export default PixelCard;
