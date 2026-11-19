import { createFileRoute } from "@tanstack/react-router";
import {
  Compass,
  FileMusic,
  Headphones,
  Layers,
  Music,
  Piano,
  Sliders,
  Sparkles,
  Trophy,
  Waves,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { IntervalExplorer } from "@/components/scales-intervals-lab/IntervalExplorer";
import { IntervalTrainer } from "@/components/scales-intervals-lab/IntervalTrainer";
import { PracticeAndChallenges } from "@/components/scales-intervals-lab/PracticeAndChallenges";
import { ScaleBuilder } from "@/components/scales-intervals-lab/ScaleBuilder";
import { ScaleExplorer } from "@/components/scales-intervals-lab/ScaleExplorer";
import { ScalesIntervalsOverview } from "@/components/scales-intervals-lab/ScalesIntervalsOverview";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/scales-intervals")({
  head: () => ({
    meta: [{ title: "Scales and Intervals Studio · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerScalesIntervalsPage,
});

type ScalesIntervalsTab =
  | "overview"
  | "scale-explorer"
  | "interval-explorer"
  | "scale-builder"
  | "interval-trainer"
  | "practice";

const LAB_TABS: {
  id: ScalesIntervalsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "scale-explorer", label: "Scale Explorer", icon: Sliders },
  { id: "interval-explorer", label: "Interval Explorer", icon: Waves },
  { id: "scale-builder", label: "Scale Builder", icon: Piano },
  { id: "interval-trainer", label: "Interval Trainer", icon: Headphones },
  { id: "practice", label: "Practice and Challenges", icon: Trophy },
];

function LearnerScalesIntervalsPage() {
  const [activeTab, setActiveTab] = useState<ScalesIntervalsTab>("overview");

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 3: Scales and Intervals Studio"
        message="Diatonic scales, modal systems, simple and compound intervals, interactive step-by-step construction, and aural ear drills are active."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 3"
          title="Scales and Intervals Studio"
          description="Master the building blocks of musical pitch: explore 16 diatonic and modal scales, analyze 17 simple and compound intervals, build scales interactively, and train your ear."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Sparkles className="size-3.5 text-crimson-deep" />
          <span>Interactive Audio · Virtual Piano Visualizer · Academic Enharmonic Engine</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1"
          aria-label="Scales and Intervals Sections"
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
                  "flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-2 text-xs sm:text-sm font-medium transition-colors",
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
        {activeTab === "overview" && (
          <ScalesIntervalsOverview
            onSelectStudioTab={(tab) => {
              if (
                tab === "scale-explorer" ||
                tab === "interval-explorer" ||
                tab === "scale-builder" ||
                tab === "interval-trainer" ||
                tab === "practice"
              ) {
                setActiveTab(tab);
              }
            }}
          />
        )}
        {activeTab === "scale-explorer" && <ScaleExplorer />}
        {activeTab === "interval-explorer" && <IntervalExplorer />}
        {activeTab === "scale-builder" && <ScaleBuilder />}
        {activeTab === "interval-trainer" && <IntervalTrainer />}
        {activeTab === "practice" && <PracticeAndChallenges />}
      </div>
    </div>
  );
}
