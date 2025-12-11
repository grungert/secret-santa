// Avatar types available in the game
export type AvatarType =
  | "santa"
  | "elf"
  | "snowman"
  | "reindeer"
  | "penguin"
  | "gingerbread"
  | "present"
  | "mystery";

// Individual avatar definition
export interface Avatar {
  id: string;
  type: AvatarType;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// A participant in the game
export interface Participant {
  id: string;
  name: string;
  normalizedName: string;
  avatarId: string;
  assignedToId: string | null;
  hasRevealed: boolean;
  revealedAt: string | null;
  createdAt: string;
}

// Game status states
export type GameStatus = "setup" | "ready" | "active" | "completed";

// Main game state object
export interface GameState {
  id: string;
  status: GameStatus;
  participants: Participant[];
  createdAt: string;
  startedAt: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Reveal request/response
export interface RevealRequest {
  participantName: string;
  selectedAvatarId: string;
}

export interface RevealResponse {
  assignedTo: {
    name: string;
    avatarId: string;
  };
  alreadyRevealed: boolean;
}

// Player view of another participant (hides sensitive info)
export interface PlayerViewParticipant {
  avatarId: string;
  hasRevealed: boolean;
  isCurrentPlayer: boolean;
}

// Player's game view
export interface PlayerGameView {
  status: GameStatus;
  participants: PlayerViewParticipant[];
  currentPlayer: {
    name: string;
    hasRevealed: boolean;
    assignedToName?: string;
    assignedToAvatarId?: string;
  } | null;
  totalParticipants: number;
  revealedCount: number;
}

// Admin action types
export type AdminAction =
  | { type: "ADD_PARTICIPANT"; name: string }
  | { type: "REMOVE_PARTICIPANT"; id: string }
  | { type: "START_GAME" }
  | { type: "RESET_GAME" };
