import { yellowConfig } from "@/config/yellow";
import { getAgentYellowMessageSigner } from "@/lib/agent";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { Group } from "@/mongodb/models/group";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { GroupAgent, GroupMessage, GroupUser } from "@/types/group";
import {
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import { createAppSessionMessage as createCreateAppSessionMessage } from "@erc7824/nitrolite/dist/rpc/api";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import z from "zod";
import { describe } from "zod/v4/core";

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
      name: z.string(),
      description: z.string(),
      agent: z.object({
        address: z.string(),
        ensName: z.string(),
      }),
      users: z.array(
        z.object({
          address: z.string(),
          ensName: z.string(),
        }),
      ),
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
    const name = bodyParseResult.data.name;
    const description = bodyParseResult.data.description;
    const agent: GroupAgent = {
      address: bodyParseResult.data.agent.address as `0x${string}`,
      ensName: bodyParseResult.data.agent.ensName,
    };
    const users: GroupUser[] = bodyParseResult.data.users.map((user) => ({
      address: user.address as `0x${string}`,
      ensName: user.ensName,
    }));

    // Define Yellow app definition
    const yellowAppDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [agent.address, ...users.map((user) => user.address)],
      weights: [0, ...users.map(() => 25)],
      quorum: 50,
      challenge: 0,
      nonce: Date.now(),
      application: yellowConfig.appName,
    };

    // Define Yellow app allocations
    const yellowAppAllocations: RPCAppSessionAllocation[] = [
      {
        participant: agent.address,
        asset: "ytest.usd",
        amount: Number(0).toString(),
      },
      ...users.map((user) => ({
        participant: user.address,
        asset: "ytest.usd",
        amount: Number(10).toString(),
      })),
    ];

    // Create Yellow create app session message signed by the agent
    const yellowMessageSigner = await getAgentYellowMessageSigner(
      agent.address,
    );
    const yellowMessage = await createCreateAppSessionMessage(
      yellowMessageSigner,
      {
        definition: yellowAppDefinition,
        allocations: yellowAppAllocations,
      },
    );

    // Define group messages
    const messages: GroupMessage[] = [];
    messages.push({
      id: new ObjectId().toString(),
      created: new Date(),
      creatorAddress: agent.address,
      creatorEnsName: agent.ensName,
      creatorRole: "agent",
      content:
        `Group created 🎉\n\n` +
        `To start vibe team trading, everyone needs to sign the Yellow message so I can set up our Yellow app session`,
      extra: {
        yellow: {
          message: yellowMessage,
          messageCreated: new Date(),
          messageSignerAddresses: [agent.address],
        },
      },
    });

    // Create a new group
    const group: Group = {
      _id: new ObjectId(),
      created: new Date(),
      status: "active",
      name: name,
      description: description,
      agent: agent,
      users: users,
      messages: messages,
      yellowAppDefinition: yellowAppDefinition,
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
