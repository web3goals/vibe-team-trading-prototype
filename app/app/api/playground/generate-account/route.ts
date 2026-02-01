import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export async function POST() {
  try {
    console.log("[API] Generating account...");

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    return createSuccessApiResponse({
      address: account.address,
      privateKey: privateKey,
    });
  } catch (error) {
    console.error(
      `[API] Failed to generate account, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
