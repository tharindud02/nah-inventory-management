"use client";

import { useRef, useState } from "react";
import { Plus, Camera, Paperclip, Smile, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ChatInputBarProps {
  placeholder?: string;
  aiAnalyzingText?: string;
  onSend?: (message: string, files?: File[]) => void;
  onAttach?: () => void;
  acceptFiles?: string;
  maxFileSizeBytes?: number;
  maxFiles?: number;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatInputBar({
  placeholder = "Type a message...",
  aiAnalyzingText,
  onSend,
  onAttach,
  acceptFiles = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  maxFileSizeBytes = 10 * 1024 * 1024,
  maxFiles = 5,
  className,
}: ChatInputBarProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const valid = files.filter((f) => f.size <= maxFileSizeBytes);
    const rejected = files.filter((f) => f.size > maxFileSizeBytes);
    if (rejected.length > 0) {
      console.warn(
        `Skipped ${rejected.length} file(s) over ${formatFileSize(maxFileSizeBytes)} limit`,
      );
    }

    setAttachments((prev) => {
      const next = [...prev, ...valid].slice(0, maxFiles);
      return next;
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    const hasContent = trimmed || attachments.length > 0;

    if (hasContent && onSend) {
      onSend(trimmed || "(attachment)", attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const canSend = message.trim() || attachments.length > 0;

  return (
    <div
      className={cn(
        "border-t border-slate-200 bg-white p-4",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptFiles}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />

      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm"
            >
              <span className="truncate max-w-[120px]" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-slate-500">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={triggerFilePick}
          aria-label="Add attachment"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="min-h-10 flex-1"
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={triggerFilePick}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={triggerFilePick}
            aria-label="Add photo"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Emoji">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon-sm"
            disabled={!canSend}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
      {aiAnalyzingText && (
        <p className="mt-2 text-xs text-slate-500">{aiAnalyzingText}</p>
      )}
    </div>
  );
}
