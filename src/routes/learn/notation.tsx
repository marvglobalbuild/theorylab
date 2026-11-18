import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Hammer,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { NotationConstructor } from "@/components/notation-lab/NotationConstructor";
import { NotationExplorer } from "@/components/notation-lab/NotationExplorer";
import { NotationGuidedExercises } from "@/components/notation-lab/NotationGuidedExercises";
import { NotationTheoryGuide } from "@/components/notation-lab/NotationTheoryGuide";
import { NotationTrainer } from "@/components/notation-lab/NotationTrainer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/notation")({
  head: () => ({
    meta: [{ title: "Music Notation Lab · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerNotationPage,
});

type NotationTab = "explorer" | "trainer" | "constructor" | "guided" | "theory";

const LAB_TABS: { id: NotationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "explorer", label: "Read & Inspect", icon: Compass },
  { id: "trainer", label: "Note Trainer", icon: Trophy },
  { id: "constructor", label: "Note Builder", icon: Hammer },
  { id: "guided", label: "Guided Practice", icon: GraduationCap },
  { id: "theory", label: "Theory Guide", icon: BookOpen },
];

function LearnerNotationPage() {
  const [activeTab, setActiveTab] = useState<NotationTab>("explorer");

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 1: Notation"
        message="Full interactive VexFlow staff engraving and Tone.js sound synthesis are active. All exercises, note placement, and pitch identification operate in real-time."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 1"
          title="Music Notation Lab"
          description="Read, identify, construct, and master pitch notation across Treble and Bass staves with interactive engraving and audio feedback."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Sparkles className="size-3.5 text-crimson-deep" />
          <span>VexFlow + Web Audio Synthesis Active</span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1" aria-label="Notation Lab Sections">
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
                <Icon className={cn("size-4", isActive ? "text-crimson" : "text-muted-foreground")} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "explorer" && <NotationExplorer />}
        {activeTab === "trainer" && <NotationTrainer />}
        {activeTab === "constructor" && <NotationConstructor />}
        {activeTab === "guided" && <NotationGuidedExercises />}
        {activeTab === "theory" && <NotationTheoryGuide />}
      </div>
    </div>
  );
}
