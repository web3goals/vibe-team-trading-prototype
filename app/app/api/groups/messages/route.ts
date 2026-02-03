import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Posting message...");

    // Define the schema for request body validation
    const bodySchema = z.object({
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
    const { content } = bodyParseResult.data;

    // Return the result
    return createSuccessApiResponse({ content });
  } catch (error) {
    console.error(
      `[API] Failed to post message, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
