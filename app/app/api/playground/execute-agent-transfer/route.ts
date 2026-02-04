import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
import {
  MessageSigner,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import {
  createCloseAppSessionMessage,
  createAppSessionMessage as createCreateAppSessionMessage,
  createECDSAMessageSigner,
  createGetLedgerBalancesMessage,
  createSubmitAppStateMessage,
} from "@erc7824/nitrolite/dist/rpc/api";
import { createWalletClient, http, WalletClient } from "viem";
import { Account, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";

export async function POST() {
  try {
    console.log("[API] Executing agent transfer...");

    // Prepare account, yellow clients, and message signers
    const accounts = await getAccounts();
    const walletClients = await getWalletClients(accounts);
    const { yellowClients, messageSigners } =
      await authenticateWalletClients(walletClients);

    // Get ledger balances
    const ledgerBalancesBeforeCreateApp = await getLedgerBalances(
      yellowClients,
      messageSigners,
    );

    // Define the app
    const appDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [
        accounts[0].address,
        accounts[1].address,
        accounts[2].address,
      ],
      weights: [0, 50, 50], // Equal voting power
      quorum: 100, // Requires unanimous agreement
      challenge: 0, // No challenge period
      nonce: Date.now(), // Unique session identifier
      application: yellowConfig.appName,
    };

    // Send a create app session message
    const initAllocations: RPCAppSessionAllocation[] = [
      { participant: accounts[0].address, asset: "ytest.usd", amount: "0.0" },
      { participant: accounts[1].address, asset: "ytest.usd", amount: "10.0" },
      { participant: accounts[2].address, asset: "ytest.usd", amount: "10.0" },
    ];
    const createAppSessionMessage = await getCreateAppSessionMessage(
      appDefinition,
      initAllocations,
      messageSigners,
    );
    const sendCreateAppSessionMessageResponse =
      await yellowClients[0].sendMessage(createAppSessionMessage);

    // Save app session ID
    const appSessionId =
      sendCreateAppSessionMessageResponse.params.appSessionId;

    // Get ledger balances
    const ledgerBalancesAfterCreateApp = await getLedgerBalances(
      yellowClients,
      messageSigners,
    );

    // Send a submit app state message
    const newAllocations: RPCAppSessionAllocation[] = [
      { participant: accounts[0].address, asset: "ytest.usd", amount: "2.0" },
      { participant: accounts[1].address, asset: "ytest.usd", amount: "9.0" },
      { participant: accounts[2].address, asset: "ytest.usd", amount: "9.0" },
    ];
    const submitAppStateMessage = await getSubmitAppStateMessage(
      appSessionId,
      newAllocations,
      messageSigners,
    );
    const sendSubmitAppStateMessageResponse =
      await yellowClients[0].sendMessage(submitAppStateMessage);

    // Get ledger balances
    const ledgerBalancesAfterSubmitAppState = await getLedgerBalances(
      yellowClients,
      messageSigners,
    );

    // Send a close app session message
    const finalAllocations: RPCAppSessionAllocation[] = [
      { participant: accounts[0].address, asset: "ytest.usd", amount: "0.0" },
      { participant: accounts[1].address, asset: "ytest.usd", amount: "10.0" },
      { participant: accounts[2].address, asset: "ytest.usd", amount: "10.0" },
    ];
    const closeAppSessionMessage = await getCloseAppSessionMessage(
      appSessionId,
      finalAllocations,
      messageSigners,
    );
    const sendCloseAppSessionMessageResponse =
      await yellowClients[0].sendMessage(closeAppSessionMessage);

    // Get ledger balances
    const ledgerBalancesAfterCloseApp = await getLedgerBalances(
      yellowClients,
      messageSigners,
    );

    // Close the yellow clients
    for (const yellowClient of yellowClients) {
      await yellowClient.disconnect();
    }

    return createSuccessApiResponse({
      sendCreateAppSessionMessageResponse,
      sendSubmitAppStateMessageResponse,
      sendCloseAppSessionMessageResponse,
      ledgerBalancesBeforeCreateApp,
      ledgerBalancesAfterCreateApp,
      ledgerBalancesAfterSubmitAppState,
      ledgerBalancesAfterCloseApp,
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

async function getAccounts(): Promise<Account[]> {
  const privateKeys = [
    process.env.AGENT_PRIVATE_KEY,
    process.env.USER_A_PRIVATE_KEY,
    process.env.USER_B_PRIVATE_KEY,
  ];

  return privateKeys.map((privateKey) =>
    privateKeyToAccount(privateKey as `0x${string}`),
  );
}

async function getWalletClients(accounts: Account[]): Promise<WalletClient[]> {
  return accounts.map((account) =>
    createWalletClient({
      account: account,
      chain: sepolia,
      transport: http(),
    }),
  );
}

async function authenticateWalletClients(
  walletClients: WalletClient[],
): Promise<{ yellowClients: Client[]; messageSigners: MessageSigner[] }> {
  const yellowClients: Client[] = [];
  const messageSigners: MessageSigner[] = [];
  for (const walletClient of walletClients) {
    // Create a new Yellow client for each account to avoid listener conflicts
    const yellowClient = new Client({ url: yellowConfig.url });
    await yellowClient.connect();

    // Authenticate and get message signer
    const sessionAccount = await authenticateWallet(yellowClient, walletClient);
    const messageSigner = createECDSAMessageSigner(sessionAccount.privateKey);

    // Push the yellow client and message signer to the arrays
    yellowClients.push(yellowClient);
    messageSigners.push(messageSigner);
  }

  return { yellowClients, messageSigners };
}

async function getCreateAppSessionMessage(
  appDefinition: RPCAppDefinition,
  initAllocations: RPCAppSessionAllocation[],
  messageSigners: MessageSigner[],
): Promise<string> {
  // Create a message with the signer 0
  const message = await createCreateAppSessionMessage(messageSigners[0], {
    definition: appDefinition,
    allocations: initAllocations,
  });
  const messageJson = JSON.parse(message);

  // Sign the message with the signer 1
  const signature1 = await messageSigners[1](messageJson.req as RPCData);
  messageJson.sig.push(signature1);

  // Sign the message with the signer 2
  const signature2 = await messageSigners[2](messageJson.req as RPCData);
  messageJson.sig.push(signature2);

  return JSON.stringify(messageJson);
}

async function getSubmitAppStateMessage(
  appSessionId: `0x${string}`,
  newAllocations: RPCAppSessionAllocation[],
  messageSigners: MessageSigner[],
): Promise<string> {
  // Create a message with the signer 0
  const message = await createSubmitAppStateMessage(messageSigners[0], {
    app_session_id: appSessionId,
    allocations: newAllocations,
    version: 2,
  });
  const messageJson = JSON.parse(message);

  // Sign the message with the signer 1
  const signature1 = await messageSigners[1](messageJson.req as RPCData);
  messageJson.sig.push(signature1);

  // Sign the message with the signer 2
  const signature2 = await messageSigners[2](messageJson.req as RPCData);
  messageJson.sig.push(signature2);

  return JSON.stringify(messageJson);
}

async function getCloseAppSessionMessage(
  appSessionId: `0x${string}`,
  finalAllocations: RPCAppSessionAllocation[],
  messageSigners: MessageSigner[],
): Promise<string> {
  // Create a message with the signer 0
  const message = await createCloseAppSessionMessage(messageSigners[0], {
    app_session_id: appSessionId,
    allocations: finalAllocations,
  });
  const messageJson = JSON.parse(message);

  // Sign the message with the signer 1
  const signature1 = await messageSigners[1](messageJson.req as RPCData);
  messageJson.sig.push(signature1);

  // Sign the message with the signer 2
  const signature2 = await messageSigners[2](messageJson.req as RPCData);
  messageJson.sig.push(signature2);

  return JSON.stringify(messageJson);
}

async function getLedgerBalances(
  yellowClients: Client[],
  messageSigners: MessageSigner[],
): Promise<string[]> {
  const ledgerBalances: string[] = [];
  for (let i = 0; i < yellowClients.length; i++) {
    const message = await createGetLedgerBalancesMessage(messageSigners[i]);
    const response = await yellowClients[i].sendMessage(message);
    ledgerBalances.push(JSON.stringify(response));
  }
  return ledgerBalances;
}
