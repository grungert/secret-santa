"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "font-pixel uppercase tracking-wider border-4 transition-all duration-150 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";

    const variants = {
      primary:
        "bg-santa-red border-santa-red-dark text-snow-white hover:bg-santa-red-dark pixel-shadow hover:pixel-shadow-hover",
      secondary:
        "bg-christmas-green border-christmas-green-dark text-snow-white hover:bg-christmas-green-dark pixel-shadow hover:pixel-shadow-hover",
      danger:
        "bg-red-600 border-red-800 text-snow-white hover:bg-red-700 pixel-shadow hover:pixel-shadow-hover",
      success:
        "bg-emerald-600 border-emerald-800 text-snow-white hover:bg-emerald-700 pixel-shadow hover:pixel-shadow-hover",
    };

    const sizes = {
      sm: "px-3 py-1 text-lg",
      md: "px-6 py-2 text-xl",
      lg: "px-8 py-3 text-2xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";

export default PixelButton;
