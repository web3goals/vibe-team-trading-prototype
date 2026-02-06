import { Group } from "@/mongodb/models/group";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGroups({
  signal,
}: {
  signal: AbortSignal;
}): Promise<Group[]> {
  console.log("[Hook] Getting groups...");

  const { data } = await axios.get("/api/groups", {
    signal,
  });

  return data.data.groups;
}

export function useGroups() {
  const query = useQuery({
    queryKey: ["groups"],
    queryFn: ({ signal }) => getGroups({ signal }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  return query;
}
