import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { confettiConfig } from "@/config/confetti";
import { handleError } from "@/lib/error";
import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import { createECDSAMessageSigner, RPCData } from "@erc7824/nitrolite";
import axios from "axios";
import confetti from "canvas-confetti";
import { SignatureIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GroupMessageCard(props: {
  group: Group;
  groupMessage: GroupMessage;
}) {
  const { address, sessionAccountPrivateKey } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  // TODO: Implement
  async function handleSignYellowMessage() {
    try {
      console.log("[Component] Sign yellow message...");
      setIsProcessing(true);

      if (!sessionAccountPrivateKey) {
        throw new Error("Please sign in");
      }
      if (!props.groupMessage.extra?.yellow?.message) {
        throw new Error("No yellow message to sign");
      }

      const yellowMessageSigner = createECDSAMessageSigner(
        sessionAccountPrivateKey as `0x${string}`,
      );

      const yellowMessageJson = JSON.parse(
        props.groupMessage.extra.yellow.message,
      );
      const signature = await yellowMessageSigner(
        yellowMessageJson.req as RPCData,
      );

      // Call API to add signature
      await axios.patch(
        `/api/groups/${props.group._id.toString()}/messages/${props.groupMessage.id}/yellow-message-signature`,
        {
          address: address,
          signature: signature,
        },
      );

      confetti({ ...confettiConfig });
      toast.success("Signed");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to sign yellow message" });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Created: {new Date(props.groupMessage.created).toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Creator role: {props.groupMessage.creatorRole}
        </p>
        <p className="text-sm text-muted-foreground">
          Creator address: {props.groupMessage.creatorAddress}
        </p>
        <p className="text-sm text-muted-foreground wrap-break-word">
          Content: {props.groupMessage.content}
        </p>
        {props.groupMessage.extra?.yellow && (
          <>
            <p className="text-sm text-muted-foreground">Extra Yellow:</p>
            <pre className="text-xs text-muted-foreground bg-muted rounded-md overflow-auto wrap-anywhere p-2">
              {JSON.stringify(props.groupMessage.extra.yellow, null, 2)}
            </pre>
          </>
        )}
      </div>
      <Button
        disabled={isProcessing}
        onClick={() => handleSignYellowMessage()}
        className="mt-2"
      >
        {isProcessing ? <Spinner /> : <SignatureIcon />} Sign Yellow message
      </Button>
    </div>
  );
}
