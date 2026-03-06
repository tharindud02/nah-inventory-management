"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChatContactHeader } from "./ChatContactHeader";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTimestampSeparator } from "./ChatTimestampSeparator";
import { ChatInputBar } from "./ChatInputBar";

export interface ChatAttachment {
  name: string;
  size: number;
  type?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatSectionProps {
  contactName: string;
  contactInitials: string;
  contactStatus?: "online" | "offline";
  messages: ChatMessage[];
  aiAnalyzingText?: string;
  onSendMessage?: (message: string, files?: File[]) => void;
  onCall?: () => void;
  onMenuClick?: () => void;
  onAttach?: () => void;
  /** Disable send while posting to API. */
  isSending?: boolean;
  /** Show loading state in message area. */
  isLoading?: boolean;
  className?: string;
}

export function ChatSection({
  contactName,
  contactInitials,
  contactStatus = "online",
  messages,
  aiAnalyzingText,
  onSendMessage,
  onCall,
  onMenuClick,
  onAttach,
  isSending = false,
  isLoading = false,
  className,
}: ChatSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white",
        className,
      )}
    >
      <ChatContactHeader
        name={contactName}
        initials={contactInitials}
        status={contactStatus}
        onCall={onCall}
        onMenuClick={onMenuClick}
      />
      <div className="max-h-[400px] flex-1 overflow-y-auto">
        <div className="space-y-2 px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <ChatTimestampSeparator label="Today" />
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg.message}
                  timestamp={msg.timestamp}
                  isOutgoing={msg.isOutgoing}
                  attachments={msg.attachments}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      <ChatInputBar
        aiAnalyzingText={aiAnalyzingText}
        onSend={onSendMessage}
        onAttach={onAttach}
        isSending={isSending}
      />
    </div>
  );
}
