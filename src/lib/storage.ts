import { kv } from "@vercel/kv";
import { GameState } from "@/types";
import { v4 as uuidv4 } from "uuid";

const GAME_STATE_KEY = "secret-santa-game-state";

function createInitialGameState(): GameState {
  return {
    id: uuidv4(),
    status: "setup",
    participants: [],
    createdAt: new Date().toISOString(),
    startedAt: null,
  };
}

export async function readGameState(): Promise<GameState> {
  try {
    const state = await kv.get<GameState>(GAME_STATE_KEY);
    if (state) {
      return state;
    }
    // No state exists, create initial state
    const initialState = createInitialGameState();
    await writeGameState(initialState);
    return initialState;
  } catch (error) {
    console.error("Error reading game state from KV:", error);
    // Return initial state on error
    return createInitialGameState();
  }
}

export async function writeGameState(state: GameState): Promise<void> {
  try {
    await kv.set(GAME_STATE_KEY, state);
  } catch (error) {
    console.error("Error writing game state to KV:", error);
    throw error;
  }
}

export async function resetGameState(): Promise<GameState> {
  const newState = createInitialGameState();
  await writeGameState(newState);
  return newState;
}

/**
 * Atomic read-modify-write operation
 * Vercel KV operations are atomic by default
 */
export async function atomicUpdateGameState<T>(
  updateFn: (state: GameState) => { state: GameState; result: T }
): Promise<T> {
  const currentState = await readGameState();
  const { state: newState, result } = updateFn(currentState);
  await writeGameState(newState);
  return result;
}

// Keep for backwards compatibility (no-op now)
export async function ensureDataDir(): Promise<void> {
  // No longer needed with KV storage
}
