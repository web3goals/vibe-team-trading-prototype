"use client";

import { EnsData } from "@/types/ens";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

async function getEnsData({ name }: { name: string }): Promise<EnsData> {
  console.log("[Hook] Getting ENS data...");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const normalizedName = normalize(name);

  const [instructions, skills, description, creator] = await Promise.all([
    publicClient.getEnsText({
      name: normalizedName,
      key: "Instructions",
    }),
    publicClient.getEnsText({
      name: normalizedName,
      key: "Skills",
    }),
    publicClient.getEnsText({
      name: normalizedName,
      key: "Description",
    }),
    publicClient.getEnsText({
      name: normalizedName,
      key: "Creator",
    }),
  ]);

  return {
    instructions: instructions || "",
    skills: skills || "",
    description: description || "",
    creator: creator || "",
  };
}

export function useEnsData(name?: string) {
  return useQuery({
    queryKey: ["ens", name],
    queryFn: () => getEnsData({ name: name! }),
    enabled: !!name,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
