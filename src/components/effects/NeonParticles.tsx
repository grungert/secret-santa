"use client";

import { useEffect, useRef } from "react";

interface NeonParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  glowColor: string;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface NeonParticlesProps {
  density?: number;
  className?: string;
}

const NEON_COLORS = [
  { color: "#39ff14", glow: "rgba(57, 255, 20, 0.6)" },   // green
  { color: "#ff00ff", glow: "rgba(255, 0, 255, 0.6)" },   // pink
  { color: "#00ffff", glow: "rgba(0, 255, 255, 0.6)" },   // cyan
  { color: "#ffff00", glow: "rgba(255, 255, 0, 0.6)" },   // yellow
  { color: "#ff6600", glow: "rgba(255, 102, 0, 0.6)" },   // orange
];

export default function NeonParticles({ density = 40, className = "" }: NeonParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<NeonParticle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: density }, () => {
        const colorSet = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5 - 0.3, // Slight upward drift
          color: colorSet.color,
          glowColor: colorSet.glow,
          opacity: Math.random() * 0.5 + 0.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.05 + 0.02,
        };
      });
    };
    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += particle.pulseSpeed;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Calculate pulsing opacity
        const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.2;

        // Draw glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.glowColor;

        // Draw particle (pixel square)
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0.1, pulseOpacity);

        const x = Math.round(particle.x);
        const y = Math.round(particle.y);
        const size = Math.round(particle.size);

        ctx.fillRect(x, y, size, size);

        // Reset shadow for next particle
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-5 ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
