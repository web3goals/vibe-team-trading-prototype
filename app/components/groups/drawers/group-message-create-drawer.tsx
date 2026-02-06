import { useUser } from "@/components/providers/user-provider";
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
import { Group } from "@/mongodb/models/group";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// TODO: Implement
export function GroupMessageCreateDrawer(props: { group: Group }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { address, ensName } = useUser();

  async function handleCreateGroupMessage() {
    try {
      console.log("[Component] Creating group message...");
      setIsProcessing(true);

      if (!address || !ensName) {
        setIsOpen(false);
        throw new Error("Please sign in");
      }

      // Call create group API
      await axios.post(`/api/groups/${props.group._id.toString()}/messages`, {
        creatorAddress: address,
        creatorEnsName: ensName,
        creatorRole: "user",
        content: "Hello world",
      });

      // Invalidate group query to refetch the group with the newly created message
      queryClient.invalidateQueries({
        queryKey: ["group", props.group._id.toString()],
      });

      setIsOpen(false);
      confetti({ ...confettiConfig });
      toast.success("Posted");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to post message" });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Drawer
      repositionInputs={false}
      open={isOpen}
      onOpenChange={(open) => {
        if (!isProcessing) {
          setIsOpen(open);
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="default">
          <PencilIcon /> Post message
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New message</DrawerTitle>
          <DrawerDescription>
            Vibe together, trade together, and let AI do the heavy lifting
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <p>...</p>
        </div>
        <DrawerFooter>
          <Button
            disabled={isProcessing}
            onClick={() => handleCreateGroupMessage()}
          >
            {isProcessing && <Spinner />} Post
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
