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
          "font-pixel text-xl px-4 py-3 bg-midnight border-4 text-snow-white placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold",
          "transition-all duration-150 pixel-shadow",
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-frost-blue",
          className
        )}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";

export default PixelInput;
