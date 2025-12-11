import { Avatar } from "@/types";

export const avatars: Avatar[] = [
  {
    id: "santa-classic",
    type: "santa",
    name: "Classic Santa",
    colors: { primary: "#c41e3a", secondary: "#fffafa", accent: "#ffd700" },
  },
  {
    id: "santa-cool",
    type: "santa",
    name: "Cool Santa",
    colors: { primary: "#c41e3a", secondary: "#1a1a2e", accent: "#ffd700" },
  },
  {
    id: "elf-happy",
    type: "elf",
    name: "Happy Elf",
    colors: { primary: "#228b22", secondary: "#c41e3a", accent: "#ffd700" },
  },
  {
    id: "elf-mischief",
    type: "elf",
    name: "Mischievous Elf",
    colors: { primary: "#006400", secondary: "#8b0000", accent: "#ffd700" },
  },
  {
    id: "snowman-hat",
    type: "snowman",
    name: "Snowman with Hat",
    colors: { primary: "#fffafa", secondary: "#1a1a2e", accent: "#ff6b35" },
  },
  {
    id: "snowman-scarf",
    type: "snowman",
    name: "Snowman with Scarf",
    colors: { primary: "#fffafa", secondary: "#c41e3a", accent: "#228b22" },
  },
  {
    id: "reindeer-rudolph",
    type: "reindeer",
    name: "Rudolph",
    colors: { primary: "#8b4513", secondary: "#c41e3a", accent: "#ffd700" },
  },
  {
    id: "reindeer-dasher",
    type: "reindeer",
    name: "Dasher",
    colors: { primary: "#a0522d", secondary: "#228b22", accent: "#fffafa" },
  },
  {
    id: "penguin-santa",
    type: "penguin",
    name: "Penguin Santa",
    colors: { primary: "#1a1a2e", secondary: "#fffafa", accent: "#c41e3a" },
  },
  {
    id: "gingerbread",
    type: "gingerbread",
    name: "Gingerbread",
    colors: { primary: "#cd853f", secondary: "#fffafa", accent: "#c41e3a" },
  },
  {
    id: "present-red",
    type: "present",
    name: "Red Present",
    colors: { primary: "#c41e3a", secondary: "#ffd700", accent: "#228b22" },
  },
  {
    id: "present-green",
    type: "present",
    name: "Green Present",
    colors: { primary: "#228b22", secondary: "#c41e3a", accent: "#ffd700" },
  },
];

export const mysteryAvatar: Avatar = {
  id: "mystery",
  type: "mystery",
  name: "Mystery",
  colors: { primary: "#4a4a6a", secondary: "#ffd700", accent: "#c41e3a" },
};

export function getAvatarById(id: string): Avatar | undefined {
  if (id === "mystery") return mysteryAvatar;
  return avatars.find((a) => a.id === id);
}

export function shuffleAvatars(): Avatar[] {
  const shuffled = [...avatars];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
