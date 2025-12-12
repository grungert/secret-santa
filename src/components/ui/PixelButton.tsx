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
        "bg-[#4a1942] text-[#ffd700] border-[6px] border-t-[#ff69b4] border-l-[#ff69b4] border-b-[#2a0a2a] border-r-[#2a0a2a] shadow-[4px_4px_0_0_#000,inset_2px_2px_0_0_#ff99cc,0_0_20px_#ff69b4,0_0_40px_#ff69b480,0_0_60px_#ff69b440] cursor-pointer hover:cursor-pointer hover:bg-[#5a2952] hover:border-t-[#ff99cc] hover:border-l-[#ff99cc] hover:shadow-[4px_4px_0_0_#000,inset_2px_2px_0_0_#ff99cc,0_0_30px_#ff69b4,0_0_60px_#ff69b4,0_0_80px_#ff69b480] active:border-t-[#2a0a2a] active:border-l-[#2a0a2a] active:border-b-[#ff69b4] active:border-r-[#ff69b4] active:shadow-[2px_2px_0_0_#000,0_0_40px_#ffd700] active:translate-x-[2px] active:translate-y-[2px] animate-retro-glow",
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
