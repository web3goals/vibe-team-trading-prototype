"use client";

import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { GroupAgent, GroupUser } from "@/types/group";
import {
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
  createECDSAMessageSigner,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import axios from "axios";
import { UsersIcon } from "lucide-react";
import { useUser } from "../providers/user-provider";
import { Button } from "../ui/button";

// TODO: Implement
export function Index() {
  const { sessionAccountPrivateKey } = useUser();

  async function handleCreateGroup() {
    console.log("Creating group...");

    if (!sessionAccountPrivateKey) {
      console.error("No session account private key found.");
      return;
    }

    // Define group agent
    const groupAgent: GroupAgent = {
      ensName: demoConfig.agent.ensName,
      address: demoConfig.agent.address as `0x${string}`,
    };

    // Define group users
    const groupUsers: GroupUser[] = [
      {
        ensName: demoConfig.userA.ensName,
        address: demoConfig.userA.address as `0x${string}`,
      },
      {
        ensName: demoConfig.userB.ensName,
        address: demoConfig.userB.address as `0x${string}`,
      },
    ];

    // Define Yellow app definition
    const yellowAppDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [
        demoConfig.agent.address as `0x${string}`,
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
        participant: demoConfig.agent.address as `0x${string}`,
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

    console.log("Creating group completed");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Title, subtitle */}
      <h2 className="text-3xl font-bold tracking-tight text-center mt-6">
        Vibe together. Trade together. Let AI do the heavy lifting.
      </h2>
      <h4 className="text-xl text-muted-foreground tracking-tight text-center mt-2">
        Collaborative platform where groups trade alongside AI Agents. By
        combining human sentiment with quorum-based governance, we turn trading
        into a high-frequency team sport.
      </h4>
      {/* Button */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <Button variant="default" size="lg" onClick={() => handleCreateGroup()}>
          <UsersIcon />
          Create group
        </Button>
      </div>
    </div>
  );
}
