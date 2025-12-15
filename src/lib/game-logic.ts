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

  // Get avatars already used by existing participants
  const usedAvatarIds = new Set(state.participants.map((p) => p.avatarId));

  // Find available avatars (not yet used)
  const availableAvatars = avatars.filter((a) => !usedAvatarIds.has(a.id));

  // Pick a random avatar from available ones, or fallback to any if all used
  const avatarPool = availableAvatars.length > 0 ? availableAvatars : avatars;
  const randomIndex = Math.floor(Math.random() * avatarPool.length);
  const avatarId = avatarPool[randomIndex].id;

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
 * Start the game - players will choose who to buy for (no pre-assignment)
 */
export function startGame(state: GameState): { state: GameState; error?: string } {
  if (state.status !== "setup") {
    return { state, error: "Game has already started" };
  }

  if (state.participants.length < 2) {
    return { state, error: "Need at least 2 participants to start" };
  }

  // Shuffle avatars and take first N unique avatars for N participants
  const shuffledAvatars = shuffleAvatars();

  // Update participants with unique shuffled avatars (no pre-assignment)
  const updatedParticipants = state.participants.map((p, index) => ({
    ...p,
    avatarId: shuffledAvatars[index].id, // Each participant gets a unique avatar
    assignedToId: null, // No pre-assignment - users will choose
    hasRevealed: false,
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
 * Choose who to buy a gift for (user picks from available participants)
 */
export function chooseAssignment(
  state: GameState,
  playerName: string,
  targetId: string
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

  // Check if player already chose
  if (player.hasRevealed) {
    const assignedTo = state.participants.find((p) => p.id === player.assignedToId);
    return {
      state,
      assignedTo,
      alreadyRevealed: true
    };
  }

  // Find the target participant
  const targetIndex = state.participants.findIndex((p) => p.id === targetId);
  if (targetIndex === -1) {
    return { state, error: "Target not found" };
  }

  const target = state.participants[targetIndex];

  // Can't choose yourself
  if (target.id === player.id) {
    return { state, error: "You cannot choose yourself" };
  }

  // Check if target is already chosen by someone else
  const alreadyChosen = state.participants.some(
    (p) => p.hasRevealed && p.assignedToId === targetId
  );
  if (alreadyChosen) {
    return { state, error: "This person has already been chosen by someone else" };
  }

  // Update player with their choice
  const updatedParticipants = [...state.participants];
  updatedParticipants[playerIndex] = {
    ...player,
    assignedToId: targetId,
    hasRevealed: true,
    revealedAt: new Date().toISOString(),
  };

  // Check if all have chosen
  const allRevealed = updatedParticipants.every((p) => p.hasRevealed);

  return {
    state: {
      ...state,
      status: allRevealed ? "completed" : "active",
      participants: updatedParticipants,
    },
    assignedTo: target,
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
    id: string;
    avatarId: string;
    hasRevealed: boolean;
    isCurrentPlayer: boolean;
    isAvailable: boolean;
  }>;
  availableParticipants: Array<{
    id: string;
    avatarId: string;
    name: string;
  }>;
  currentPlayer: {
    name: string;
    avatarId: string;
    hasRevealed: boolean;
    assignedToName?: string;
    assignedToAvatarId?: string;
  } | null;
  totalParticipants: number;
  revealedCount: number;
  chosenAvatars: Array<{ avatarId: string; name: string }>;
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

  // Calculate chosen avatars - participants who have been chosen as someone's gift recipient
  const chosenParticipantIds = state.participants
    .filter((p) => p.hasRevealed && p.assignedToId)
    .map((p) => p.assignedToId);

  const chosenAvatars = state.participants
    .filter((p) => chosenParticipantIds.includes(p.id))
    .map((p) => ({ avatarId: p.avatarId, name: p.name }));

  // Available participants: not chosen by anyone, not the current player
  const availableParticipants = state.participants
    .filter((p) =>
      !chosenParticipantIds.includes(p.id) &&
      p.normalizedName !== normalizedName
    )
    .map((p) => ({ id: p.id, avatarId: p.avatarId, name: p.name }));

  return {
    status: state.status,
    participants: state.participants.map((p) => ({
      id: p.id,
      avatarId: p.avatarId,
      hasRevealed: p.hasRevealed,
      isCurrentPlayer: p.normalizedName === normalizedName,
      isAvailable: !chosenParticipantIds.includes(p.id) && p.normalizedName !== normalizedName,
    })),
    availableParticipants,
    currentPlayer: currentPlayer
      ? {
          name: currentPlayer.name,
          avatarId: currentPlayer.avatarId,
          hasRevealed: currentPlayer.hasRevealed,
          assignedToName,
          assignedToAvatarId,
        }
      : null,
    totalParticipants: state.participants.length,
    revealedCount: state.participants.filter((p) => p.hasRevealed).length,
    chosenAvatars,
  };
}
