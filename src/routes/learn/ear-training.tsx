import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  FileMusic,
  Headphones,
  Layers,
  Music,
  Music2,
  Sparkles,
  Trophy,
  Waves,
} from "lucide-react";
import { useState } from "react";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { ChordRecognitionView } from "@/components/ear-training-lab/ChordRecognitionView";
import { EarTrainingOverview } from "@/components/ear-training-lab/EarTrainingOverview";
import { EarTrainingPracticeCenter } from "@/components/ear-training-lab/EarTrainingPracticeCenter";
import { EarTrainingTheoryGuide } from "@/components/ear-training-lab/EarTrainingTheoryGuide";
import { HarmonicListeningView } from "@/components/ear-training-lab/HarmonicListeningView";
import { IntervalRecognitionView } from "@/components/ear-training-lab/IntervalRecognitionView";
import { MelodicDictationView } from "@/components/ear-training-lab/MelodicDictationView";
import { PitchRecognitionView } from "@/components/ear-training-lab/PitchRecognitionView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/ear-training")({
  head: () => ({
    meta: [{ title: "Ear Training Studio · Interactive Labs — THEORYLAB" }],
  }),
  component: LearnerEarTrainingPage,
});

type EarTrainingTab =
  | "overview"
  | "pitch"
  | "intervals"
  | "chords"
  | "dictation"
  | "harmony"
  | "practice"
  | "theory";

const LAB_TABS: {
  id: EarTrainingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview & Setup", icon: Compass },
  { id: "pitch", label: "Pitch Recognition", icon: Music },
  { id: "intervals", label: "Interval Recognition", icon: Waves },
  { id: "chords", label: "Chord Qualities", icon: Layers },
  { id: "dictation", label: "Melodic Dictation", icon: FileMusic },
  { id: "harmony", label: "Harmonic Listening", icon: Music2 },
  { id: "practice", label: "Practice Centre", icon: Trophy },
  { id: "theory", label: "Theory Guide", icon: BookOpen },
];

function LearnerEarTrainingPage() {
  const [activeTab, setActiveTab] = useState<EarTrainingTab>("overview");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Beginner",
  );
  const [sessionStats, setSessionStats] = useState({
    attempts: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const handleResetSessionStats = () => {
    setSessionStats({
      attempts: 0,
      correct: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <PreviewNotice
        title="Interactive Music Labs · Module 6: Ear Training Studio"
        message="Aural perception training, interval identification, chord quality discrimination, interactive melodic dictation, and harmonic listening drills are active."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Interactive Music Labs · Module 6"
          title="Ear Training Studio"
          description="Cultivate academic relative pitch through structured listening exercises: pitch discrimination, all 13 intervals, chord qualities, melodic dictation, and cadential harmony."
        />

        <div className="flex items-center gap-2 rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Headphones className="size-3.5 text-crimson-deep" />
          <span>Interactive Audio · Virtual Piano Input · Academic Dictation Engine</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto pb-1"
          aria-label="Ear Training Studio Sections"
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
          <EarTrainingOverview
            level={difficulty}
            onChangeLevel={setDifficulty}
            sessionStats={sessionStats}
            onResetStats={handleResetSessionStats}
            onSelectSection={(section: string) => {
              if (
                section === "pitch" ||
                section === "intervals" ||
                section === "chords" ||
                section === "dictation" ||
                section === "harmony" ||
                section === "practice" ||
                section === "theory"
              ) {
                setActiveTab(section);
              }
            }}
          />
        )}
        {activeTab === "pitch" && <PitchRecognitionView difficulty={difficulty} />}
        {activeTab === "intervals" && <IntervalRecognitionView difficulty={difficulty} />}
        {activeTab === "chords" && <ChordRecognitionView difficulty={difficulty} />}
        {activeTab === "dictation" && <MelodicDictationView difficulty={difficulty} />}
        {activeTab === "harmony" && <HarmonicListeningView difficulty={difficulty} />}
        {activeTab === "practice" && (
          <EarTrainingPracticeCenter initialDifficulty={difficulty} />
        )}
        {activeTab === "theory" && <EarTrainingTheoryGuide />}
      </div>
    </div>
  );
}
