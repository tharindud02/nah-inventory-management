import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import type {
  VehicleSpecs,
  VehicleSpecsSections,
  VehicleEquipmentItem,
  VehicleOption,
} from "@/types/vehicle-specs";

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
  vehicleSpecs?: VehicleSpecs | null;
}

export const BuildSheetModal: React.FC<BuildSheetModalProps> = ({
  open,
  onOpenChange,
  vinData,
  vehicleSpecs,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);
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

  const formatCurrency = (value?: number | null): string => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return `$${value.toLocaleString()}`;
    }
    return "—";
  };

  const formatOptionText = (value: unknown): string => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (Array.isArray(value)) {
      return value
        .map((item) => formatOptionText(item))
        .filter(Boolean)
        .join(", ");
    }
    if (typeof value === "object") {
      return Object.values(value)
        .map((item) => formatOptionText(item))
        .filter(Boolean)
        .join(", ");
    }
    return "";
  };

  const safeString = (val: unknown, fallback: string): string => {
    const result = formatOptionText(val);
    return result || fallback;
  };

  const resolveColorText = (
    colorDetails?: VehicleSpecs["exteriorColorDetails"],
    fallback?: unknown,
  ): string => {
    if (colorDetails) {
      const fromDetails =
        colorDetails.name || colorDetails.base || colorDetails.code;
      if (fromDetails) {
        return fromDetails;
      }
    }
    return formatOptionText(fallback) || "";
  };

  const sectionKeywordMap: Record<keyof VehicleSpecsSections, string[]> = {
    mechanical: [
      "engine",
      "transmission",
      "drivetrain",
      "powertrain",
      "suspension",
      "performance",
      "fuel",
    ],
    interior: ["interior", "comfort", "seat", "steering", "cabin", "console"],
    exterior: [
      "exterior",
      "body",
      "door",
      "mirror",
      "lighting",
      "paint",
      "bed",
      "trailer",
      "wheel",
      "tire",
      "roof",
      "window",
    ],
    safety: [
      "safety",
      "driver assist",
      "airbag",
      "brake",
      "collision",
      "security",
      "lane",
      "parking",
      "cruise",
      "assist",
    ],
    entertainment: [
      "infotainment",
      "audio",
      "entertainment",
      "display",
      "screen",
      "speaker",
      "voice",
      "bluetooth",
      "telematics",
    ],
  };

  const deriveSectionsFromSpecs = (
    specs: VehicleSpecs,
  ): VehicleSpecsSections => {
    const buckets: VehicleSpecsSections = {
      mechanical: [...(specs.sections?.mechanical ?? [])],
      interior: [...(specs.sections?.interior ?? [])],
      exterior: [...(specs.sections?.exterior ?? [])],
      safety: [...(specs.sections?.safety ?? [])],
      entertainment: [...(specs.sections?.entertainment ?? [])],
    };

    const addUnique = (key: keyof VehicleSpecsSections, value?: string) => {
      if (!value) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (!buckets[key].includes(trimmed)) {
        buckets[key].push(trimmed);
      }
    };

    const assignSection = (
      category?: string,
    ): keyof VehicleSpecsSections | null => {
      if (!category) return null;
      const lowered = category.toLowerCase();
      for (const [section, keywords] of Object.entries(sectionKeywordMap)) {
        if (keywords.some((keyword) => lowered.includes(keyword))) {
          return section as keyof VehicleSpecsSections;
        }
      }
      return null;
    };

    const collectFeatures = (
      featureSource?: Record<
        string,
        { category?: string; description?: string }[]
      >,
    ) => {
      if (!featureSource) return;
      Object.values(featureSource).forEach((featureList) => {
        featureList?.forEach((feature) => {
          const target = assignSection(feature.category);
          if (target) {
            addUnique(target, feature.description);
          }
        });
      });
    };

    collectFeatures(specs.features);
    collectFeatures(specs.highValueFeatures);

    addUnique("mechanical", specs.engine);
    addUnique(
      "mechanical",
      specs.transmissionDescription || specs.transmission,
    );
    addUnique("mechanical", specs.drivetrain);
    addUnique(
      "interior",
      specs.interiorColorDetails?.name || specs.interiorColor
        ? `Interior Color: ${resolveColorText(specs.interiorColorDetails, specs.interiorColor)}`
        : "",
    );
    addUnique(
      "exterior",
      specs.exteriorColorDetails?.name || specs.exteriorColor
        ? `Exterior Color: ${resolveColorText(specs.exteriorColorDetails, specs.exteriorColor)}`
        : "",
    );

    const mpgText =
      specs.mpg?.city && specs.mpg?.highway
        ? `MPG: ${specs.mpg.city} city / ${specs.mpg.highway} hwy`
        : "";
    addUnique("mechanical", mpgText);

    (Object.keys(buckets) as (keyof VehicleSpecsSections)[]).forEach((key) => {
      if (buckets[key].length > 12) {
        buckets[key] = buckets[key].slice(0, 12);
      }
    });

    return buckets;
  };

  const derivedSections = React.useMemo(() => {
    if (!vehicleSpecs) return null;
    return deriveSectionsFromSpecs(vehicleSpecs);
  }, [vehicleSpecs]);

  const summaryRows = React.useMemo(
    () => [
      {
        label: "Year",
        value:
          vehicleSpecs?.year?.toString() ||
          vinData?.year?.toString() ||
          demoBuildSheet.year,
      },
      {
        label: "Engine",
        value: safeString(vehicleSpecs?.engine, demoBuildSheet.engine),
      },
      {
        label: "Make",
        value:
          safeString(vehicleSpecs?.make, "")?.toUpperCase() ||
          vinData?.make?.toUpperCase() ||
          demoBuildSheet.make,
      },
      {
        label: "Transmission",
        value: safeString(
          vehicleSpecs?.transmission,
          demoBuildSheet.transmission,
        ),
      },
      {
        label: "Model",
        value:
          safeString(vehicleSpecs?.model, "")?.toUpperCase() ||
          vinData?.model?.toUpperCase() ||
          demoBuildSheet.model,
      },
      {
        label: "Exterior",
        value:
          resolveColorText(
            vehicleSpecs?.exteriorColorDetails,
            vehicleSpecs?.exteriorColor,
          ) || demoBuildSheet.exterior,
      },
      {
        label: "VIN",
        value:
          safeString(vehicleSpecs?.vin, "") ||
          vinData?.vin ||
          demoBuildSheet.vin,
      },
      {
        label: "Interior",
        value:
          resolveColorText(
            vehicleSpecs?.interiorColorDetails,
            vehicleSpecs?.interiorColor,
          ) || demoBuildSheet.interior,
      },
    ],
    [vehicleSpecs, vinData],
  );

  const summaryMap = React.useMemo(() => {
    return summaryRows.reduce<Record<string, string>>((acc, row) => {
      acc[row.label] = row.value ?? "";
      return acc;
    }, {});
  }, [summaryRows]);

  const resolvedVehicleTitle = React.useMemo(() => {
    const trim = vehicleSpecs?.trim || vinData?.trim;
    const parts = [summaryMap.Year, summaryMap.Make, summaryMap.Model]
      .filter(Boolean)
      .map((part) => part.trim());
    if (trim) {
      parts.push(trim.toUpperCase());
    }
    return parts.filter(Boolean).join(" ") || "Vehicle Build Sheet";
  }, [summaryMap, vehicleSpecs?.trim, vinData?.trim]);

  const resolvedSections: VehicleSpecsSections = {
    mechanical: derivedSections?.mechanical?.length
      ? derivedSections.mechanical
      : demoBuildSheet.mechanical,
    interior: derivedSections?.interior?.length
      ? derivedSections.interior
      : demoBuildSheet.interiorFeatures,
    exterior: derivedSections?.exterior?.length
      ? derivedSections.exterior
      : demoBuildSheet.exteriorFeatures,
    safety: derivedSections?.safety?.length
      ? derivedSections.safety
      : demoBuildSheet.safety,
    entertainment: derivedSections?.entertainment?.length
      ? derivedSections.entertainment
      : demoBuildSheet.entertainment,
  };

  const normalizeRawInstalledOptions = (raw: unknown): VehicleOption[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      code:
        typeof (item as any)?.code === "string"
          ? ((item as any)?.code as string)
          : undefined,
      name:
        typeof (item as any)?.name === "string"
          ? ((item as any)?.name as string)
          : typeof (item as any)?.description === "string"
            ? ((item as any)?.description as string)
            : "",
      description:
        typeof (item as any)?.description === "string"
          ? ((item as any)?.description as string)
          : undefined,
      price:
        typeof (item as any)?.msrp === "number"
          ? ((item as any)?.msrp as number)
          : typeof (item as any)?.msrp === "string"
            ? Number((item as any)?.msrp) || null
            : null,
    }));
  };

  const resolvedInstalledOptionsSource = React.useMemo(() => {
    if (!vehicleSpecs) return [];
    if (vehicleSpecs.installedOptionsDetails?.length) {
      return vehicleSpecs.installedOptionsDetails;
    }
    if (vehicleSpecs.installedOptions?.length) {
      return vehicleSpecs.installedOptions;
    }
    const raw = (
      vehicleSpecs as unknown as {
        installed_options_details?: unknown;
      }
    )?.installed_options_details;
    return normalizeRawInstalledOptions(raw);
  }, [vehicleSpecs]);

  const parsedInstalledOptions = resolvedInstalledOptionsSource.length
    ? resolvedInstalledOptionsSource.map((option) => ({
        code: option.code,
        label: option.name || option.description || "",
        price: typeof option.price === "number" ? option.price : null,
      }))
    : [];

  const baseMsrp = vehicleSpecs?.msrp ?? null;
  const destinationCharge = vehicleSpecs?.destinationCharge ?? 1350;
  const optionsTotal = parsedInstalledOptions.reduce(
    (sum, opt) => sum + (opt.price ?? 0),
    0,
  );
  const computedTotal = parsedInstalledOptions.length > 0 ? optionsTotal : 0;
  const totalPriceValue = computedTotal;
  const mpgCity = vehicleSpecs?.mpg?.city ?? demoBuildSheet.mpg.city;
  const mpgHighway = vehicleSpecs?.mpg?.highway ?? demoBuildSheet.mpg.highway;

  const handleExport = React.useCallback(async () => {
    if (!vehicleSpecs && !vinData) {
      toast.warning("No build sheet data available to export yet.");
      return;
    }

    setIsExporting(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const createdAt = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let page = pdfDoc.addPage();
      let { width: pageWidth, height: pageHeight } = page.getSize();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = pageHeight - margin;

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const wrapText = (
        text: string,
        font: typeof fontRegular,
        size: number,
        maxWidth: number,
      ) => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let currentLine = "";
        words.forEach((word) => {
          const tentative = currentLine ? `${currentLine} ${word}` : word;
          if (
            font.widthOfTextAtSize(tentative, size) > maxWidth &&
            currentLine
          ) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = tentative;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines.length ? lines : [text];
      };

      const addPage = () => {
        page = pdfDoc.addPage();
        const size = page.getSize();
        pageWidth = size.width;
        pageHeight = size.height;
        cursorY = pageHeight - margin;
      };

      const ensureSpace = (needed: number) => {
        if (cursorY - needed < margin) {
          addPage();
        }
      };

      const drawLines = (
        lines: string[],
        {
          font = fontRegular,
          size = 11,
          color = rgb(0, 0, 0),
          indent = 0,
          lineGap = 4,
        }: {
          font?: typeof fontRegular;
          size?: number;
          color?: ReturnType<typeof rgb>;
          indent?: number;
          lineGap?: number;
        } = {},
      ) => {
        lines.forEach((line) => {
          ensureSpace(size + lineGap);
          page.drawText(line, {
            x: margin + indent,
            y: cursorY,
            size,
            font,
            color,
          });
          cursorY -= size + lineGap;
        });
      };

      const drawParagraph = (
        text: string,
        options?: {
          font?: typeof fontRegular;
          size?: number;
          color?: ReturnType<typeof rgb>;
          indent?: number;
          lineGap?: number;
        },
      ) => {
        const { font = fontRegular, size = 11, indent = 0 } = options ?? {};
        const wrapped = wrapText(text, font, size, contentWidth - indent);
        drawLines(wrapped, { ...options, font, size, indent });
      };

      const drawBulletList = (items: string[]) => {
        if (!items.length) {
          drawParagraph("• —");
          return;
        }
        items.forEach((item) => {
          const clean = item?.trim() || "—";
          const wrapped = wrapText(clean, fontRegular, 11, contentWidth - 16);
          ensureSpace(15);
          page.drawText(`• ${wrapped[0]}`, {
            x: margin,
            y: cursorY,
            size: 11,
            font: fontRegular,
            color: rgb(0.15, 0.15, 0.15),
          });
          cursorY -= 15;
          wrapped.slice(1).forEach((line) => {
            ensureSpace(15);
            page.drawText(line, {
              x: margin + 14,
              y: cursorY,
              size: 11,
              font: fontRegular,
              color: rgb(0.15, 0.15, 0.15),
            });
            cursorY -= 15;
          });
        });
      };

      const headline = resolvedVehicleTitle;
      ensureSpace(32);
      page.drawText(headline, {
        x: margin,
        y: cursorY,
        size: 18,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      cursorY -= 24;
      drawParagraph(`Generated on ${createdAt}`, {
        font: fontRegular,
        size: 11,
        color: rgb(0.4, 0.4, 0.4),
      });
      cursorY -= 8;

      drawParagraph("Summary", {
        font: fontBold,
        size: 13,
        color: rgb(0.2, 0.2, 0.2),
      });
      summaryRows.forEach((row) => {
        drawParagraph(`${row.label}: ${row.value ?? "—"}`, {
          size: 11,
        });
      });
      drawParagraph(
        `MPG (City/Highway): ${mpgCity ?? "—"} / ${mpgHighway ?? "—"}`,
        { size: 11 },
      );
      cursorY -= 6;

      const sectionOrder: { label: string; items: string[] }[] = [
        { label: "Mechanical", items: resolvedSections.mechanical },
        { label: "Exterior", items: resolvedSections.exterior },
        { label: "Interior", items: resolvedSections.interior },
        { label: "Safety", items: resolvedSections.safety },
        { label: "Entertainment", items: resolvedSections.entertainment },
      ];

      sectionOrder.forEach((section) => {
        cursorY -= 4;
        drawParagraph(section.label.toUpperCase(), {
          font: fontBold,
          size: 12,
        });
        drawBulletList(
          section.items.map((item) => formatOptionText(item) || "—"),
        );
      });

      cursorY -= 4;
      drawParagraph("Installed Options", {
        font: fontBold,
        size: 12,
      });
      const optionLines = parsedInstalledOptions.length
        ? parsedInstalledOptions.map((opt) => {
            const priceText =
              typeof opt.price === "number" ? formatCurrency(opt.price) : "—";
            const codeText = opt.code ? `[${opt.code}] ` : "";
            return `${codeText}${formatOptionText(opt.label)} — ${priceText}`;
          })
        : ["No installed options data available"];
      drawBulletList(optionLines);

      cursorY -= 4;
      drawParagraph("Pricing", {
        font: fontBold,
        size: 12,
      });
      const pricingLines = [
        `Base MSRP: ${formatCurrency(baseMsrp)}`,
        `Destination Charge: ${formatCurrency(destinationCharge)}`,
        `Installed Options: ${formatCurrency(optionsTotal || 0)}`,
        `Displayed Total: ${formatCurrency(totalPriceValue || 0)}`,
      ];
      drawLines(pricingLines, { size: 11 });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileNameVin =
        summaryMap.VIN?.replace(/[^A-Za-z0-9]/g, "") ||
        vinData?.vin?.replace(/[^A-Za-z0-9]/g, "") ||
        vehicleSpecs?.vin?.replace(/[^A-Za-z0-9]/g, "");
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameVin
        ? `${fileNameVin}-build-sheet.pdf`
        : "build-sheet.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Build sheet PDF downloaded.");
    } catch (error) {
      console.error("Error exporting build sheet PDF", error);
      toast.error("Failed to generate build sheet PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [
    vehicleSpecs,
    vinData,
    resolvedVehicleTitle,
    summaryRows,
    summaryMap,
    resolvedSections,
    parsedInstalledOptions,
    baseMsrp,
    destinationCharge,
    optionsTotal,
    totalPriceValue,
    mpgCity,
    mpgHighway,
  ]);

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
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? "Generating…" : "Export PDF"}
            </Button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr] gap-8 py-6 flex-1">
            {/* Left Panel */}
            <div className="flex flex-col space-y-8 overflow-hidden">
              <div className="grid grid-cols-2 gap-y-1 text-xs leading-snug">
                {summaryRows.map((row) => (
                  <div key={row.label}>
                    <span className="font-semibold text-gray-900">
                      {row.label}:
                    </span>
                    <span className="text-gray-700 ml-2">{row.value}</span>
                  </div>
                ))}
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
                      {resolvedSections.mechanical.map((item, idx) => (
                        <li key={idx}>• {formatOptionText(item)}</li>
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
                      {resolvedSections.exterior.map((item, idx) => (
                        <li key={idx}>• {formatOptionText(item)}</li>
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
                      {resolvedSections.interior.map((item, idx) => (
                        <li key={idx}>• {formatOptionText(item)}</li>
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
                      {resolvedSections.safety.map((item, idx) => (
                        <li key={idx}>• {formatOptionText(item)}</li>
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
                      {resolvedSections.entertainment.map((item, idx) => (
                        <li key={idx}>• {formatOptionText(item)}</li>
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
                      {mpgCity ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Highway MPG
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {mpgHighway ?? "—"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Actual mileage will vary with options, driving conditions,
                  driving habits and vehicle's condition
                </p>
              </div>

              <div
                className="border border-gray-900 rounded-lg p-4 flex flex-col"
                style={{ minHeight: "fit-content" }}
              >
                <h3 className="font-semibold tracking-wide text-gray-900 mb-3">
                  INSTALLED OPTIONS
                </h3>
                <div className="text-[13px] space-y-1 max-h-48 overflow-y-auto">
                  {parsedInstalledOptions.length > 0 ? (
                    parsedInstalledOptions.map((opt, idx) => (
                      <div
                        key={`${opt.code}-${idx}`}
                        className="flex justify-between"
                      >
                        <span className="text-gray-700">
                          {opt.code ? `${formatOptionText(opt.code)} ` : ""}
                          {formatOptionText(opt.label)}
                        </span>
                        <span className="font-semibold">
                          {typeof opt.price === "number"
                            ? formatCurrency(opt.price)
                            : "—"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No installed options data available
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center border-t border-gray-900 pt-4 mt-4">
                  <span className="text-lg font-semibold text-gray-900">
                    TOTAL PRICE
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalPriceValue || 0)}
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
