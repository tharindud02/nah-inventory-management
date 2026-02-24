"use client";

import { Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/notes/UserAvatar";
import { cn } from "@/lib/utils";

export interface ChatContactHeaderProps {
  name: string;
  initials: string;
  status?: "online" | "offline";
  onCall?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export function ChatContactHeader({
  name,
  initials,
  status = "online",
  onCall,
  onMenuClick,
  className,
}: ChatContactHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <UserAvatar initials={initials} />
          {status === "online" && (
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
              aria-hidden
            />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{name}</h2>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === "online" ? "bg-emerald-500" : "bg-slate-400",
              )}
            />
            {status === "online" ? "ONLINE" : "OFFLINE"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCall}
          aria-label="Call"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
