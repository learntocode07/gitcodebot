"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoSendSharp } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ChatInput({ onSend, isSending }: { onSend: (message: string) => void; isSending?: boolean }) {
  const [text, setText] = useState("");

  return (
    <div className="flex items-center gap-2 p-4 rounded-lg">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button
        onClick={() => {
          if (text.trim()) {
            onSend(text);
            setText("");
          }
        }}
        disabled={isSending}
      >
        <IoSendSharp className="h-5 w-5" />
        {isSending ? <Loader2 className="animate-spin h-5 w-5" /> : "Send"}
      </Button>
    </div>
  )
}
