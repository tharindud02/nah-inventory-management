"use client";

import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Clock,
  Plus,
  TrendingUp,
  Info,
  ArrowUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReconCategoryModal } from "./ReconCategoryModal";
import { ReconDeleteConfirmDialog } from "./ReconDeleteConfirmDialog";

export interface ReconItem {
  id: string;
  category: string;
  description: string;
  cost: number;
}

export interface CostAnalysisTabContentProps {
  purchasePrice?: number;
  buyerFee?: number;
  shipping?: number;
  otherFees?: number;
  reconItems?: ReconItem[];
  targetSalePrice?: number;
  turnTime?: number;
  marketAverage?: number;
  marketHigh?: number;
  marketLow?: number;
  velocity?: number;
  projectedTurn?: number;
  sourcingIntel?: string;
  onPurchasePriceChange?: (value: number) => void;
  onBuyerFeeChange?: (value: number) => void;
  onShippingChange?: (value: number) => void;
  onOtherFeesChange?: (value: number) => void;
  onReconItemChange?: (itemId: string, cost: number) => void;
  onAddReconCategory?: () => void;
  onReconCategoryAdd?: (item: ReconItem) => void;
  onReconCategoryEdit?: (item: ReconItem) => void;
  onReconCategoryDelete?: (itemId: string) => void;
  onAddCustomRecon?: () => void;
}

