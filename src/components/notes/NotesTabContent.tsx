"use client";

import { DealNotesSection } from "./DealNotesSection";
import { InternalStrategySidebar } from "./InternalStrategySidebar";
import type { DealNote } from "./DealNotesSection";
import type { PriorityFlag } from "./InternalStrategySidebar";

export interface NotesTabContentProps {
  notes: DealNote[];
  negotiationGoals: string[];
  maxBidLimit: string;
  reconBudget: string;
  totalAllInCost: string;
  exitStrategy: string;
  priorityFlags: PriorityFlag[];
  onAddNote?: () => void;
  onTagMember?: () => void;
  onNoteEdit?: (note: DealNote) => void;
  onNoteDelete?: (noteId: string) => void;
  onSaveStrategy?: (data: {
    maxBidLimit: string;
    reconBudget: string;
    exitStrategy: string;
    priorityFlags: PriorityFlag[];
  }) => void;
}

export function NotesTabContent({
  notes,
  negotiationGoals,
  maxBidLimit,
  reconBudget,
  totalAllInCost,
  exitStrategy,
  priorityFlags,
  onAddNote,
  onTagMember,
  onNoteEdit,
  onNoteDelete,
  onSaveStrategy,
}: NotesTabContentProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <DealNotesSection
          notes={notes}
          onAddNote={onAddNote}
          onTagMember={onTagMember}
          onNoteEdit={onNoteEdit}
          onNoteDelete={onNoteDelete}
        />
      </div>
      <InternalStrategySidebar
        negotiationGoals={negotiationGoals}
        maxBidLimit={maxBidLimit}
        reconBudget={reconBudget}
        totalAllInCost={totalAllInCost}
        exitStrategy={exitStrategy}
        priorityFlags={priorityFlags}
        onSave={onSaveStrategy}
      />
    </div>
  );
}
