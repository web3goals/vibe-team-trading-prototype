import { ObjectId } from "mongodb";

export class Group {
  constructor(
    public _id: ObjectId,
    public created: Date,
  ) {}
}
