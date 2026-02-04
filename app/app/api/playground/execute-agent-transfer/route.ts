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
  createCloseAppSessionMessage,
  createAppSessionMessage as createCreateAppSessionMessage,
  createECDSAMessageSigner,
} from "@erc7824/nitrolite/dist/rpc/api";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";

export async function POST() {
  try {
    console.log("[API] Executing agent transfer...");

    // Create and connect Yellow clients
    const yellowClient0 = new Client({ url: yellowConfig.url });
    const yellowClient1 = new Client({ url: yellowConfig.url });
    const yellowClient2 = new Client({ url: yellowConfig.url });
    await yellowClient0.connect();
    await yellowClient1.connect();
    await yellowClient2.connect();

    // Create account and wallets
    const account0 = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY as `0x${string}`,
    );
    const account1 = privateKeyToAccount(
      process.env.USER_A_PRIVATE_KEY as `0x${string}`,
    );
    const account2 = privateKeyToAccount(
      process.env.USER_B_PRIVATE_KEY as `0x${string}`,
    );
    const walletClient0 = createWalletClient({
      account: account0,
      chain: sepolia,
      transport: http(),
    });
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
    const sessionAccount0 = await authenticateWallet(
      yellowClient0,
      walletClient0,
    );
    const sessionAccount1 = await authenticateWallet(
      yellowClient1,
      walletClient1,
    );
    const sessionAccount2 = await authenticateWallet(
      yellowClient2,
      walletClient2,
    );
    const messageSigner0 = createECDSAMessageSigner(sessionAccount0.privateKey);
    const messageSigner1 = createECDSAMessageSigner(sessionAccount1.privateKey);
    const messageSigner2 = createECDSAMessageSigner(sessionAccount2.privateKey);

    // Define the app
    const appDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [account0.address, account1.address, account2.address],
      weights: [0, 50, 50], // Equal voting power
      quorum: 100, // Requires unanimous agreement
      challenge: 0, // No challenge period
      nonce: Date.now(), // Unique session identifier
      application: yellowConfig.appName,
    };

    // Define initial allocations
    const initAllocations: RPCAppSessionAllocation[] = [
      { participant: account0.address, asset: "ytest.usd", amount: "0.0" },
      { participant: account1.address, asset: "ytest.usd", amount: "10.0" },
      { participant: account2.address, asset: "ytest.usd", amount: "10.0" },
    ];

    // Create open app session message
    const createAppSessionMessage = await createCreateAppSessionMessage(
      messageSigner0,
      {
        definition: appDefinition,
        allocations: initAllocations,
      },
    );

    // Sign open app session message with the account 1 and account 2
    const createAppSessionMessageJson = JSON.parse(createAppSessionMessage);
    const createSignature1 = await messageSigner1(
      createAppSessionMessageJson.req as RPCData,
    );
    createAppSessionMessageJson.sig.push(createSignature1);
    const createSignature2 = await messageSigner2(
      createAppSessionMessageJson.req as RPCData,
    );
    createAppSessionMessageJson.sig.push(createSignature2);

    // Send create app session message
    const sendCreateAppSessionMessageResponse = await yellowClient0.sendMessage(
      JSON.stringify(createAppSessionMessageJson),
    );
    console.log({
      sendCreateAppSessionMessageResponse,
    });
    // Save app session ID
    const appSessionId =
      sendCreateAppSessionMessageResponse.params.appSessionId;

    // Define final allocations
    const finalAllocations: RPCAppSessionAllocation[] = [
      { participant: account0.address, asset: "ytest.usd", amount: "2.0" },
      { participant: account1.address, asset: "ytest.usd", amount: "9.0" },
      { participant: account2.address, asset: "ytest.usd", amount: "9.0" },
    ];

    // Create close app session message
    const closeAppSessionMessage = await createCloseAppSessionMessage(
      messageSigner0,
      {
        app_session_id: appSessionId,
        allocations: finalAllocations,
      },
    );

    // Sign close app session message with the second account
    const closeAppSessionMessageJson = JSON.parse(closeAppSessionMessage);
    const closeSignature1 = await messageSigner1(
      closeAppSessionMessageJson.req as RPCData,
    );
    closeAppSessionMessageJson.sig.push(closeSignature1);
    const closeSignature2 = await messageSigner2(
      closeAppSessionMessageJson.req as RPCData,
    );
    closeAppSessionMessageJson.sig.push(closeSignature2);

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
      `[API] Failed to execute agent transfer, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
