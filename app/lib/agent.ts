import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createECDSAMessageSigner, MessageSigner } from "@erc7824/nitrolite";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import { authenticateWalletInYellow } from "./yellow";

export function getAgentPrivateKey(
  agentAddress: `0x${string}`,
): string | undefined {
  if (getAddress(agentAddress) === getAddress(demoConfig.groupAgentA.address)) {
    return process.env.AGENT_A_PRIVATE_KEY;
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
