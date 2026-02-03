"use client";

import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { GroupAgent, GroupMessage, GroupUser } from "@/types/group";
import {
  createECDSAMessageSigner,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import axios from "axios";

export default function PlaygroundPage() {
  const { address, ensName, sessionAccountPrivateKey } = useUser();

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

  async function addYellowMessageSignature() {
    console.log("Adding yellow message signature...");

    const message: GroupMessage = {
      id: "6982440b74d49fb886ce5c95",
      created: new Date("2026-02-03T18:52:59.085Z"),
      senderAddress: "0x818eD0E13030FDE0C86B771a965084e44CC7F8d6",
      senderRole: "system",
      content:
        'Sign a message to create an Yellow app session, create app session message: {"req":[1770144788547,"create_app_session",{"definition":{"protocol":"NitroRPC/0.4","participants":["0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f","0x818eD0E13030FDE0C86B771a965084e44CC7F8d6","0x568647a8f0dDc1772E97aDD23c70960138F16330","0x60aef32500a838cb6ef895478606a3d2DC0deD7c"],"weights":[0,25,25,25],"quorum":50,"challenge":0,"nonce":1770144778914,"application":"Test app"},"allocations":[{"participant":"0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f","asset":"ytest.usd","amount":"0.0"},{"participant":"0x818eD0E13030FDE0C86B771a965084e44CC7F8d6","asset":"ytest.usd","amount":"100.0"},{"participant":"0x568647a8f0dDc1772E97aDD23c70960138F16330","asset":"ytest.usd","amount":"100.0"},{"participant":"0x60aef32500a838cb6ef895478606a3d2DC0deD7c","asset":"ytest.usd","amount":"100.0"}]},1770144778914],"sig":["0xfbc40abaf83ae257209c1a5abce3528770defe9e2118c56920dab62a16dfae1836f636520c598820dabe9b5a10195e2d2282fa25235412c40fc68882a7caae2b1c"]}',
      yellowMessage:
        '{"req":[1770144788547,"create_app_session",{"definition":{"protocol":"NitroRPC/0.4","participants":["0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f","0x818eD0E13030FDE0C86B771a965084e44CC7F8d6","0x568647a8f0dDc1772E97aDD23c70960138F16330","0x60aef32500a838cb6ef895478606a3d2DC0deD7c"],"weights":[0,25,25,25],"quorum":50,"challenge":0,"nonce":1770144778914,"application":"Test app"},"allocations":[{"participant":"0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f","asset":"ytest.usd","amount":"0.0"},{"participant":"0x818eD0E13030FDE0C86B771a965084e44CC7F8d6","asset":"ytest.usd","amount":"100.0"},{"participant":"0x568647a8f0dDc1772E97aDD23c70960138F16330","asset":"ytest.usd","amount":"100.0"},{"participant":"0x60aef32500a838cb6ef895478606a3d2DC0deD7c","asset":"ytest.usd","amount":"100.0"}]},1770144778914],"sig":["0xfbc40abaf83ae257209c1a5abce3528770defe9e2118c56920dab62a16dfae1836f636520c598820dabe9b5a10195e2d2282fa25235412c40fc68882a7caae2b1c"]}',
    };

    // Create Yellow message signer
    const yellowMessageSigner = createECDSAMessageSigner(
      sessionAccountPrivateKey as `0x${string}`,
    );
    const yellowMessage = message.yellowMessage as string;
    const yellowMessageJson = JSON.parse(yellowMessage);
    const signature = await yellowMessageSigner(yellowMessageJson as RPCData);

    await axios.patch(
      `/api/groups/6982440b74d49fb886ce5c96/messages/${message.id}`,
      {
        senderEnsName: ensName,
        signature: signature,
      },
    );

    console.log("Adding yellow message signature completed");
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
          ENS Name: {ensName || "N/A"}
        </p>
        <p className="text-sm text-muted-foreground">
          Session account private key: {sessionAccountPrivateKey || "N/A"}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 mt-4">
        <Button variant="outline" onClick={() => createGroup()}>
          Create Group
        </Button>
        <Button variant="outline" onClick={() => addYellowMessageSignature()}>
          Add Yellow Message Signature
        </Button>
      </div>
    </div>
  );
}
