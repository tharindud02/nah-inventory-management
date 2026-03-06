"use client";

import { cn } from "@/lib/utils";

export interface SourceInfoItemProps {
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
  className?: string;
}

export function SourceInfoItem({
  label,
  value,
  isLink = false,
  href,
  className,
}: SourceInfoItemProps) {
  const content = isLink ? (
    <a
      href={href ?? "#"}
      className="text-blue-600 hover:underline"
    >
      {value}
    </a>
  ) : (
    <span>{value}</span>
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        className,
      )}
    >
      <span className="text-slate-500">{label}</span>
      {content}
    </div>
  );
}
