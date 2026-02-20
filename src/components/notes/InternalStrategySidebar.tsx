"use client";

import { useRef, useState } from "react";
import { Users, Info, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface PriorityFlag {
  id: string;
  label: string;
  checked: boolean;
}

export interface InternalStrategySidebarProps {
  negotiationGoals: string[];
  maxBidLimit: string;
  reconBudget: string;
  totalAllInCost: string;
  exitStrategy: string;
  priorityFlags: PriorityFlag[];
  onSave?: (data: {
    maxBidLimit: string;
    reconBudget: string;
    exitStrategy: string;
    priorityFlags: PriorityFlag[];
  }) => void;
  className?: string;
}

export function InternalStrategySidebar({
  negotiationGoals,
  maxBidLimit,
  reconBudget,
  totalAllInCost,
  exitStrategy,
  priorityFlags,
  onSave,
  className,
}: InternalStrategySidebarProps) {
  const [maxBid, setMaxBid] = useState(maxBidLimit);
  const [recon, setRecon] = useState(reconBudget);
  const [exit, setExit] = useState(exitStrategy);
  const [flags, setFlags] = useState(priorityFlags);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleFlagChange = (id: string, checked: boolean) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked } : f)),
    );
  };

  const scrollToTop = () => {
    sidebarRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "relative flex w-full flex-col rounded-xl border border-slate-200 bg-white lg:w-80 lg:shrink-0",
        className,
      )}
    >
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Internal Strategy
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Shared planning and negotiation guardrails.
          </p>
        </div>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Negotiation Goals
          </h4>
          <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
            {negotiationGoals.map((goal, i) => (
              <li key={i} className="pl-1">
                {goal}
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Max Bid Limit
            </label>
            <Input
              type="text"
              value={maxBid}
              onChange={(e) => setMaxBid(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recon Budget
            </label>
            <Input
              type="text"
              value={recon}
              onChange={(e) => setRecon(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total All In Cost Budget
              </label>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                aria-label="More info"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-700">
              {totalAllInCost}
            </div>
          </div>
        </section>

        <section>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Exit Strategy
          </label>
          <select
            value={exit}
            onChange={(e) => setExit(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="retail-ready">Retail Ready (Priority)</option>
            <option value="wholesale">Wholesale</option>
            <option value="auction">Auction</option>
          </select>
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Priority Flags
          </h4>
          <div className="space-y-3">
            {flags.map((flag) => (
              <Checkbox
                key={flag.id}
                id={flag.id}
                label={flag.label}
                checked={flag.checked}
                onChange={(e) =>
                  handleFlagChange(flag.id, e.target.checked)
                }
              />
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-200 p-4">
        <Button
          className="w-full bg-slate-800 hover:bg-slate-900"
          onClick={() =>
            onSave?.({
              maxBidLimit: maxBid,
              reconBudget: recon,
              exitStrategy: exit,
              priorityFlags: flags,
            })
          }
        >
          Save Strategy Changes
        </Button>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="absolute bottom-20 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </aside>
  );
}
