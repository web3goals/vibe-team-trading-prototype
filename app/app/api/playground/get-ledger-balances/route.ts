import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWalletInYellow } from "@/lib/yellow";
import {
  createECDSAMessageSigner,
  createGetLedgerBalancesMessage,
} from "@erc7824/nitrolite";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";

export async function POST() {
  try {
    console.log("[API] Getting ledger balances...");

    // Prepare private keys
    const privateKeys = [
      process.env.AGENT_A_PRIVATE_KEY as `0x${string}`,
      process.env.AGENT_B_PRIVATE_KEY as `0x${string}`,
      process.env.USER_A_PRIVATE_KEY as `0x${string}`,
      process.env.USER_B_PRIVATE_KEY as `0x${string}`,
      process.env.USER_C_PRIVATE_KEY as `0x${string}`,
    ];

    const responses: { account: string; response: unknown }[] = [];
    for (const privateKey of privateKeys) {
      // Create a new Yellow client for each account to avoid listener conflicts
      const yellowClient = new Client({ url: yellowConfig.url });
      await yellowClient.connect();

      // Create wallet client
      const account = privateKeyToAccount(privateKey);
      const walletClient = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(),
      });

      // Authenticate and get message signer
      const sessionAccount = await authenticateWalletInYellow(
        yellowClient,
        walletClient,
      );
      const messageSigner = createECDSAMessageSigner(sessionAccount.privateKey);

      // Get ledger balances
      const getLedgerBalancesMessage =
        await createGetLedgerBalancesMessage(messageSigner);
      const response = await yellowClient.sendMessage(getLedgerBalancesMessage);

      responses.push({ account: account.address, response: response });

      // Close the connection after use
      await yellowClient.disconnect();
    }

    return createSuccessApiResponse(responses);
  } catch (error) {
    console.error(
      `[API] Failed to get ledger balances, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
