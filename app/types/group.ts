export type GroupAgent = {
  address: `0x${string}`;
  ensName: string;
};

export type GroupAgentMetadata = {
  description: string;
  created: Date;
  creatorAddress: `0x${string}`;
  creatorEnsName: string;
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
  extra?: {
    yellow?: {
      message: string;
      messageCreated: Date;
      messageSignerAddresses: `0x${string}`[];
      response?: string; // Response from the Yellow network
      responseCreated?: Date;
    };
  };
};
