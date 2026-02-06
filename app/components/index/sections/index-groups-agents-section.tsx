import { ClassValue } from "clsx";

import { GroupList } from "@/components/groups/lists/group-list";
import { cn } from "@/lib/utils";

export function IndexGroupsAgentsSection(props: { className?: ClassValue }) {
  return (
    <div className={cn(props.className)}>
      <p className="font-bold text-center">Vibe together, trade together</p>
      <p className="text-muted-foreground text-center">
        Let AI do the heavy lifting
      </p>
      <GroupList className="mt-4" />
    </div>
  );
}
