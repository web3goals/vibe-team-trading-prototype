import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
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
import { zeroAddress } from "viem";
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

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Creating group...");

    // Define the schema for request body validation
    const bodySchema = z.object({
      sessionAccountPrivateKey: z.string(),
    });

    // Extract request body
    const body = await request.json();

    // Validate request body using schema
    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Invalid request body: ${bodyParseResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")}`,
        },
        400,
      );
    }

    // Extract validated data
    const { sessionAccountPrivateKey } = bodyParseResult.data;

    // Define group agent
    const groupAgent: GroupAgent = {
      ensName: demoConfig.agent.ensName,
      address: demoConfig.agent.address as `0x${string}`,
    };

    // Define group users
    const groupUsers: GroupUser[] = [
      {
        ensName: demoConfig.userA.ensName,
        address: demoConfig.userA.address as `0x${string}`,
      },
      {
        ensName: demoConfig.userB.ensName,
        address: demoConfig.userB.address as `0x${string}`,
      },
      {
        ensName: demoConfig.userC.ensName,
        address: demoConfig.userC.address as `0x${string}`,
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
      ],
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

    // Create Yellow message signer
    const messageSigner = createECDSAMessageSigner(
      sessionAccountPrivateKey as `0x${string}`,
    );

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
