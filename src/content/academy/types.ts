import type { StaffClef, StaffChord } from "@/components/music/Staff";
import type { PhraseStep } from "@/lib/music/usePiano";

export type AcademyLevel = "beginner" | "elementary" | "intermediate" | "advanced";

export interface AcademyNotationExample {
  clef?: StaffClef | undefined;
  keySignature?: string | undefined;
  timeSignature?: string | undefined;
  chords: StaffChord[];
  beamNotes?: boolean | undefined;
  tuplet?: { start: number; end: number; numNotes?: number | undefined } | undefined;
  label: string;
  caption: string;
}

export interface AcademyLessonSection {
  id: string;
  heading: string;
  body: string[];
  notation?: AcademyNotationExample | undefined;
  audioSteps?: PhraseStep[] | undefined;
  audioLabel?: string | undefined;
}

export interface AcademyWorkedExample {
  title: string;
  scenario: string;
  steps: string[];
  conclusion: string;
  notation?: AcademyNotationExample | undefined;
  audioSteps?: PhraseStep[] | undefined;
  audioLabel?: string | undefined;
}

export interface AcademyRepertoireExample {
  composer: string;
  work: string;
  barReference: string;
  insight: string;
  audioSteps?: PhraseStep[] | undefined;
  audioLabel?: string | undefined;
}

export interface AcademyPracticeQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
  notation?: AcademyNotationExample | undefined;
  audioSteps?: PhraseStep[] | undefined;
  audioLabel?: string | undefined;
}

export interface AcademyLessonContent {
  slug: string;
  title: string;
  summary: string;
  learningPathSlug: string;
  courseSlug: string;
  moduleSlug: string;
  level: AcademyLevel;
  estimatedMinutes: number;
  sortOrder: number;
  objectives: string[];
  sections: AcademyLessonSection[];
  repertoireExample: AcademyRepertoireExample;
  workedExample: AcademyWorkedExample;
  practiceActivities: AcademyPracticeQuestion[];
  summaryText: string;
  keyTakeaways: string[];
}

export interface AcademyModuleDefinition {
  slug: string;
  courseSlug: string;
  learningPathSlug: string;
  title: string;
  summary: string;
  sortOrder: number;
}

export interface AcademyCourseDefinition {
  slug: string;
  learningPathSlug: string;
  title: string;
  description: string;
  level: AcademyLevel;
  sortOrder: number;
  estimatedMinutes: number;
}

export interface AcademyPathDefinition {
  slug: string;
  numeral: string;
  title: string;
  summary: string;
  level: AcademyLevel;
  sortOrder: number;
}
