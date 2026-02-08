import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { ObjectId } from "mongodb";

export async function createGroupMessage(
  groupId: string,
  agentAddress: string,
  agentEnsName: string,
  content: string,
): Promise<string> {
  // Find the group
  const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
  if (!group) {
    return "Group not found.";
  }

  // Add message to the group and save to database
  group.messages.push({
    id: new ObjectId().toString(),
    created: new Date(),
    creatorAddress: agentAddress as `0x${string}`,
    creatorEnsName: agentEnsName,
    creatorRole: "agent",
    content: content,
  });
  await insertOrUpdateGroup(group);

  return "Group message created successfully.";
}
