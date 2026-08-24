"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  STAGE_META,
  TRACKER_STAGES,
  type TrackedJob,
  type TrackerBoard as Board,
  type TrackerStage,
} from "../api/tracker.api";
import { TrackerCard } from "./tracker-card";

interface TrackerBoardProps {
  board: Board;
  onMove: (id: string, stage: TrackerStage, position: number) => void;
  onEdit: (job: TrackedJob) => void;
  onArchive: (id: string) => void;
  onRemove: (id: string) => void;
}

/** What the pointer is currently over, so exactly one gap is shown. */
interface DropTarget {
  stage: TrackerStage;
  index: number;
}

/**
 * The Kanban board.
 *
 * NATIVE HTML5 DRAG-AND-DROP, no library. A Kanban board needs "pick a card up, drop it
 * in a column at an index", which the platform already does; the alternatives are a
 * dependency that is either unmaintained (react-beautiful-dnd) or considerably larger
 * than the feature (@dnd-kit).
 *
 * The cost is real and worth stating: HTML5 drag events do not fire on touch, so this is
 * a pointer-only interaction. Every card also opens an editor on click where the stage
 * can be changed from a select, which is what makes the board usable on a phone at all.
 */
export function TrackerBoard({ board, onMove, onEdit, onArchive, onRemove }: TrackerBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);

  const finish = () => {
    setDraggingId(null);
    setTarget(null);
  };

  const drop = (stage: TrackerStage, index: number) => {
    if (draggingId) onMove(draggingId, stage, index);
    finish();
  };

  return (
    // Columns FLEX to fill the width rather than sitting at a fixed size, so a wide
    // screen shows all five without the last one falling off the edge. `min-w` keeps
    // them readable and hands back horizontal scrolling once the viewport is too narrow
    // to give each column its minimum.
    <div className="flex gap-4 overflow-x-auto pb-4 items-stretch">
      {TRACKER_STAGES.map((stage) => {
        const cards = board.columns[stage] ?? [];
        const isTargetColumn = target?.stage === stage;

        return (
          <section
            key={stage}
            aria-label={STAGE_META[stage].title}
            onDragOver={(e) => {
              // Without preventDefault the browser refuses the drop outright.
              e.preventDefault();
              // Dragging over the column's padding, below the last card, means "append".
              if (!isTargetColumn) setTarget({ stage, index: cards.length });
            }}
            onDrop={(e) => {
              e.preventDefault();
              drop(stage, target?.stage === stage ? target.index : cards.length);
            }}
            className={cn(
              "flex-1 min-w-[17rem] rounded-xl p-4 transition-colors",
              isTargetColumn && "ring-2 ring-primary-300",
            )}
            style={{
              background: "var(--color-bg-secondary)",
              // Fills the space under the header instead of stopping short and leaving
              // the page half empty; still grows past this once a column fills up.
              minHeight: "calc(100vh - 15rem)",
            }}
          >
            <header className="px-1 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {STAGE_META[stage].title}
                </h2>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
                >
                  {cards.length}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                {STAGE_META[stage].blurb}
              </p>
            </header>

            <div className="space-y-2.5">
              {cards.map((job, index) => (
                <React.Fragment key={job.id}>
                  <DropGap active={isTargetColumn && target?.index === index} />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Past the midpoint means "after this card" — the standard rule, and
                      // without it the last slot in a column is unreachable.
                      const box = e.currentTarget.getBoundingClientRect();
                      const after = e.clientY > box.top + box.height / 2;
                      setTarget({ stage, index: after ? index + 1 : index });
                    }}
                  >
                    <TrackerCard
                      job={job}
                      dragging={draggingId === job.id}
                      onDragStart={(e) => {
                        setDraggingId(job.id);
                        e.dataTransfer.effectAllowed = "move";
                        // Firefox will not start a drag without data set.
                        e.dataTransfer.setData("text/plain", job.id);
                      }}
                      onDragEnd={finish}
                      onEdit={onEdit}
                      onArchive={onArchive}
                      onRemove={onRemove}
                    />
                  </div>
                </React.Fragment>
              ))}
              <DropGap active={isTargetColumn && target?.index === cards.length} />

              {cards.length === 0 && !isTargetColumn && (
                <p
                  className="text-xs text-center py-14 rounded-lg border-2 border-dashed"
                  style={{ color: "var(--color-text-disabled)", borderColor: "var(--color-border)" }}
                >
                  Drop a job here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** The line showing where the card will land. */
function DropGap({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-full transition-all", active ? "h-1.5 my-1" : "h-0")}
      style={{ background: active ? "var(--color-primary-500)" : "transparent" }}
    />
  );
}
