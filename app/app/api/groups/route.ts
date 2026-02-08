import { demoConfig } from "@/config/demo";
import { yellowConfig } from "@/config/yellow";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { getMessageWithCreateAppSessionRequest } from "@/lib/messages";
import { Group } from "@/mongodb/models/group";
import { findGroups, insertOrUpdateGroup } from "@/mongodb/services/group";
import { GroupAgent, GroupUser } from "@/types/group";
import { RPCAppDefinition, RPCProtocolVersion } from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
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
      name: z.string(),
      description: z.string(),
      agentEnsName: z.string(),
      userEnsNames: z.array(z.string()),
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
    const { name, description, agentEnsName, userEnsNames } =
      bodyParseResult.data;

    // Define agent
    let agent: GroupAgent | undefined;
    if (agentEnsName === demoConfig.groupAgentA.ensName) {
      agent = demoConfig.groupAgentA;
    }
    if (agentEnsName === demoConfig.groupAgentB.ensName) {
      agent = demoConfig.groupAgentB;
    }
    if (!agent) {
      return createFailedApiResponse(
        { message: "Invalid agentEnsName, no matching agent found" },
        400,
      );
    }

    // Define users
    const users: GroupUser[] = [];
    for (const userEnsName of userEnsNames) {
      let user: GroupUser | undefined;
      if (userEnsName === demoConfig.groupUserA.ensName) {
        user = demoConfig.groupUserA;
      }
      if (userEnsName === demoConfig.groupUserB.ensName) {
        user = demoConfig.groupUserB;
      }
      if (userEnsName === demoConfig.groupUserC.ensName) {
        user = demoConfig.groupUserC;
      }

      if (user) {
        users.push(user);
      }
    }

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

    // Create a new group
    const group: Group = {
      _id: new ObjectId(),
      created: new Date(),
      status: "active",
      name: name,
      description: description,
      agent: agent,
      users: users,
      messages: [],
      yellowAppDefinition: yellowAppDefinition,
    };

    // Create and add the initial message with the Yellow create app session request
    const message = await getMessageWithCreateAppSessionRequest(group);
    group.messages.push(message);

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
