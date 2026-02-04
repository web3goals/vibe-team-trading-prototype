export type GroupAgent = {
  ensName: string;
  address: `0x${string}`;
};

export type GroupUser = {
  ensName: string;
  address: `0x${string}`;
};

export type GroupMessage = {
  id: string;
  created: Date;
  senderAddress: `0x${string}`;
  senderRole: "user" | "agent";
  content: string;
  yellowMessage?: string;
};
