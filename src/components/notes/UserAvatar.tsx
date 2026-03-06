"use client";

import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  initials: string;
  className?: string;
}

export function UserAvatar({ initials, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700",
        className,
      )}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
