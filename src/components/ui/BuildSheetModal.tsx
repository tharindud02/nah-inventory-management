import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BuildSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vinData?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    vin?: string;
  };
}

export const BuildSheetModal: React.FC<BuildSheetModalProps> = ({
  open,
  onOpenChange,
  vinData,
}) => {
  const demoBuildSheet = {
    year: "2022",
    make: "PORSCHE",
    model: "911 CARRERA",
    vin: "WP0AA2A9XNS240192",
    engine: "3.0L Twin-Turbo Flat-6",
    transmission: "8-Speed PDK",
    exterior: "GT Silver Metallic",
    interior: "Leather Interior in Black",
    mechanical: [
      "3.0L Twin-Turbocharged Boxer 6",
      "Rear Wheel Drive",
      "Porsche Active Suspension Management (PASM)",
      "Sport Exhaust System inc. Tailpipes in Silver",
      "Power Steering Plus",
      "23.7 Gallon Extended Range Fuel Tank",
      "Porsche Torque Vectoring Plus (PTV+)",
    ],
    interiorFeatures: [
      "Adaptive Sport Seats Plus (18-way)",
      "Memory Package",
      "Heated and Ventilated Front Seats",
      "GT Sport Steering Wheel in Leather",
      "Tachometer Dial in Guards Red",
      "Sport Chrono Stopwatch Dial in Guards Red",
      "Roof Lining in Alcantara",
    ],
    exteriorFeatures: [
      '20"/21" Carrera S Wheels',
      "LED Headlights inc. PDLS+",
      "Auto-Dimming Mirrors",
      "Electric Slide/Tilt Glass Sunroof",
      "Lightweight and Noise Insulating Glass",
      "Exterior Mirror Lower Trim in Exterior Color",
    ],
    safety: [
      "Porsche Side Impact Protection (POSIP)",
      "Warn and Brake Assist",
      "ParkAssist (Front and Rear) incl. Reversing Camera",
      "Lane Keep Assist (LKA) incl. Traffic Sign Recognition",
      "Cruise Control",
    ],
    entertainment: [
      "BOSE® Surround Sound System",
      "Porsche Communication Management (PCM)",
      "Wireless Apple CarPlay® and Wired Android Auto™",
      "SiriusXM® with 3-Month Platinum Plan Trial",
    ],
    mpg: {
      city: 18,
      highway: 23,
    },
    installedOptions: [
      { code: "MSRP", description: "", price: 117100 },
      { code: "[U2]", description: "GT Silver Metallic", price: 840 },
      {
        code: "[AU]",
        description: "Adaptive Sport Seats Plus (18-way)",
        price: 2840,
      },
      { code: "[XSE]", description: "Sport Chrono Package", price: 2700 },
      {
        code: "[XLF]",
        description: "Lightweight and Noise Insulating Glass",
        price: 1490,
      },
      { code: "[XKR]", description: "Roof Lining in Alcantara", price: 2840 },
      {
        code: "[X4L]",
        description: "BOSE® Surround Sound System",
        price: 1100,
      },
      {
        code: "[X6B]",
        description: "Heated and Ventilated Front Seats",
        price: 580,
      },
      {
        code: "[X5D]",
        description: "ParkAssist (Front and Rear) incl. Reversing Camera",
        price: 1100,
      },
      {
        code: "[X3L]",
        description: "Lane Keep Assist (LKA) incl. Traffic Sign Recognition",
        price: 970,
      },
    ],
    totalPrice: "$141,200",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto"
        style={{ width: "95vw", maxWidth: "1400px" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4">
              EXPORT
            </Button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr] gap-8 py-6 flex-1">
            {/* Left Panel */}
            <div className="flex flex-col space-y-8 overflow-hidden">
              <div className="grid grid-cols-2 gap-y-1 text-xs leading-snug">
                <div>
                  <span className="font-semibold text-gray-900">Year:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.year}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Engine:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.engine}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Make:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.make}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    Transmission:
                  </span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.transmission}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Model:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.model}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Exterior:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.exterior}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">VIN:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.vin}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Interior:</span>
                  <span className="text-gray-700 ml-2">
                    {demoBuildSheet.interior}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-[13px] text-gray-800">
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center justify-between border-b border-gray-900/20 pb-1">
                      <h3 className="font-semibold tracking-wide text-gray-900">
                        MECHANICAL
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {demoBuildSheet.mechanical.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <div className="flex items-center justify-between border-b border-gray-900/20 pb-1">
                      <h3 className="font-semibold tracking-wide text-gray-900">
                        EXTERIOR
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {demoBuildSheet.exteriorFeatures.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                </div>
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center justify-between border-b border-gray-900/20 pb-1">
                      <h3 className="font-semibold tracking-wide text-gray-900">
                        INTERIOR
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {demoBuildSheet.interiorFeatures.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <div className="flex items-center justify-between border-b border-gray-900/20 pb-1">
                      <h3 className="font-semibold tracking-wide text-gray-900">
                        SAFETY
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {demoBuildSheet.safety.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <div className="flex items-center justify-between border-b border-gray-900/20 pb-1">
                      <h3 className="font-semibold tracking-wide text-gray-900">
                        ENTERTAINMENT
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {demoBuildSheet.entertainment.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col space-y-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      City MPG
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {demoBuildSheet.mpg.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Highway MPG
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {demoBuildSheet.mpg.highway}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Actual mileage will vary with options, driving conditions,
                  driving habits and vehicle's condition
                </p>
              </div>

              <div className="border border-gray-900 rounded-lg p-4 flex-1 flex flex-col">
                <h3 className="font-semibold tracking-wide text-gray-900 mb-3">
                  INSTALLED OPTIONS
                </h3>
                <div className="text-[13px] space-y-1 flex-1">
                  {demoBuildSheet.installedOptions.map((opt, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-700">
                        {opt.code} {opt.description}
                      </span>
                      <span className="font-semibold">
                        ${opt.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-300 pt-2 mt-3">
                    <span className="font-semibold text-gray-900">
                      Destination Charge
                    </span>
                    <span className="font-semibold">$1,350</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-900 pt-4 mt-4">
                  <span className="text-lg font-semibold text-gray-900">
                    TOTAL PRICE
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {demoBuildSheet.totalPrice}
                  </span>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Get more information on your smartphone
                </p>
                <div className="w-24 h-24 bg-gray-100 mx-auto rounded flex items-center justify-center text-[10px] text-gray-400">
                  QR
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
