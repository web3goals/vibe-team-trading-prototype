import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createECDSAMessageSigner, MessageSigner } from "@erc7824/nitrolite";
import { ChainId, createConfig, EVM, executeRoute, getRoutes } from "@lifi/sdk";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import { authenticateWalletInYellow } from "./yellow";

export function getAgentPrivateKey(
  agentAddress: `0x${string}`,
): string | undefined {
  if (getAddress(agentAddress) === getAddress(demoConfig.groupAgentA.address)) {
    return process.env.AGENT_A_PRIVATE_KEY;
  }
  if (getAddress(agentAddress) === getAddress(demoConfig.groupAgentB.address)) {
    return process.env.AGENT_B_PRIVATE_KEY;
  }
  return undefined;
}

export async function getAgentYellowMessageSigner(
  agentAddress: `0x${string}`,
): Promise<MessageSigner> {
  const agentPrivateKey = getAgentPrivateKey(agentAddress);
  if (!agentPrivateKey) {
    throw new Error("Agent private key undefined");
  }
  return createECDSAMessageSigner(agentPrivateKey as `0x${string}`);
}

export async function sendYellowMessageByAgent(
  agentAddress: `0x${string}`,
  yellowMessage: string,
): Promise<string> {
  const agentPrivateKey = getAgentPrivateKey(agentAddress);
  if (!agentPrivateKey) {
    throw new Error("Agent private key undefined");
  }
  const agentAccount = privateKeyToAccount(agentPrivateKey as `0x${string}`);
  const agentWalletClient = createWalletClient({
    account: agentAccount,
    chain: sepolia,
    transport: http(),
  });

  const yellowClient = new Client({ url: yellowConfig.url });
  await yellowClient.connect();

  await authenticateWalletInYellow(yellowClient, agentWalletClient);

  const yellowResponse = await yellowClient.sendMessage(yellowMessage);

  yellowClient.disconnect();

  return yellowResponse as string;
}

export async function executeLiFiTradeByAgent(
  agentAddress: `0x${string}`,
): Promise<void> {
  const agentPrivateKey = getAgentPrivateKey(agentAddress);
  if (!agentPrivateKey) {
    throw new Error("Agent private key undefined");
  }
  const agentAccount = privateKeyToAccount(agentPrivateKey as `0x${string}`);
  const agentWalletClient = createWalletClient({
    account: agentAccount,
    chain: base,
    transport: http(),
  });

  createConfig({
    integrator: process.env.LIFI_INTEGRATOR as string,
    apiKey: process.env.LIFI_API_KEY as string,
    routeOptions: {
      fee: 0.01,
    },
    providers: [
      EVM({
        getWalletClient: async () => agentWalletClient,
      }),
    ],
  });

  const getRoutesResponse = await getRoutes({
    fromChainId: ChainId.BAS,
    toChainId: ChainId.BAS,
    fromTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    toTokenAddress: "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07", // CLAWD
    fromAmount: "100000", // 0.1 USDC
    fromAddress: agentAddress, // The address from which the tokens are being transferred
  });
  console.log(
    `[Agent] Get routes response: ${JSON.stringify(getRoutesResponse)}`,
  );

  const route = getRoutesResponse.routes[0];
  console.log(`[Agent] Route: ${JSON.stringify(route)}`);

  const executeRouteResponse = await executeRoute(route, {
    // Gets called once the route object gets new updates
    updateRouteHook(route) {
      console.log(`[Agent] Updated route: ${JSON.stringify(route)}`);
    },
  });
  console.log(
    `[Agent] Execute route response: ${JSON.stringify(executeRouteResponse)}`,
  );
}
