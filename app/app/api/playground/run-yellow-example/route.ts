import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";

export async function POST() {
  try {
    console.log("[API] Running Yellow example...");

    return createSuccessApiResponse(42);
  } catch (error) {
    console.error(
      `[API] Failed to run Yellow example, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
