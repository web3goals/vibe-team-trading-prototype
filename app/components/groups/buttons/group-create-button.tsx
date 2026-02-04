import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { confettiConfig } from "@/config/confetti";
import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { handleError } from "@/lib/error";
import { GroupAgent, GroupUser } from "@/types/group";
import {
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
  createECDSAMessageSigner,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import axios from "axios";
import confetti from "canvas-confetti";
import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GroupCreateButton() {
  const { sessionAccountPrivateKey } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCreateGroup() {
    try {
      console.log("[Component] Creating group...");
      setIsProcessing(true);

      if (!sessionAccountPrivateKey) {
        throw new Error("Please sign in");
      }

      // Define group agent
      const groupAgent: GroupAgent = {
        address: demoConfig.agentA.address as `0x${string}`,
        ensName: demoConfig.agentA.ensName,
      };

      // Define group users
      const groupUsers: GroupUser[] = [
        {
          address: demoConfig.userA.address as `0x${string}`,
          ensName: demoConfig.userA.ensName,
        },
        {
          address: demoConfig.userB.address as `0x${string}`,
          ensName: demoConfig.userB.ensName,
        },
      ];

      // Define Yellow app definition
      const yellowAppDefinition: RPCAppDefinition = {
        protocol: RPCProtocolVersion.NitroRPC_0_4,
        participants: [
          demoConfig.agentA.address as `0x${string}`,
          demoConfig.userA.address as `0x${string}`,
          demoConfig.userB.address as `0x${string}`,
        ],
        weights: [0, 25, 25],
        quorum: 50,
        challenge: 0,
        nonce: Date.now(),
        application: yellowConfig.appName,
      };

      // Define Yellow app allocations
      const yellowAppAllocations: RPCAppSessionAllocation[] = [
        {
          participant: demoConfig.agentA.address as `0x${string}`,
          asset: "ytest.usd",
          amount: "0.0",
        },
        {
          participant: demoConfig.userA.address as `0x${string}`,
          asset: "ytest.usd",
          amount: "100.0",
        },
        {
          participant: demoConfig.userB.address as `0x${string}`,
          asset: "ytest.usd",
          amount: "100.0",
        },
      ];

      // Create Yellow message signer
      const yellowMessageSigner = createECDSAMessageSigner(
        sessionAccountPrivateKey as `0x${string}`,
      );

      // Create Yellow create app session message
      const yellowCreateAppSessionMessage = await createCreateAppSessionMessage(
        yellowMessageSigner,
        {
          definition: yellowAppDefinition,
          allocations: yellowAppAllocations,
        },
      );

      // Call create group API
      await axios.post("/api/groups", {
        agent: groupAgent,
        users: groupUsers,
        yellowAppDefinition: yellowAppDefinition,
        yellowCreateAppSessionMessage: yellowCreateAppSessionMessage,
      });

      confetti({ ...confettiConfig });
      toast.success("Created");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to create group" });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Button
      size="lg"
      disabled={isProcessing}
      onClick={() => handleCreateGroup()}
    >
      {isProcessing ? <Spinner /> : <UsersIcon />} Create group
    </Button>
  );
}
