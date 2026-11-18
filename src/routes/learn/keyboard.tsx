import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Keyboard,
  Piano,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { KeyboardExplorer } from "@/components/keyboard-lab/KeyboardExplorer";
import { KeyboardTheoryGuide } from "@/components/keyboard-lab/KeyboardTheoryGuide";
import { KeyboardTrainer } from "@/components/keyboard-lab/KeyboardTrainer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/keyboard")({
  head: () => ({
    meta: [{ title: "Virtual Piano Keyboard · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerKeyboardPage,
});

type KeyboardTab = "explorer" | "trainer" | "theory";

const LAB_TABS: { id: KeyboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "explorer", label: "Interactive Keyboard", icon: Piano },
  { id: "trainer", label: "Keyboard Trainer", icon: Trophy },
  { id: "theory", label: "Theory & Shortcuts", icon: BookOpen },
];

function LearnerKeyboardPage() {
  const [activeTab, setActiveTab] = useState<KeyboardTab>("explorer");

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 2: Virtual Keyboard"
        message="Acoustic piano synthesis and polyphonic multi-octave touch response are active. Play via mouse, touch screen, or physical computer keyboard shortcuts."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 2"
          title="Virtual Piano Keyboard"
          description="Explore pitch geography, octaves, semitones, and enharmonics with a realistic, multi-octave interactive piano keyboard."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Sparkles className="size-3.5 text-crimson-deep" />
          <span>Polyphonic Audio Engine · A4 = 440 Hz</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1" aria-label="Keyboard Lab Sections">
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
        {activeTab === "explorer" && <KeyboardExplorer />}
        {activeTab === "trainer" && <KeyboardTrainer />}
        {activeTab === "theory" && <KeyboardTheoryGuide />}
      </div>
    </div>
  );
}
