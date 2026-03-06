"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReconItem } from "./CostAnalysisTabContent";

export interface ReconCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ReconItem | null;
  onSave: (item: Omit<ReconItem, "id"> & { id?: string }) => void;
}

export function ReconCategoryModal({
  open,
  onOpenChange,
  item,
  onSave,
}: ReconCategoryModalProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setDescription(item.description);
      setCost(item.cost);
    } else {
      setCategory("");
      setDescription("");
      setCost(0);
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) return;

    onSave({
      id: item?.id,
      category: category.trim().toUpperCase(),
      description: description.trim() || "—",
      cost: Number.isFinite(cost) ? cost : 0,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {item ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. INTERIOR DETAIL"
                className="uppercase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Full Steam & Clean"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                step={1}
                value={cost || ""}
                onChange={(e) => setCost(Number.parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!category.trim()}>
              {item ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
