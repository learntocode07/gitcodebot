import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Message } from "@/types/chat/message";
import { MessageCircle } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  messages: Message[];
  streaming?: {
    role: "detroit-ai";
    content: string;
  } | null;
};

export function ChatMessages({ messages = [], streaming }: Props) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {[...messages, ...(streaming ? [streaming] : [])].map((message, idx) => (
        // Inline console.log to debug message rendering
        console.log(`Rendering message ${idx}:`, message),
        <div
          key={`msg-${idx}`}
          className={cn(
            "flex items-start space-x-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <MessageCircle
                className={cn(
                  "h-5 w-5",
                  message.role === "user" ? "text-blue-700" : "text-gray-500"
                )}
              />
            </AvatarFallback>
          </Avatar>

          {/* Message Bubble */}
          <div className="flex flex-col space-y-1 max-w-[75%]">
            <div
              className={cn(
                "text-sm p-3 rounded-lg whitespace-pre-wrap leading-relaxed",
                message.role === "user"
                  ? "bg-blue-100 text-blue-900 justify-end"
                  : "bg-gray-100 text-gray-800 justify-start"
              )}
            >
              {message.content}
              {streaming && message === streaming && (
                <span className="ml-1 animate-pulse">▍</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
