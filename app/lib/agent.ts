import { findGroups } from "@/mongodb/services/group";
import { BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import { z } from "zod";
import {
  createGroupMessage,
  createGroupMessageWithStartTradeRequest,
  getGroupMessages,
} from "./agent-tools";

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

const getGroupMessagesTool = tool(
  async (input) => await getGroupMessages(input.groupId),
  {
    name: "get_group_messages",
    description: "Retrieves messages from a group.",
    schema: z.object({
      groupId: z
        .string()
        .describe("ID of the group to retrieve messages from."),
    }),
  },
);

const createGroupMessageTool = tool(
  async (input) => await createGroupMessage(input.groupId, input.content),
  {
    name: "create_group_message",
    description: "Creates a group message with the provided content.",
    schema: z.object({
      groupId: z.string().describe("ID of the group to create the message in."),
      content: z.string().describe("Content of the group message to create."),
    }),
  },
);

const createGroupMessageWithStartTradeRequestTool = tool(
  async (input) =>
    await createGroupMessageWithStartTradeRequest(input.groupId, input.content),
  {
    name: "create_group_message_with_start_trade_request",
    description:
      "Creates a group message with the provided content and a start trade request.",
    schema: z.object({
      groupId: z.string().describe("ID of the group to create the message in."),
      content: z.string().describe("Content of the group message to create."),
    }),
  },
);

const systemPrompt = (groupId: string) => {
  return `# Role
You are an AI Trading Agent in a group chat. Your goal is to analyze messages and propose trades based on solid arguments from group members.

# Style Guidelines
- **Use Emojis:** Engage users with emojis (🚀, 💰, 🔍, ✅, 📊).
- **Emoji Placement:** Do NOT put a period (.) between the end of a sentence and an emoji. (e.g., "I propose we buy BTC ✅" instead of "I propose we buy BTC. ✅").
- **Structure:** Use logical paragraphs to separate points. Do not put all sentences in one paragraph; it's difficult to read.
- **Be Concise:** Keep responses short and direct.

# Workflow: Propose a trade
1. **Fetch Messages:** Call the tool \`get_group_messages\` to retrieve recent conversation history.
2. **Analyze & Evaluate:** Scan the messages for token mentions and justifications for buying (e.g., market trends, news, or technical analysis).
3. **Execute Action:**
   - **If arguments are found:** Propose a trade by calling \`create_group_message_with_start_trade_request\`. Content should contain:
     - Your proposal to buy {token}.
     - A statement that your own technical and sentiment analysis approves the proposal.
     - A note that users need to sign the Yellow message to allocate 1 USDC each to execute the trade.
   - **If no arguments are found:** Do NOT call any message creation tool. Instead, finish the task by stating that no clear trading opportunities were identified.

# Context
- **Group ID:** ${groupId}`;
};

// TODO: Load extra instructions and skills from ENS
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
    tools: [
      getGroupMessagesTool,
      createGroupMessageTool,
      createGroupMessageWithStartTradeRequestTool,
    ],
    systemPrompt: systemPrompt(groupId),
  });

  // Invoke the agent with the provided messages
  const result = await agent.invoke({ messages });
  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage;
}
