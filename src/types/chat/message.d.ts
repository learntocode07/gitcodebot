export type Message = {
  _id: string;
  sessionId: string;
  role: "user" | "gitcodebot" | "system";
  content: string;
  createdAt: Date;
  metadata?: {
    tokenCount?: number;
    functionCall?: Record<string, any>;
    responseTimeMs?: number;
    [key: string]: any;
  };
};