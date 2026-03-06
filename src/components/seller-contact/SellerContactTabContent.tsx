"use client";

import { MessageCircle } from "lucide-react";
import { ChatSection } from "./ChatSection";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { SellerDetailsPanel } from "./SellerDetailsPanel";
import type { ChatMessage } from "./ChatSection";
import type { SellerContactInfo, SourceInfo } from "./SellerDetailsPanel";
import type { ContactChannel, ChannelAvailability } from "@/lib/seller-contact";

export interface SellerContactTabContentProps {
  contactName: string;
  contactInitials: string;
  contactStatus?: "online" | "offline";
  /** External URL to open Messenger / Marketplace listing (e.g. Facebook Marketplace item). */
  messengerHref?: string;
  messages: ChatMessage[];
  aiSuggestions: Array<{
    id: string;
    category: string;
    actionText: string;
    description: string;
    icon?: "zap" | "check" | "calendar" | "tag";
  }>;
  contactInfo: SellerContactInfo;
  sourceInfo: SourceInfo;
  actions: Array<{ id: string; label: string }>;
  aiAnalyzingText?: string;
  channelAvailability?: ChannelAvailability;
  selectedChannel?: ContactChannel;
  onChannelSelect?: (channel: ContactChannel) => void;
  isSending?: boolean;
  isLoading?: boolean;
  onSendMessage?: (message: string, files?: File[]) => void;
  onSuggestionClick?: (suggestionId: string) => void;
  onLogActivity?: () => void;
  onActionClick?: (actionId: string) => void;
  onCall?: () => void;
  onMenuClick?: () => void;
  onAttach?: () => void;
}

export function SellerContactTabContent({
  contactName,
  contactInitials,
  contactStatus = "online",
  messengerHref,
  messages,
  aiSuggestions,
  contactInfo,
  sourceInfo,
  actions,
  aiAnalyzingText,
  channelAvailability,
  selectedChannel = "email",
  onChannelSelect,
  isSending = false,
  isLoading = false,
  onSendMessage,
  onSuggestionClick,
  onLogActivity,
  onActionClick,
  onCall,
  onMenuClick,
  onAttach,
}: SellerContactTabContentProps) {
  const hasChatChannels =
    (channelAvailability?.hasSms ?? false) || (channelAvailability?.hasEmail ?? false);
  const onlyMessenger =
    (channelAvailability?.hasMessenger ?? false) && !hasChatChannels;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px_320px]">
      {onlyMessenger ? (
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <p className="mb-4 text-center text-slate-600">
            Contact the seller via Messenger
          </p>
          <a
            href={messengerHref ?? "https://www.facebook.com/marketplace"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {channelAvailability?.showSampleButtons ? "Sample Messenger" : "Message on Messenger"}
          </a>
        </div>
      ) : (
        <ChatSection
          contactName={contactName}
          contactInitials={contactInitials}
          contactStatus={contactStatus}
          messages={messages}
          aiAnalyzingText={aiAnalyzingText}
          onSendMessage={onSendMessage}
          onCall={onCall}
          onMenuClick={onMenuClick}
          onAttach={onAttach}
          isSending={isSending}
          isLoading={isLoading}
          className="min-h-[500px]"
        />
      )}

      <AISuggestionsPanel
        suggestions={aiSuggestions}
        onSuggestionClick={onSuggestionClick}
      />

      <SellerDetailsPanel
        contactInfo={contactInfo}
        sourceInfo={sourceInfo}
        actions={actions}
        messengerHref={messengerHref}
        channelAvailability={channelAvailability}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        onLogActivity={onLogActivity}
        onActionClick={onActionClick}
        className="lg:col-start-2 xl:col-start-3"
      />
    </div>
  );
}
