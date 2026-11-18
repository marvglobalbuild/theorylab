import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

import { Staff, type StaffClef, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InteractiveStaffViewProps {
  chords: StaffChord[];
  clef: StaffClef;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  label: string;
  height?: number;
  showStaffGuides?: boolean;
  onPlaySelected?: () => void;
  className?: string;
  emptyMessage?: string;
}

export function InteractiveStaffView({
  chords,
  clef,
  selectedIndex,
  onSelect,
  label,
  height = 180,
  showStaffGuides = false,
  onPlaySelected,
  className,
  emptyMessage = "No notes placed on staff yet.",
}: InteractiveStaffViewProps) {
  const [guidesVisible, setGuidesVisible] = useState(showStaffGuides);

  return (
    <div className={cn("relative rounded-[2px] border border-border bg-paper p-5", className)}>
      <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-muted-foreground">
            {clef.toUpperCase()} CLEF STAFF
          </span>
          <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            {chords.length} {chords.length === 1 ? "note/rest" : "notes/rests"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPlaySelected && selectedIndex !== null && selectedIndex !== undefined && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPlaySelected}
              className="h-7 text-xs"
            >
              <Volume2 className="mr-1 size-3.5" aria-hidden /> Hear note
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setGuidesVisible(!guidesVisible)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            {guidesVisible ? "Hide line guides" : "Show line guides"}
          </Button>
        </div>
      </div>

      {guidesVisible && (
        <div className="mb-2 rounded bg-muted/30 p-2 text-xs text-muted-foreground">
          {clef === "treble" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong className="text-foreground">Treble Lines (bottom → top):</strong> Line 1: E4, Line 2: G4, Line 3: B4, Line 4: D5, Line 5: F5 (<em>Every Good Boy Does Fine</em>)
              </div>
              <div>
                <strong className="text-foreground">Treble Spaces:</strong> Space 1: F4, Space 2: A4, Space 3: C5, Space 4: E5 (<em>F-A-C-E</em>)
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong className="text-foreground">Bass Lines (bottom → top):</strong> Line 1: G2, Line 2: B2, Line 3: D3, Line 4: F3, Line 5: A3 (<em>Good Boys Do Fine Always</em>)
              </div>
              <div>
                <strong className="text-foreground">Bass Spaces:</strong> Space 1: A2, Space 2: C3, Space 3: E3, Space 4: G3 (<em>All Cows Eat Grass</em>)
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto py-1">
        <Staff
          chords={chords}
          clef={clef}
          height={height}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          label={label}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}

