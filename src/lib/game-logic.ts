import { Participant, GameState } from "@/types";
import { avatars, shuffleAvatars } from "@/data/avatars";
import { v4 as uuidv4 } from "uuid";

/**
 * Fisher-Yates shuffle algorithm
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if assignment has any self-assignments (person giving to themselves)
 */
function hasSelfAssignment(
  original: string[],
  shuffled: string[]
): boolean {
  return original.some((id, index) => id === shuffled[index]);
}

/**
 * Generate random Secret Santa assignments ensuring no one gets themselves
 * Uses Fisher-Yates shuffle with derangement check
 */
export function generateAssignments(participantIds: string[]): Map<string, string> {
  const n = participantIds.length;
  if (n < 2) {
    throw new Error("Need at least 2 participants for Secret Santa");
  }

  let shuffled: string[];
  let attempts = 0;
  const maxAttempts = 1000;

  // Keep shuffling until we get a valid derangement (no self-assignments)
  do {
    shuffled = fisherYatesShuffle(participantIds);
    attempts++;
  } while (hasSelfAssignment(participantIds, shuffled) && attempts < maxAttempts);

  // Fallback: simple rotation (guaranteed derangement)
  if (attempts >= maxAttempts) {
    shuffled = participantIds.map((_, i) => participantIds[(i + 1) % n]);
  }

  // Create assignment map: participantIds[i] gives gift to shuffled[i]
  const assignments = new Map<string, string>();
  for (let i = 0; i < n; i++) {
    assignments.set(participantIds[i], shuffled[i]);
  }

  return assignments;
}

/**
 * Create a new participant
 */
