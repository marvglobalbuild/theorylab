import { createFileRoute } from "@tanstack/react-router";

import { Instrument } from "@/components/music/Instrument";
import { EarTrainingDemo } from "@/components/sections/EarTrainingDemo";
import {
  PageHeader,
  PreviewNotice,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";

export const Route = createFileRoute("/learn/practice")({
  head: () => ({
    meta: [{ title: "Quick Practice · Learner Studio — THEORYLAB" }],
  }),
  component: LearnerPracticePage,
});

function LearnerPracticePage() {
  return (
    <div className="space-y-10">
      <PreviewNotice
        title="Live browser practice tools"
        message="Keyboard playback, VexFlow staff engraving and ear training work in real time in your browser. Practice session logging will activate once Supabase is connected."
      />

      <PageHeader
        eyebrow="Interactive Studio"
        title="Quick practice"
        description="Explore keyboard notes, treble staff positions, and intervals with Tone.js audio and engraved notation."
      />

      <SectionBlock
        title="Keyboard, Notation & Intervals"
        subtitle="Switch modes to play freely, inspect the C major scale, or compare intervals above middle C."
      >
        <Instrument />
      </SectionBlock>

      <SectionBlock
        title="Interval ear training"
        subtitle="Listen to rising intervals above middle C and identify each quality by ear."
      >
        <div className="rounded-[2px] border border-ink-border bg-ink p-6 text-ink-foreground md:p-8">
          <EarTrainingDemo />
        </div>
      </SectionBlock>
    </div>
  );
}
