/** Upstream conversation API types. No `any`; strict typing for responses. */

export type ConversationChannel = "email" | "sms";

export interface ConversationMessage {
  id: string;
  conversationId: string;
  channel: ConversationChannel;
  direction: "inbound" | "outbound";
  sender: string;
  recipient: string;
  body: string;
  status: string;
  externalSid: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  dealerId: string;
  listingId: string;
  channel: ConversationChannel;
  dealerPhone: string | null;
  dealerEmail: string | null;
  sellerPhone: string | null;
  sellerEmail: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: ConversationMessage[];
}

export interface ListingConversations {
  email?: Conversation;
  sms?: Conversation;
}

export interface AllConversationsResponse {
  data: Record<string, ListingConversations>;
}

export interface ListingConversationsResponse {
  data: ListingConversations;
}

export interface CreateEmailPayload {
  dealerEmail: string;
  sellerEmail: string;
  message: string;
  channel: "email";
}

export interface CreateSmsMessagePayload {
  conversationId: string;
  to: string;
  from: string;
  body: string;
  channel: "sms";
}

export interface CreateConversationResponse {
  data: {
    conversation: Conversation;
    message: ConversationMessage;
    sendResult: {
      success: boolean;
      messageId?: string;
      sid?: string;
      statusCode?: number;
      status?: string;
      channel: string;
    };
  };
}
