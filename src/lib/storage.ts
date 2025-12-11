import { promises as fs } from "fs";
import path from "path";
import { GameState } from "@/types";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const GAME_STATE_FILE = path.join(DATA_DIR, "game-state.json");

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
