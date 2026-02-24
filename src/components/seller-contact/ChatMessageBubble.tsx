"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatAttachment {
  name: string;
  size: number;
  type?: string;
  previewUrl?: string;
}

export interface ChatMessageBubbleProps {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  attachments?: ChatAttachment[];
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatMessageBubble({
  message,
  timestamp,
  isOutgoing,
  attachments = [],
  className,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isOutgoing ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          isOutgoing
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-900",
        )}
      >
        {message && (
          <p className="text-sm leading-relaxed">{message}</p>
        )}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((att, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-lg p-2",
                  isOutgoing ? "bg-blue-500/50" : "bg-slate-200/60",
                )}
              >
                {att.previewUrl ? (
                  <a
                    href={att.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block shrink-0"
                  >
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </a>
                ) : (
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded",
                      isOutgoing ? "bg-blue-500/70" : "bg-slate-300/70",
                    )}
                  >
                    <FileText className="h-5 w-5" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{att.name}</p>
                  <p
                    className={cn(
                      "text-xs",
                      isOutgoing ? "text-blue-100" : "text-slate-500",
                    )}
                  >
                    {formatFileSize(att.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <time
          className={cn(
            "mt-1 block text-xs",
            isOutgoing ? "text-blue-100" : "text-slate-500",
          )}
        >
          {timestamp}
        </time>
      </div>
    </div>
  );
}
