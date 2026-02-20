"use client";

import { cn } from "@/lib/utils";

export type VehicleDetailTabId =
  | "details"
  | "valuation"
  | "seller"
  | "notes"
  | "appointments";

export interface VehicleDetailTab {
  id: VehicleDetailTabId;
  label: string;
}

const TABS: VehicleDetailTab[] = [
  { id: "details", label: "Details & Photos" },
  { id: "valuation", label: "Valuation" },
  { id: "seller", label: "Seller Contact" },
  { id: "notes", label: "Notes" },
  { id: "appointments", label: "Appointments" },
];

export interface VehicleDetailTabsProps {
  activeTab: VehicleDetailTabId;
  onTabChange: (tab: VehicleDetailTabId) => void;
}

export function VehicleDetailTabs({
  activeTab,
  onTabChange,
}: VehicleDetailTabsProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="flex gap-8 px-6" aria-label="Vehicle detail sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative py-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-blue-600"
                : "text-slate-600 hover:text-slate-900",
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                aria-hidden
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
