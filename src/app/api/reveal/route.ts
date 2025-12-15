import { NextRequest, NextResponse } from "next/server";
import { atomicUpdateGameState } from "@/lib/storage";
import { chooseAssignment } from "@/lib/game-logic";
import { ApiResponse, RevealResponse, Participant } from "@/types";

// POST: Choose who to buy a gift for
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RevealResponse>>> {
  try {
    const body = await request.json();
    const { playerName, targetId } = body;

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { success: false, error: "Player name is required" },
        { status: 400 }
      );
    }

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target ID is required" },
        { status: 400 }
      );
    }

    // Use atomic update to prevent race conditions
    const result = await atomicUpdateGameState<{
      assignedTo?: Participant;
      error?: string;
      alreadyRevealed?: boolean;
    }>((state) => {
      const chooseResult = chooseAssignment(state, playerName, targetId);
      return {
        state: chooseResult.state,
        result: {
          assignedTo: chooseResult.assignedTo,
          error: chooseResult.error,
          alreadyRevealed: chooseResult.alreadyRevealed,
        },
      };
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    if (!result.assignedTo) {
      return NextResponse.json(
        { success: false, error: "Could not find assignment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        assignedTo: {
          name: result.assignedTo.name,
          avatarId: result.assignedTo.avatarId,
        },
        alreadyRevealed: result.alreadyRevealed || false,
      },
    });
  } catch (error) {
    console.error("Error revealing assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reveal assignment" },
      { status: 500 }
    );
  }
}
