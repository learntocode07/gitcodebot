import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { ChatMessageHistory } from "langchain/memory";
import type { ChatSession } from "@/types/chat/session";
import type { Message } from "@/types/chat/message";
import { ObjectId } from "mongodb";
import { mongo } from "@/mongodb/client";

const DB_NAME = "gitcodebot";

export async function getChatSessionCollection() {
  const client = await mongo.client;
  return client.db(DB_NAME).collection<ChatSession>("sessions");
}

export async function createChatSession(
  sessionId: string,
  sessionData: ChatSession
) {
  const col = await getChatSessionCollection();
  const result = await col.insertOne({
    ...sessionData,
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function updateChatSession(
  sessionId: string,
  update: Partial<ChatSession>
) {
  const col = await getChatSessionCollection();
  return await col.updateOne({ sessionId }, { $set: update });
}

export async function getChatSessionById(sessionId: string) {
  const col = await getChatSessionCollection();
  return await col.findOne({ sessionId });
}

export async function getChatMessageCollection() {
  const client = await mongo.client;
  return client.db(DB_NAME).collection<Message>("messages");
}

export async function createChatMessage(message: Message) {
  const col = await getChatMessageCollection();
  const result = await col.insertOne({
    ...message,
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function getChatMessages(sessionId: string) {
  const col = await getChatMessageCollection();

  if (!sessionId) {
    return [];
  }

  const messages = await col
    .find({ sessionId })
    .sort({ createdAt: 1 })
    .toArray();

  if (!messages) return [];
  return messages;

}

export async function addChatMessage(
  sessionId: string,
  role: Message["role"],
  content: string,
  metadata?: Message["metadata"]
) {
  await createChatMessage({
    _id: new ObjectId().toString(),
    sessionId,
    role,
    content,
    createdAt: new Date(),
    metadata: metadata || {},
  });

  await updateChatSession(sessionId, {
    updatedAt: new Date(),
    metadata: {
      ...metadata,
      lastMessageRole: role,
    },
  });

  return {
    sessionId,
    role,
    content,
    createdAt: new Date(),
    metadata: metadata || {},
  };
}

export async function getChatSessionSummaryCollection() {
  const client = await mongo.client;
  return client.db(DB_NAME).collection<ChatSession>("summary");
}

export class MongoChatHistory extends ChatMessageHistory {
  constructor(public sessionId: string) {
    super();
  }

  async getMessages(): Promise<BaseMessage[]> {
    const docs = await getChatMessages(this.sessionId);
    return docs.map((doc) => {
      if (doc.role === "user") {
        return new HumanMessage(doc.content);
      }
      if (doc.role === "gitcodebot") {
        return new AIMessage(doc.content);
      }
      return new SystemMessage(doc.content);
    });
  }

  async addUserMessage(text: string): Promise<void> {
    await addChatMessage(this.sessionId, "user", text);
  }

  async addAIMessage(text: string): Promise<void> {
    await addChatMessage(this.sessionId, "gitcodebot", text);
  }
}
