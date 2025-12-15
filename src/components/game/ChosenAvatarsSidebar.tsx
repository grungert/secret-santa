"use client";

import PixelAvatar from "./PixelAvatar";
import { ChosenAvatar } from "@/types";

interface ChosenAvatarsSidebarProps {
  chosenAvatars: ChosenAvatar[];
  totalParticipants: number;
}

export default function ChosenAvatarsSidebar({
  chosenAvatars,
  totalParticipants,
}: ChosenAvatarsSidebarProps) {
  if (chosenAvatars.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-1/4 z-20">
      <div
        className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 border border-neon-green/50"
        style={{
          boxShadow: "0 0 30px rgba(57, 255, 20, 0.2)",
        }}
      >
        {/* Counter */}
        <div className="text-center mb-2">
          <p className="text-lg font-bold neon-text-green">
            {chosenAvatars.length}/{totalParticipants}
          </p>
        </div>

        {/* Avatar list - just avatars, no names */}
        <div className="flex flex-col gap-3 items-center">
          {chosenAvatars.map((avatar, index) => (
            <div
              key={index}
              className="rounded-lg border-2 border-neon-green/50 bg-black/60 p-1"
              style={{
                boxShadow: "0 0 15px rgba(57, 255, 20, 0.4)",
              }}
            >
              <PixelAvatar avatarId={avatar.avatarId} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
