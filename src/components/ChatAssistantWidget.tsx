"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Maximize2, MessageCircle, Minimize2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StreamChunkPayload {
  session_id?: unknown;
  text?: unknown;
  message?: unknown;
  response?: unknown;
  token?: unknown;
  content?: unknown;
  delta?: unknown;
}

const SESSION_STORAGE_KEY = "chat_assistant_session_id";

function readStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function writeStoredSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function parseChunkToText(payload: StreamChunkPayload): string {
  const candidates = [
    payload.text,
    payload.message,
    payload.response,
    payload.token,
    payload.content,
    payload.delta,
  ];

  const textCandidate = candidates.find((value) => typeof value === "string");
  return typeof textCandidate === "string" ? textCandidate : "";
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

interface FormattedBlock {
  type: "paragraph" | "bullet";
  text: string;
}

function normalizeAssistantText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/(\*\*[^*]+\*\*)\s*-\s+/g, "$1\n- ")
    .replace(/([.!?])\s+-\s+/g, "$1\n- ")
    .trim();
}

function formatAssistantBlocks(raw: string): FormattedBlock[] {
  const normalized = normalizeAssistantText(raw);
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: FormattedBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphBuffer.length === 0) return;
    blocks.push({
      type: "paragraph",
      text: paragraphBuffer.join(" "),
    });
    paragraphBuffer = [];
  };

  for (const line of lines) {
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      blocks.push({
        type: "bullet",
        text: line.replace(/^[-*]\s+/, "").trim(),
      });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

function renderInlineBold(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((segment) => segment.length > 0)
    .map((segment, index) => {
      if (segment.startsWith("**") && segment.endsWith("**")) {
        return (
          <strong key={`${keyPrefix}-strong-${index}`}>
            {segment.slice(2, -2)}
          </strong>
        );
      }

      return <span key={`${keyPrefix}-span-${index}`}>{segment}</span>;
    });
}

function renderAssistantMessage(content: string, keyPrefix: string): ReactNode {
  const blocks = formatAssistantBlocks(content);
  if (blocks.length === 0) return content;

  const bulletBlocks = blocks.filter((block) => block.type === "bullet");
  const paragraphBlocks = blocks.filter((block) => block.type === "paragraph");

  return (
    <div className="space-y-2">
      {paragraphBlocks.map((block, index) => (
        <p key={`${keyPrefix}-paragraph-${index}`} className="leading-6">
          {renderInlineBold(block.text, `${keyPrefix}-paragraph-${index}`)}
        </p>
      ))}
      {bulletBlocks.length > 0 && (
        <ul className="list-disc space-y-1 pl-5">
          {bulletBlocks.map((block, index) => (
            <li key={`${keyPrefix}-bullet-${index}`} className="leading-6">
              {renderInlineBold(block.text, `${keyPrefix}-bullet-${index}`)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ChatAssistantWidget() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    readStoredSessionId(),
  );
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content: "Ask me anything about inventory, sourcing, pricing, or demand.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending],
  );

  const updateAssistantMessage = (id: string, nextContent: string): void => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, content: nextContent } : message,
      ),
    );
  };

  const appendToAssistantMessage = (id: string, chunk: string): void => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? { ...message, content: `${message.content}${chunk}` }
          : message,
      ),
    );
  };

  const sendMessage = async (): Promise<void> => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-auth-error-${Date.now()}`,
          role: "assistant",
          content: "Please sign in again. Missing access token.",
        },
      ]);
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: trimmed },
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    setInput("");
    setIsSending(true);

    try {
      const payload = sessionId
        ? { message: trimmed, session_id: sessionId }
        : { message: trimmed };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Assistant request failed");
      }

      if (!response.body) {
        const fallbackText = await response.text();
        const parsed = safeJsonParse(fallbackText);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          "session_id" in parsed &&
          typeof (parsed as StreamChunkPayload).session_id === "string"
        ) {
          const nextSessionId = (parsed as StreamChunkPayload).session_id as string;
          setSessionId(nextSessionId);
          writeStoredSessionId(nextSessionId);
        }
        const answer =
          parsed && typeof parsed === "object"
            ? parseChunkToText(parsed as StreamChunkPayload)
            : fallbackText;
        updateAssistantMessage(
          assistantMessageId,
          answer || "No response received from assistant.",
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let carry = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        carry += decoder.decode(value, { stream: true });
        const lines = carry.split("\n");
        carry = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;

          const normalized = line.startsWith("data:")
            ? line.slice(5).trim()
            : line;
          if (!normalized || normalized === "[DONE]") continue;

          const parsed = safeJsonParse(normalized);
          if (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
          ) {
            const maybeSessionId = (parsed as StreamChunkPayload).session_id;
            if (typeof maybeSessionId === "string" && maybeSessionId.length > 0) {
              setSessionId(maybeSessionId);
              writeStoredSessionId(maybeSessionId);
            }

            const chunkText = parseChunkToText(parsed as StreamChunkPayload);
            if (chunkText) appendToAssistantMessage(assistantMessageId, chunkText);
            continue;
          }

          appendToAssistantMessage(assistantMessageId, normalized);
        }
      }

      const trailing = carry.trim();
      if (trailing) {
        const parsed = safeJsonParse(
          trailing.startsWith("data:") ? trailing.slice(5).trim() : trailing,
        );
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const maybeSessionId = (parsed as StreamChunkPayload).session_id;
          if (typeof maybeSessionId === "string" && maybeSessionId.length > 0) {
            setSessionId(maybeSessionId);
            writeStoredSessionId(maybeSessionId);
          }
          const chunkText = parseChunkToText(parsed as StreamChunkPayload);
          if (chunkText) appendToAssistantMessage(assistantMessageId, chunkText);
        } else {
          appendToAssistantMessage(assistantMessageId, trailing);
        }
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId && message.content.trim().length === 0
            ? {
                ...message,
                content: "No response received from assistant.",
              }
            : message,
        ),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Assistant request failed";
      updateAssistantMessage(
        assistantMessageId,
        `Assistant error: ${errorMessage}`,
      );
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {isOpen && (
        <div
          className={`fixed z-[60] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${
            isMaximized
              ? "inset-4 left-20 max-h-[calc(100vh-2rem)]"
              : "bottom-24 right-6 w-[360px] max-w-[calc(100vw-1.5rem)]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-semibold">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
                aria-label={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            className={`space-y-3 overflow-y-auto bg-slate-50 p-4 ${
              isMaximized ? "h-[calc(100vh-12rem)]" : "h-96"
            }`}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-5 ${
                  message.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                {message.content ? (
                  message.role === "assistant" ? (
                    renderAssistantMessage(message.content, message.id)
                  ) : (
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  )
                ) : isSending && message.role === "assistant" ? (
                  "..."
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask AI about inventory..."
              rows={2}
              className="mb-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {sessionId ? `Session: ${sessionId}` : "New session"}
              </span>
              <Button
                onClick={() => void sendMessage()}
                disabled={!canSend}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700"
        aria-label="Open AI assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
