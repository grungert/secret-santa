"use client";

import "./SantaFace.css";
import { cn } from "@/lib/utils";

export type SantaExpression = "naughty" | "nice" | "super-nice";

interface SantaFaceProps {
  expression?: SantaExpression;
  className?: string;
}

export default function SantaFace({ expression = "naughty", className }: SantaFaceProps) {
  return (
    <div className={cn("santa-container", className)}>
      <div className={cn("santa", expression)}>
        <div className="hat">
          <div className="front"></div>
          <div className="tail"></div>
        </div>
        <div className="eye left"></div>
        <div className="brow left"></div>
        <div className="eye right"></div>
        <div className="brow right"></div>
        <div className="ear left"></div>
        <div className="ear right"></div>
        <div className="mustache"></div>
        <div className="nose"></div>
        <div className="mouth"></div>
        <div className="beard"></div>
      </div>
    </div>
  );
}
