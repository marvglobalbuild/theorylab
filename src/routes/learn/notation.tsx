import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

import { Staff } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { TREBLE_READING, displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";

export const Route = createFileRoute("/learn/notation")({
  head: () => ({
    meta: [{ title: "Notation Lab · Learner Studio — THEORYLAB" }],
  }),
  component: LearnerNotationPage,
});

function LearnerNotationPage() {
  const piano = usePiano();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const chords = TREBLE_READING.map((item) => ({ keys: [item.note], duration: "q" as const }));
  const current = TREBLE_READING[selectedIndex] ?? TREBLE_READING[0]!;

  const selectNote = (index: number) => {
    setSelectedIndex(index);
    const target = TREBLE_READING[index];
    if (!target) return;
    piano.playPhrase([{ notes: [target.note], at: 0, duration: 0.9 }]);
  };

  const playScale = () => {
    const steps: PhraseStep[] = TREBLE_READING.map((item, i) => ({
      notes: [item.note],
      at: i * 0.42,
      duration: i === TREBLE_READING.length - 1 ? 1.1 : 0.45,
    }));
    piano.playPhrase(steps, (s) => {
      if (!s) return;
      const idx = steps.indexOf(s);
      if (idx >= 0) setSelectedIndex(idx);
    });
  };

  return (
    <div className="space-y-8">
      <PreviewNotice
        title="Notation reading workspace"
        message="Tap any note on the VexFlow staff below to hear its pitch and inspect its treble staff placement."
      />

      <PageHeader
        eyebrow="Music Notation Lab"
        title="Treble staff reading"
        description="Read pitch positions from middle C up to C5 on the engraved treble staff."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow text-muted-foreground">Treble clef · C4 to C5</span>
            <Button type="button" size="sm" onClick={playScale}>
              <Play className="size-3.5" aria-hidden /> Play full scale
            </Button>
          </div>
          <Staff
            chords={chords}
            height={170}
            selectedIndex={selectedIndex}
            onSelect={selectNote}
            label="Treble staff showing notes C4 through C5"
          />
        </div>

        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-5">
          <div>
            <p className="eyebrow text-crimson-deep">Selected pitch</p>
            <p className="mt-3 font-display text-5xl leading-none text-foreground">
              {displayNote(current.note)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{current.position}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                selectNote((selectedIndex - 1 + TREBLE_READING.length) % TREBLE_READING.length)
              }
            >
              <ChevronLeft className="size-4" aria-hidden /> Previous note
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selectNote((selectedIndex + 1) % TREBLE_READING.length)}
            >
              Next note <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
