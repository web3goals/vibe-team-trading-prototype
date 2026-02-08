import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import {
  getMessageWithStartTradeRequest,
  getMessageWithWithdrawRequest,
} from "@/lib/messages";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { GroupMessage } from "@/types/group";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Creating demo message...");

    const { groupId } = await params;

    // Define the schema for request body validation
    const bodySchema = z.object({
      category: z.enum(["start_trade_request", "withdraw_request"]),
    });

    // Extract request body
    const body = await request.json();

    // Validate request body using schema
    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Invalid request body: ${bodyParseResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")}`,
        },
        400,
      );
    }

    // Extract validated data
    const { category } = bodyParseResult.data;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Create a message based on the category
    let message: GroupMessage | undefined;
    if (category === "start_trade_request") {
      const content = [
        "Agreed 💯",
        "Technicals look primed for a bounce",
        "I propose buying ENS now and exiting once it clears the immediate $7.20 resistance",
        "To execute, sign the Yellow message to allocate 1 USDC each",
      ].join("\n\n");
      message = await getMessageWithStartTradeRequest(group, content);
    }
    if (category === "withdraw_request") {
      const content = [
        "Funds allocated 🤝",
        "Now, please sign this Yellow message to authorize the withdrawal of the USDC to the execution wallet",
        "I will then route the swap through LI.FI to ensure the best execution price for our entry",
      ].join("\n\n");
      message = await getMessageWithWithdrawRequest(group, content);
    }

    // Add message to the group and save to database
    if (message) {
      group.messages.push(message);
      await insertOrUpdateGroup(group);
    }

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create demo message, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
