import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { zeroAddress } from "viem";
import { Client } from "yellow-ts";
import z from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; messageId: string }> },
) {
  try {
    console.log("[API] Adding yellow message signature...");

    const { groupId, messageId } = await params;

    // Define the schema for request body validation
    const bodySchema = z.object({
      senderEnsName: z.string(),
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
    const { senderEnsName, signature } = bodyParseResult.data;

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
    if (!message.yellowMessage) {
      throw new Error(
        `Message does not have a yellow message to sign: ${messageId}`,
      );
    }

    // Add signature to message
    const yellowMessageJson = JSON.parse(message.yellowMessage);
    yellowMessageJson.sig.push(signature);
    message.yellowMessage = JSON.stringify(yellowMessageJson);

    // Add agent message
    group.messages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      senderAddress: zeroAddress,
      senderRole: "agent",
      content: `Message ${messageId} signed by ${senderEnsName}`,
    });

    // Try to send message to yellow network
    try {
      const yellowClient = new Client({ url: yellowConfig.url });
      await yellowClient.connect();
      console.log({ yellowMessageJson });
      const sendYellowMessageResponse = await yellowClient.sendMessage(
        JSON.stringify(yellowMessageJson),
      );
      console.log({ sendYellowMessageResponse });
    } catch (error) {
      console.error(
        `[API] Failed to send yellow message to network, error: ${getErrorString(
          error,
        )}`,
      );
    }

    // Update the group in the database
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to add yellow message signature, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
