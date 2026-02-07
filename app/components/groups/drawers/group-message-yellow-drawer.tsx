import { useUser } from "@/components/providers/user-provider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { confettiConfig } from "@/config/confetti";
import { handleError } from "@/lib/error";
import { cn } from "@/lib/utils";
import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import { createECDSAMessageSigner, RPCData } from "@erc7824/nitrolite";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { ClassValue } from "clsx";
import { useState } from "react";
import { toast } from "sonner";

export function GroupMessageYellowDrawer(props: {
  group: Group;
  groupMessage: GroupMessage;
  className?: ClassValue;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { address, sessionAccountPrivateKey } = useUser();

  // TODO: Implement
  async function handleSignYellowMessage() {
    try {
      console.log("[Component] Sign yellow message...");
      setIsProcessing(true);

      if (!address || !sessionAccountPrivateKey) {
        setIsOpen(false);
        throw new Error("Please sign in");
      }
      if (!props.group.users.some((user) => user.address === address)) {
        setIsOpen(false);
        throw new Error(
          "You must be a member of the group to sign the Yellow message",
        );
      }
      if (!props.groupMessage.extra?.yellow?.message) {
        setIsOpen(false);
        throw new Error("No Yellow message to sign");
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

      // Invalidate group query to refetch the group with the newly created message
      queryClient.invalidateQueries({
        queryKey: ["group", props.group._id.toString()],
      });

      setIsOpen(false);
      confetti({ ...confettiConfig });
      toast.success("Signed");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to sign yellow message" });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!isProcessing) {
          setIsOpen(open);
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" className={cn(props.className)}>
          <Avatar className="size-4">
            <AvatarImage src="/images/yellow.png" />
          </Avatar>
          Open Yellow message
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Yellow message</DrawerTitle>
          <DrawerDescription>
            Vibe together, trade together, and let AI do the heavy lifting
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2">
            {JSON.stringify(
              JSON.parse(props.groupMessage.extra?.yellow?.message || "{}"),
              null,
              2,
            )}
          </pre>
          <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2 mt-4">
            {JSON.stringify(
              JSON.parse(props.groupMessage.extra?.yellow?.response || "{}"),
              null,
              2,
            )}
          </pre>
        </div>
        <DrawerFooter>
          <Button
            disabled={isProcessing}
            onClick={() => handleSignYellowMessage()}
          >
            {isProcessing && <Spinner />} Sign
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
