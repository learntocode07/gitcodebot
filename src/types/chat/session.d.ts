import { ObjectId } from 'mongodb';

export type ChatSession = {
  _id?: ObjectId | string;
  sessionId: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    model?: string;
    temperature?: number;
    repoUrl?: string;
    [key: string]: any;
  };
};
