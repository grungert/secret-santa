"use client";

import { useState, FormEvent } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelInput from "@/components/ui/PixelInput";
import PixelCard from "@/components/ui/PixelCard";

interface LoginFormProps {
  onLogin: (name: string) => void;
  error?: string;
  loading?: boolean;
}

export default function LoginForm({ onLogin, error, loading }: LoginFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onLogin(name.trim());
    }
  };

  return (
    <PixelCard variant="highlight" className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl text-gold mb-2">Welcome!</h2>
          <p className="text-lg text-frost-blue">
            Enter your name to join the Secret Santa game
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-lg text-snow-white">
            Your First Name:
          </label>
          <PixelInput
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full"
            error={!!error}
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-santa-red text-sm animate-shake">{error}</p>
          )}
        </div>

        <PixelButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={name.trim().length < 2 || loading}
        >
          {loading ? "Checking..." : "Enter Game"}
        </PixelButton>

        <p className="text-sm text-gray-400 text-center">
          Make sure you use the exact name the admin registered for you!
        </p>
      </form>
    </PixelCard>
  );
}
