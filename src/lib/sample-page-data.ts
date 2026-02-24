import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import type { ChatMessage } from "@/components/seller-contact/ChatSection";

export const EMPTY_EVENTS: CalendarEvent[] = [];
export const EMPTY_UPCOMING: Array<{
  title: string;
  relativeLabel: string;
  date: string;
  timeRange: string;
  attendee?: string;
}> = [];
export const EMPTY_AVAILABILITY: Array<{
  label: string;
  available: number;
  total: number;
}> = [];
export const EMPTY_NOTES: DealNote[] = [];
export const EMPTY_NEGOTIATION_GOALS: string[] = [];
export const EMPTY_PRIORITY_FLAGS: PriorityFlag[] = [];
export const EMPTY_CHAT_MESSAGES: ChatMessage[] = [];
export const EMPTY_AI_SUGGESTIONS: Array<{
  id: string;
  category: string;
  actionText: string;
  description: string;
  icon: "zap" | "check" | "calendar" | "tag";
}> = [];
export const EMPTY_CONFIGURATION: Array<{ label: string; value: string }> = [];
export const EMPTY_IMAGES: string[] = [];
export const EMPTY_VEHICLE_IMAGES: string[] = [];

export const EMPTY_SELLER_CONTACT = {
  mobile: "—",
  email: "—",
  location: "—",
};

export const EMPTY_SOURCE_INFO = {
  channel: "—",
  created: "—",
  leadId: "—",
};

export const EMPTY_SELLER_ACTIONS: Array<{ id: string; label: string }> = [];

export const EMPTY_MARKET_OVERVIEW = {
  currentPrice: "—",
  previousPrice: undefined,
  priceDrop: undefined,
  daysOnMarket: "—",
  marketCondition: "—",
  estRecon: "",
  mmrApi: "",
  mcApi: "",
};

export const EMPTY_SOURCING_INTEL = "—";

export const EMPTY_VALUATION_RESULTS: ValuationResultsData = {
  metrics: {
    daysOnMarket: 0,
    avgMarketDom: 0,
    activeLocal: 0,
    sold90dLocal: 0,
    marketDaysSupply: 0,
    consumerInterest: "—",
    consumerInterestPercentile: "—",
  },
  mmr: {
    base_mmr: 0,
    adjusted_mmr: 0,
    adjustments: { odometer: 0, region: 0, cr_score: 0, color: 0 },
    typical_range: { min: 0, max: 0 },
    avg_odo: 0,
    avg_condition: "—",
  },
  retail: {
    currentAsking: "—",
    marketAvg: "—",
    belowMarket: undefined,
    retailMargin: "—",
    priceRank: "—",
    competitivePositionPercent: 0,
  },
  condition: {
    score: 0,
    bars: [],
  },
  comparables: [],
  marketPosition: {
    sold: [],
    subject: undefined,
  },
};
