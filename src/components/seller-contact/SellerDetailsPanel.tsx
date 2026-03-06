"use client";

import { Phone, Mail, MapPin, Calendar, MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactInfoItem } from "./ContactInfoItem";
import { SourceInfoItem } from "./SourceInfoItem";
import { ActionListItem } from "./ActionListItem";
import { cn } from "@/lib/utils";
import type { ContactChannel, ChannelAvailability } from "@/lib/seller-contact";

export interface SellerContactInfo {
  mobile?: string;
  email?: string;
  location?: string;
}

export interface SourceInfo {
  channel: string;
  channelHref?: string;
  created: string;
  leadId: string;
}

export interface SellerDetailsPanelProps {
  contactInfo: SellerContactInfo;
  sourceInfo: SourceInfo;
  actions: Array<{ id: string; label: string }>;
  /** External URL to open Messenger (e.g. Facebook Marketplace listing). */
  messengerHref?: string;
  channelAvailability?: ChannelAvailability;
  selectedChannel?: ContactChannel;
  onChannelSelect?: (channel: ContactChannel) => void;
  onLogActivity?: () => void;
  onActionClick?: (actionId: string) => void;
  className?: string;
}

const SAMPLE_MESSENGER_HREF = "https://www.facebook.com/marketplace";

export function SellerDetailsPanel({
  contactInfo,
  sourceInfo,
  actions,
  messengerHref,
  channelAvailability,
  selectedChannel = "email",
  onChannelSelect,
  onLogActivity,
  onActionClick,
  className,
}: SellerDetailsPanelProps) {
  const showSamples = channelAvailability?.showSampleButtons ?? false;
  const hasSms = channelAvailability?.hasSms ?? false;
  const hasEmail = channelAvailability?.hasEmail ?? false;
  const hasMessenger = channelAvailability?.hasMessenger ?? false;
  const messengerUrl = messengerHref ?? (showSamples ? SAMPLE_MESSENGER_HREF : undefined);

  const channelButton = (
    channel: ContactChannel,
    label: string,
    sampleLabel: string,
    Icon: typeof Phone,
  ) => (
    <Button
      key={channel}
      type="button"
      variant={selectedChannel === channel ? "default" : "outline"}
      size="sm"
      className="flex-1 gap-1.5"
      onClick={() => onChannelSelect?.(channel)}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {showSamples ? sampleLabel : label}
    </Button>
  );

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white",
        className,
      )}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Seller Details
        </h3>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {(hasSms || hasEmail) && onChannelSelect && (
          <div className="flex gap-2">
            {hasSms && channelButton("sms", "SMS", "Sample SMS", MessageSquare)}
            {hasEmail && channelButton("email", "Email", "Sample Email", Mail)}
          </div>
        )}
        {(messengerUrl || hasMessenger) && (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {showSamples ? "Sample Messenger" : "Message on Messenger"}
          </a>
        )}
        <div className="space-y-4">
          {contactInfo.mobile && (
            <ContactInfoItem
              icon={Phone}
              value={contactInfo.mobile}
              label="Mobile"
            />
          )}
          {contactInfo.email && (
            <ContactInfoItem
              icon={Mail}
              value={contactInfo.email}
              label="Email"
            />
          )}
          {contactInfo.location && (
            <ContactInfoItem
              icon={MapPin}
              value={contactInfo.location}
              label="Location"
            />
          )}
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Source Information
          </h4>
          <div className="space-y-2">
            <SourceInfoItem
              label="Channel"
              value={sourceInfo.channel}
              isLink
              href={sourceInfo.channelHref}
            />
            <SourceInfoItem label="Created" value={sourceInfo.created} />
            <SourceInfoItem label="Lead ID" value={sourceInfo.leadId} />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onLogActivity}
        >
          <Calendar className="h-4 w-4" aria-hidden />
          Log Activity
        </Button>

        <div className="space-y-1">
          {actions.map((action) => (
            <ActionListItem
              key={action.id}
              label={action.label}
              onClick={() => onActionClick?.(action.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
