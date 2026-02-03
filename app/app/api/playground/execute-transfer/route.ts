import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
import {
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import {
  createAppSessionMessage as createCreateAppSessionMessage,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
} from "@erc7824/nitrolite/dist/rpc/api";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";

export async function POST() {
  try {
    console.log("[API] Executing transfer...");

    // Create and connect Yellow clients
    const yellowClient1 = new Client({ url: yellowConfig.url });
    const yellowClient2 = new Client({ url: yellowConfig.url });
    await yellowClient1.connect();
    await yellowClient2.connect();

    // Create account and wallets
    const account1 = privateKeyToAccount(
      process.env.ACCOUNT_1_PRIVATE_KEY as `0x${string}`,
    );
    const account2 = privateKeyToAccount(
      process.env.ACCOUNT_2_PRIVATE_KEY as `0x${string}`,
    );
    const walletClient1 = createWalletClient({
      account: account1,
      chain: sepolia,
      transport: http(),
    });
    const walletClient2 = createWalletClient({
      account: account2,
      chain: sepolia,
      transport: http(),
    });

    // Authenticate and get message signers
    const sessionAccount1 = await authenticateWallet(
      yellowClient1,
      walletClient1,
    );
    const sessionAccount2 = await authenticateWallet(
      yellowClient2,
      walletClient2,
    );
    const messageSigner1 = createECDSAMessageSigner(sessionAccount1.privateKey);
    const messageSigner2 = createECDSAMessageSigner(sessionAccount2.privateKey);

    // Define the app
    const appDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [account1.address, account2.address],
      weights: [50, 50], // Equal voting power
      quorum: 100, // Requires unanimous agreement
      challenge: 0, // No challenge period
      nonce: Date.now(), // Unique session identifier
      application: yellowConfig.appName,
    };

    // Define initial allocations
    const initAllocations: RPCAppSessionAllocation[] = [
      { participant: account1.address, asset: "ytest.usd", amount: "0.01" },
      { participant: account2.address, asset: "ytest.usd", amount: "0.00" },
    ];

    // Create open app session message
    const createAppSessionMessage = await createCreateAppSessionMessage(
      messageSigner1,
      {
        definition: appDefinition,
        allocations: initAllocations,
      },
    );

    // Send create app session message
    const sendCreateAppSessionMessageResponse = await yellowClient1.sendMessage(
      createAppSessionMessage,
    );
    console.log({
      sendCreateAppSessionMessageResponse,
    });
    // Save app session ID
    const appSessionId =
      sendCreateAppSessionMessageResponse.params.appSessionId;

    // Define final allocations
    const finalAllocations: RPCAppSessionAllocation[] = [
      { participant: account1.address, asset: "ytest.usd", amount: "0.00" },
      { participant: account2.address, asset: "ytest.usd", amount: "0.01" },
    ];

    // Create close app session message
    const closeAppSessionMessage = await createCloseAppSessionMessage(
      messageSigner1,
      {
        app_session_id: appSessionId,
        allocations: finalAllocations,
      },
    );

    // Sign close app session message with the second account
    const closeAppSessionMessageJson = JSON.parse(closeAppSessionMessage);
    const signature2 = await messageSigner2(
      closeAppSessionMessageJson.req as RPCData,
    );
    closeAppSessionMessageJson.sig.push(signature2);

    // Send close app session message
    const sendCloseAppSessionMessageResponse = await yellowClient1.sendMessage(
      JSON.stringify(closeAppSessionMessageJson),
    );
    console.log({ sendCloseAppSessionMessageResponse });

    return createSuccessApiResponse({
      sendCreateAppSessionMessageResponse,
      sendCloseAppSessionMessageResponse,
    });
  } catch (error) {
    console.error(
      `[API] Failed to execute transfer, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
