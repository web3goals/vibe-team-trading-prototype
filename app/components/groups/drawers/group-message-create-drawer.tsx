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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { confettiConfig } from "@/config/confetti";
import { handleError } from "@/lib/error";
import { Group } from "@/mongodb/models/group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function GroupMessageCreateDrawer(props: { group: Group }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { address, ensName } = useUser();

  const formSchema = z.object({
    content: z
      .string()
      .min(1, "Message cannot be empty")
      .max(1000, "Message is too long"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("[Component] Creating group message...");
      setIsProcessing(true);

      if (!address || !ensName) {
        setIsOpen(false);
        throw new Error("Please sign in");
      }
      if (!props.group.users.some((user) => user.address === address)) {
        setIsOpen(false);
        throw new Error("You must be a member of the group to post a message");
      }
      if (!props.group.yellowAppSessionId) {
        setIsOpen(false);
        throw new Error("Yellow app is not set up for this group");
      }

      // Call create group API
      await axios.post(`/api/groups/${props.group._id.toString()}/messages`, {
        creatorAddress: address,
        creatorEnsName: ensName,
        creatorRole: "user",
        content: values.content,
      });

      // Invalidate group query to refetch the group with the newly created message
      queryClient.invalidateQueries({
        queryKey: ["group", props.group._id.toString()],
      });

      // Call invoke agents API to analyze the conversation and propose a trade if appropriate
      axios.post(`/api/groups/${props.group._id.toString()}/agents`, {
        message:
          "Analyze the conversation and propose a trade if it is appropriate.",
      });

      setIsOpen(false);
      form.reset();
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
          form.reset();
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
          <Form {...form}>
            <form
              id="group-message-create-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write a message..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            form="group-message-create-form"
            disabled={isProcessing}
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
