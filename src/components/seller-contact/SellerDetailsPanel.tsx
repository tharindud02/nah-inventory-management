"use client";

import { Phone, Mail, MapPin, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactInfoItem } from "./ContactInfoItem";
import { SourceInfoItem } from "./SourceInfoItem";
import { ActionListItem } from "./ActionListItem";
import { cn } from "@/lib/utils";

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
  onLogActivity?: () => void;
  onActionClick?: (actionId: string) => void;
  className?: string;
}

export function SellerDetailsPanel({
  contactInfo,
  sourceInfo,
  actions,
  onLogActivity,
  onActionClick,
  className,
}: SellerDetailsPanelProps) {
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
