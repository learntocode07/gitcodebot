import { ObjectId } from "mongodb";

export interface Repository {
  _id?: ObjectId | string;
  url: string;
  users: string[];
  status: "ready" | "processing" | "ingested" | string
  availableToConsume: Boolean;
  createdAt?: Date;
}
