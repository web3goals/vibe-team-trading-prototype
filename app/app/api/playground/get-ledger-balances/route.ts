import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
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

    const account1 = privateKeyToAccount(
      process.env.ACCOUNT_1_PRIVATE_KEY as `0x${string}`,
    );
    const walletClient1 = createWalletClient({
      account: account1,
      chain: sepolia,
      transport: http(),
    });

    // Connect to Yellow
    const yellowClient = new Client({ url: yellowConfig.url });
    await yellowClient.connect();

    // Authenticate and get session account and signer
    const sessionAccount = await authenticateWallet(
      yellowClient,
      walletClient1,
    );
    const sessionSigner = createECDSAMessageSigner(sessionAccount.privateKey);

    // Get ledger balances
    const ledgerBalancesMsg =
      await createGetLedgerBalancesMessage(sessionSigner);
    const response = await yellowClient.sendMessage(ledgerBalancesMsg);

    return createSuccessApiResponse(response);
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
