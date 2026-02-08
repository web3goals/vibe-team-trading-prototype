import { BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import { z } from "zod";
import { createGroupMessage } from "./agent-tools";
import { findGroups } from "@/mongodb/services/group";

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

const createGroupMessageTool = tool(
  async (input) =>
    await createGroupMessage(
      input.groupId,
      input.agentAddress,
      input.agentEnsName,
      input.content,
    ),
  {
    name: "create_group_message",
    description: "Creates a group message with the provided content.",
    schema: z.object({
      groupId: z.string().describe("ID of the group to create the message in."),
      agentAddress: z
        .string()
        .describe("Address of the agent creating the message."),
      agentEnsName: z
        .string()
        .describe("ENS name of the agent creating the message."),
      content: z.string().describe("Content of the group message to create."),
    }),
  },
);

const systemPrompt = (
  groupId: string,
  agentAddress: string,
  agentEnsName: string,
) => {
  return `# Context

...

# Data

- Group ID: ${groupId}
- Agent Address: ${agentAddress}
- Agent ENS Name: ${agentEnsName}`;
};

export async function invokeAgent(
  groupId: string,
  messages: BaseMessage[],
): Promise<BaseMessage> {
  console.log("[Agent] Invoking agent...");

  // Find the group
  const group = await findGroups({ id: groupId }).then((groups) => groups[0]);
  if (!group) {
    throw new Error(`Group not found, id: ${groupId}`);
  }

  // Create the agent with tools and system prompt
  const agent = createAgent({
    model,
    tools: [createGroupMessageTool],
    systemPrompt: systemPrompt(
      groupId,
      group.agent.address,
      group.agent.ensName,
    ),
  });

  // Invoke the agent with the provided messages
  const result = await agent.invoke({ messages });
  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage;
}
