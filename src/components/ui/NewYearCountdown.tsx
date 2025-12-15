"use client";

import { useState, useEffect } from "react";

interface NewYearCountdownProps {
  targetYear?: number;
  className?: string;
}

export default function NewYearCountdown({
  targetYear = 2026,
  className = "",
}: NewYearCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(`January 1, ${targetYear} 00:00:00`).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetYear]);

  const pad = (num: number) => num.toString().padStart(2, "0");

  return (
    <span className={className}>
      Nova Godina za{" "}
      <span className="neon-text-yellow">
        {timeLeft.days} {timeLeft.days === 1 ? "dan" : "dana"}
      </span>{" "}
      <span className="neon-text-cyan">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </span>
  );
}
