export type SessionSummary = {
  _id: string;
  sessionId: string;
  summary: string;
  embedding?: number[];
  updatedAt: Date;
};