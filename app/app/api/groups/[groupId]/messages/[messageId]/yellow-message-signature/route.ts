import { sendYellowMessageByAgent } from "@/lib/agent-utils";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { RPCMethod } from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
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

    // Find the Yellow message
    const message = group.messages.find((msg) => msg.id === messageId);
    if (!message) {
      throw new Error(`Message not found with id: ${messageId}`);
    }
    if (!message.extra?.yellow?.message) {
      throw new Error(`Message does not have a Yellow message: ${messageId}`);
    }

    // Add signature to the Yellow message
    const yellowMessageJson = JSON.parse(message.extra.yellow.message);
    yellowMessageJson.sig.push(signature);
    message.extra.yellow.message = JSON.stringify(yellowMessageJson);
    message.extra.yellow.messageSignerAddresses.push(address as `0x${string}`);

    // Send the Yellow message to the Yellow network by agent and save response
    const yellowResponse = await sendYellowMessageByAgent(
      group.agent.address,
      message.extra.yellow.message,
    );
    message.extra.yellow.response = JSON.stringify(yellowResponse);
    message.extra.yellow.responseCreated = new Date();

    // Parse the Yellow response JSON
    const yellowResponseJson = JSON.parse(message.extra.yellow.response);

    // Save Yellow app session ID to the group and add a new message that Yellow app session was set up successfully
    if (
      yellowResponseJson.method === RPCMethod.CreateAppSession &&
      yellowResponseJson.params.appSessionId
    ) {
      group.yellowAppSessionId = yellowResponseJson.params.appSessionId;
      group.messages.push({
        id: new ObjectId().toString(),
        created: new Date(),
        creatorAddress: group.agent.address,
        creatorEnsName: group.agent.ensName,
        creatorRole: "agent",
        content: "Yellow app session set up successfully 👍",
      });
    }

    // Save Yellow app version to the group
    if (
      yellowResponseJson.method !== RPCMethod.Error &&
      yellowResponseJson.params.version
    ) {
      group.yellowAppVersion = yellowResponseJson.params.version;
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
