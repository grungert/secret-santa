"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  opacity: number;
  size: number;
  gravity: number;
}

interface Rocket {
  x: number;
  y: number;
  velocityY: number;
  targetY: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number; opacity: number }[];
}

const COLORS = [
  "#ff00ff", // neon-pink
  "#00ffff", // neon-cyan
  "#ffff00", // neon-yellow
  "#39ff14", // neon-green
  "#ff6600", // neon-orange
  "#ff0055", // neon-red
  "#9d00ff", // neon-purple
  "#ffd700", // gold
];

export default function FireworksEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);

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

    const spawnRocket = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Launch from island area (center-bottom) with more variation
      const launchX = canvas.width * 0.5 + (Math.random() - 0.5) * 150;
      const launchY = canvas.height * 0.75;

      rocketsRef.current.push({
        x: launchX,
        y: launchY,
        velocityY: -2 - Math.random() * 2, // Even slower, more varied
        targetY: canvas.height * (0.15 + Math.random() * 0.35), // Explode at 15-50% from top (more variation)
        color,
        exploded: false,
        trail: [],
      });
    };

    const explodeRocket = (rocket: Rocket) => {
      const particleCount = 60 + Math.floor(Math.random() * 30); // More particles

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const speed = 3 + Math.random() * 5; // Bigger spread

        particlesRef.current.push({
          x: rocket.x,
          y: rocket.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          color: rocket.color,
          opacity: 1,
          size: 4 + Math.random() * 4, // Bigger particles
          gravity: 0.03 + Math.random() * 0.02, // Slower fall
        });
      }

      // Add some sparkles with different colors
      const sparkleCount = 20 + Math.floor(Math.random() * 15); // More sparkles
      for (let i = 0; i < sparkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const sparkleColor = COLORS[Math.floor(Math.random() * COLORS.length)];

        particlesRef.current.push({
          x: rocket.x,
          y: rocket.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          color: sparkleColor,
          opacity: 1,
          size: 2 + Math.random() * 2, // Bigger sparkles
          gravity: 0.015, // Slower fall for sparkles
        });
      }
    };

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new rockets with random timing (3-6 seconds)
      if (timestamp - lastSpawnRef.current > 3000 + Math.random() * 3000) {
        spawnRocket();
        // Sometimes spawn 2-3 rockets at once for burst effect
        if (Math.random() > 0.6) {
          setTimeout(() => spawnRocket(), 200 + Math.random() * 400);
        }
        if (Math.random() > 0.8) {
          setTimeout(() => spawnRocket(), 500 + Math.random() * 500);
        }
        lastSpawnRef.current = timestamp;
      }

      // Update and draw rockets
      rocketsRef.current = rocketsRef.current.filter((rocket) => {
        if (rocket.exploded) return false;

        // Update position
        rocket.y += rocket.velocityY;

        // Add trail
        rocket.trail.push({ x: rocket.x, y: rocket.y, opacity: 1 });
        if (rocket.trail.length > 10) rocket.trail.shift();

        // Update trail opacity
        rocket.trail.forEach((t, i) => {
          t.opacity = (i / rocket.trail.length) * 0.5;
        });

        // Draw trail
        rocket.trail.forEach((t) => {
          ctx.fillStyle = rocket.color;
          ctx.globalAlpha = t.opacity;
          ctx.fillRect(Math.floor(t.x) - 1, Math.floor(t.y), 2, 2);
        });

        // Draw rocket
        ctx.globalAlpha = 1;
        ctx.fillStyle = rocket.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = rocket.color;
        ctx.fillRect(Math.floor(rocket.x) - 2, Math.floor(rocket.y), 4, 6);
        ctx.shadowBlur = 0;

        // Check if should explode
        if (rocket.y <= rocket.targetY) {
          explodeRocket(rocket);
          rocket.exploded = true;
          return false;
        }

        return true;
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update position
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += particle.gravity;
        particle.opacity -= 0.008; // Slower fade out

        if (particle.opacity <= 0) return false;

        // Draw particle (pixel-art style)
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15; // Bigger glow
        ctx.shadowColor = particle.color;

        const size = Math.floor(particle.size);
        ctx.fillRect(
          Math.floor(particle.x) - size / 2,
          Math.floor(particle.y) - size / 2,
          size,
          size
        );

        ctx.shadowBlur = 0;

        return true;
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    // Start with a rocket immediately
    spawnRocket();
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-effect fixed inset-0 pointer-events-none z-[1]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
