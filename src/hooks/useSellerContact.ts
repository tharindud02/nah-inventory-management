"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/components/seller-contact/ChatSection";
import type { ContactChannel, ChannelAvailability, SellerContactInput } from "@/lib/seller-contact";
import {
  getChannelAvailability,
  buildCreateEmailPayload,
  buildCreateSmsPayload,
  buildAddEmailMessagePayload,
  buildAddSmsMessagePayload,
  mapApiMessagesToChat,
} from "@/lib/seller-contact";
import {
  fetchConversations,
  createEmailConversation,
  createSmsConversation,
  sendConversationMessage,
} from "@/lib/conversations-client";
import type { ListingConversations } from "@/types/conversations";

export interface UseSellerContactInput {
  listingId: string;
  sellerContact: SellerContactInput;
  /** Only fetch when true (e.g. when seller tab is active). */
  enabled: boolean;
}

export interface UseSellerContactResult {
  messages: ChatMessage[];
  channelAvailability: ChannelAvailability;
  selectedChannel: ContactChannel;
  setSelectedChannel: (ch: ContactChannel) => void;
  isSending: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

export function useSellerContact({
  listingId,
  sellerContact,
  enabled,
}: UseSellerContactInput): UseSellerContactResult {
  const [conversations, setConversations] = useState<ListingConversations | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel>("email");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availability = getChannelAvailability(sellerContact);

  useEffect(() => {
    if (!enabled || !listingId) return;

    let cancelled = false;
    setIsLoading(true);
    fetchConversations(listingId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error(error);
          return;
        }
        setConversations(data ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, listingId]);

  const getMessagesForChannel = useCallback(
    (channel: ContactChannel): ChatMessage[] => {
      if (!conversations) return [];
      const conv = channel === "email" ? conversations.email : conversations.sms;
      if (!conv?.messages?.length) return [];
      return mapApiMessagesToChat(conv.messages).map((m) => ({
        id: m.id,
        message: m.message,
        timestamp: m.timestamp,
        isOutgoing: m.isOutgoing,
      }));
    },
    [conversations],
  );

  const messages = getMessagesForChannel(selectedChannel);

  const onSendMessage = useCallback(
    async (message: string) => {
      if (!listingId || selectedChannel === "messenger") return;

      const ch = selectedChannel as "email" | "sms";
      const conv = ch === "email" ? conversations?.email : conversations?.sms;

      setIsSending(true);
      try {
        if (ch === "email") {
          if (conv?.id) {
            const payload = buildAddEmailMessagePayload(
              conv.id,
              message,
              sellerContact,
              availability,
            );
            if (!payload) {
              toast.error("Email contact not available");
              return;
            }
            const result = await sendConversationMessage(listingId, payload);
            if (!result.success) {
              toast.error(result.error ?? "Failed to send");
              return;
            }
          } else {
            const payload = buildCreateEmailPayload(
              listingId,
              message,
              sellerContact,
              availability,
            );
            if (!payload) {
              toast.error("Email contact not available");
              return;
            }
            const result = await createEmailConversation(listingId, {
              dealerEmail: payload.dealerEmail,
              sellerEmail: payload.sellerEmail,
              message: payload.message,
            });
            if (!result.success) {
              toast.error(result.error ?? "Failed to send");
              return;
            }
          }
        } else {
          if (conv?.id) {
            const payload = buildAddSmsMessagePayload(
              conv.id,
              message,
              sellerContact,
              availability,
            );
            if (!payload) {
              toast.error("SMS contact not available");
              return;
            }
            const result = await sendConversationMessage(listingId, payload);
            if (!result.success) {
              toast.error(result.error ?? "Failed to send");
              return;
            }
          } else {
            const payload = buildCreateSmsPayload(message, sellerContact, availability);
            if (!payload) {
              toast.error("SMS contact not available");
              return;
            }
            const result = await createSmsConversation(listingId, {
              dealerPhone: payload.dealerPhone,
              sellerPhone: payload.sellerPhone,
              message: payload.message,
            });
            if (!result.success) {
              toast.error(result.error ?? "Failed to send");
              return;
            }
          }
        }

        toast.success("Message sent");
        const { data } = await fetchConversations(listingId);
        if (data) setConversations(data);
      } finally {
        setIsSending(false);
      }
    },
    [
      listingId,
      selectedChannel,
      conversations,
      sellerContact,
      availability,
    ],
  );

  return {
    messages,
    channelAvailability: availability,
    selectedChannel,
    setSelectedChannel,
    isSending,
    isLoading,
    onSendMessage,
  };
}
