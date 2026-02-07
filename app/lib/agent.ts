import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createECDSAMessageSigner, MessageSigner } from "@erc7824/nitrolite";
import { ChainId, RouteExtended } from "@lifi/sdk";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import { executeLifiRoute } from "./lifi";
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
): Promise<RouteExtended> {
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

  return await executeLifiRoute({
    walletClient: agentWalletClient,
    fromChainId: ChainId.BAS,
    toChainId: ChainId.BAS,
    fromTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    toTokenAddress: "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07", // CLAWD
    fromAmount: "100000", // 0.1 USDC
    fromAddress: agentAddress, // The address from which the tokens are being transferred
  });
}
