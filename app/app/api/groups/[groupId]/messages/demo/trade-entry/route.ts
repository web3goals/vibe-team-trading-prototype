import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Creating demo trade entry message...");

    const { groupId } = await params;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Add message to the group and save to database
    group.messages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      creatorAddress: group.agent.address,
      creatorEnsName: group.agent.ensName,
      creatorRole: "agent",
      content: [
        "Trade executed 👌",
        "I've successfully swapped  2 USDC for 0.36 ENS via LI.FI",
        "I am now monitoring the price and will automatically trigger the sell once we hit our $7.20 target",
      ].join("\n\n"),
      extra: {
        lifi: {
          transactionLink: "https://etherscan.io/",
        },
      },
    });

    // Update the group in the database
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create demo trade entry message, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
