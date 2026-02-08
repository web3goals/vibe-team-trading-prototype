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
  category:
    | "none"
    | "create_app_session_request"
    | "create_app_session_status"
    | "start_trade_request"
    | "start_trade_status"
    | "withdraw_request"
    | "withdraw_status"
    | "entry_trade_status"
    | "exit_trade_status"
    | "deposit_request"
    | "deposit_status"
    | "distribute_request"
    | "distribute_status";
  created: Date;
  creatorAddress: `0x${string}`;
  creatorEnsName: string;
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
    lifi?: {
      executeRouteResponse: string;
    };
  };
};
