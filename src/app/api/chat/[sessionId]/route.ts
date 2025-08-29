import {
    NextRequest,
    NextResponse,
} from 'next/server';
import { addChatMessage, createChatMessage, getChatMessages } from '@/lib/services/chatService';
import { createChatSession, getChatSessionById, updateChatSession } from '@/lib/services/chatService';

import { ChatSession } from '@/types/chat/session';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;

  const messages = await getChatSessionById(sessionId);
  if (!messages) {
    return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
  }

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const body = await request.json();

  if (!body) {
    console.log("Invalid request body:", body);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let session = await getChatSessionById(sessionId);

  if (!session) {
    const newSession: ChatSession = {
      userId: body.userId,
      sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: body.metadata || {
        repoUrl: body.repoUrl,
      },
    };
    await createChatSession(sessionId, newSession); // ⬅️ Don't forget to await this
  }

  // Return the chat session
  session = await getChatSessionById(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Chat session not found after creation" }, { status: 404 });
  }

  return NextResponse.json(session, { status: 200 });
}