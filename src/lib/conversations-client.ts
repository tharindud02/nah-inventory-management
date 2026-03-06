/**
 * Client-side API for conversations. Uses bearer token from localStorage.
 * Strict typing; no any.
 */

import type {
  ListingConversations,
  CreateConversationResponse,
} from "@/types/conversations";

export interface FetchConversationsResult {
  data: ListingConversations | null;
  error: string | null;
}

export interface SendMessageResult {
  success: boolean;
  conversationId?: string;
  messageId?: string;
  error?: string;
}

function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  return token ? `Bearer ${token}` : null;
}

export async function fetchConversations(listingId: string): Promise<FetchConversationsResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const res = await fetch(
      `/api/conversations?listingId=${encodeURIComponent(listingId)}`,
      { headers: { Authorization: auth } },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? `Request failed: ${res.status}`;
      return { data: null, error: msg };
    }

    const raw = (await res.json()) as { data?: ListingConversations };
    return { data: raw.data ?? null, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch conversations";
    return { data: null, error: msg };
  }
}

export async function createSmsConversation(
  listingId: string,
  payload: { dealerPhone: string; sellerPhone: string; message: string },
): Promise<SendMessageResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(listingId)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, channel: "sms" }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? `Request failed: ${res.status}`;
      return { success: false, error: msg };
    }

    const data = (await res.json()) as CreateConversationResponse;
    const conv = data?.data?.conversation;
    const msg = data?.data?.message;
    return {
      success: true,
      conversationId: conv?.id,
      messageId: msg?.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send SMS";
    return { success: false, error: msg };
  }
}

export async function createEmailConversation(
  listingId: string,
  payload: { dealerEmail: string; sellerEmail: string; message: string },
): Promise<SendMessageResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(listingId)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, channel: "email" }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? `Request failed: ${res.status}`;
      return { success: false, error: msg };
    }

    const data = (await res.json()) as CreateConversationResponse;
    const conv = data?.data?.conversation;
    const msg = data?.data?.message;
    return {
      success: true,
      conversationId: conv?.id,
      messageId: msg?.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: msg };
  }
}

export async function sendConversationMessage(
  listingId: string,
  payload: {
    conversationId: string;
    to: string;
    from: string;
    body: string;
    channel: "sms" | "email";
  },
): Promise<SendMessageResult> {
  const auth = getAuthHeader();
  if (!auth) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const res = await fetch(
      `/api/conversations/${encodeURIComponent(listingId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? `Request failed: ${res.status}`;
      return { success: false, error: msg };
    }

    const data = (await res.json()) as CreateConversationResponse;
    const msg = data?.data?.message;
    return {
      success: true,
      conversationId: payload.conversationId,
      messageId: msg?.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send message";
    return { success: false, error: msg };
  }
}
