import { Group } from "@/mongodb/models/group";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGroup({
  groupId,
  signal,
}: {
  groupId: string;
  signal: AbortSignal;
}): Promise<Group | null> {
  console.log("[Hook] Getting group...");

  const { data } = await axios.get("/api/groups", {
    params: { id: groupId },
    signal,
  });

  return data.data.groups[0] || null;
}

export function useGroup(groupId: string | undefined) {
  const query = useQuery({
    queryKey: ["group", groupId],
    queryFn: ({ signal }) => getGroup({ groupId: groupId!, signal }),
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!groupId,
  });

  return query;
}
