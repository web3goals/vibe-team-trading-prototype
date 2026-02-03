import { Collection, Document } from "mongodb";
import clientPromise from "../client";
import { mongodbConfig } from "@/config/mongodb";

export async function getCollection<T extends Document>(
  name: string,
): Promise<Collection<T>> {
  const client = await clientPromise;
  const db = client.db(mongodbConfig.database);
  return db.collection<T>(name);
}