export function CostAnalysisTabContent({
  purchasePrice = 43560,
  buyerFee = 450,
  shipping = 850,
  otherFees = 0,
  reconItems = [
    { id: "1", category: "INTERIOR DETAIL", description: "Full Steam & Clean", cost: 180 },
    { id: "2", category: "MECHANICAL", description: "Oil & Filter Change", cost: 350 },
    { id: "3", category: "PAINT & BODY", description: "Bumper Respray", cost: 250 },
  ],
  targetSalePrice = 48100,
  turnTime = 22,
  marketAverage = 48500,
  marketHigh = 50200,
  marketLow = 46800,
  velocity = 92,
  projectedTurn = 22,
  sourcingIntel = "Priced $1,200 below national average. Market Demand: High.",
  onPurchasePriceChange,
  onBuyerFeeChange,
  onShippingChange,
  onOtherFeesChange,
  onReconItemChange,
  onAddReconCategory,
  onReconCategoryAdd,
  onReconCategoryEdit,
  onReconCategoryDelete,
  onAddCustomRecon,
}: CostAnalysisTabContentProps) {
  const [localPurchasePrice, setLocalPurchasePrice] = useState(purchasePrice);
  const [localBuyerFee, setLocalBuyerFee] = useState(buyerFee);
  const [localShipping, setLocalShipping] = useState(shipping);
  const [localOtherFees, setLocalOtherFees] = useState(otherFees);
  const [localReconItems, setLocalReconItems] = useState(reconItems);

  const totalAcquisition = useMemo(() => {
    return localPurchasePrice + localBuyerFee + localShipping + localOtherFees;
  }, [localPurchasePrice, localBuyerFee, localShipping, localOtherFees]);

  const totalRecon = useMemo(() => {
    return localReconItems.reduce((sum, item) => sum + item.cost, 0);
  }, [localReconItems]);

  const totalAllInCost = useMemo(() => {
    return totalAcquisition + totalRecon;
  }, [totalAcquisition, totalRecon]);

  const netMargin = useMemo(() => {
    return targetSalePrice - totalAllInCost;
  }, [targetSalePrice, totalAllInCost]);

  const roi = useMemo(() => {
    if (totalAllInCost === 0) return 0;
    return ((netMargin / totalAllInCost) * 100).toFixed(1);
  }, [netMargin, totalAllInCost]);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ReconItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ReconItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleReconCostChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalReconItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, cost: numValue } : item)),
    );
    onReconItemChange?.(itemId, numValue);
  };

  const handleAddCategory = () => {
    setEditItem(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (item: ReconItem) => {
    setEditItem(item);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (data: Omit<ReconItem, "id"> & { id?: string }) => {
    if (data.id) {
      setLocalReconItems((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                category: data.category,
                description: data.description,
                cost: data.cost,
              }
            : item,
        ),
      );
      onReconCategoryEdit?.({
        id: data.id,
        category: data.category,
        description: data.description,
        cost: data.cost,
      });
    } else {
      const newId = `recon-${Date.now()}`;
      const newItem: ReconItem = {
        id: newId,
        category: data.category,
        description: data.description,
        cost: data.cost,
      };
      setLocalReconItems((prev) => [...prev, newItem]);
      onReconCategoryAdd?.(newItem);
      onAddReconCategory?.();
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (item: ReconItem) => {
    setDeleteItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      setLocalReconItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      onReconCategoryDelete?.(deleteItem.id);
      setDeleteItem(null);
    }
    setDeleteConfirmOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* 3-column layout: Col1 TOTAL ACQ + ACQ COSTS | Col2 TOTAL RECON + RECON | Col3 TOTAL ALL-IN + EST. NET MARGIN + PROFITABILITY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: TOTAL ACQUISITION + ACQUISITION COSTS */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              TOTAL ACQUISITION
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(totalAcquisition)}
            </p>
            <p className="mt-1 text-sm text-gray-500">(LANDED)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                ACQUISITION COSTS
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  PURCHASE PRICE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    value={localPurchasePrice}
                    readOnly
                    className="pl-7 font-mono bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  BUYER FEE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    value={localBuyerFee}
                    readOnly
                    className="pl-7 font-mono bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  SHIPPING
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    value={localShipping}
                    readOnly
                    className="pl-7 font-mono bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  OTHER FEES
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    value={localOtherFees}
                    readOnly
                    className="pl-7 font-mono bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: TOTAL RECON + RECON ESTIMATION */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              TOTAL RECON
            </p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(totalRecon)}
            </p>
            <p className="mt-1 text-sm text-gray-500">(EST.)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  RECON ESTIMATION
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddCustomRecon}
                className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                CUSTOM
              </Button>
            </div>
            <div className="space-y-4">
              {localReconItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.category}
                    </span>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        $
                      </span>
                      <Input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleReconCostChange(item.id, e.target.value)}
                        className="pl-6 font-mono text-sm"
                      />
                    </div>
                    <span className="text-xs font-semibold text-amber-600">
                      {formatCurrency(item.cost)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleEditCategory(item)}
                      aria-label="Edit category"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteCategory(item)}
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                ADD CATEGORY
              </Button>
            </div>
          </div>
        </div>

        {/* Column 3: TOTAL ALL-IN COST + EST. NET MARGIN + PROFITABILITY MATRIX */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border-2 border-gray-800 bg-gray-800 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-300">
              TOTAL ALL-IN COST
            </p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(totalAllInCost)}
            </p>
          </div>

          {/* Est. Net Margin - values 0 for now */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            EST. NET MARGIN
          </p>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-900">
              {formatCurrency(0)}
            </p>
            <p className="text-lg font-semibold text-emerald-700">0% ROI</p>
          </div>
          <div className="space-y-2 border-t border-emerald-200 pt-4">
            <p className="text-sm text-emerald-800">
              TARGET SALE {formatCurrency(0)}
            </p>
            <p className="text-sm text-emerald-800">TURN TIME 0 Days</p>
          </div>
          </div>

          {/* Profitability Matrix - values 0 for now */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                PROFITABILITY MATRIX
              </h3>
            </div>
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MARKET AVERAGE</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-800">
                  {formatCurrency(0)}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  +{formatCurrency(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MARKET HIGH</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-800">
                  {formatCurrency(0)}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  +{formatCurrency(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MARKET LOW</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-800">
                  {formatCurrency(0)}
                </span>
                <span className="text-sm font-semibold text-amber-600">
                  +{formatCurrency(0)}
                </span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <ReconCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        item={editItem}
        onSave={handleSaveCategory}
      />
      <ReconDeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        categoryName={deleteItem?.category ?? ""}
        onConfirm={handleConfirmDelete}
      />

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-64 right-0 z-10 border-t border-gray-800 bg-gray-800 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">SOURCING INTEL INSIGHTS</span>
            </div>
            <p className="text-sm">{sourcingIntel}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold">VELOCITY {velocity}/100</p>
              <p className="text-xs text-gray-300">PROJECTED TURN {projectedTurn} Days</p>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
