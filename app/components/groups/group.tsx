"use client";

import { useGroup } from "@/hooks/use-group";
import { GroupMessage } from "@/types/group";
import EntityList from "../ui-extra/entity-list";
import EntityListDefaultNoEntitiesCard from "../ui-extra/entity-list-default-no-entities-card";
import { Loading } from "../ui-extra/loading";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { GroupMessageCard } from "./cards/group-message-card";
import { GroupCloseDrawer } from "./drawers/group-close-drawer";
import { GroupMessageCreateDrawer } from "./drawers/group-message-create-drawer";

export function Group(props: { id: string }) {
  const { data: group, isLoading: isGroupLoading } = useGroup(props.id);

  if (isGroupLoading || !group) {
    return <Loading />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="flex flex-row gap-4">
        {/* Left part */}
        <Avatar className="size-10">
          <AvatarFallback className="bg-accent text-accent-foreground">
            {group.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Right part */}
        <div className="w-full">
          {/* Name, description */}
          <div>
            <p className="font-bold">{group.name}</p>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
          {/* Buttons */}
          <div className="flex flex-row gap-2 mt-4">
            <GroupMessageCreateDrawer group={group} />
            <GroupCloseDrawer />
          </div>
        </div>
      </div>
      <Separator className="mt-4" />
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
        className="mt-4"
      />
    </div>
  );
}
