"use client";

import { ChatSection } from "./ChatSection";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { SellerDetailsPanel } from "./SellerDetailsPanel";
import type { ChatMessage } from "./ChatSection";
import type { SellerContactInfo, SourceInfo } from "./SellerDetailsPanel";

export interface SellerContactTabContentProps {
  contactName: string;
  contactInitials: string;
  contactStatus?: "online" | "offline";
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
  messages,
  aiSuggestions,
  contactInfo,
  sourceInfo,
  actions,
  aiAnalyzingText,
  onSendMessage,
  onSuggestionClick,
  onLogActivity,
  onActionClick,
  onCall,
  onMenuClick,
  onAttach,
}: SellerContactTabContentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px_320px]">
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
        className="min-h-[500px]"
      />

      <AISuggestionsPanel
        suggestions={aiSuggestions}
        onSuggestionClick={onSuggestionClick}
      />

      <SellerDetailsPanel
        contactInfo={contactInfo}
        sourceInfo={sourceInfo}
        actions={actions}
        onLogActivity={onLogActivity}
        onActionClick={onActionClick}
        className="lg:col-start-2 xl:col-start-3"
      />
    </div>
  );
}
