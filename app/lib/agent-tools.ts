import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { ObjectId } from "mongodb";
import { getErrorString } from "./error";
import { getMessageWithStartTradeRequest } from "./messages";

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
      creatorAddress: group.agent.address,
      creatorEnsName: group.agent.ensName,
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

export async function createGroupMessageWithStartTradeRequest(
  groupId: string,
  content: string,
): Promise<string> {
  try {
    console.log(
      `[Agent Tools] Creating group message with start trade request...`,
    );

    // Find the group
    const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
    if (!group) {
      throw new Error(`Group not found, id: ${groupId}`);
    }

    // Add message to the group and save to database
    const messageWithTradeRequest = await getMessageWithStartTradeRequest(
      group,
      content,
    );
    group.messages.push(messageWithTradeRequest);
    await insertOrUpdateGroup(group);

    return "Group message with start trade request created successfully.";
  } catch (error) {
    console.error(
      `[Agent Tools] Failed to create group message with start trade request, error: ${getErrorString(error)}`,
    );
    return `Failed to create group message with start trade request, error: ${getErrorString(error)}`;
  }
}
