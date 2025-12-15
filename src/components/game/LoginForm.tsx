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
          <h2 className="text-3xl text-gold mb-2">Dobrodošli!</h2>
          <p className="text-lg text-frost-blue">
            Unesi svoje ime da se pridružiš igri Tajni Deda Mraz
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-lg text-snow-white">
            Tvoje ime:
          </label>
          <PixelInput
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Unesi svoje ime..."
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
          {loading ? "Provera..." : "Uđi u igru"}
        </PixelButton>

        <p className="text-sm text-gray-400 text-center">
          Koristi tačno ime koje je admin registrovao za tebe!
        </p>
      </form>
    </PixelCard>
  );
}
