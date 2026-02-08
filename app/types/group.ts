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
    | "sign_yellow_create_app_session_message"
    | "sign_yellow_submit_app_state_message_to_approve_trade_proposal"
    | "sign_yellow_submit_app_state_message_to_approve_withdraw";
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
