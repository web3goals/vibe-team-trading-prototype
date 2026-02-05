import { yellowConfig } from "@/config/yellow";
import { YellowSessionAccount } from "@/types/yellow";
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  RPCMethod,
  RPCResponse,
} from "@erc7824/nitrolite";
import { WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Client } from "yellow-ts";

export function generateYellowSessionAccount(): YellowSessionAccount {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
}

export async function authenticateWalletInYellow(
  yellowClient: Client,
  walletClient: WalletClient,
): Promise<YellowSessionAccount> {
  const sessionAccount = generateYellowSessionAccount();
  const sessionExpiresAt = BigInt(
    Math.floor(Date.now() / 1000) + yellowConfig.sessionDuration,
  );

  const authParams = {
    address: walletClient.account?.address as `0x${string}`,
    session_key: sessionAccount.address,
    application: yellowConfig.appName,
    allowances: yellowConfig.sessionAllowances,
    expires_at: sessionExpiresAt,
    scope: yellowConfig.sessionScope,
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Auth timeout")), 30000);

    yellowClient.listen(async (message: RPCResponse) => {
      // Check for error
      if (message.method === RPCMethod.Error) {
        clearTimeout(timeout);
        console.log(
          `[Yellow] Error message received, message: ${JSON.stringify(message)}`,
        );
        reject(new Error("Error message received"));
        return;
      }

      // Check for auth challenge
      if (message.method === RPCMethod.AuthChallenge) {
        try {
          console.log("[Yellow] Processing auth challenge...");
          const signer = createEIP712AuthMessageSigner(
            walletClient,
            authParams,
            { name: yellowConfig.appName },
          );
          const verifyMsg = await createAuthVerifyMessage(signer, message);
          await yellowClient.sendMessage(verifyMsg);
          clearTimeout(timeout);
          console.log("[Yellow] Processing auth challenge completed");
          resolve(sessionAccount);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      }
    });

    // Send auth request after setting up listener
    createAuthRequestMessage(authParams).then((authRequestMessage) => {
      console.log("[Yellow] Sending auth request message...");
      yellowClient.sendMessage(authRequestMessage);
    });
  });
}
