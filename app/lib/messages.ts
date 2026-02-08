import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import {
  createAppSessionMessage as createCreateAppSessionMessage,
  createSubmitAppStateMessage,
  RPCAppSessionAllocation,
} from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { getAgentYellowMessageSigner } from "./agent-utils";

export async function getMessageWithCreateAppSessionRequest(
  group: Group,
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
    content: [
      "Group created 🎉",
      "To start vibe team trading, everyone needs to sign the Yellow message so I can set up our Yellow app session",
    ].join("\n\n"),
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

export function getMessageWithCreateAppSessionStatus(
  group: Group,
): GroupMessage {
  const message: GroupMessage = {
    id: new ObjectId().toString(),
    category: "create_app_session_status",
    created: new Date(),
    creatorAddress: group.agent.address,
    creatorEnsName: group.agent.ensName,
    creatorRole: "agent",
    content: "Yellow app session set up successfully 👍",
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
