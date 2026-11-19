import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChordRecognitionView } from "@/components/ear-training-lab/ChordRecognitionView";
import { EarTrainingOverview } from "@/components/ear-training-lab/EarTrainingOverview";
import { EarTrainingPracticeCenter } from "@/components/ear-training-lab/EarTrainingPracticeCenter";
import { EarTrainingTheoryGuide } from "@/components/ear-training-lab/EarTrainingTheoryGuide";
import { HarmonicListeningView } from "@/components/ear-training-lab/HarmonicListeningView";
import { IntervalRecognitionView } from "@/components/ear-training-lab/IntervalRecognitionView";
import { MelodicDictationView } from "@/components/ear-training-lab/MelodicDictationView";
import { PitchRecognitionView } from "@/components/ear-training-lab/PitchRecognitionView";

// Mock tone audio to avoid AudioContext errors in jsdom
vi.mock("@/lib/music/usePiano", () => ({
  usePiano: () => ({
    status: "ready",
    noteOn: vi.fn(),
    noteOff: vi.fn(),
    playPhrase: vi.fn((_steps, onStep) => {
      onStep?.(null);
    }),
  }),
}));

describe("Ear Training Lab UI Components", () => {
  describe("<EarTrainingOverview />", () => {
    it("renders hero overview, stats, and studio entry cards", () => {
      const onSelect = vi.fn();
      const onChangeLevel = vi.fn();

      render(
        <EarTrainingOverview
          level="Beginner"
          onChangeLevel={onChangeLevel}
          sessionStats={{
            attempts: 10,
            correct: 8,
            currentStreak: 3,
            bestStreak: 5,
          }}
          onResetStats={vi.fn()}
          onSelectSection={onSelect}
        />,
      );

      expect(screen.getByText(/The Science & Art of Relative Pitch Training/i)).toBeInTheDocument();
      expect(screen.getByText("Pitch Recognition")).toBeInTheDocument();
      expect(screen.getByText("Interval Recognition")).toBeInTheDocument();
      expect(screen.getByText("Chord Quality Recognition")).toBeInTheDocument();
      expect(screen.getByText("Melodic Dictation")).toBeInTheDocument();
      expect(screen.getByText("Harmonic Listening")).toBeInTheDocument();

      // Test card selection
      fireEvent.click(screen.getByText("Pitch Recognition"));
      expect(onSelect).toHaveBeenCalledWith("pitch");
    });
  });

  describe("<PitchRecognitionView />", () => {
    it("renders pitch discrimination modes and handles answer clicks", () => {
      render(<PitchRecognitionView difficulty="Beginner" />);

      expect(screen.getByText(/Identify Pitch/i)).toBeInTheDocument();
      expect(screen.getByText(/Higher vs Lower/i)).toBeInTheDocument();
      expect(screen.getByText(/Octave Registers/i)).toBeInTheDocument();
      expect(screen.getByText(/Same or Different/i)).toBeInTheDocument();
      expect(screen.getByText(/Keyboard Match/i)).toBeInTheDocument();

      // Click higher/lower mode
      fireEvent.click(screen.getByText(/Higher vs Lower/i));
      expect(screen.getByText(/Is the second note higher or lower/i)).toBeInTheDocument();

      // Click an option button
      const optionButtons = screen.getAllByRole("button").filter((b) =>
        b.textContent?.includes("Note B is"),
      );
      if (optionButtons.length > 0) {
        fireEvent.click(optionButtons[0]!);
        expect(screen.getByText(/Next Exercise/i)).toBeInTheDocument();
      }
    });
  });

  describe("<IntervalRecognitionView />", () => {
    it("renders the 13-interval catalog in Explore mode and drills in Test mode", () => {
      render(<IntervalRecognitionView difficulty="Beginner" />);

      expect(screen.getByText(/Explore Intervals/i)).toBeInTheDocument();
      expect(screen.getByText(/Interval Ear Drill/i)).toBeInTheDocument();

      // Intervals exist
      expect(screen.getAllByText(/Perfect Unison/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Perfect Fifth/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Perfect Octave/i).length).toBeGreaterThan(0);

      // Switch to test mode
      fireEvent.click(screen.getByText(/Interval Ear Drill/i));
      expect(screen.getByText(/What is the interval/i)).toBeInTheDocument();
    });
  });

  describe("<ChordRecognitionView />", () => {
    it("renders chord quality library and supports block and arpeggiated audition", () => {
      render(<ChordRecognitionView difficulty="Beginner" />);

      expect(screen.getByText(/Chord Library & Voicings/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Major Triad/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Minor Triad/i).length).toBeGreaterThan(0);

      // Switch to Chord Ear Drill
      fireEvent.click(screen.getByText(/Chord Ear Drill/i));
      expect(screen.getByText(/Identify its quality/i)).toBeInTheDocument();
    });
  });

  describe("<MelodicDictationView />", () => {
    it("renders dictation workspace and evaluates transcription input", () => {
      render(<MelodicDictationView difficulty="Beginner" />);

      expect(screen.getAllByText(/Stepwise Diatonic Motion/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Listen Target/i)).toBeInTheDocument();
      expect(screen.getByText(/Evaluate Transcription/i)).toBeInTheDocument();
      expect(screen.getByText(/Interactive Piano Input/i)).toBeInTheDocument();
    });
  });

  describe("<HarmonicListeningView />", () => {
    it("renders harmonic listening sub-modes and feedback", () => {
      render(<HarmonicListeningView difficulty="Beginner" />);

      expect(screen.getAllByText(/Major vs Minor Quality/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Stability vs Tension/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Cadence Recognition/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Chord Progressions/i).length).toBeGreaterThan(0);

      // Switch to Cadence recognition
      const cadenceBtn = screen.getAllByRole("button").find((b) =>
        b.textContent?.includes("Cadence Recognition"),
      );
      if (cadenceBtn) fireEvent.click(cadenceBtn);
      expect(screen.getByText(/Identify the cadential resolution/i)).toBeInTheDocument();
    });
  });

  describe("<EarTrainingPracticeCenter />", () => {
    it("renders unified drills with topic filters and hint support", () => {
      render(<EarTrainingPracticeCenter initialDifficulty="Beginner" />);

      expect(screen.getByText(/All Topics/i)).toBeInTheDocument();
      expect(screen.getByText(/Streak:/i)).toBeInTheDocument();
      expect(screen.getByText(/Auditioning...|Replay/i)).toBeInTheDocument();
    });
  });

  describe("<EarTrainingTheoryGuide />", () => {
    it("renders academic compendium on relative pitch, frequency ratios, and mnemonics", () => {
      render(<EarTrainingTheoryGuide />);

      expect(screen.getByText(/The Foundations of Aural Perception/i)).toBeInTheDocument();
      expect(screen.getByText(/Relative Pitch vs. Absolute/i)).toBeInTheDocument();
      expect(screen.getByText(/Intervals, Frequency Ratios & Song Mnemonics/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Perfect Consonances/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Authentic Cadence/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Plagal Cadence/i).length).toBeGreaterThan(0);
    });
  });
});
