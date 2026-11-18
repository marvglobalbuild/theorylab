import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  BookOpen,
  Compass,
  FileMusic,
  GraduationCap,
  Layers,
  Repeat,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { ChordExplorer } from "@/components/harmony-lab/ChordExplorer";
import { ChordInversionsView } from "@/components/harmony-lab/ChordInversionsView";
import { ChordProgressionsView } from "@/components/harmony-lab/ChordProgressionsView";
import { HarmonyPracticeCenter } from "@/components/harmony-lab/HarmonyPracticeCenter";
import { HarmonyTheoryGuide } from "@/components/harmony-lab/HarmonyTheoryGuide";
import { RomanNumeralAnalysisView } from "@/components/harmony-lab/RomanNumeralAnalysisView";
import { VoiceLeadingSATBView } from "@/components/harmony-lab/VoiceLeadingSATBView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/harmony")({
  head: () => ({
    meta: [{ title: "Interactive Harmony Studio · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerHarmonyPage,
});

type HarmonyTab =
  | "explorer"
  | "inversions"
  | "progressions"
  | "roman"
  | "satb"
  | "practice"
  | "theory";

const LAB_TABS: {
  id: HarmonyTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "explorer", label: "Chord Explorer", icon: Compass },
  { id: "inversions", label: "Inversions & Figured Bass", icon: ArrowUpDown },
  { id: "progressions", label: "Progressions & Cadences", icon: Repeat },
  { id: "roman", label: "Roman Numeral Analysis", icon: Layers },
  { id: "satb", label: "SATB Voice Leading", icon: Users },
  { id: "practice", label: "Practice Centre", icon: Trophy },
  { id: "theory", label: "Theory Guide", icon: BookOpen },
];

function LearnerHarmonyPage() {
  const [activeTab, setActiveTab] = useState<HarmonyTab>("explorer");

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 4: Harmony Studio"
        message="Polyphonic tertian chord construction, figured bass inversions, progression realization, and automated 4-part SATB voice leading checks are active."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 4"
          title="Interactive Harmony Studio"
          description="Explore tertian chord construction, inversions with figured bass, functional diatonic progressions, and classical SATB voice leading with automated rule diagnostics."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Sparkles className="size-3.5 text-crimson-deep" />
          <span>Polyphonic Audio · Grand Staff Engraving · Voice Leading Rule Engine</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1"
          aria-label="Harmony Studio Sections"
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
        {activeTab === "explorer" && <ChordExplorer />}
        {activeTab === "inversions" && <ChordInversionsView />}
        {activeTab === "progressions" && <ChordProgressionsView />}
        {activeTab === "roman" && <RomanNumeralAnalysisView />}
        {activeTab === "satb" && <VoiceLeadingSATBView />}
        {activeTab === "practice" && <HarmonyPracticeCenter />}
        {activeTab === "theory" && <HarmonyTheoryGuide />}
      </div>
    </div>
  );
}
