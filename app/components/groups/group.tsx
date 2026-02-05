"use client";

import { useGroup } from "@/hooks/use-group";
import { GroupMessage } from "@/types/group";
import EntityList from "../ui-extra/entity-list";
import EntityListDefaultNoEntitiesCard from "../ui-extra/entity-list-default-no-entities-card";
import { Loading } from "../ui-extra/loading";
import { Separator } from "../ui/separator";
import { GroupMessageCard } from "./cards/group-message-card";

export function Group(props: { id: string }) {
  const { data: group, isLoading: isGroupLoading } = useGroup(props.id);

  if (isGroupLoading || !group) {
    return <Loading />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">ID: {props.id}</p>
        <p className="text-sm text-muted-foreground wrap-break-word">Agent:</p>
        <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2">
          {JSON.stringify(group.agent, null, 2)}
        </pre>
        <p className="text-sm text-muted-foreground wrap-break-word">Users:</p>
        <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2">
          {JSON.stringify(group.users, null, 2)}
        </pre>
        <p className="text-sm text-muted-foreground">Yellow app session ID:</p>
        <pre className="text-xs text-muted-foreground bg-muted rounded-md whitespace-pre-wrap break-all p-2">
          {group.yellowAppSessionId || "N/A"}
        </pre>
        <p className="text-sm text-muted-foreground">
          Yellow app version: {group.yellowAppVersion || "N/A"}
        </p>
      </div>
      <Separator className="mt-8" />
      <EntityList<GroupMessage>
        entities={[...group.messages].reverse()}
        renderEntityCard={(groupMessage, index) => (
          <GroupMessageCard
            key={index}
            group={group}
            groupMessage={groupMessage}
          />
        )}
        noEntitiesCard={
          <EntityListDefaultNoEntitiesCard noEntitiesText="No data yet, check back later" />
        }
        className="mt-8"
      />
    </div>
  );
}
