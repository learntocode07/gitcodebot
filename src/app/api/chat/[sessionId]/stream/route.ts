import { getRepoNameFromUrl, getRepoOwnerFromUrl } from "@/utils/repository";
import { initChatChain, ragChainWithSource } from "@/lib/services/ragService";

import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { TextEncoder } from "util";
import { addChatMessage } from "@/lib/services/chatService";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  const repo = searchParams.get("repo");

  if (!prompt || !repo) {
    return new Response("Missing `prompt` or `repo`", { status: 400 });
  }

  const repo_name = getRepoNameFromUrl(decodeURIComponent(repo));
  const repo_owner = getRepoOwnerFromUrl(decodeURIComponent(repo));
  if (!repo_owner || !repo_name) {
    return new Response("Invalid repo format", { status: 400 });
  }

  if (!ragChainWithSource) {
    try {
      console.log("repo_name: ", repo_name);

      await initChatChain(repo_name, repo_owner);
    } catch (err) {
      console.error("Failed to init RAG chain:", err);
      return new Response("Internal server error", { status: 500 });
    }
  }

  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const responseStream = await ragChainWithSource.stream(
          { input: decodeURIComponent(prompt) },
          {
            configurable: { sessionId },
          }
        );

        for await (const chunk of responseStream) {
          console.log("New token:", chunk);
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        await addChatMessage(
          sessionId,
          "gitcodebot",
          fullResponse,
        )
        controller.close();
      } catch (err) {
        console.error("Streaming error:", err);
        controller.enqueue(encoder.encode("data: [ERROR]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
