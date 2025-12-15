import { promises as fs } from "fs";
import path from "path";
import { GameState } from "@/types";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const GAME_STATE_FILE = path.join(DATA_DIR, "game-state.json");
const LOCK_FILE = path.join(DATA_DIR, "game-state.lock");

// Simple mutex lock for file operations
let lockPromise: Promise<void> = Promise.resolve();

async function acquireLock(): Promise<void> {
  const maxRetries = 50;
  const retryDelay = 100; // ms

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to create lock file exclusively
      await fs.writeFile(LOCK_FILE, Date.now().toString(), { flag: "wx" });
      return; // Lock acquired
    } catch {
      // Lock exists, wait and retry
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // Force release stale lock after timeout (5 seconds)
  try {
    const lockTime = parseInt(await fs.readFile(LOCK_FILE, "utf-8"));
    if (Date.now() - lockTime > 5000) {
      await fs.unlink(LOCK_FILE);
      await fs.writeFile(LOCK_FILE, Date.now().toString(), { flag: "wx" });
      return;
    }
  } catch {
    // Ignore errors, throw timeout
  }

  throw new Error("Could not acquire lock - too many concurrent requests");
}

async function releaseLock(): Promise<void> {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {
    // Ignore if lock file doesn't exist
  }
}

function createInitialGameState(): GameState {
  return {
    id: uuidv4(),
    status: "setup",
    participants: [],
    createdAt: new Date().toISOString(),
    startedAt: null,
  };
}

export async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readGameState(): Promise<GameState> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
    return JSON.parse(data) as GameState;
  } catch {
    // File doesn't exist, create initial state
    const initialState = createInitialGameState();
    await writeGameState(initialState);
    return initialState;
  }
}

export async function writeGameState(state: GameState): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(GAME_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export async function resetGameState(): Promise<GameState> {
  const newState = createInitialGameState();
  await writeGameState(newState);
  return newState;
}

/**
 * Atomic read-modify-write operation with file locking
 * Ensures only one player can modify the state at a time
 */
export async function atomicUpdateGameState<T>(
  updateFn: (state: GameState) => { state: GameState; result: T }
): Promise<T> {
  await acquireLock();
  try {
    const currentState = await readGameState();
    const { state: newState, result } = updateFn(currentState);
    await writeGameState(newState);
    return result;
  } finally {
    await releaseLock();
  }
}
