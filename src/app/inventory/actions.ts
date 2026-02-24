"use server";

import { z } from "zod";
import { MarketcheckAPI } from "@/lib/marketcheck-api";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";
import {
  getEmptyInventoryData,
  type InventoryCar,
  type KPIData,
} from "@/lib/marketcheck-api";

const fetchSchema = z.object({
  start: z.number().int().min(0),
  rows: z.number().int().min(1).max(100),
});

export type FetchInventoryResult =
  | { success: true; kpiData: KPIData; inventoryCars: InventoryCar[]; totalFound: number }
  | { success: false; error: string };

export async function fetchInventoryPage(
  start: number,
  rows: number,
): Promise<FetchInventoryResult> {
  const parsed = fetchSchema.safeParse({ start, rows });
  if (!parsed.success) {
    return { success: false, error: "Invalid pagination params" };
  }

  const config = getMarketcheckConfig();
  if (!config) {
    const empty = getEmptyInventoryData();
    return {
      success: true,
      kpiData: empty.kpiData,
      inventoryCars: empty.inventoryCars,
      totalFound: empty.totalFound,
    };
  }

  try {
    const api = new MarketcheckAPI(config.apiKey, config.dealerId);
    const result = await api.fetchInventoryData(parsed.data.start, parsed.data.rows);
    return {
      success: true,
      kpiData: result.kpiData,
      inventoryCars: result.inventoryCars,
      totalFound: result.totalFound,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch inventory";
    return { success: false, error: message };
  }
}
