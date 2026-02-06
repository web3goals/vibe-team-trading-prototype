import { GroupAgent, GroupMessage, GroupUser } from "@/types/group";
import { RPCAppDefinition } from "@erc7824/nitrolite";
import { ObjectId } from "mongodb";

export class Group {
  constructor(
    public _id: ObjectId,
    public created: Date,
    public status: "active" | "closed",
    public name: string,
    public agent: GroupAgent,
    public users: GroupUser[],
    public messages: GroupMessage[],
    public yellowAppDefinition: RPCAppDefinition,
    public yellowAppSessionId?: string,
    public yellowAppVersion?: number,
  ) {}
}
