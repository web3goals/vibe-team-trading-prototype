import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Generating session account...");

    // Define the schema for request body validation
    const bodySchema = z.object({
      address: z.string(),
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
    const { address } = bodyParseResult.data;

    // Get private key for the given address from demo config
    let privateKey: string | undefined;
    if (getAddress(address) === getAddress(demoConfig.userA.address)) {
      privateKey = process.env.USER_A_PRIVATE_KEY;
    }
    if (getAddress(address) === getAddress(demoConfig.userB.address)) {
      privateKey = process.env.USER_B_PRIVATE_KEY;
    }
    if (getAddress(address) === getAddress(demoConfig.userC.address)) {
      privateKey = process.env.USER_C_PRIVATE_KEY;
    }
    if (!privateKey) {
      throw new Error("No private key found for the given address");
    }

    // Connect to Yellow client
    const yellowClient = new Client({ url: yellowConfig.url });
    await yellowClient.connect();

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account: account,
      chain: sepolia,
      transport: http(),
    });

    // Authenticate wallet and get session account
    const sessionAccount = await authenticateWallet(yellowClient, walletClient);

    return createSuccessApiResponse({ sessionAccount });
  } catch (error) {
    console.error(
      `[API] Failed to generate session account, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
