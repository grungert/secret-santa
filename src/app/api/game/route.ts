import { NextRequest, NextResponse } from "next/server";
import { readGameState, writeGameState, resetGameState } from "@/lib/storage";
import {
  addParticipant,
  removeParticipant,
  startGame,
  restartGame,
  getPlayerView,
} from "@/lib/game-logic";
import { ApiResponse, GameState, PlayerGameView } from "@/types";

// GET: Retrieve game state
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GameState | PlayerGameView | string[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get("player");
    const isAdmin = searchParams.get("admin") === "true";
    const publicNames = searchParams.get("publicNames") === "true";

    const state = await readGameState();

    // Public names only - returns just participant names for intro screen
    if (publicNames) {
      const names = state.participants.map((p) => p.name);
      return NextResponse.json({ success: true, data: names });
    }

    // If player name provided, return player view (hides sensitive info)
    if (playerName && !isAdmin) {
      const playerView = getPlayerView(state, playerName);
      return NextResponse.json({ success: true, data: playerView });
    }

    // Admin view: return full state
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error("Error reading game state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read game state" },
      { status: 500 }
    );
  }
}

// POST: Modify game state (add participant, remove participant, start game, reset)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GameState>>> {
  try {
    const body = await request.json();
    const { action, name, participantId } = body;

    let state = await readGameState();
    let result: { state: GameState; error?: string };

    switch (action) {
      case "ADD_PARTICIPANT":
        if (!name || typeof name !== "string") {
          return NextResponse.json(
            { success: false, error: "Name is required" },
            { status: 400 }
          );
        }
        result = addParticipant(state, name);
        break;

      case "REMOVE_PARTICIPANT":
        if (!participantId || typeof participantId !== "string") {
          return NextResponse.json(
            { success: false, error: "Participant ID is required" },
            { status: 400 }
          );
        }
        result = removeParticipant(state, participantId);
        break;

      case "START_GAME":
        result = startGame(state);
        break;

      case "RESTART_GAME":
        result = restartGame(state);
        break;

      case "RESET_GAME":
        const newState = await resetGameState();
        return NextResponse.json({ success: true, data: newState });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    await writeGameState(result.state);
    return NextResponse.json({ success: true, data: result.state });
  } catch (error) {
    console.error("Error updating game state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game state" },
      { status: 500 }
    );
  }
}
