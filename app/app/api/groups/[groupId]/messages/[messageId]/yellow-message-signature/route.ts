import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { NextRequest } from "next/server";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import z from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; messageId: string }> },
) {
  try {
    console.log("[API] Adding Yellow message signature...");

    const { groupId, messageId } = await params;

    // Define the schema for request body validation
    const bodySchema = z.object({
      address: z.string(),
      signature: z.string(),
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
    const { address, signature } = bodyParseResult.data;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Find the message
    const message = group.messages.find((msg) => msg.id === messageId);
    if (!message) {
      throw new Error(`Message not found with id: ${messageId}`);
    }
    if (!message.extra?.yellow?.message) {
      throw new Error(`Message does not have a Yellow message: ${messageId}`);
    }

    // Add signature to the message
    const yellowMessageJson = JSON.parse(message.extra.yellow.message);
    yellowMessageJson.sig.push(signature);
    message.extra.yellow.message = JSON.stringify(yellowMessageJson);
    message.extra.yellow.messageSignerAddresses.push(address as `0x${string}`);

    // Define agent wallet client to send the message to Yellow network
    let agentPrivateKey;
    if (
      getAddress(group.agent.address) ===
      getAddress(demoConfig.groupAgentA.address)
    ) {
      agentPrivateKey = process.env.AGENT_A_PRIVATE_KEY;
    }
    if (!agentPrivateKey) {
      throw new Error("Agent private key not found for sending Yellow message");
    }
    const agentAccount = privateKeyToAccount(
      process.env.AGENT_A_PRIVATE_KEY as `0x${string}`,
    );
    const agentWalletClient = createWalletClient({
      account: agentAccount,
      chain: sepolia,
      transport: http(),
    });

    // Send the message to the Yellow network and save response
    const yellowClient = new Client({ url: yellowConfig.url });
    await yellowClient.connect();
    await authenticateWallet(yellowClient, agentWalletClient);
    const yellowResponse = await yellowClient.sendMessage(
      message.extra.yellow.message,
    );
    message.extra.yellow.response = JSON.stringify(yellowResponse);
    message.extra.yellow.responseCreated = new Date();
    yellowClient.disconnect();

    // Save Yellow app session ID to the group if applicable
    const yellowResponseJson = JSON.parse(message.extra.yellow.response);
    if (
      yellowResponseJson.method === "create_app_session" &&
      yellowResponseJson.params.status === "open"
    ) {
      group.yellowAppSessionId = yellowResponseJson.params.appSessionId;
    }

    // Update the group in the database
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to add Yellow message signature, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
