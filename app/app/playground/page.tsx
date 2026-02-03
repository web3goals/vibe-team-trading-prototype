"use client";

import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GroupMessage } from "@/types/group";
import { createECDSAMessageSigner, RPCData } from "@erc7824/nitrolite";
import axios from "axios";

export default function PlaygroundPage() {
  const { address, ensName, sessionAccountPrivateKey } = useUser();

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
        <Button variant="outline" onClick={() => addYellowMessageSignature()}>
          Add Yellow Message Signature
        </Button>
      </div>
    </div>
  );
}
