interface MarketcheckCar {
  id: string;
  vin: string;
  price: number;
  miles: number;
  dom: number;
  build: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  media: {
    photo_links: string[];
  };
  p_price?: number; // Predicted market price
  msrp?: number;
}

interface MarketcheckResponse {
  num_found: number;
  stats: {
    price: {
      mean: number;
      sum: number;
    };
    dom: {
      mean: number;
    };
  };
  listings: MarketcheckCar[];
}

export interface InventoryCar {
  id: string;
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

const MARKETCHECK_API_BASE = "https://marketcheck-prod.apigee.net/v2";

export class MarketcheckAPI {
  private apiKey: string;
  private dealerId: string;

  constructor(apiKey: string, dealerId: string) {
    this.apiKey = apiKey;
    this.dealerId = dealerId;
  }

  async fetchInventoryData(rows: number = 50): Promise<{
    kpiData: KPIData;
    inventoryCars: InventoryCar[];
  }> {
    try {
      const response = await fetch(
        `${MARKETCHECK_API_BASE}/search/car/active?api_key=${this.apiKey}&dealer_id=${this.dealerId}&rows=${rows}&stats=price,dom`,
      );

      if (!response.ok) {
        throw new Error(
          `Marketcheck API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: MarketcheckResponse = await response.json();

      // Process KPI data
      const kpiData: KPIData = {
        totalRetailValue: data.stats.price.sum || 0,
        totalWholesaleValue: 0, // Marketcheck doesn't provide wholesale data
        totalProjectedProfit: 0, // Need to calculate with internal data
        activeInventory: data.num_found,
        avgDaysOnLot: Math.round(data.stats.dom.mean || 0),
        overpricedCount: 0,
        attentionRequiredCount: 0,
      };

      // Process inventory cars
      const inventoryCars: InventoryCar[] = data.listings.map((car) => {
        // Calculate market percentage
        const predictedPrice = car.p_price || car.price;
        const marketPercentage = Math.round((car.price / predictedPrice) * 100);

        // Determine status based on logic
        let status: "healthy" | "attention" | "overpriced" = "healthy";

        if (car.dom > 60 || !car.media.photo_links.length) {
          status = "attention";
          kpiData.attentionRequiredCount++;
        } else if (marketPercentage > 103) {
          status = "overpriced";
          kpiData.overpricedCount++;
        }

        return {
          id: car.id,
          year: car.build.year,
          make: car.build.make,
          model: car.build.model,
          trim: car.build.trim,
          vin: car.vin,
          mileage: car.miles,
          price: car.price,
          daysOnLot: car.dom,
          marketPercentage,
          status,
          image: car.media.photo_links[0] || "/api/placeholder/300/200",
        };
      });

      return { kpiData, inventoryCars };
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

// Demo mode fallback
export function getDemoInventoryData(): {
  kpiData: KPIData;
  inventoryCars: InventoryCar[];
} {
  const kpiData: KPIData = {
    totalRetailValue: 4200000,
    totalWholesaleValue: 3100000,
    totalProjectedProfit: 210000,
    activeInventory: 142,
    avgDaysOnLot: 42,
    overpricedCount: 12,
    attentionRequiredCount: 8,
  };

  const inventoryCars: InventoryCar[] = [
    {
      id: "1",
      year: 2022,
      make: "BMW",
      model: "M4 Competition xDrive Coupe",
      vin: "WBS83AYBXNCH38102",
      mileage: 12450,
      price: 78900,
      marketPercentage: 104,
      daysOnLot: 74,
      status: "attention",
      image: "/api/placeholder/300/200",
    },
    {
      id: "2",
      year: 2023,
      make: "Mercedes-Benz",
      model: "C 300 Sedan",
      vin: "W1KDB3HB5PR123456",
      mileage: 8900,
      price: 52500,
      marketPercentage: 98,
      daysOnLot: 21,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: "3",
      year: 2024,
      make: "Porsche",
      model: "911 Carrera S",
      vin: "WP0AB2A99RS123456",
      mileage: 3200,
      price: 145000,
      marketPercentage: 112,
      daysOnLot: 45,
      status: "overpriced",
      image: "/api/placeholder/300/200",
    },
    {
      id: "4",
      year: 2023,
      make: "Audi",
      model: "RS5 Sportback",
      vin: "WAUZZZF7XPA123456",
      mileage: 15600,
      price: 87500,
      marketPercentage: 101,
      daysOnLot: 18,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: "5",
      year: 2022,
      make: "Lexus",
      model: "LC 500",
      vin: "JTHGB5C21NA123456",
      mileage: 9800,
      price: 98500,
      marketPercentage: 96,
      daysOnLot: 92,
      status: "attention",
      image: "/api/placeholder/300/200",
    },
    {
      id: "6",
      year: 2023,
      make: "BMW",
      model: "M3 Competition",
      vin: "WBS83CR30PCH12345",
      mileage: 6700,
      price: 82500,
      marketPercentage: 108,
      daysOnLot: 12,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
  ];

  return { kpiData, inventoryCars };
}
