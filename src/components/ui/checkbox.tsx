"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  label?: React.ReactNode;
}

export function Checkbox({
  className,
  label,
  id: providedId,
  ...props
}: CheckboxProps) {
  const id = React.useId();
  const inputId = providedId ?? id;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group flex cursor-pointer items-center gap-3 text-sm text-slate-700",
        props.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type="checkbox"
        id={inputId}
        className="sr-only"
        {...props}
      />
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 transition-colors",
          "group-has-checked:border-blue-600 group-has-checked:bg-blue-600",
          "group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2",
          className,
        )}
      >
        <Check className="h-3 w-3 text-white opacity-0 group-has-checked:opacity-100" />
      </span>
      {label != null && <span>{label}</span>}
    </label>
  );
}
