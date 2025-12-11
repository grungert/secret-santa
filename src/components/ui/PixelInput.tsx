"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "font-pixel text-xl px-4 py-3 bg-black/60 border-4 text-white placeholder-gray-500 backdrop-blur-sm",
          "focus:outline-none transition-all duration-200",
          error
            ? "border-neon-red focus:border-neon-red neon-glow-red"
            : "border-neon-cyan/50 focus:border-neon-cyan focus:neon-glow-cyan",
          className
        )}
        style={{
          boxShadow: error
            ? "0 0 10px var(--neon-red-glow)"
            : undefined,
        }}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";

export default PixelInput;
