import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import {
  createSubmitAppStateMessage,
  RPCAppSessionAllocation,
} from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { getAgentYellowMessageSigner } from "./agent-utils";
import { getErrorString } from "./error";

export async function getGroupMessages(groupId: string): Promise<string> {
  try {
    console.log(`[Agent Tools] Getting group messages...`);

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found, id: ${groupId}`);
    }

    // Return the messages in a string format
    return JSON.stringify(
      group.messages.map((message) => ({
        created: message.created,
        creatorRole: message.creatorRole,
        content: message.content,
      })),
    );
  } catch (error) {
    console.error(
      `[Agent Tools] Failed to get group messages, error: ${getErrorString(error)}`,
    );
    return `Failed to get group messages, error: ${getErrorString(error)}`;
  }
}

export async function createGroupMessage(
  groupId: string,
  agentAddress: string,
  agentEnsName: string,
  content: string,
): Promise<string> {
  try {
    console.log(`[Agent Tools] Creating group message...`);

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found, id: ${groupId}`);
    }

    // Add message to the group and save to database
    group.messages.push({
      id: new ObjectId().toString(),
      category: "none",
      created: new Date(),
      creatorAddress: agentAddress as `0x${string}`,
      creatorEnsName: agentEnsName,
      creatorRole: "agent",
      content: content,
    });
    await insertOrUpdateGroup(group);

    // Return success message
    return "Group message created successfully.";
  } catch (error) {
    console.error(
      `[Agent Tools] Failed to create group message, error: ${getErrorString(error)}`,
    );
    return `Failed to create group message, error: ${getErrorString(error)}`;
  }
}

export async function createGroupMessageWithTradeProposal(
  groupId: string,
  agentAddress: string,
  agentEnsName: string,
  content: string,
): Promise<string> {
  try {
    console.log(`[Agent Tools] Creating group message with trade proposal...`);

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found, id: ${groupId}`);
    }

    // Define Yellow allocations
    // TODO: Calculate based on the previous state
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
    const yellowMessage = await createSubmitAppStateMessage(
      yellowMessageSigner,
      {
        app_session_id: group.yellowAppSessionId as `0x${string}`,
        allocations: yellowAppAllocations,
        version: (group.yellowAppVersion as number) + 1,
      },
    );

    // Add message to the group and save to database
    group.messages.push({
      id: new ObjectId().toString(),
      category:
        "sign_yellow_submit_app_state_message_to_approve_trade_proposal",
      created: new Date(),
      creatorAddress: agentAddress as `0x${string}`,
      creatorEnsName: agentEnsName,
      creatorRole: "agent",
      content: content,
      extra: {
        yellow: {
          message: yellowMessage,
          messageCreated: new Date(),
          messageSignerAddresses: [group.agent.address],
        },
      },
    });
    await insertOrUpdateGroup(group);

    // Return success message
    return "Group message with trade proposal created successfully.";
  } catch (error) {
    console.error(
      `[Agent Tools] Failed to create group message with trade proposal, error: ${getErrorString(error)}`,
    );
    return `Failed to create group message with trade proposal, error: ${getErrorString(error)}`;
  }
}
