"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "dark" | "neonPink" | "neonCyan";
  hover?: boolean;
  glow?: boolean;
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = "default", hover = false, glow = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-black/60 border-neon-cyan/50 backdrop-blur-sm",
      highlight: "bg-black/70 border-neon-pink backdrop-blur-sm neon-glow-pink",
      dark: "bg-black/80 border-neon-purple/50 backdrop-blur-sm",
      neonPink: "bg-black/60 border-neon-pink backdrop-blur-sm",
      neonCyan: "bg-black/60 border-neon-cyan backdrop-blur-sm",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border-4 p-4 transition-all duration-300",
          variants[variant],
          hover && "pixel-hover-lift cursor-pointer hover:neon-glow-pink",
          glow && "neon-card-glow",
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
