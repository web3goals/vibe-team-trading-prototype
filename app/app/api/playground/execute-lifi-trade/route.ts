import { demoConfig } from "@/config/demo";
import { executeLiFiTradeByAgent } from "@/lib/agent-utils";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";

export async function POST() {
  try {
    console.log("[API] Executing LI.FI trade...");

    await executeLiFiTradeByAgent(demoConfig.groupAgentA.address);

    return createSuccessApiResponse(42);
  } catch (error) {
    console.error(
      `[API] Failed to execute LI.FI trade, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
