"use client";

import { useGroup } from "@/hooks/use-group";
import { Loading } from "../ui-extra/loading";
import { GroupMessageCard } from "./cards/group-message-card";
import EntityList from "../ui-extra/entity-list";
import { GroupMessage } from "@/types/group";
import EntityListDefaultNoEntitiesCard from "../ui-extra/entity-list-default-no-entities-card";

export function Group(props: { id: string }) {
  const { data: group, isLoading: isGroupLoading } = useGroup(props.id);

  if (isGroupLoading || !group) {
    return <Loading />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">ID: {props.id}</p>
        <p className="text-sm text-muted-foreground wrap-break-word">
          Agent: {JSON.stringify(group.agent)}
        </p>
        <p className="text-sm text-muted-foreground wrap-break-word">
          Users: {JSON.stringify(group.users)}
        </p>
      </div>
      <EntityList<GroupMessage>
        entities={group.messages}
        renderEntityCard={(groupMessage, index) => (
          <GroupMessageCard key={index} groupMessage={groupMessage} />
        )}
        noEntitiesCard={
          <EntityListDefaultNoEntitiesCard noEntitiesText="No data yet, check back later" />
        }
        className="mt-4"
      />
    </div>
  );
}
