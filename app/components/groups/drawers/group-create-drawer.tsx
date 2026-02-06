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
import { demoConfig } from "@/config/demo";
import { handleError } from "@/lib/error";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { UsersRoundIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// TODO: Implement
export function GroupCreateDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { address, ensName } = useUser();

  async function handleCreateGroup() {
    try {
      console.log("[Component] Creating group...");
      setIsProcessing(true);

      if (!address || !ensName) {
        setIsOpen(false);
        throw new Error("Please sign in");
      }

      // Call create group API
      await axios.post("/api/groups", {
        name: "Degens",
        description: "Where degens become legends or get rekt trying",
        agent: demoConfig.groupAgentA,
        users: [demoConfig.groupUserA, demoConfig.groupUserB],
      });

      // Invalidate groups query to refetch the groups with the newly created group
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      setIsOpen(false);
      confetti({ ...confettiConfig });
      toast.success("Created");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to create group" });
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
          <UsersRoundIcon />
          Create group
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New group</DrawerTitle>
          <DrawerDescription>
            Vibe together, trade together, and let AI do the heavy lifting
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <p>...</p>
        </div>
        <DrawerFooter>
          <Button disabled={isProcessing} onClick={() => handleCreateGroup()}>
            {isProcessing && <Spinner />} Create
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
