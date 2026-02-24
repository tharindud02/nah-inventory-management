import React from "react";

interface LinearGaugeProps {
  min: number;
  max: number;
  value: number;
  fairBuyLabel?: string;
  averageLabel?: string;
  premiumLabel?: string;
  priceRangeLabel?: string;
  formatCompactCurrency?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  indicatorColor?: string;
}

export const LinearGauge: React.FC<LinearGaugeProps> = ({
  min,
  max,
  value,
  fairBuyLabel = "Fair Buy",
  averageLabel = "Average",
  premiumLabel = "Premium",
  priceRangeLabel = "Retail Price Range",
  formatCompactCurrency = (v) => `$${(v / 1000).toFixed(1)}K`,
  minLabel,
  maxLabel,
  gradientFrom = "from-green-400",
  gradientVia = "via-yellow-300",
  gradientTo = "to-pink-400",
  indicatorColor = "border-white",
}) => {
  const calculatePercent = () => {
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {priceRangeLabel}
        </span>
        <span className="text-xs font-semibold text-blue-700">
          {`${formatCompactCurrency(min)} - ${formatCompactCurrency(max)}`}
        </span>
      </div>
      <div className="flex justify-between text-[11px] uppercase tracking-wide font-semibold mt-2 text-gray-500">
        <span className="text-green-600">{fairBuyLabel}</span>
        <span>{averageLabel}</span>
        <span className="text-pink-600">{premiumLabel}</span>
      </div>
      <div className="relative mt-3 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`absolute inset-0 bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
        ></div>
        <div
          className={`absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full border-2 ${indicatorColor} shadow-md`}
          style={{ left: `${calculatePercent()}%` }}
        ></div>
      </div>
    </div>
  );
};
