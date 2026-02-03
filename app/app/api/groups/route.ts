import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { authenticateWallet } from "@/lib/yellow";
import { Group } from "@/mongodb/models/group";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { GroupAgent, GroupMessage, GroupUser } from "@/types/group";
import {
  createECDSAMessageSigner,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { createWalletClient, http, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "yellow-ts";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Getting groups...");

    // Define the schema for query parameters validation
    const querySchema = z.object({
      id: z
        .string()
        .refine((value) => ObjectId.isValid(value), {
          message: "ID must be a valid ObjectId",
        })
        .optional(),
    });

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | null> = {
      id: searchParams.get("id"),
    };

    // Filter out null values to only validate provided parameters
    const filteredQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== null),
    );

    // Validate query parameters using schema
    const queryParseResult = querySchema.safeParse(filteredQueryParams);
    if (!queryParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Invalid query parameters: ${queryParseResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")}`,
        },
        400,
      );
    }

    // Extract validated data
    const { id } = queryParseResult.data;

    // Find groups
    const groups = await findGroups({ id });

    return createSuccessApiResponse({ groups });
  } catch (error) {
    console.error("[API] Failed to get groups:", error);
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}

export async function POST() {
  try {
    console.log("[API] Creating group...");

    // Define group agent
    const groupAgent: GroupAgent = {
      ensName: "agent-a.eth",
      address: "0xB418506A0dd0E6c81B2a2901a8aa2B6F409BFB3f",
    };

    // Define group users
    const groupUsers: GroupUser[] = [
      {
        ensName: "user-a.eth",
        address: "0x818eD0E13030FDE0C86B771a965084e44CC7F8d6",
      },
      {
        ensName: "user-b.eth",
        address: "0x568647a8f0dDc1772E97aDD23c70960138F16330",
      },
      {
        ensName: "user-c.eth",
        address: "0x60aef32500a838cb6ef895478606a3d2DC0deD7c",
      },
    ];

    // Define Yellow app definition
    const yellowAppDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [
        groupAgent.address,
        groupUsers[0].address,
        groupUsers[1].address,
        groupUsers[2].address,
      ].flat(),
      weights: [0, 25, 25, 25],
      quorum: 50,
      challenge: 0,
      nonce: Date.now(),
      application: yellowConfig.appName,
    };

    // Define Yellow app allocations
    const yellowAppAllocations: RPCAppSessionAllocation[] = [
      { participant: groupAgent.address, asset: "ytest.usd", amount: "0.0" },
      {
        participant: groupUsers[0].address,
        asset: "ytest.usd",
        amount: "100.0",
      },
      {
        participant: groupUsers[1].address,
        asset: "ytest.usd",
        amount: "100.0",
      },
      {
        participant: groupUsers[2].address,
        asset: "ytest.usd",
        amount: "100.0",
      },
    ];

    // Define Yellow message signer (agent)
    const yellowClient = new Client({ url: yellowConfig.url });
    await yellowClient.connect();
    const account = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY as `0x${string}`,
    );
    const walletClient = createWalletClient({
      account: account,
      chain: sepolia,
      transport: http(),
    });
    const sessionAccount = await authenticateWallet(yellowClient, walletClient);
    const messageSigner = createECDSAMessageSigner(sessionAccount.privateKey);

    // Create Yellow app session
    const createAppSessionMessage = await createCreateAppSessionMessage(
      messageSigner,
      {
        definition: yellowAppDefinition,
        allocations: yellowAppAllocations,
      },
    );

    // Define group messages
    const groupMessages: GroupMessage[] = [];
    groupMessages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      senderAddress: zeroAddress,
      senderRole: "system",
      content: `${groupUsers[0].ensName} created a group with ${groupAgent.ensName}, ${groupUsers[1].ensName}, and ${groupUsers[2].ensName}`,
    });
    groupMessages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      senderAddress: groupUsers[0].address,
      senderRole: "system",
      content: `Sign a message to create an Yellow app session, create app session message: ${createAppSessionMessage}`,
      yellowMessage: createAppSessionMessage,
    });

    // Create a new group
    const group: Group = {
      _id: new ObjectId(),
      created: new Date(),
      status: "active",
      agent: groupAgent,
      users: groupUsers,
      messages: groupMessages,
      yellowAppDefinition,
    };

    // Insert the group into the database
    await insertOrUpdateGroup(group);

    return createSuccessApiResponse({ group });
  } catch (error) {
    console.error(
      `[API] Failed to create group, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500,
    );
  }
}
