"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { LinearGauge } from "@/components/ui/LinearGauge";
import { BuildSheetModal } from "@/components/ui/BuildSheetModal";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { VehicleSpecs } from "@/types/vehicle-specs";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Users,
  Package,
  LogOut,
  Activity,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface VINData {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  body?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  odometer?: number;
  exterior_color?: string;
  interior_color?: string;
  options?: string[];
  market_data?: {
    estimated_market_value?: number;
    retail_turn_rate?: number;
    avg_days_to_sell?: number;
    market_days_supply?: number;
    active_local?: number;
    consumer_interest?: number;
    sold_90d?: number;
  };
}

export default function VINDeepDivePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [vinData, setVinData] = useState<VINData | null>(null);
  const [vin, setVin] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [buildSheetModalOpen, setBuildSheetModalOpen] = useState(false);
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecs | null>(null);
  const marketDataFetchedRef = useRef(false);
  const [aamvaReport, setAamvaReport] = useState<any>(null);
  const [marketComps, setMarketComps] = useState<any[]>([]);
  const [soldCompsScrollState, setSoldCompsScrollState] = useState<
    "top" | "middle" | "bottom"
  >("top");
  const [activeListingsScrollState, setActiveListingsScrollState] = useState<
    "top" | "middle" | "bottom"
  >("top");
  const [soldComps, setSoldComps] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [mmr, setMmr] = useState<any>(null);
  const [demandScore, setDemandScore] = useState<any>(null);

  const fetchAamvaReport = useCallback(async (vinParam: string) => {
    try {
      const response = await fetch("/api/vindata/aamva-access-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: vinParam }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && (errorData.error || errorData.details)) ||
            `Failed to fetch AAMVA report: ${response.status}`,
        );
      }

      const result = await response.json();
      if (result?.success && result.data) {
        setAamvaReport(result.data);
        sessionStorage.setItem("aamvaReport", JSON.stringify(result.data));
        return result.data;
      }

      throw new Error("AAMVA report response missing data");
    } catch (error) {
      return null;
    }
  }, []);

  const fetchMmr = useCallback(
    async (vinParam: string, miles?: number, zip?: string) => {
      try {
        const response = await fetch("/api/vindata/mmr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinParam, miles, zip }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.error || errorData.details)) ||
              `Failed to fetch MMR: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result?.success && result.data) {
          setMmr(result.data);
          sessionStorage.setItem("mmr", JSON.stringify(result.data));
          return result.data;
        }

        throw new Error("MMR response missing data");
      } catch (error) {
        return null;
      }
    },
    [],
  );

  const fetchDemandScore = useCallback(
    async (vinParam: string, year?: number, make?: string, model?: string) => {
      try {
        const response = await fetch("/api/vindata/demand-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinParam, year, make, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.error || errorData.details)) ||
              `Failed to fetch demand score: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result?.success && result.data) {
          setDemandScore(result.data);
          sessionStorage.setItem("demandScore", JSON.stringify(result.data));
          return result.data;
        }

        throw new Error("Demand score response missing data");
      } catch (error) {
        return null;
      }
    },
    [],
  );

  const fetchValuation = useCallback(
    async (vinParam: string, miles?: number, zip?: string) => {
      try {
        const response = await fetch("/api/vindata/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinParam, miles, zip }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.error || errorData.details)) ||
              `Failed to fetch valuation: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result?.success && result.data) {
          setValuation(result.data);
          sessionStorage.setItem("valuation", JSON.stringify(result.data));
          return result.data;
        }

        throw new Error("Valuation response missing data");
      } catch (error) {
        return null;
      }
    },
    [],
  );

  // Scroll detection handlers
  const handleSoldCompsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      const threshold = 50; // 50px from top/bottom to trigger state change

      if (scrollTop <= threshold) {
        setSoldCompsScrollState("top");
      } else if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setSoldCompsScrollState("bottom");
      } else {
        setSoldCompsScrollState("middle");
      }
    },
    [],
  );

  const handleActiveListingsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      const threshold = 50; // 50px from top/bottom to trigger state change

      if (scrollTop <= threshold) {
        setActiveListingsScrollState("top");
      } else if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setActiveListingsScrollState("bottom");
      } else {
        setActiveListingsScrollState("middle");
      }
    },
    [],
  );

  // Helper function to get scroll indicator text
  const getScrollIndicator = (state: "top" | "middle" | "bottom") => {
    switch (state) {
      case "top":
        return "↓ Scroll for more";
      case "middle":
        return "↕ Scroll";
      case "bottom":
        return "↑ Scroll to top";
      default:
        return "↓ Scroll for more";
    }
  };

  const fetchMarketComps = useCallback(
    async (vinParam: string, year?: number, make?: string, model?: string) => {
      try {
        const response = await fetch("/api/vindata/market-comps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinParam, year, make, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.error || errorData.details)) ||
              `Failed to fetch market comps: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result?.success && result.data?.listings) {
          setMarketComps(result.data.listings);
          sessionStorage.setItem(
            "marketComps",
            JSON.stringify(result.data.listings),
          );
          return result.data.listings;
        }

        throw new Error("Market comps response missing data");
      } catch (error) {
        return [];
      }
    },
    [],
  );

  const fetchSoldComps = useCallback(
    async (vinParam: string, year?: number, make?: string, model?: string) => {
      try {
        const response = await fetch("/api/vindata/sold-comps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinParam, year, make, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.error || errorData.details)) ||
              `Failed to fetch sold comps: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result?.success && result.data?.listings) {
          setSoldComps(result.data.listings);
          sessionStorage.setItem(
            "soldComps",
            JSON.stringify(result.data.listings),
          );
          return result.data.listings;
        }

        throw new Error("Sold comps response missing data");
      } catch (error) {
        return [];
      }
    },
    [],
  );

  const fetchAndStoreVehicleSpecs = useCallback(async (vinParam: string) => {
    try {
      const response = await fetch("/api/cars/vehicle-specs/neovin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: vinParam }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && (errorData.error || errorData.details)) ||
            `Failed to fetch vehicle specs: ${response.status}`,
        );
      }

      const result = await response.json();
      if (result?.success && result.data) {
        setVehicleSpecs(result.data);
        sessionStorage.setItem("vehicleSpecs", JSON.stringify(result.data));
        return result.data as VehicleSpecs;
      }

      throw new Error("Vehicle specs response missing data");
    } catch (error) {
      toast.warning(
        error instanceof Error
          ? error.message
          : "Unable to refresh build sheet data for this VIN.",
      );
      return null;
    }
  }, []);

  useEffect(() => {
    // Retrieve VIN data from sessionStorage
    const storedVinData = sessionStorage.getItem("vinData");
    const storedVin = sessionStorage.getItem("vin");
    const storedVehicleSpecs = sessionStorage.getItem("vehicleSpecs");

    if (storedVinData && storedVin) {
      try {
        const rawData = JSON.parse(storedVinData);
        // Transform MarketCheck API data to expected format
        const transformedData = transformVinData(rawData, storedVin);
        setVinData(transformedData);
        setVin(storedVin);

        if (storedVehicleSpecs) {
          try {
            setVehicleSpecs(JSON.parse(storedVehicleSpecs));
          } catch (specError) {
            setVehicleSpecs(null);
            if (storedVin) {
              fetchAndStoreVehicleSpecs(storedVin);
            }
          }
        } else if (storedVin) {
          fetchAndStoreVehicleSpecs(storedVin);
        }

        // Fetch additional market data only if not already fetched
        if (!marketDataFetchedRef.current) {
          fetchMarketData(storedVin, transformedData);
          marketDataFetchedRef.current = true;
        }
      } catch (error) {
        toast.error("Error loading vehicle data. Please try again.");
      }
    } else {
      toast.info("No vehicle data found. Please analyze a VIN first.");
      if (storedVin) {
        fetchAndStoreVehicleSpecs(storedVin);
      }
    }

    setIsLoading(false);
  }, [fetchAndStoreVehicleSpecs]);

  useEffect(() => {
    if (
      buildSheetModalOpen &&
      vin &&
      (!vehicleSpecs || !vehicleSpecs.installedOptionsDetails?.length)
    ) {
      fetchAndStoreVehicleSpecs(vin);
    }
  }, [buildSheetModalOpen, vin, vehicleSpecs, fetchAndStoreVehicleSpecs]);

  useEffect(() => {
    const storedAamvaReport = sessionStorage.getItem("aamvaReport");
    const storedMarketComps = sessionStorage.getItem("marketComps");
    const storedSoldComps = sessionStorage.getItem("soldComps");
    const storedMmr = sessionStorage.getItem("mmr");
    const storedDemandScore = sessionStorage.getItem("demandScore");
    const storedValuation = sessionStorage.getItem("valuation");
    if (storedMmr) {
      try {
        setMmr(JSON.parse(storedMmr));
      } catch (e) {}
    }
    if (storedDemandScore) {
      try {
        setDemandScore(JSON.parse(storedDemandScore));
      } catch (e) {}
    }
    if (storedMarketComps) {
      try {
        setMarketComps(JSON.parse(storedMarketComps));
      } catch (e) {}
    }
    if (storedSoldComps) {
      try {
        setSoldComps(JSON.parse(storedSoldComps));
      } catch (e) {}
    }
    if (storedValuation) {
      try {
        setValuation(JSON.parse(storedValuation));
      } catch (e) {}
    }
    if (vin) {
      fetchAamvaReport(vin);
      fetchValuation(vin, vinData?.odometer);
      fetchMmr(vin, vinData?.odometer);
      fetchDemandScore(vin, vinData?.year, vinData?.make, vinData?.model);
      fetchMarketComps(vin, vinData?.year, vinData?.make, vinData?.model);
      fetchSoldComps(vin, vinData?.year, vinData?.make, vinData?.model);
    }
  }, [
    vin,
    vinData,
    fetchAamvaReport,
    fetchValuation,
    fetchMmr,
    fetchDemandScore,
    fetchMarketComps,
    fetchSoldComps,
  ]);

  // Fetch market data from various MarketCheck APIs
  const fetchMarketData = async (vin: string, currentData: VINData) => {
    // Prevent multiple simultaneous calls
    if (marketDataFetchedRef.current) return;

    let loadingToastId: string | number | undefined;
    try {
      // Show loading toast with ID so we can dismiss it properly
      loadingToastId = toast.loading(
        "Analyzing vehicle and fetching market data...",
      );

      const requests = [
        // Market Days Supply
        fetch("/api/vindata/market-days-supply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin }),
        }),

        // Estimated Market Value
        fetch("/api/vindata/estimated-market-value", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vin,
            miles: currentData.odometer,
            zip: "90210",
          }),
        }),

        // Inventory Stats (avg days to sell, sold 90d, active local)
        fetch("/api/vindata/inventory-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin }),
        }),

        // Consumer Interest
        fetch("/api/vindata/consumer-interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: currentData.year,
            make: currentData.make,
            model: currentData.model,
          }),
        }),
      ];

      const responses = await Promise.allSettled(requests);

      const marketDataUpdates: Partial<VINData["market_data"]> = {};

      // Process Market Days Supply
      if (responses[0].status === "fulfilled") {
        const result = await responses[0].value.json();
        if (result.success && result.data) {
          // Extract the actual market days supply value - check for mds field first
          const mdsData =
            result.data.mds || result.data.market_days_supply || result.data;
          if (typeof mdsData === "object" && mdsData !== null) {
            marketDataUpdates.market_days_supply =
              mdsData.mean || mdsData.median || mdsData.value || null;
          } else if (typeof mdsData === "number") {
            marketDataUpdates.market_days_supply = mdsData;
          }
        }
      }

      // Process Estimated Market Value
      if (responses[1].status === "fulfilled") {
        const result = await responses[1].value.json();
        if (result.success && result.data) {
          // Extract the marketcheck_price value
          const priceData =
            result.data.marketcheck_price ||
            result.data.predicted_price ||
            result.data.price;
          if (typeof priceData === "number") {
            marketDataUpdates.estimated_market_value = priceData;
          } else if (typeof priceData === "object" && priceData !== null) {
            marketDataUpdates.estimated_market_value =
              priceData.mean || priceData.median || priceData.value || null;
          }
        }
      }

      // Process Inventory Stats
      if (responses[2].status === "fulfilled") {
        const result = await responses[2].value.json();
        if (result.success && result.data) {
          const stats = result.data;

          // Extract avg days to sell from stats object
          if (stats.avg_days_to_sell) {
            if (
              typeof stats.avg_days_to_sell === "object" &&
              stats.avg_days_to_sell !== null
            ) {
              marketDataUpdates.avg_days_to_sell =
                stats.avg_days_to_sell.mean ||
                stats.avg_days_to_sell.median ||
                null;
            } else if (typeof stats.avg_days_to_sell === "number") {
              marketDataUpdates.avg_days_to_sell = stats.avg_days_to_sell;
            }
          }

          // Sold count and active local should be simple numbers
          marketDataUpdates.sold_90d =
            typeof stats.sold_90d === "number" ? stats.sold_90d : null;
          marketDataUpdates.active_local =
            typeof stats.active_local === "number" ? stats.active_local : null;
        }
      }

      // Process Consumer Interest
      if (responses[3].status === "fulfilled") {
        const result = await responses[3].value.json();
        if (result.success && result.data) {
          // Consumer interest is derived from popular cars data - look for sales volume or ranking
          const interestData =
            result.data.sales_volume ||
            result.data.volume ||
            result.data.rank ||
            result.data.popularity_score;
          if (typeof interestData === "object" && interestData !== null) {
            marketDataUpdates.consumer_interest =
              interestData.mean ||
              interestData.median ||
              interestData.value ||
              null;
          } else if (typeof interestData === "number") {
            marketDataUpdates.consumer_interest = interestData;
          } else if (Array.isArray(result.data) && result.data.length > 0) {
            // If data is an array of popular cars, use the first item's ranking or volume
            const firstItem = result.data[0];
            marketDataUpdates.consumer_interest =
              firstItem.sales_volume ||
              firstItem.rank ||
              firstItem.volume ||
              null;
          }
        }
      }

      // Derive Retail Turn Rate from Market Days Supply
      // Retail Turn Rate = 1 / Market Days Supply * 100 (approximate monthly turn rate)
      if (
        marketDataUpdates.market_days_supply &&
        typeof marketDataUpdates.market_days_supply === "number"
      ) {
        // Convert to monthly turn rate (30 days)
        marketDataUpdates.retail_turn_rate =
          Math.round((30 / marketDataUpdates.market_days_supply) * 100) / 100;
      }

      // Update VIN data with market information
      setVinData((prev) =>
        prev
          ? {
              ...prev,
              market_data: {
                ...prev.market_data,
                ...marketDataUpdates,
              },
            }
          : null,
      );

      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.success("VIN analysis complete!");
    } catch (error) {
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Some market data could not be loaded");
    }
  };

  // Helper function to safely format market data values
  const formatMarketValue = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return `$${value.toLocaleString()}`;
    }
    return "N/A";
  };

  const formatPercentage = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return `${value}%`;
    }
    return "N/A";
  };

  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return "N/A";
  };

  // Transform MarketCheck API response to frontend format
  const transformVinData = (rawData: any, vin: string): VINData => {
    try {
      const summary = rawData.summary || {};
      const trimLevels = rawData.trimLevels || {};
      const defaultTrim = trimLevels.Default || {};
      const general = defaultTrim.General || {};
      const engine = defaultTrim.Engine || {};
      const mechanical = defaultTrim.Mechanical || {};
      const exterior = defaultTrim.Exterior || {};
      const interior = defaultTrim.Interior || {};

      // Get odometer from title information
      const odometerInfo = rawData.odometerInformation?.[0];
      const odometer = odometerInfo?.reportedOdometer || null;

      return {
        vin: vin,
        make: summary.make || general.make || "N/A",
        model: summary.model || general.model || "N/A",
        year: summary.year || general["Model Year"] || null,
        trim: general.Trim || "Base",
        body: general["Body Class"] || "N/A",
        engine:
          `${engine["Engine Number of Cylinders"]}-Cylinder ${engine["Fuel Type - Primary"] || ""}`.trim() ||
          "N/A",
        transmission:
          `${mechanical["Transmission Speeds"]}-Speed ${mechanical["Transmission Style"]}` ||
          "N/A",
        drivetrain: mechanical["Drive Type"] || "N/A",
        fuel_type: engine["Fuel Type - Primary"] || "N/A",
        odometer: odometer,
        exterior_color: "N/A", // Not provided by MarketCheck API
        interior_color: "N/A", // Not provided by MarketCheck API
        options: [], // Could be extracted from trim levels if needed
        market_data: {
          // MarketCheck API doesn't provide market data, so these remain undefined
          estimated_market_value: undefined,
          retail_turn_rate: undefined,
          avg_days_to_sell: undefined,
          market_days_supply: undefined,
          active_local: undefined,
          consumer_interest: undefined,
        },
      };
    } catch (error) {
      // Return minimal data if transformation fails
      return {
        vin: vin,
        make: "N/A",
        model: "N/A",
        year: undefined,
        market_data: {},
      };
    }
  };

  const valuationSummary = {
    retail: {
      marketCheckAvg:
        valuation?.estimated_market_value ??
        vinData?.market_data?.estimated_market_value ??
        null,
      demandLabel: demandScore?.demand_label
        ? typeof demandScore.demand_label === "string"
          ? demandScore.demand_label
          : "No Demand Data"
        : "No Demand Data",
      demandTone: demandScore?.demand_tone
        ? typeof demandScore.demand_tone === "string"
          ? demandScore.demand_tone
          : "bg-gray-100 text-gray-800"
        : "bg-gray-100 text-gray-800",
      priceRange: {
        min:
          valuation?.estimated_market_value ||
          vinData?.market_data?.estimated_market_value
            ? (valuation?.estimated_market_value ??
                vinData?.market_data?.estimated_market_value) * 0.95
            : null,
        max:
          valuation?.estimated_market_value ||
          vinData?.market_data?.estimated_market_value
            ? (valuation?.estimated_market_value ??
                vinData?.market_data?.estimated_market_value) * 1.05
            : null,
      },
      estGrossMargin:
        valuation?.estimated_market_value ||
        vinData?.market_data?.estimated_market_value
          ? Math.round(
              (valuation?.estimated_market_value ??
                vinData?.market_data?.estimated_market_value) * 0.06,
            )
          : null,
    },
    wholesale: {
      baseMMR: mmr?.base_mmr
        ? typeof mmr.base_mmr === "number"
          ? mmr.base_mmr
          : parseFloat(mmr.base_mmr)
        : null,
      adjustedMMR: mmr?.adjusted_mmr
        ? typeof mmr.adjusted_mmr === "number"
          ? mmr.adjusted_mmr
          : parseFloat(mmr.adjusted_mmr)
        : null,
      avgOdo: mmr?.avg_odo ?? null,
      avgCondition: mmr?.avg_condition ?? null,
      adjustments: mmr?.adjustments?.length ? mmr.adjustments : [],
    },
  };

  const activeListings = marketComps?.length
    ? marketComps.map((listing: any) => ({
        year: listing.year || vinData?.year || 2020,
        make: listing.make || vinData?.make || "FORD",
        model: listing.model || vinData?.model || "F-150",
        trim: listing.trim || "Limited",
        miles: listing.miles || 0,
        price: listing.price || 0,
        vdpUrl: listing.vdp_url || "#",
        dom: listing.days_on_market || 0,
        seller: listing.seller_name || "Dealer",
        certified: listing.certified || false,
        gradient: "from-blue-400 to-blue-600",
      }))
    : aamvaReport?.titleInformation?.length
      ? aamvaReport.titleInformation.map((t: any) => ({
          year: aamvaReport.summary?.year ?? 2020,
          make: aamvaReport.summary?.make ?? "FORD",
          model: aamvaReport.summary?.model ?? "F-150",
          trim: "Limited",
          miles:
            typeof t.reportedOdometer === "number"
              ? t.reportedOdometer
              : parseInt(t.reportedOdometer) || 0,
          price: vinData?.market_data?.estimated_market_value ?? 141200,
          vdpUrl: "#",
          dom: 12,
          seller: "Local Dealer",
          certified: false,
          gradient: "from-gray-400 to-gray-600",
        }))
      : [];

  const scatterData = {
    target: {
      miles: vinData?.odometer ?? 0,
      price: vinData?.market_data?.estimated_market_value ?? 0,
    },
    market: soldComps?.length
      ? soldComps.slice(0, 20).map((c: any) => ({
          miles: c.miles ?? 0,
          price: c.price ?? 0,
        }))
      : activeListings?.length
        ? activeListings.slice(0, 20).map((l: any) => ({
            miles: l.miles ?? 0,
            price: l.price ?? 0,
          }))
        : [],
  };

  const priceValues = [
    scatterData.target.price,
    ...(scatterData.market?.map((point: any) => point.price) ?? []),
  ];
  const mileageValues = [
    scatterData.target.miles,
    ...(scatterData.market?.map((point: any) => point.miles) ?? []),
  ];
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const minMiles = Math.min(...mileageValues);
  const maxMiles = Math.max(...mileageValues);

  const getScatterPosition = (miles: number, price: number) => {
    const xPercent =
      maxMiles === minMiles
        ? 50
        : ((miles - minMiles) / (maxMiles - minMiles)) * 100;
    const yPercent =
      maxPrice === minPrice
        ? 50
        : ((price - minPrice) / (maxPrice - minPrice)) * 100;
    return {
      left: `${xPercent}%`,
      bottom: `${yPercent}%`,
    };
  };

  // Prepare data for recharts ScatterChart
  const scatterChartData = [
    ...scatterData.market.map((point) => ({
      ...point,
      type: "Market",
    })),
    {
      ...scatterData.target,
      type: "Target",
    },
  ];

  const formatCurrency = (
    value: number | undefined | null,
    options: Intl.NumberFormatOptions = {},
  ) => {
    if (typeof value !== "number" || isNaN(value)) return "$0";
    return `$${value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
      ...options,
    })}`;
  };

  const formatCompactCurrency = (value: number | undefined | null) => {
    if (typeof value !== "number" || isNaN(value)) return "$0K";
    return `$${(value / 1000).toFixed(1)}K`;
  };

  const calculateRangePercent = () => {
    const { min, max } = valuationSummary.retail.priceRange;
    const value = valuationSummary.retail.marketCheckAvg;
    if (!min || !max || max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  };

  const gaugeMin = 124000;
  const gaugeMax = 140000;
  const gaugePercent = Math.min(
    1,
    Math.max(
      0,
      ((valuationSummary.wholesale.adjustedMMR ?? 0) - gaugeMin) /
        (gaugeMax - gaugeMin),
    ),
  );
  const gaugePointerRotation = -90 + gaugePercent * 180;
  const gaugePathLength = Math.PI * 90;
  const gaugeDashOffset = gaugePathLength * (1 - gaugePercent);

  // Gauge data for PieChart
  const gaugeData = [
    {
      name: "value",
      value: (valuationSummary.wholesale.adjustedMMR ?? 0) - gaugeMin,
    },
    {
      name: "remaining",
      value: gaugeMax - (valuationSummary.wholesale.adjustedMMR ?? 0),
    },
  ];
  const RADIAN = Math.PI / 180;
  const renderNeedle = (value: number, min: number, max: number) => {
    const angle = (value / (max - min)) * 180 - 90;
    const length = 45;
    const cx = 100;
    const cy = 100;
    const sin = Math.sin(angle * RADIAN);
    const cos = Math.cos(angle * RADIAN);
    const x1 = cx;
    const y1 = cy;
    const x2 = cx + length * cos;
    const y2 = cy + length * sin;
    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1f2937"
          strokeWidth="2"
        />
        <circle cx={cx} cy={cy} r="4" fill="#1f2937" />
      </g>
    );
  };

  return (
    <ProtectedRoute>
      <Layout title="Acquisition Intelligence Deep Dive">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <Breadcrumb
              items={[
                { label: "VIN Intel", href: "/vin-intel" },
                {
                  label: "Acquisition Intelligence Deep Dive",
                  isCurrent: true,
                },
              ]}
            />
            <div className="text-lg font-medium text-gray-700">
              VIN: {vin || "Loading..."}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading vehicle data...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !vinData && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Vehicle Data Found
            </h3>
            <p className="text-gray-500 mb-4">
              Please analyze a VIN first to view acquisition intelligence.
            </p>
            <Button onClick={() => router.push("/vin-intel")}>
              Go to VIN Intel
            </Button>
          </div>
        )}

        {/* Vehicle Data */}
        {!isLoading && vinData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {vinData.year} {vinData.make?.toUpperCase()}{" "}
                        {vinData.model?.toUpperCase()}
                        {vinData.trim && (
                          <>
                            <br />
                            {vinData.trim.toUpperCase()}
                          </>
                        )}
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        {vinData.trim && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {vinData.trim}
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {vinData.odometer?.toLocaleString() || "N/A"} mi
                        </span>
                        {vinData.exterior_color && (
                          <>
                            <span>•</span>
                            <span>{vinData.exterior_color}</span>
                          </>
                        )}
                        {vinData.engine && (
                          <>
                            <span>•</span>
                            <span>{vinData.engine}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Estimated Market Value
                        </div>
                        <div className="text-4xl font-bold text-gray-900">
                          {formatMarketValue(
                            vinData.market_data?.estimated_market_value,
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center whitespace-nowrap"
                        onClick={() => setBuildSheetModalOpen(true)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Pull Build Sheet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Retail Turn Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(vinData.market_data?.retail_turn_rate) ||
                      "—"}
                  </div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Avg. Days to Sell
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(vinData.market_data?.avg_days_to_sell) || "—"}
                  </div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Market Days Supply
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatNumber(vinData.market_data?.market_days_supply) ||
                      "—"}
                  </div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Active Local
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(vinData.market_data?.active_local) || "—"}
                  </div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Sold 90d
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatNumber(vinData.market_data?.sold_90d) || "—"}
                  </div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Consumer Interest
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(vinData.market_data?.consumer_interest) ||
                      "—"}
                  </div>
                </Card>
              </div>
            </div>

            <section className="flex gap-6 mb-6">
              <div className="w-[40%]">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex flex-row justify-between items-start space-y-0 flex-shrink-0">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Retail Valuation
                      </div>
                      <CardTitle className="text-4xl font-bold mt-2">
                        {formatCurrency(
                          valuationSummary.retail.marketCheckAvg ?? 0,
                        )}
                      </CardTitle>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${valuationSummary.retail.demandTone}`}
                    >
                      {valuationSummary.retail.demandLabel}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">
                        Market Check Avg
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          valuationSummary.retail.marketCheckAvg ?? 0,
                        )}
                      </p>
                    </div>
                    <div>
                      <LinearGauge
                        min={valuationSummary.retail.priceRange.min ?? 0}
                        max={valuationSummary.retail.priceRange.max ?? 0}
                        value={valuationSummary.retail.marketCheckAvg ?? 0}
                        formatCompactCurrency={formatCompactCurrency}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase text-blue-700 font-semibold">
                          Est. Gross Margin
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          +
                          {formatCurrency(
                            valuationSummary.retail.estGrossMargin ?? 0,
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-blue-700">
                        Projected
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-[60%]">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex flex-row justify-between items-start space-y-0 flex-shrink-0">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Wholesale Valuation (Full MMR)
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Insights based on current Manheim market data
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex flex-col lg:flex-row gap-6 flex-1">
                      <div className="lg:w-1/4 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                        <p className="text-xs uppercase text-gray-500 font-semibold">
                          Base MMR
                        </p>
                        <p className="text-4xl font-bold text-amber-600 mt-1">
                          {formatCurrency(
                            valuationSummary.wholesale.baseMMR ?? 0,
                          )}
                        </p>
                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">
                              Avg ODO (mi)
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {valuationSummary.wholesale.avgOdo
                                ? valuationSummary.wholesale.avgOdo.toLocaleString()
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold">
                              Avg Condition
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {valuationSummary.wholesale.avgCondition || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-2/5 space-y-4">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold">
                          Valuation Adjustments
                        </h4>
                        <div className="space-y-3">
                          {valuationSummary.wholesale.adjustments.length > 0 ? (
                            valuationSummary.wholesale.adjustments.map(
                              (adjustment: any) => (
                                <div
                                  key={adjustment.label}
                                  className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {adjustment.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {adjustment.value}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-sm font-semibold ${adjustment.value >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                                  >
                                    {adjustment.value >= 0 ? "+" : ""}
                                    {formatCurrency(Math.abs(adjustment.value))}
                                  </span>
                                </div>
                              ),
                            )
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No adjustments available
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="lg:flex-1 flex flex-col gap-0">
                        <div className="text-center">
                          <p className="text-xs uppercase text-gray-500 font-semibold">
                            Adjusted MMR
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(
                              valuationSummary.wholesale.adjustedMMR ?? 0,
                            )}
                          </p>
                          <p className="text-xs text-gray-500">vs. Market</p>
                        </div>
                        <div className="relative w-full max-w-xl h-44 mx-auto -mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={gaugeData}
                                startAngle={180}
                                endAngle={0}
                                innerRadius="70%"
                                outerRadius="90%"
                                cx="50%"
                                cy="95%"
                                paddingAngle={2}
                                dataKey="value"
                              >
                                <Cell fill="#2563eb" />
                                <Cell fill="#dbeafe" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <svg
                            viewBox="0 0 200 110"
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ transform: "rotate(0deg)" }}
                          >
                            {renderNeedle(
                              (valuationSummary.wholesale.adjustedMMR ?? 0) -
                                gaugeMin,
                              0,
                              gaugeMax - gaugeMin,
                            )}
                          </svg>
                          <div
                            className="absolute bottom-0 left-0 text-xs text-gray-500"
                            style={{ transform: "translateX(-4px)" }}
                          >
                            {formatCurrency(gaugeMin)}
                          </div>
                          <div
                            className="absolute bottom-0 right-0 text-xs text-gray-500"
                            style={{ transform: "translateX(4px)" }}
                          >
                            {formatCurrency(gaugeMax)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              <Card>
                <CardHeader className="flex items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sold Comparables
                    </p>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {formatCompactCurrency(
                        valuationSummary.retail.marketCheckAvg,
                      )}{" "}
                      Market Snapshot
                    </CardTitle>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    7 comps found (90d)
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-b from-gray-100 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent z-10 pointer-events-none flex items-end justify-center pb-2">
                      <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-200">
                        {getScrollIndicator(soldCompsScrollState)}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <div
                        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                        onScroll={handleSoldCompsScroll}
                      >
                        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          <span className="col-span-1">Img</span>
                          <span className="col-span-5">
                            Year / Make / Model
                          </span>
                          <span className="col-span-2 text-right">Miles</span>
                          <span className="col-span-2 text-right">Price</span>
                          <span className="col-span-2 text-right">Sold</span>
                        </div>
                        {(activeListings || []).map(
                          (comp: any, idx: number) => (
                            <div
                              key={`${comp.make}-${comp.miles}-${idx}`}
                              className="grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-gray-100"
                            >
                              <div className="col-span-1 flex items-center">
                                <span
                                  className={`h-8 w-8 rounded-full bg-linear-to-b ${comp.gradient} shadow-inner`}
                                ></span>
                              </div>
                              <div className="col-span-5">
                                <p className="font-semibold text-gray-900">
                                  {comp.year} {comp.make} {comp.model}
                                </p>
                              </div>
                              <div className="col-span-2 text-right text-gray-600">
                                {comp.miles.toLocaleString()}
                              </div>
                              <div className="col-span-2 text-right font-semibold text-gray-900">
                                {comp.price}
                              </div>
                              <div className="col-span-2 text-right text-gray-500">
                                {comp.soldDate}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between space-y-0">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price vs. Mileage Scatter Analysis
                    </p>
                    <p className="text-sm text-gray-500">
                      Market comps vs target unit
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                    National comps
                  </button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={256}>
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        dataKey="miles"
                        name="Mileage"
                        unit=" mi"
                        domain={[minMiles, maxMiles]}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        label={{
                          value: "Mileage",
                          position: "insideBottom",
                          offset: -10,
                          fontSize: 12,
                          fill: "#6b7280",
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="price"
                        name="Price"
                        unit="$"
                        domain={[minPrice, maxPrice]}
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}K`
                        }
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        label={{
                          value: "Price",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                          fill: "#6b7280",
                        }}
                      />
                      <Tooltip
                        formatter={(value: any, name?: string) => [
                          name === "Mileage"
                            ? `${value.toLocaleString()} mi`
                            : `$${value.toLocaleString()}`,
                          name === "Mileage" ? "Mileage" : "Price",
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Scatter
                        name="Market Listings"
                        data={scatterData.market}
                        fill="#d1d5db"
                      />
                      <Scatter
                        name="Target Vehicle"
                        data={[scatterData.target]}
                        fill="#2563eb"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 text-xs font-semibold text-gray-500 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                      Target Vehicle
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-gray-300"></span>
                      Market Listings
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <Card>
                <CardHeader className="flex items-center justify-between space-y-0">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Your Competition: Active Listings
                    </p>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Nearby units currently on market
                    </CardTitle>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    {activeListings.length} active units
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-b from-gray-100 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent z-10 pointer-events-none flex items-end justify-center pb-2">
                      <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-200">
                        {getScrollIndicator(activeListingsScrollState)}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-gray-100">
                      <div
                        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                        onScroll={handleActiveListingsScroll}
                      >
                        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          <span className="col-span-1">Img</span>
                          <span className="col-span-4">
                            Year / Make / Model
                          </span>
                          <span className="col-span-2 text-right">Miles</span>
                          <span className="col-span-2 text-right">Price</span>
                          <span className="col-span-2 text-right">
                            Distance
                          </span>
                          <span className="col-span-1 text-right">DOM</span>
                        </div>
                        {(soldComps.length ? soldComps : activeListings).map(
                          (comp: any, idx: number) => (
                            <div
                              key={`${comp.make}-${comp.miles}-${idx}`}
                              className="grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-gray-100"
                            >
                              <div className="col-span-1 flex items-center">
                                <span
                                  className={`h-8 w-8 rounded-full bg-linear-to-b ${comp.gradient} shadow-inner`}
                                ></span>
                              </div>
                              <div className="col-span-4">
                                <p className="font-semibold text-gray-900">
                                  {comp.year} {comp.make} {comp.model}
                                </p>
                              </div>
                              <div className="col-span-2 text-right text-gray-600">
                                {comp.miles.toLocaleString()}
                              </div>
                              <div className="col-span-2 text-right font-semibold text-gray-900">
                                {formatCurrency(comp.price)}
                              </div>
                              <div className="col-span-2 text-right text-gray-500">
                                {comp.distance || "N/A"}
                              </div>
                              <div className="col-span-1 text-right text-gray-500">
                                {comp.dom || comp.days_on_market || "N/A"}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Error State */}
        {!isLoading && !vinData && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Vehicle Data Found
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to retrieve vehicle information. Please try again.
            </p>
            <Button onClick={() => router.push("/vin-intel")}>
              Go to VIN Intel
            </Button>
          </div>
        )}

        {/* Build Sheet Modal */}
        <BuildSheetModal
          open={buildSheetModalOpen}
          onOpenChange={setBuildSheetModalOpen}
          vinData={vinData || undefined}
          vehicleSpecs={vehicleSpecs}
        />
      </Layout>
    </ProtectedRoute>
  );
}
