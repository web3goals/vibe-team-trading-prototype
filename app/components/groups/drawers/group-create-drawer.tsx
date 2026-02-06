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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { confettiConfig } from "@/config/confetti";
import { demoConfig } from "@/config/demo";
import { handleError } from "@/lib/error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import confetti from "canvas-confetti";
import { UsersRoundIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function GroupCreateDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { address, ensName } = useUser();

  const formSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").max(50, "Name is too long"),
    description: z
      .string()
      .min(1, "Description cannot be empty")
      .max(200, "Description is too long"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("[Component] Creating group...");
      setIsProcessing(true);

      if (!address || !ensName) {
        setIsOpen(false);
        throw new Error("Please sign in");
      }

      // Call create group API
      await axios.post("/api/groups", {
        name: values.name,
        description: values.description,
        agent: demoConfig.groupAgentA,
        users: [demoConfig.groupUserA, demoConfig.groupUserB],
      });

      // Invalidate groups query to refetch the groups with the newly created group
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      setIsOpen(false);
      form.reset();
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
          form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your group"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Spinner />} Create
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
