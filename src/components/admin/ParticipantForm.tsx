"use client";

import { useState, FormEvent } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelInput from "@/components/ui/PixelInput";

interface ParticipantFormProps {
  onAdd: (name: string) => Promise<void>;
  disabled?: boolean;
}

export default function ParticipantForm({ onAdd, disabled }: ParticipantFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAdd(name.trim());
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <PixelInput
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Enter friend's name..."
          className="flex-1"
          disabled={disabled || loading}
          error={!!error}
        />
        <PixelButton
          type="submit"
          variant="secondary"
          disabled={disabled || loading || name.trim().length < 2}
        >
          {loading ? "..." : "Add"}
        </PixelButton>
      </div>
      {error && <p className="text-santa-red text-sm">{error}</p>}
    </form>
  );
}
