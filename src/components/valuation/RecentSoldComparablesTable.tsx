"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ComparableRow {
  date: string;
  miles: number;
  price: string;
  lastSeenDate?: string;
  baseExtColor?: string;
  baseIntColor?: string;
  source?: string;
}

export interface RecentSoldComparablesTableProps {
  rows: ComparableRow[];
  numFound?: number;
  onExport?: () => void;
  className?: string;
}

const ROWS_PER_PAGE = 10;

export function RecentSoldComparablesTable({
  rows,
  numFound = 0,
  onExport,
  className,
}: RecentSoldComparablesTableProps) {
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setDisplayCount((prev) => Math.min(prev + ROWS_PER_PAGE, rows.length));
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [rows.length]);

  const displayedRows = rows.slice(0, displayCount);
  const hasMore = displayCount < rows.length;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Recent Sold Comparables
          {numFound > 0 && (
            <span className="ml-2 font-normal normal-case text-slate-500">
              ({numFound.toLocaleString()})
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={onExport}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Export
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: "240px" }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-left font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="pb-3 text-left font-semibold uppercase tracking-wide text-slate-500">
                Miles
              </th>
              <th className="pb-3 text-right font-semibold uppercase tracking-wide text-slate-500">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="py-3 text-slate-700">{row.date}</td>
                <td className="py-3 text-slate-700">
                  {row.miles.toLocaleString()}
                </td>
                <td className="py-3 text-right font-semibold text-slate-900">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasMore && (
          <div className="flex justify-center py-4 text-sm text-slate-500">
            Scroll for more ({displayCount} of {rows.length})
          </div>
        )}
      </div>
    </div>
  );
}
