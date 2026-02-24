"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import type { VinHistoryItem } from "@/lib/api/vin-history";

const PAGE_SIZE = 10;

type ModalVariant = "analysis" | "buildSheet";

interface VinHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: VinHistoryItem[];
  variant: ModalVariant;
  onViewItem: (item: VinHistoryItem) => void | Promise<void>;
}

function StatusBadge({
  reportType,
  variant,
}: {
  reportType?: VinHistoryItem["reportType"];
  variant: ModalVariant;
}) {
  const isValidated =
    reportType === "Validated Build Sheet" ||
    reportType === "Full Data Package" ||
    variant === "buildSheet";

  if (isValidated) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle className="h-3 w-3" />
        Validated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      <Clock className="h-3 w-3" />
      {reportType ?? "Standard Analysis"}
    </span>
  );
}

function formatVehicleLabel(item: VinHistoryItem): string {
  const parts = [item.year, item.make, item.model, item.trim].filter(Boolean);
  const base = parts.join(" ");
  const color =
    typeof item.exteriorColor === "string" ? item.exteriorColor : undefined;
  return color ? `${base} • ${color}` : base;
}

export function VinHistoryModal({
  open,
  onOpenChange,
  items,
  variant,
  onViewItem,
}: VinHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.vin?.toLowerCase().includes(q) ||
        item.make?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q) ||
        item.year?.toString().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(startIdx, startIdx + PAGE_SIZE);

  const handleView = (item: VinHistoryItem) => {
    onOpenChange(false);
    onViewItem(item);
  };

  const title =
    variant === "analysis"
      ? "Search History (Last 30 Days)"
      : "Build Sheet History (Last 30 Days)";
  const description =
    variant === "analysis"
      ? "Review and manage your recently analyzed VINs and build sheets."
      : "Review and download build sheets generated for your analyzed vehicles.";
  const dateColumn = variant === "analysis" ? "SEARCH DATE" : "PULL DATE";
  const actionLabel = variant === "analysis" ? "View Analysis" : "View Build Sheet";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[1400px] max-h-[90vh] flex flex-col w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by VIN or Model..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">
                  VEHICLE
                </th>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">
                  VIN DETAILS
                </th>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">
                  {dateColumn}
                </th>
                <th className="text-left font-medium px-4 py-3 text-muted-foreground">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr
                    key={item.vin}
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {formatVehicleLabel(item)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs">{item.vin}</span>
                        <StatusBadge reportType={item.reportType} variant={variant} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.searchDate}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary hover:text-primary/90"
                        onClick={() => handleView(item)}
                      >
                        {actionLabel}
                        {variant === "analysis" ? (
                          <ChevronRight className="ml-1 h-4 w-4" />
                        ) : (
                          <FileText className="ml-1 h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {pageItems.length > 0 ? startIdx + 1 : 0}–
            {startIdx + pageItems.length} of {filteredItems.length} results
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
