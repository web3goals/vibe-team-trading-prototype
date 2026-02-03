"use client";

import { Group as GroupModel } from "@/mongodb/models/group";
import { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function Group(props: { id: string }) {
  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group", props.id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<{ groups: GroupModel[] }>>(
        `/api/groups?id=${props.id}`,
      );
      const result = response.data;
      if (!result.isSuccess || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch group");
      }
      return result.data.groups[0];
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <p>Loading group — {props.id}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <p>Group {props.id} not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <p className="font-bold mb-4">Group — {props.id}</p>
      <pre className="p-4 border rounded overflow-auto whitespace-pre-wrap break-all text-xs">
        {JSON.stringify(group, null, 2)}
      </pre>
    </div>
  );
}
