"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { ChatInput } from "@/components/custom/chat/ChatInput";
import { ChatMessages } from "@/components/custom/chat/ChatMessages";
import { HomeSidebar } from "@/components/custom/HomeSidebar";
import { Message } from "@/types/chat/message";
import { SidebarProvider } from "@/components/ui/sidebar";
import { get } from "http";

async function getChatHistory(sessionId: string): Promise<Message[]> {
  const res = await fetch(`/api/chat/${sessionId}/messages`);
  if (!res.ok) {
    console.log("Failed to fetch chat history:", res.statusText);
    return [];
  }
  const data = await res.json();
  return data;
}

async function addChatMessage(
  sesssionId: string,
  role: string,
  content: string,
  metadata?: any
): Promise<string> {
  const res = await fetch(`/api/chat/${sesssionId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, content, metadata }),
  });

  if (!res.ok) {
    console.error("Failed to add chat message:", res.statusText);
    throw new Error("Failed to add chat message");
  }

  const data = await res.json();
  console.log("Chat message added:", data);
  return data.insertedId;
}
export default function ChatPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;
  const repoUrl = useSearchParams().get("repoUrl") || "";
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [streamingMsg, setStreamingMsg] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      console.log("No sessionId found in params");
      return;
    }
    console.log("Fetching chat history for session:", sessionId);
    getChatHistory(sessionId).then((messages) => {
      console.log("Chat history loaded:", messages);
      setSessionMessages(messages);
    });
  }, [sessionId]);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [sessionMessages, streamingMsg]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setIsStreaming(true);

    await addChatMessage(sessionId, "user", text)
    await getChatHistory(sessionId).then((messages) => {
      setSessionMessages(messages);
    });

    const evt = new EventSource(
      `/api/chat/${sessionId}/stream?repo=${encodeURIComponent(
        repoUrl
      )}&prompt=${encodeURIComponent(text)}`
    );

    let full = "";
    evt.onmessage = async (e) => {
      if (e.data === "[DONE]") {
        setSessionMessages(await getChatHistory(sessionId));
        setStreamingMsg("");
        setIsStreaming(false);
        evt.close();
      } else {
        full += e.data;
        setStreamingMsg(full);
      }
    };

    evt.onerror = () => {
      setStreamingMsg("⚠️ Connection error.");
      setIsStreaming(false);
      evt.close();
    };
  };

  return (
    <SidebarProvider>
      <HomeSidebar />
      <main className="flex-1 p-1 bg-background text-foreground font-mono">
        <div className="max-w-3xl mx-auto items-center mb-6">
          <h1 className="text-2xl font-bold mb-4">Chat with GitCodeBot</h1>
          <p className="mb-6">
            {repoUrl
              ? `Chatting about repository: ${repoUrl}`
              : "No repository selected."}
          </p>
          <div
            ref={containerRef}
            className="bottom max-w-3xl mx-auto border-gray-100 border rounded-lg shadow-md bg-white p-5"
          >
            <ChatMessages
              messages={sessionMessages}
              streaming={
                isStreaming
                  ? {
                    role: "gitcodebot",
                    content: streamingMsg,
                  }
                  : null
              }
            />
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
