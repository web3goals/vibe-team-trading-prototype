import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { confettiConfig } from "@/config/confetti";
import { demoConfig } from "@/config/demo";
import { handleError } from "@/lib/error";
import { cn } from "@/lib/utils";
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

  const formSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").max(50, "Name is too long"),
    description: z
      .string()
      .min(1, "Description cannot be empty")
      .max(200, "Description is too long"),
    agentEnsName: z.string().min(1, "Agent must be selected"),
    userEnsNames: z
      .array(z.string())
      .min(2, "Select at least 2 users")
      .max(3, "Select at most 3 users"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      agentEnsName: demoConfig.groupAgentA.ensName,
      userEnsNames: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("[Component] Creating group...");
      setIsProcessing(true);

      // Call create group API
      await axios.post("/api/groups", {
        name: values.name,
        description: values.description,
        agentEnsName: values.agentEnsName,
        userEnsNames: values.userEnsNames,
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
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              id="group-create-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
              <FormField
                control={form.control}
                name="agentEnsName"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Agent</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-3"
                      >
                        {[
                          {
                            agent: demoConfig.groupAgentA,
                            metadata: demoConfig.groupAgentMetadataA,
                          },
                          {
                            agent: demoConfig.groupAgentB,
                            metadata: demoConfig.groupAgentMetadataB,
                          },
                        ].map(({ agent, metadata }) => (
                          <FormItem
                            key={agent.ensName}
                            className={cn(
                              "flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900",
                              field.value === agent.ensName &&
                                "border-primary bg-zinc-50 dark:bg-zinc-900",
                            )}
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={agent.ensName}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium leading-none cursor-pointer">
                                {agent.ensName}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {metadata.description}
                              </p>
                            </div>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userEnsNames"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Users</FormLabel>
                    </div>
                    {[
                      demoConfig.groupUserA,
                      demoConfig.groupUserB,
                      demoConfig.groupUserC,
                    ].map((user) => (
                      <FormField
                        key={user.ensName}
                        control={form.control}
                        name="userEnsNames"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={user.ensName}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.ensName)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          user.ensName,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.ensName,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {user.ensName}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
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
            form="group-create-form"
            disabled={isProcessing}
          >
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
