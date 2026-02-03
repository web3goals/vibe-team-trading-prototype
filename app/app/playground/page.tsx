"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { GroupAgent, GroupUser } from "@/types/group";
import {
  createECDSAMessageSigner,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import axios from "axios";
import { useState } from "react";

export default function PlaygroundPage() {
  const [address, setAddress] = useState<string | undefined>();
  const [sessionAccountPrivateKey, setSessionAccountPrivateKey] = useState<
    string | undefined
  >();

  async function signIn(address: string) {
    console.log(`Signing in, address: ${address}...`);

    const { data } = await axios.post("/api/yellow/session-account", {
      address: address,
    });
    const sessionAccount = data.data.sessionAccount;

    setAddress(address);
    setSessionAccountPrivateKey(sessionAccount.privateKey);

    console.log("Signing in completed");
  }

  async function createGroup() {
    console.log("Creating group...");

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
      {
        ensName: demoConfig.userC.ensName,
        address: demoConfig.userC.address as `0x${string}`,
      },
    ];

    // Define Yellow app definition
    const yellowAppDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [
        groupAgent.address,
        groupUsers[0].address,
        groupUsers[1].address,
        groupUsers[2].address,
      ],
      weights: [0, 25, 25, 25],
      quorum: 50,
      challenge: 0,
      nonce: Date.now(),
      application: yellowConfig.appName,
    };

    // Define Yellow app allocations
    const yellowAppAllocations: RPCAppSessionAllocation[] = [
      { participant: groupAgent.address, asset: "ytest.usd", amount: "0.0" },
      {
        participant: groupUsers[0].address,
        asset: "ytest.usd",
        amount: "100.0",
      },
      {
        participant: groupUsers[1].address,
        asset: "ytest.usd",
        amount: "100.0",
      },
      {
        participant: groupUsers[2].address,
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
      <p className="font-bold">Playground</p>
      <Separator className="mt-4" />
      <div className="flex flex-col gap-2 mt-4">
        <p className="text-sm text-muted-foreground">
          Address: {address || "N/A"}
        </p>
        <p className="text-sm text-muted-foreground">
          Session account private key: {sessionAccountPrivateKey || "N/A"}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 mt-4">
        <Button onClick={() => signIn(demoConfig.userA.address)}>
          Sign in User A
        </Button>
        <Button onClick={() => createGroup()}>Create Group</Button>
      </div>
    </div>
  );
}
