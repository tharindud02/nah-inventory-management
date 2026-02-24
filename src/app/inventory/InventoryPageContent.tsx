"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Package,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { InventoryCar, KPIData } from "@/lib/marketcheck-api";
import { fetchInventoryPage } from "./actions";

const PAGE_SIZE = 20;

interface InventoryPageContentProps {
  initialKpiData: KPIData;
  initialInventoryCars: InventoryCar[];
  initialTotalFound: number;
}

export function InventoryPageContent({
  initialKpiData,
  initialInventoryCars,
  initialTotalFound,
}: InventoryPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [kpiData, setKpiData] = useState<KPIData>(initialKpiData);
  const [inventoryCars, setInventoryCars] = useState<InventoryCar[]>(initialInventoryCars);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialInventoryCars.length < initialTotalFound);
  const [totalFound, setTotalFound] = useState(initialTotalFound);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const result = await fetchInventoryPage(inventoryCars.length, PAGE_SIZE);
    setLoadingMore(false);
    if (!result.success) {
      setHasMore(false);
      return;
    }
    const newLength = inventoryCars.length + result.inventoryCars.length;
    setInventoryCars((prev) => [...prev, ...result.inventoryCars]);
    setTotalFound(result.totalFound);
    setHasMore(newLength < result.totalFound);
  }, [loadingMore, hasMore, inventoryCars.length]);

  const lastCarElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) loadMore();
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, loadMore],
  );

  const handleCarClick = (car: InventoryCar) => {
    const rawData = {
      id: car.id,
      vin: car.vin,
      year: car.year,
      make: car.make,
      model: car.model,
      trim: car.trim ?? "Base",
      price: car.price,
      mileage: car.mileage,
      daysOnLot: car.daysOnLot,
      media: {
        photo_links: car.media?.photo_links ?? [],
        photo_links_cached: [],
      },
    };
    sessionStorage.setItem("vinData", JSON.stringify(rawData));
    sessionStorage.setItem("vin", car.vin);
    sessionStorage.setItem(
      "carMedia",
      JSON.stringify({ photo_links: car.media?.photo_links ?? [] }),
    );
    sessionStorage.setItem("carImage", car.image ?? "");
    router.push(`/inventory/${encodeURIComponent(car.id)}`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "HEALTHY";
      case "attention":
        return "ATTENTION REQUIRED";
      case "overpriced":
        return "OVERPRICED";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <Layout
      title="Inventory Management"
      showSearch={true}
      searchPlaceholder="Search VIN, Stock#, or Model..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showLastUpdated={true}
    >
      <div className="mb-6">
        <Breadcrumb items={[{ label: "Inventory", isCurrent: true }]} />
      </div>

      {inventoryCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Car className="w-10 h-10 text-slate-400" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No inventory yet</h2>
          <p className="text-slate-600 text-center max-w-md mb-8">
            Your inventory is empty. Connect your inventory source or add vehicles to see them
            here.
          </p>
          <Button variant="outline" size="lg" className="rounded-lg">
            Add vehicle
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">TOTAL RETAIL VALUE</p>
                    <p className="text-xl font-bold">
                      ${kpiData.totalRetailValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      ↑1.2%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">TOTAL WHOLESALE VALUE</p>
                    <p className="text-xl font-bold">
                      ${kpiData.totalWholesaleValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      ↓0.5%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">TOTAL PROJECTED GROSS PROFIT</p>
                    <p className="text-xl font-bold">
                      ${(kpiData.totalProjectedProfit / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-red-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      ↓3%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">ACTIVE INVENTORY</p>
                    <p className="text-xl font-bold">{kpiData.activeInventory} units</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +4
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">AVG. DAYS ON LOT</p>
                    <p className="text-xl font-bold">{kpiData.avgDaysOnLot} days</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Alert</h3>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Overpriced ({kpiData.overpricedCount})
              </Button>
              <Button
                variant="outline"
                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Attention Required ({kpiData.attentionRequiredCount})
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-4">
                <select className="border rounded px-3 py-2 text-sm bg-white">
                  <option>Price</option>
                  <option>Low to High</option>
                  <option>High to Low</option>
                </select>
                <select className="border rounded px-3 py-2 text-sm bg-white">
                  <option>Days on Lot</option>
                  <option>0-30 days</option>
                  <option>31-60 days</option>
                  <option>60+ days</option>
                </select>
                <select className="border rounded px-3 py-2 text-sm bg-white">
                  <option>Make/Model</option>
                  <option>All Makes</option>
                  <option>BMW</option>
                  <option>Mercedes-Benz</option>
                  <option>Porsche</option>
                  <option>Audi</option>
                  <option>Lexus</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {totalFound || kpiData.activeInventory} TOTAL UNITS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventoryCars.map((item, index) => (
              <Card
                key={`${item.vin}-${index}`}
                ref={index === inventoryCars.length - 1 ? lastCarElementRef : undefined}
                className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 pt-0 pb-4 cursor-pointer"
                onClick={() => handleCarClick(item)}
              >
                <div className="w-full h-48 overflow-hidden relative bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.heading}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${
                      item.image ? "hidden" : ""
                    }`}
                  >
                    <Car className="w-12 h-12 text-gray-400" />
                  </div>

                  {item.status !== "healthy" && (
                    <div
                      className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold text-white ${
                        item.status === "attention"
                          ? "bg-red-500"
                          : item.status === "overpriced"
                            ? "bg-amber-500"
                            : "bg-gray-500"
                      }`}
                    >
                      {getStatusText(item.status)}
                    </div>
                  )}
                </div>

                <CardContent className="px-4 py-0">
                  <div className="flex items-center justify-between mb-0">
                    <h3 className="text-lg font-bold truncate flex-1 pr-2">
                      {item.heading || `${item.year} ${item.make} ${item.model}`}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>

                  {item.trim && (
                    <p className="text-sm text-gray-500 mb-2">{item.trim}</p>
                  )}

                  <div className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg mb-2">
                    <span className="text-xs font-mono text-gray-700">{item.vin}</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {(item.mileage ?? 0).toLocaleString()} mi
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">RETAIL PRICE</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">
                        ${(item.price ?? 0).toLocaleString()}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          (item.marketPercentage ?? 0) > 100 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {item.marketPercentage ?? 0}% Mkt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{item.daysOnLot ?? 0} Days on Lot</span>
                    </div>
                    {item.status === "healthy" && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loadingMore && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-600">Loading more vehicles...</p>
            </div>
          )}

          {!hasMore && inventoryCars.length > 0 && !loadingMore && (
            <div className="flex justify-center py-8">
              <p className="text-sm text-gray-500">
                Showing all {inventoryCars.length} vehicles
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
