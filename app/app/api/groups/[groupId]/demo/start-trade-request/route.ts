import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { getMessageWithStartTradeRequest } from "@/lib/messages";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Creating demo start trade request...");

    const { groupId } = await params;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Add message to the group and save to database
    const content = [
      "Agreed 💯",
      "Technicals look primed for a bounce",
      "I propose buying ENS now and exiting once it clears the immediate $7.20 resistance",
      "To execute, sign the Yellow message to allocate 1 USDC each",
    ].join("\n\n");
    const messageWithTradeRequest = await getMessageWithStartTradeRequest(
      group,
      content,
    );
    group.messages.push(messageWithTradeRequest);
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create demo start trade request, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
