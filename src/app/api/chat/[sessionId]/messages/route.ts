import { NextRequest, NextResponse } from "next/server";
import { addChatMessage, getChatMessages } from "@/lib/services/chatService";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await context.params;

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
        const messages = await getChatMessages(sessionId);
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await context.params;

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
        const body = await request.json();
        if (!body || !body.role || !body.content) {
            return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
        }

        const insertedId = await addChatMessage(
            sessionId,
            body.role,
            body.content,
            body.metadata || {}
        );
        return NextResponse.json({ insertedId }, { status: 201 });
    } catch (error) {
        console.error("Error creating chat message:", error);
        return NextResponse.json(
            { error: "Failed to create chat message" },
            { status: 500 }
        );
    }
}
