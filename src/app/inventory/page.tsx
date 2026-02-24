import { MarketcheckAPI, getEmptyInventoryData } from "@/lib/marketcheck-api";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InventoryPageContent } from "./InventoryPageContent";

const PAGE_SIZE = 20;

async function fetchInitialInventory() {
  const config = getMarketcheckConfig();
  if (!config) {
    return getEmptyInventoryData();
  }
  try {
    const api = new MarketcheckAPI(config.apiKey, config.dealerId);
    const result = await api.fetchInventoryData(0, PAGE_SIZE);
    return {
      kpiData: result.kpiData,
      inventoryCars: result.inventoryCars,
      totalFound: result.totalFound,
    };
  } catch {
    return getEmptyInventoryData();
  }
}

export default async function InventoryPage() {
  const { kpiData, inventoryCars, totalFound } = await fetchInitialInventory();

  return (
    <ProtectedRoute>
      <InventoryPageContent
        initialKpiData={kpiData}
        initialInventoryCars={inventoryCars}
        initialTotalFound={totalFound}
      />
    </ProtectedRoute>
  );
}
