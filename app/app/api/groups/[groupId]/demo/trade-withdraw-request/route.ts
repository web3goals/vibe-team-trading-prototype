import { getAgentYellowMessageSigner } from "@/lib/agent-utils";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import {
  createSubmitAppStateMessage,
  RPCAppSessionAllocation,
  RPCAppStateIntent,
} from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Creating demo trade withdraw request message...");

    const { groupId } = await params;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Define new Yellow allocations
    // TODO: Calculate based on the previous state
    const yellowAppAllocations: RPCAppSessionAllocation[] = [
      {
        participant: group.agent.address,
        asset: "ytest.usd",
        amount: Number(0).toString(),
      },
      ...group.users.map((user) => ({
        participant: user.address,
        asset: "ytest.usd",
        amount: Number(10 - 1).toString(),
      })),
    ];

    // Create Yellow submit app state message signed by the agent
    const yellowMessageSigner = await getAgentYellowMessageSigner(
      group.agent.address,
    );
    const yellowMessage = await createSubmitAppStateMessage(
      yellowMessageSigner,
      {
        app_session_id: group.yellowAppSessionId as `0x${string}`,
        allocations: yellowAppAllocations,
        version: (group.yellowAppVersion as number) + 1,
        intent: RPCAppStateIntent.Withdraw,
      },
    );

    // Add message to the group and save to database
    group.messages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      creatorAddress: group.agent.address,
      creatorEnsName: group.agent.ensName,
      creatorRole: "agent",
      content: [
        "Funds allocated 🤝",
        "Now, please sign this Yellow message to authorize the withdrawal of the USDC to the execution wallet",
        "I will then route the ENS swap through LI.FI to ensure the best execution price for our entry",
      ].join("\n\n"),
      extra: {
        yellow: {
          message: yellowMessage,
          messageCreated: new Date(),
          messageSignerAddresses: [group.agent.address],
        },
      },
    });

    // Update the group in the database
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create demo trade withdraw request message, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
