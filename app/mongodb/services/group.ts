import { mongodbConfig } from "@/config/mongodb";
import { ObjectId } from "mongodb";
import { Group } from "../models/group";
import { getCollection } from "../utils/collections";

export async function findGroups(args?: { id?: string }): Promise<Group[]> {
  console.log("[MongoDB] Finding groups...");
  const collection = await getCollection<Group>(
    mongodbConfig.collections.groups,
  );

  const groups = await collection
    .find({
      ...(args?.id !== undefined && { _id: new ObjectId(args.id) }),
    })
    .sort({ created: -1 })
    .toArray();
  return groups;
}

export async function insertOrUpdateGroup(group: Group): Promise<void> {
  console.log("[MongoDB] Inserting or updating group...");
  const collection = await getCollection<Group>(
    mongodbConfig.collections.groups,
  );
  await collection.updateOne(
    { _id: group._id },
    { $set: group },
    { upsert: true },
  );
}
