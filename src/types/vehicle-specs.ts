export type VehicleSpecsSectionKey =
  | "mechanical"
  | "interior"
  | "exterior"
  | "safety"
  | "entertainment";

export interface VehicleOption {
  code?: string;
  name: string;
  description?: string;
  category?: string;
  price?: number | null;
  msrp?: string | number | null;
  type?: string;
  confidence?: string;
}

export interface VehicleColor {
  code?: string;
  name?: string;
  base?: string;
  msrp?: string | number;
  confidence?: string | number;
}

export interface VehicleSpecsSections {
  mechanical: string[];
  interior: string[];
  exterior: string[];
  safety: string[];
  entertainment: string[];
}

export interface VehicleEquipmentItem {
  category?: string;
  item?: string;
  attribute?: string;
  location?: string;
  value?: string | number | null;
}

export interface SafetyRating {
  front?: number;
  side?: number;
  overall?: number;
  rollover?: number;
  roofStrength?: string;
}

export interface WarrantyInfo {
  total?: { duration?: number; distance?: number };
  powertrain?: { duration?: number; distance?: number };
  antiCorrosion?: { duration?: number; distance?: number };
  roadsideAssistance?: { duration?: number; distance?: number };
}

export interface VehicleFeature {
  category: string;
  feature_type?: string;
  description: string;
}

export interface VehicleDimensions {
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  doors?: number;
  seatingCapacity?: number;
}

export interface VehicleSpecs {
  vin?: string;
  year?: number | null;
  make?: string;
  model?: string;
  trim?: string;
  version?: string;
  subTrim?: string;
  engine?: string;
  transmission?: string;
  transmissionDescription?: string;
  drivetrain?: string;
  powertrainType?: string;
  fuelType?: string;
  bodyType?: string;
  bodySubtype?: string;
  vehicleType?: string;
  exteriorColor?: string;
  interiorColor?: string;
  exteriorColorDetails?: VehicleColor;
  interiorColorDetails?: VehicleColor;
  mpg?: {
    city?: number | null;
    highway?: number | null;
    combined?: number | null;
  };
  msrp?: number | null;
  installedOptionsMsrp?: number | null;
  installedOptions: VehicleOption[];
  installedOptionsDetails?: VehicleOption[];
  installedEquipment?: Record<string, VehicleEquipmentItem[]>;
  destinationCharge?: number | null;
  totalMsrp?: number | null;
  sections: VehicleSpecsSections;
  features?: Record<string, VehicleFeature[]>;
  highValueFeatures?: Record<
    string,
    { category: string; description: string }[]
  >;
  rating?: SafetyRating;
  warranty?: WarrantyInfo;
  dimensions?: VehicleDimensions;
  manufacturerCode?: string;
  packageCode?: string;
  source?: string;
}
