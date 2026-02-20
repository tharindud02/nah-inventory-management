"use client";

import { ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { RoleBadge, type RoleVariant } from "./RoleBadge";
import { cn } from "@/lib/utils";

export interface NoteItemProps {
  authorName: string;
  authorInitials: string;
  role: string;
  roleVariant?: RoleVariant;
  timestamp: string;
  content: string;
  showActions?: boolean;
  className?: string;
}

export function NoteItem({
  authorName,
  authorInitials,
  role,
  roleVariant = "acquisition",
  timestamp,
  content,
  showActions = false,
  className,
}: NoteItemProps) {
  return (
    <article
      className={cn(
        "flex gap-4 border-b border-slate-100 pb-6 last:border-b-0",
        className,
      )}
    >
      <UserAvatar initials={authorInitials} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">{authorName}</span>
          <RoleBadge role={role} variant={roleVariant} />
        </div>
        <time className="mb-2 block text-xs text-slate-500">{timestamp}</time>
        <p className="text-sm leading-relaxed text-slate-700">{content}</p>
        {showActions && (
          <div className="mt-3 flex gap-4">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-600">
              <Reply className="h-4 w-4" aria-hidden />
              Reply
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-600">
              <ThumbsUp className="h-4 w-4" aria-hidden />
              Helpful
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