export function createParticipant(name: string, avatarId: string): Participant {
  const trimmedName = name.trim();
  return {
    id: uuidv4(),
    name: trimmedName,
    normalizedName: trimmedName.toLowerCase(),
    avatarId,
    assignedToId: null,
    hasRevealed: false,
    revealedAt: null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Add a participant to the game
 */
export function addParticipant(
  state: GameState,
  name: string
): { state: GameState; error?: string } {
  if (state.status !== "setup") {
    return { state, error: "Cannot add participants after game has started" };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { state, error: "Name must be at least 2 characters" };
  }

  const normalizedName = trimmedName.toLowerCase();
  const exists = state.participants.some(
    (p) => p.normalizedName === normalizedName
  );
  if (exists) {
    return { state, error: "A participant with this name already exists" };
  }

  // Assign avatar based on position (cycle through available avatars)
  const avatarIndex = state.participants.length % avatars.length;
  const shuffledAvatars = shuffleAvatars();
  const avatarId = shuffledAvatars[avatarIndex].id;

  const participant = createParticipant(trimmedName, avatarId);

  return {
    state: {
      ...state,
      participants: [...state.participants, participant],
    },
  };
}

/**
 * Remove a participant from the game
 */
export function removeParticipant(
  state: GameState,
  participantId: string
): { state: GameState; error?: string } {
  if (state.status !== "setup") {
    return { state, error: "Cannot remove participants after game has started" };
  }

  const filtered = state.participants.filter((p) => p.id !== participantId);
  if (filtered.length === state.participants.length) {
    return { state, error: "Participant not found" };
  }

  return {
    state: {
      ...state,
      participants: filtered,
    },
  };
}

/**
 * Start the game - generate random assignments
 */
export function startGame(state: GameState): { state: GameState; error?: string } {
  if (state.status !== "setup") {
    return { state, error: "Game has already started" };
  }

  if (state.participants.length < 3) {
    return { state, error: "Need at least 3 participants to start" };
  }

  // Generate assignments
  const participantIds = state.participants.map((p) => p.id);
  const assignments = generateAssignments(participantIds);

  // Shuffle avatars and reassign to make it more random
  const shuffledAvatars = shuffleAvatars();

  // Update participants with assignments and shuffled avatars
  const updatedParticipants = state.participants.map((p, index) => ({
    ...p,
    avatarId: shuffledAvatars[index % shuffledAvatars.length].id,
    assignedToId: assignments.get(p.id) || null,
  }));

  return {
    state: {
      ...state,
      status: "active",
      participants: updatedParticipants,
      startedAt: new Date().toISOString(),
    },
  };
}

/**
 * Reveal a player's assignment
 */
export function revealAssignment(
  state: GameState,
  playerName: string
): { state: GameState; assignedTo?: Participant; error?: string; alreadyRevealed?: boolean } {
  if (state.status !== "active") {
    return { state, error: "Game is not active" };
  }

  const normalizedName = playerName.trim().toLowerCase();
  const playerIndex = state.participants.findIndex(
    (p) => p.normalizedName === normalizedName
  );

  if (playerIndex === -1) {
    return { state, error: "Player not found" };
  }

  const player = state.participants[playerIndex];

  // Find who they're assigned to give a gift to
  const assignedTo = state.participants.find((p) => p.id === player.assignedToId);
  if (!assignedTo) {
    return { state, error: "Assignment not found" };
  }

  // Check if already revealed
  if (player.hasRevealed) {
    return {
      state,
      assignedTo,
      alreadyRevealed: true
    };
  }

  // Update player as revealed
  const updatedParticipants = [...state.participants];
  updatedParticipants[playerIndex] = {
    ...player,
    hasRevealed: true,
    revealedAt: new Date().toISOString(),
  };

  // Check if all have revealed
  const allRevealed = updatedParticipants.every((p) => p.hasRevealed);

  return {
    state: {
      ...state,
      status: allRevealed ? "completed" : "active",
      participants: updatedParticipants,
    },
    assignedTo,
    alreadyRevealed: false,
  };
}

/**
 * Restart the game - keep participants but reset assignments and revealed status
 */
export function restartGame(state: GameState): { state: GameState; error?: string } {
  if (state.participants.length < 3) {
    return { state, error: "Need at least 3 participants to restart" };
  }

  // Reset all participants: clear assignments and revealed status
  const resetParticipants = state.participants.map((p) => ({
    ...p,
    assignedToId: null,
    hasRevealed: false,
    revealedAt: null,
  }));

  return {
    state: {
      ...state,
      status: "setup",
      participants: resetParticipants,
      startedAt: null,
    },
  };
}

/**
 * Get player's view of the game (hides sensitive information)
 */
export function getPlayerView(
  state: GameState,
  playerName: string
): {
  status: GameState["status"];
  participants: Array<{
    avatarId: string;
    hasRevealed: boolean;
    isCurrentPlayer: boolean;
  }>;
  currentPlayer: {
    name: string;
    hasRevealed: boolean;
    assignedToName?: string;
    assignedToAvatarId?: string;
  } | null;
  totalParticipants: number;
  revealedCount: number;
} {
  const normalizedName = playerName.trim().toLowerCase();
  const currentPlayer = state.participants.find(
    (p) => p.normalizedName === normalizedName
  );

  let assignedToName: string | undefined;
  let assignedToAvatarId: string | undefined;

  if (currentPlayer?.hasRevealed && currentPlayer.assignedToId) {
    const assignedTo = state.participants.find(
      (p) => p.id === currentPlayer.assignedToId
    );
    if (assignedTo) {
      assignedToName = assignedTo.name;
      assignedToAvatarId = assignedTo.avatarId;
    }
  }

  return {
    status: state.status,
    participants: state.participants.map((p) => ({
      avatarId: p.avatarId,
      hasRevealed: p.hasRevealed,
      isCurrentPlayer: p.normalizedName === normalizedName,
    })),
    currentPlayer: currentPlayer
      ? {
          name: currentPlayer.name,
          hasRevealed: currentPlayer.hasRevealed,
          assignedToName,
          assignedToAvatarId,
        }
      : null,
    totalParticipants: state.participants.length,
    revealedCount: state.participants.filter((p) => p.hasRevealed).length,
  };
}
