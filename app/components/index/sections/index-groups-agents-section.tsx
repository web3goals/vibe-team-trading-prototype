import { AgentList } from "@/components/agents/lists/agent-list";
import { GroupList } from "@/components/groups/lists/group-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { BotIcon, UsersRoundIcon } from "lucide-react";

export function IndexGroupsAgentsSection(props: { className?: ClassValue }) {
  return (
    <div className={cn(props.className)}>
      <p className="font-bold text-center">Vibe together, trade together</p>
      <p className="text-muted-foreground text-center">
        Let AI do the heavy lifting
      </p>
      <Tabs defaultValue="groups" className="mt-4">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="groups">
            <UsersRoundIcon />
            Groups
          </TabsTrigger>
          <TabsTrigger value="agents">
            <BotIcon />
            Agents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="groups">
          <GroupList />
        </TabsContent>
        <TabsContent value="agents">
          <AgentList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
