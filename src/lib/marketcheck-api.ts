/** MarketCheck dealership inventory API listing (matches actual response). */
interface MarketcheckCar {
  id: string;
  vin: string;
  heading?: string;
  price: number;
  miles: number;
  dom?: number;
  dom_active?: number;
  ref_price?: number;
  build?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
  };
  media?: {
    photo_links?: string[];
  };
  p_price?: number;
  msrp?: number;
}

interface MarketcheckResponse {
  num_found?: number;
  stats?: {
    price?: { mean?: number; sum?: number };
    dom?: { mean?: number };
  };
  listings?: MarketcheckCar[];
}

export interface InventoryCar {
  id: string;
  heading: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  mileage: number;
  price: number;
  daysOnLot: number;
  marketPercentage: number;
  status: "healthy" | "attention" | "overpriced";
  image: string;
  media?: {
    photo_links: string[];
  };
}

export interface KPIData {
  totalRetailValue: number;
  totalWholesaleValue: number;
  totalProjectedProfit: number;
  activeInventory: number;
  avgDaysOnLot: number;
  overpricedCount: number;
  attentionRequiredCount: number;
}

const MARKETCHECK_API_BASE = "https://api.marketcheck.com/v2";

export class MarketcheckAPI {
  private apiKey: string;
  private dealerId: string;

  constructor(apiKey: string, dealerId: string) {
    this.apiKey = apiKey;
    this.dealerId = dealerId;
  }

  async fetchInventoryData(
    start: number = 0,
    rows: number = 50,
  ): Promise<{
    kpiData: KPIData;
    inventoryCars: InventoryCar[];
    totalFound: number;
  }> {
    try {
      const response = await fetch(
        `${MARKETCHECK_API_BASE}/dealerships/inventory?api_key=${this.apiKey}&dealer_id=${this.dealerId}&start=${start}&rows=${rows}&stats=price,dom&owned=true`,
      );

      if (!response.ok) {
        throw new Error(
          `Marketcheck API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: MarketcheckResponse = await response.json();
      const listings = data.listings ?? [];

      // Process KPI data
      const kpiData: KPIData = {
        totalRetailValue: data.stats?.price?.sum ?? 0,
        totalWholesaleValue: 0,
        totalProjectedProfit: 0,
        activeInventory: data.num_found ?? listings.length,
        avgDaysOnLot: Math.round(data.stats?.dom?.mean ?? 0),
        overpricedCount: 0,
        attentionRequiredCount: 0,
      };

      // Process inventory cars from MarketCheck API response
      const inventoryCars: InventoryCar[] = listings.map((car) => {
        const build = car.build ?? {};
        const year = build.year ?? 0;
        const make = build.make ?? "";
        const model = build.model ?? "";
        const trim = build.trim;

        const heading =
          car.heading ??
          [year, make, model, trim].filter(Boolean).join(" ");

        const refPrice = car.ref_price ?? car.p_price ?? car.price;
        const marketPercentage =
          refPrice > 0 ? Math.round((car.price / refPrice) * 100) : 100;

        const daysOnLot = car.dom_active ?? car.dom ?? 0;

        let status: "healthy" | "attention" | "overpriced" = "healthy";
        const hasPhotos = (car.media?.photo_links?.length ?? 0) > 0;

        if (daysOnLot > 60 || !hasPhotos) {
          status = "attention";
          kpiData.attentionRequiredCount++;
        } else if (marketPercentage > 103) {
          status = "overpriced";
          kpiData.overpricedCount++;
        }

        return {
          id: car.id,
          heading,
          year,
          make,
          model,
          trim,
          vin: car.vin ?? "",
          mileage: car.miles ?? 0,
          price: car.price ?? 0,
          daysOnLot,
          marketPercentage,
          status,
          image: car.media?.photo_links?.[0] ?? "",
          media: {
            photo_links: car.media?.photo_links ?? [],
          },
        };
      });

      return { kpiData, inventoryCars, totalFound: data.num_found ?? listings.length };
    } catch (error) {
      throw error;
    }
  }

  // Method to merge with internal DMS data for wholesale values and profit calculations
  async enrichWithInternalData(
    inventoryCars: InventoryCar[],
    internalCostData: { vin: string; wholesaleCost: number }[],
  ): Promise<{
    enrichedCars: (InventoryCar & {
      wholesaleCost: number;
      projectedProfit: number;
    })[];
    totalWholesaleValue: number;
    totalProjectedProfit: number;
  }> {
    const costMap = new Map(
      internalCostData.map((item) => [item.vin, item.wholesaleCost]),
    );

    const enrichedCars = inventoryCars.map((car) => {
      const wholesaleCost = costMap.get(car.vin) || 0;
      const projectedProfit = car.price - wholesaleCost;

      return {
        ...car,
        wholesaleCost,
        projectedProfit,
      };
    });

    const totalWholesaleValue = enrichedCars.reduce(
      (sum, car) => sum + car.wholesaleCost,
      0,
    );
    const totalProjectedProfit = enrichedCars.reduce(
      (sum, car) => sum + car.projectedProfit,
      0,
    );

    return {
      enrichedCars,
      totalWholesaleValue,
      totalProjectedProfit,
    };
  }
}

// Empty state fallback for production without demo data
export function getEmptyInventoryData(): {
  kpiData: KPIData;
  inventoryCars: InventoryCar[];
  totalFound: number;
} {
  const kpiData: KPIData = {
    totalRetailValue: 0,
    totalWholesaleValue: 0,
    totalProjectedProfit: 0,
    activeInventory: 0,
    avgDaysOnLot: 0,
    overpricedCount: 0,
    attentionRequiredCount: 0,
  };

  const inventoryCars: InventoryCar[] = [];

  return { kpiData, inventoryCars, totalFound: 0 };
}
