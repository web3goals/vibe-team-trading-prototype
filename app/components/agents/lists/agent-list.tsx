import { demoConfig } from "@/config/demo";
import { AgentCard } from "../cards/agent-card";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export function AgentList(props: { className?: ClassValue }) {
  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <AgentCard
        ensName={demoConfig.groupAgentA.ensName}
        description={demoConfig.groupAgentMetadataA.description}
        created={demoConfig.groupAgentMetadataA.created}
        creatorAddress={demoConfig.groupAgentMetadataA.creatorAddress}
        creatorEnsName={demoConfig.groupAgentMetadataA.creatorEnsName}
      />
      <AgentCard
        ensName={demoConfig.groupAgentB.ensName}
        description={demoConfig.groupAgentMetadataB.description}
        created={demoConfig.groupAgentMetadataB.created}
        creatorAddress={demoConfig.groupAgentMetadataB.creatorAddress}
        creatorEnsName={demoConfig.groupAgentMetadataB.creatorEnsName}
      />
    </div>
  );
}
