import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { confettiConfig } from "@/config/confetti";
import { demoConfig } from "@/config/demo";
import { handleError } from "@/lib/error";
import axios from "axios";
import confetti from "canvas-confetti";
import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GroupCreateButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCreateDemoGroup() {
    try {
      console.log("[Component] Creating demo group...");
      setIsProcessing(true);

      // Call create group API
      await axios.post("/api/groups", {
        agent: demoConfig.groupAgentA,
        users: [demoConfig.groupUserA, demoConfig.groupUserB],
      });

      confetti({ ...confettiConfig });
      toast.success("Created");
    } catch (error) {
      handleError({ error, toastTitle: "Failed to create demo group" });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Button
      size="lg"
      disabled={isProcessing}
      onClick={() => handleCreateDemoGroup()}
    >
      {isProcessing ? <Spinner /> : <UsersIcon />} Create demo group
    </Button>
  );
}
