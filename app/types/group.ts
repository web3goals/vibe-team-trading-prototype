export type GroupAgent = {
  address: `0x${string}`;
  ensName: string;
};

export type GroupUser = {
  address: `0x${string}`;
  ensName: string;
};

export type GroupMessage = {
  id: string;
  created: Date;
  creatorAddress: `0x${string}`;
  creatorRole: "user" | "agent";
  content: string;
  yellowMessage?: string;
};
