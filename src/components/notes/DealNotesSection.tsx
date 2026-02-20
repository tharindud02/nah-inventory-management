"use client";

import { FileText, AtSign, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteItem } from "./NoteItem";
import type { RoleVariant } from "./RoleBadge";
import { cn } from "@/lib/utils";

export interface DealNote {
  id: string;
  authorName: string;
  authorInitials: string;
  role: string;
  roleVariant?: RoleVariant;
  timestamp: string;
  content: string;
  showActions?: boolean;
}

export interface DealNotesSectionProps {
  notes: DealNote[];
  onAddNote?: () => void;
  onTagMember?: () => void;
  onNoteEdit?: (note: DealNote) => void;
  onNoteDelete?: (noteId: string) => void;
  className?: string;
}

export function DealNotesSection({
  notes,
  onAddNote,
  onTagMember,
  onNoteEdit,
  onNoteDelete,
  className,
}: DealNotesSectionProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900">Deal Notes</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTagMember}
            className="gap-2"
          >
            <AtSign className="h-4 w-4" aria-hidden />
            Tag Team Member
          </Button>
          <Button size="sm" onClick={onAddNote} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden />
            Add Note
          </Button>
        </div>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto px-6 py-6">
        <div className="space-y-0">
          {notes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm">No notes yet. Add your first note to get started.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="group relative">
                <NoteItem
                  authorName={note.authorName}
                  authorInitials={note.authorInitials}
                  role={note.role}
                  roleVariant={note.roleVariant}
                  timestamp={note.timestamp}
                  content={note.content}
                  showActions={note.showActions}
                />
                {(onNoteEdit || onNoteDelete) && (
                  <div className="absolute top-4 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onNoteEdit && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onNoteEdit(note)}
                        className="h-8 w-8"
                        aria-label="Edit note"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onNoteDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onNoteDelete(note.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
