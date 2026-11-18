import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  BookOpen,
  Clock,
  Hammer,
  Hand,
  Headphones,
  Layers,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { BeatVisualizer } from "@/components/rhythm-lab/BeatVisualizer";
import { MetronomeStudio } from "@/components/rhythm-lab/MetronomeStudio";
import { RhythmConstructor } from "@/components/rhythm-lab/RhythmConstructor";
import { RhythmDictationStudio } from "@/components/rhythm-lab/RhythmDictationStudio";
import { RhythmExplorer } from "@/components/rhythm-lab/RhythmExplorer";
import { RhythmPerformanceStudio } from "@/components/rhythm-lab/RhythmPerformanceStudio";
import { RhythmPlaybackView } from "@/components/rhythm-lab/RhythmPlaybackView";
import { RhythmPracticeCenter } from "@/components/rhythm-lab/RhythmPracticeCenter";
import { RhythmTheoryGuide } from "@/components/rhythm-lab/RhythmTheoryGuide";
import { TimeSignatureStudio } from "@/components/rhythm-lab/TimeSignatureStudio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/rhythm")({
  head: () => ({
    meta: [{ title: "Rhythm Laboratory · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerRhythmPage,
});

type RhythmTab =
  | "explorer"
  | "signatures"
  | "visualizer"
  | "playback"
  | "constructor"
  | "metronome"
  | "performance"
  | "dictation"
  | "practice"
  | "theory";

const LAB_TABS: {
  id: RhythmTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "explorer", label: "Rhythm Explorer", icon: Clock },
  { id: "signatures", label: "Time Signatures", icon: Layers },
  { id: "visualizer", label: "Beat Visualizer", icon: Activity },
  { id: "playback", label: "Rhythm Playback", icon: Play },
  { id: "constructor", label: "Measure Builder", icon: Hammer },
  { id: "metronome", label: "Metronome", icon: Bell },
  { id: "performance", label: "Tap & Clap Trainer", icon: Hand },
  { id: "dictation", label: "Aural Dictation", icon: Headphones },
  { id: "practice", label: "Practice Centre", icon: Trophy },
  { id: "theory", label: "Theory Guide", icon: BookOpen },
];

function LearnerRhythmPage() {
  const [activeTab, setActiveTab] = useState<RhythmTab>("explorer");

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 5: Rhythm Laboratory"
        message="Sample-accurate Web Audio clock scheduling, animated beat visualizers, interactive measure capacity validation, and tap performance evaluation are active."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 5"
          title="Rhythm Laboratory"
          description="Master note and rest durations, simple and compound time signatures, metric accent hierarchies, syncopation, and practical rhythm performance."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Sparkles className="size-3.5 text-crimson-deep" />
          <span>Web Audio Clock · VexFlow Engraving · Real-Time Tap Tracking</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1"
          aria-label="Rhythm Laboratory Sections"
        >
          {LAB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "border-crimson text-crimson-deep font-semibold"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-4", isActive ? "text-crimson" : "text-muted-foreground")}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "explorer" && <RhythmExplorer />}
        {activeTab === "signatures" && <TimeSignatureStudio />}
        {activeTab === "visualizer" && <BeatVisualizer />}
        {activeTab === "playback" && <RhythmPlaybackView />}
        {activeTab === "constructor" && <RhythmConstructor />}
        {activeTab === "metronome" && <MetronomeStudio />}
        {activeTab === "performance" && <RhythmPerformanceStudio />}
        {activeTab === "dictation" && <RhythmDictationStudio />}
        {activeTab === "practice" && <RhythmPracticeCenter />}
        {activeTab === "theory" && <RhythmTheoryGuide />}
      </div>
    </div>
  );
}
