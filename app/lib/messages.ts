import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import {
  createAppSessionMessage as createCreateAppSessionMessage,
  createSubmitAppStateMessage,
  RPCAppSessionAllocation,
  RPCAppStateIntent,
} from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { getAgentYellowMessageSigner } from "./agent-utils";

export async function getMessageWithCreateAppSessionRequest(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  // Define Yellow app allocations
  // TODO: Calculate allocation amounts dynamically
  const yellowAppAllocations: RPCAppSessionAllocation[] = [
    {
      participant: group.agent.address,
      asset: "ytest.usd",
      amount: Number(0).toString(),
    },
    ...group.users.map((user) => ({
      participant: user.address,
      asset: "ytest.usd",
      amount: Number(10).toString(),
    })),
  ];

  // Create Yellow create app session message signed by the agent
  const yellowMessageSigner = await getAgentYellowMessageSigner(
    group.agent.address,
  );
  const yellowMessage = await createCreateAppSessionMessage(
    yellowMessageSigner,
    {
      definition: group.yellowAppDefinition,
      allocations: yellowAppAllocations,
    },
  );

  // Create group message
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "create_app_session_request",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: {
      yellow: {
        message: yellowMessage,
        messageCreated: new Date(),
        messageSignerAddresses: [group.agent.address],
      },
    },
  };

  return message;
}

export async function getMessageWithCreateAppSessionStatus(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "create_app_session_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
  };

  return message;
}

export async function getMessageWithStartTradeRequest(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  // Define Yellow app allocations
  // TODO: Calculate allocation amounts dynamically
  const yellowAppAllocations: RPCAppSessionAllocation[] = [
    {
      participant: group.agent.address,
      asset: "ytest.usd",
      amount: Number(0 + group.users.length * 1).toString(),
    },
    ...group.users.map((user) => ({
      participant: user.address,
      asset: "ytest.usd",
      amount: Number(10 - 1).toString(),
    })),
  ];

  // Create Yellow submit app state message signed by the agent
  const yellowMessageSigner = await getAgentYellowMessageSigner(
    group.agent.address,
  );
  const yellowMessage = await createSubmitAppStateMessage(yellowMessageSigner, {
    app_session_id: group.yellowAppSessionId as `0x${string}`,
    allocations: yellowAppAllocations,
    version: (group.yellowAppVersion as number) + 1,
  });

  // Create group message
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "start_trade_request",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: {
      yellow: {
        message: yellowMessage,
        messageCreated: new Date(),
        messageSignerAddresses: [group.agent.address],
      },
    },
  };

  return message;
}

export async function getMessageWithWithdrawRequest(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  // Define Yellow app allocations
  // TODO: Calculate allocation amounts dynamically
  const yellowAppAllocations: RPCAppSessionAllocation[] = [
    {
      participant: group.agent.address,
      asset: "ytest.usd",
      amount: Number(0).toString(),
    },
    ...group.users.map((user) => ({
      participant: user.address,
      asset: "ytest.usd",
      amount: Number(10 - 1).toString(),
    })),
  ];

  // Create Yellow submit app state message signed by the agent
  const yellowMessageSigner = await getAgentYellowMessageSigner(
    group.agent.address,
  );
  const yellowMessage = await createSubmitAppStateMessage(yellowMessageSigner, {
    app_session_id: group.yellowAppSessionId as `0x${string}`,
    allocations: yellowAppAllocations,
    version: (group.yellowAppVersion as number) + 1,
    intent: RPCAppStateIntent.Withdraw,
  });

  // Create group message
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "withdraw_request",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: {
      yellow: {
        message: yellowMessage,
        messageCreated: new Date(),
        messageSignerAddresses: [group.agent.address],
      },
    },
  };

  return message;
}

export async function getMessageWithWithdrawStatus(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "withdraw_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
  };

  return message;
}

export async function getMessageWithEntryTradeStatus(
  group: Group,
  content: string,
  extraLifiExecuteRouteResponse: string,
): Promise<GroupMessage> {
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "entry_trade_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: { lifi: { executeRouteResponse: extraLifiExecuteRouteResponse } },
  };

  return message;
}

export async function getMessageWithExitTradeStatus(
  group: Group,
  content: string,
  extraLifiExecuteRouteResponse: string,
): Promise<GroupMessage> {
  // Define Yellow app allocations
  // TODO: Calculate allocation amounts dynamically
  const yellowAppAllocations: RPCAppSessionAllocation[] = [
    {
      participant: group.agent.address,
      asset: "ytest.usd",
      amount: Number(0).toString(),
    },
    ...group.users.map((user) => ({
      participant: user.address,
      asset: "ytest.usd",
      amount: Number(10 - 1).toString(),
    })),
  ];

  // Create Yellow submit app state message signed by the agent
  const yellowMessageSigner = await getAgentYellowMessageSigner(
    group.agent.address,
  );
  const yellowMessage = await createSubmitAppStateMessage(yellowMessageSigner, {
    app_session_id: group.yellowAppSessionId as `0x${string}`,
    allocations: yellowAppAllocations,
    version: (group.yellowAppVersion as number) + 1,
    intent: RPCAppStateIntent.Deposit,
  });

  // Create group message
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "exit_trade_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: {
      yellow: {
        message: yellowMessage,
        messageCreated: new Date(),
        messageSignerAddresses: [group.agent.address],
      },
      lifi: { executeRouteResponse: extraLifiExecuteRouteResponse },
    },
  };

  return message;
}

export async function getMessageWithDistributeRequest(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  // Define Yellow app allocations
  // TODO: Calculate allocation amounts dynamically
  const yellowAppAllocations: RPCAppSessionAllocation[] = [
    {
      participant: group.agent.address,
      asset: "ytest.usd",
      amount: Number(0).toString(),
    },
    ...group.users.map((user) => ({
      participant: user.address,
      asset: "ytest.usd",
      amount: Number(10 + 0.59 / 2).toString(),
    })),
  ];

  // Create Yellow submit app state message signed by the agent
  const yellowMessageSigner = await getAgentYellowMessageSigner(
    group.agent.address,
  );
  const yellowMessage = await createSubmitAppStateMessage(yellowMessageSigner, {
    app_session_id: group.yellowAppSessionId as `0x${string}`,
    allocations: yellowAppAllocations,
    version: (group.yellowAppVersion as number) + 1,
    intent: RPCAppStateIntent.Deposit,
  });

  // Create group message
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "distribute_request",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
    extra: {
      yellow: {
        message: yellowMessage,
        messageCreated: new Date(),
        messageSignerAddresses: [group.agent.address],
      },
    },
  };

  return message;
}

export async function getMessageWithDistributeStatus(
  group: Group,
  content: string,
): Promise<GroupMessage> {
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "distribute_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: content,
  };

  return message;
}
