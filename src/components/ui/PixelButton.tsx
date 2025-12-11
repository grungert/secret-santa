"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "neonPink" | "neonCyan" | "neonGreen" | "neonOrange" | "neonYellow" | "retro";
  size?: "sm" | "md" | "lg";
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "font-pixel uppercase tracking-wider border-4 transition-all duration-200 active:translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 backdrop-blur-sm";

    const variants = {
      // Neon variants (new 80s style)
      primary:
        "bg-black/40 border-neon-pink text-neon-pink neon-glow-pink hover:bg-neon-pink/20 hover:animate-neon-tube",
      secondary:
        "bg-black/40 border-neon-cyan text-neon-cyan neon-glow-cyan hover:bg-neon-cyan/20 hover:animate-neon-tube",
      danger:
        "bg-black/40 border-neon-red text-neon-red neon-glow-red hover:bg-neon-red/20 hover:animate-neon-tube",
      success:
        "bg-black/40 border-neon-green text-neon-green neon-glow-green hover:bg-neon-green/20 hover:animate-neon-tube",
      neonPink:
        "bg-black/40 border-neon-pink text-neon-pink neon-glow-pink hover:bg-neon-pink/20 hover:animate-neon-tube",
      neonCyan:
        "bg-black/40 border-neon-cyan text-neon-cyan neon-glow-cyan hover:bg-neon-cyan/20 hover:animate-neon-tube",
      neonGreen:
        "bg-black/40 border-neon-green text-neon-green neon-glow-green hover:bg-neon-green/20 hover:animate-neon-tube",
      neonOrange:
        "bg-black/40 border-neon-orange text-neon-orange neon-glow-orange hover:bg-neon-orange/20 hover:animate-neon-tube",
      neonYellow:
        "bg-black/40 border-neon-yellow text-neon-yellow neon-glow-yellow hover:bg-neon-yellow/20 hover:animate-neon-tube",
      retro:
        "bg-[#2d1b4e] border-[#8b5cf6] text-white shadow-[inset_0_-4px_0_0_#1a0f2e,inset_0_4px_0_0_#4c1d95,0_0_20px_#8b5cf680,0_0_40px_#8b5cf640] hover:bg-[#3d2b5e] hover:shadow-[inset_0_-4px_0_0_#1a0f2e,inset_0_4px_0_0_#4c1d95,0_0_30px_#8b5cf6,0_0_60px_#8b5cf680] hover:scale-105 active:shadow-[inset_0_4px_0_0_#1a0f2e,0_0_20px_#8b5cf680]",
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
