"use client";

import { cn } from "@/lib/utils";

export interface ComparableRow {
  date: string;
  miles: number;
  price: string;
}

export interface RecentSoldComparablesTableProps {
  rows: ComparableRow[];
  onExport?: () => void;
  className?: string;
}

export function RecentSoldComparablesTable({
  rows,
  onExport,
  className,
}: RecentSoldComparablesTableProps) {
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
        </h3>
        <button
          type="button"
          onClick={onExport}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
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
            {rows.map((row, i) => (
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
      </div>
    </div>
  );
}
