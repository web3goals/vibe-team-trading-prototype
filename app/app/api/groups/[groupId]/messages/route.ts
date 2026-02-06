import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Creating message...");

    const { groupId } = await params;

    // Define the schema for request body validation
    const bodySchema = z.object({
      creatorAddress: z.string(),
      creatorEnsName: z.string(),
      creatorRole: z.enum(["user"]),
      content: z.string(),
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
    const { creatorAddress, creatorEnsName, creatorRole, content } =
      bodyParseResult.data;

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found with id: ${groupId}`);
    }

    // Add message to the group and save to database
    group.messages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      creatorAddress: creatorAddress as `0x${string}`,
      creatorEnsName: creatorEnsName,
      creatorRole: creatorRole,
      content: content,
    });

    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create message, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
