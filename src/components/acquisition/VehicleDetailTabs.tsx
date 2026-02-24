"use client";

import { cn } from "@/lib/utils";

export type VehicleDetailTabId =
  | "details"
  | "valuation"
  | "seller"
  | "notes"
  | "appointments"
  | "cost-analysis";

export interface VehicleDetailTab {
  id: VehicleDetailTabId;
  label: string;
}

const TABS: VehicleDetailTab[] = [
  { id: "details", label: "Details & Photos" },
  { id: "valuation", label: "Valuation" },
  { id: "cost-analysis", label: "Cost Analysis" },
  { id: "seller", label: "Seller Contact" },
  { id: "notes", label: "Notes" },
  { id: "appointments", label: "Appointments" },
];

export interface VehicleDetailTabsProps {
  activeTab: VehicleDetailTabId;
  onTabChange: (tab: VehicleDetailTabId) => void;
  /** Tabs to hide (e.g. seller, notes, appointments for inventory/vin-intel). */
  hiddenTabs?: VehicleDetailTabId[];
}

export function VehicleDetailTabs({
  activeTab,
  onTabChange,
  hiddenTabs = [],
}: VehicleDetailTabsProps) {
  const visibleTabs = TABS.filter((tab) => !hiddenTabs.includes(tab.id));

  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="flex gap-8 px-6" aria-label="Vehicle detail sections">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative py-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-gray-800"
                : "text-gray-500 hover:text-gray-800",
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"
                aria-hidden
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
