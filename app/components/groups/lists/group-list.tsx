import EntityList from "@/components/ui-extra/entity-list";
import EntityListDefaultNoEntitiesCard from "@/components/ui-extra/entity-list-default-no-entities-card";
import { Loading } from "@/components/ui-extra/loading";
import { useGroups } from "@/hooks/use-groups";
import { Group } from "@/mongodb/models/group";
import { GroupCard } from "../cards/group-card";
import { ClassValue } from "clsx";

export function GroupList(props: { className?: ClassValue }) {
  const { data: groups, isLoading: isGroupsLoading } = useGroups();

  if (isGroupsLoading || !groups) {
    return <Loading />;
  }

  return (
    <EntityList<Group>
      entities={groups}
      renderEntityCard={(group, index) => (
        <GroupCard key={index} group={group} />
      )}
      noEntitiesCard={
        <EntityListDefaultNoEntitiesCard noEntitiesText="No data yet, check back later" />
      }
      className={props.className}
    />
  );
}
