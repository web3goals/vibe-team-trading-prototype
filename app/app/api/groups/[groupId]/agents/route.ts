import { invokeAgent } from "@/lib/agent";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { HumanMessage } from "langchain";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    console.log("[API] Invoking agent...");

    const { groupId } = await params;

    // Define the schema for request body validation
    const bodySchema = z.object({
      message: z.string(),
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
    const { message } = bodyParseResult.data;

    // Invoke the agent with the message
    const invokeAgentResponse = await invokeAgent(groupId, [
      new HumanMessage(message),
    ]);

    return createSuccessApiResponse({ invokeAgentResponse });
  } catch (error) {
    console.error(
      `[API] Failed to invoke agent, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
