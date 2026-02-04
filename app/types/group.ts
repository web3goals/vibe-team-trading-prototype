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
  senderAddress: `0x${string}`;
  senderRole: "user" | "agent";
  content: string;
  yellowMessage?: string;
};
