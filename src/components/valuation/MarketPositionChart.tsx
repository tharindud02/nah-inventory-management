"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataPoint {
  mileage: number;
  price: number;
  isSubject?: boolean;
}

export interface MarketPositionChartProps {
  data: DataPoint[];
  subjectPoint?: DataPoint;
  className?: string;
}

export function MarketPositionChart({
  data,
  subjectPoint,
  className,
}: MarketPositionChartProps) {
  const allPoints = subjectPoint
    ? [...data, { ...subjectPoint, isSubject: true }]
    : data;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Market Position
        </h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Sold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-amber-500" />
            Subject
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="mileage"
              name="Mileage"
              unit=" mi"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey="price"
              name="Price"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "mileage"
                  ? `${value.toLocaleString()} mi`
                  : `$${value.toLocaleString()}`
              }
            />
            <Scatter
              data={allPoints.filter((p) => !p.isSubject)}
              fill="#3b82f6"
              shape="circle"
            />
            {subjectPoint && (
              <Scatter
                data={[{ ...subjectPoint, isSubject: true }]}
                fill="#f59e0b"
                shape="diamond"
                legendType="none"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
          aria-label="Chart options"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
