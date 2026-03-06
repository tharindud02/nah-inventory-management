"use client";

import { cn } from "@/lib/utils";

export interface ConfigItem {
  label: string;
  value: string;
}

export interface ConfigurationCardProps {
  items: ConfigItem[];
  className?: string;
}

export function ConfigurationCard({
  items,
  className,
}: ConfigurationCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-600">
        Configuration
      </h3>
      <dl className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <dt className="text-sm font-medium text-slate-500">{item.label}</dt>
            <dd className="text-right text-sm font-semibold text-slate-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
