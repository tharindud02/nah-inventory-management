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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DealNote } from "./DealNotesSection";
import type { RoleVariant } from "./RoleBadge";

export interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: DealNote | null;
  onSave: (note: Omit<DealNote, "id"> & { id?: string }) => void;
}

const ROLE_OPTIONS: Array<{ value: string; variant: RoleVariant }> = [
  { value: "ACQUISITION", variant: "acquisition" },
  { value: "SERVICE", variant: "service" },
  { value: "MANAGER", variant: "manager" },
];

export function NoteFormModal({
  open,
  onOpenChange,
  note,
  onSave,
}: NoteFormModalProps) {
  const [content, setContent] = useState("");
  const [role, setRole] = useState("ACQUISITION");
  const [roleVariant, setRoleVariant] = useState<RoleVariant>("acquisition");

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setRole(note.role);
      setRoleVariant(note.roleVariant || "acquisition");
    } else {
      setContent("");
      setRole("ACQUISITION");
      setRoleVariant("acquisition");
    }
  }, [note, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const m = mins < 10 ? `0${mins}` : mins;
    const timestamp = note?.timestamp || `${h}:${m} ${ampm} Today`;

    const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === role);

    onSave({
      id: note?.id,
      authorName: note?.authorName || "Current User",
      authorInitials: note?.authorInitials || "CU",
      role,
      roleVariant: selectedRoleOption?.variant || "acquisition",
      timestamp,
      content: content.trim(),
      showActions: true,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                const selected = ROLE_OPTIONS.find((r) => r.value === e.target.value);
                if (selected) setRoleVariant(selected.variant);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter your note here..."
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              {note ? "Update Note" : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
