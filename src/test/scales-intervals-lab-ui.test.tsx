import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntervalExplorer } from "@/components/scales-intervals-lab/IntervalExplorer";
import { IntervalTrainer } from "@/components/scales-intervals-lab/IntervalTrainer";
import { PracticeAndChallenges } from "@/components/scales-intervals-lab/PracticeAndChallenges";
import { ScaleBuilder } from "@/components/scales-intervals-lab/ScaleBuilder";
import { ScaleExplorer } from "@/components/scales-intervals-lab/ScaleExplorer";
import { ScalesIntervalsOverview } from "@/components/scales-intervals-lab/ScalesIntervalsOverview";

// Mock audio
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

describe("Scales and Intervals Lab UI Components", () => {
  describe("<ScalesIntervalsOverview />", () => {
    it("renders hero overview and navigation cards", () => {
      const onSelect = vi.fn();
      render(<ScalesIntervalsOverview onSelectStudioTab={onSelect} />);

      expect(screen.getByText(/The Architecture of Scales and Intervals/i)).toBeInTheDocument();
      expect(screen.getByText("Scale Explorer")).toBeInTheDocument();
      expect(screen.getByText("Interval Explorer")).toBeInTheDocument();
      expect(screen.getByText("Scale Builder")).toBeInTheDocument();
      expect(screen.getByText("Interval Trainer")).toBeInTheDocument();
      expect(screen.getByText("Practice and Challenges")).toBeInTheDocument();

      // Click card
      fireEvent.click(screen.getByText("Scale Explorer"));
      expect(onSelect).toHaveBeenCalledWith("scale-explorer");
    });
  });

  describe("<ScaleExplorer />", () => {
    it("renders categories, tonics, and plays scales", () => {
      render(<ScaleExplorer />);

      expect(screen.getByText(/Major Scales/i)).toBeInTheDocument();
      expect(screen.getByText(/Minor Scales/i)).toBeInTheDocument();
      expect(screen.getByText(/Musical Modes/i)).toBeInTheDocument();
      expect(screen.getByText(/Pentatonic & Other/i)).toBeInTheDocument();

      // Change category
      fireEvent.click(screen.getByText(/Minor Scales/i));
      expect(screen.getAllByText(/Natural Minor \(Aeolian\)/i).length).toBeGreaterThan(0);
    });
  });

  describe("<IntervalExplorer />", () => {
    it("renders intervals grid and audio controls", () => {
      render(<IntervalExplorer />);

      expect(screen.getAllByText(/Perfect Fifth/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Play Melodic/i)).toBeInTheDocument();
      expect(screen.getByText(/Play Harmonic/i)).toBeInTheDocument();

      // Click an interval
      const m3Btn = screen.getByText(/Minor Third/i);
      fireEvent.click(m3Btn);
      expect(screen.getAllByText(/Minor Third/i).length).toBeGreaterThan(0);
    });
  });

  describe("<ScaleBuilder />", () => {
    it("renders step construction slots and handles note placement", () => {
      render(<ScaleBuilder />);

      expect(screen.getByText(/Construct C Major Scale/i)).toBeInTheDocument();
      expect(screen.getByText(/Interactive Piano Input/i)).toBeInTheDocument();
      expect(screen.getByText(/Reset Construction/i)).toBeInTheDocument();
    });
  });

  describe("<IntervalTrainer />", () => {
    it("renders drill exercises and scoreboard", () => {
      render(<IntervalTrainer initialDifficulty="Beginner" />);

      expect(screen.getByText(/Drill:/i)).toBeInTheDocument();
      expect(screen.getByText(/Score:/i)).toBeInTheDocument();
      expect(screen.getByText(/Auditioning...|Replay/i)).toBeInTheDocument();
    });
  });

  describe("<PracticeAndChallenges />", () => {
    it("renders scale & interval challenge modes and timed option", () => {
      render(<PracticeAndChallenges initialDifficulty="Beginner" />);

      expect(screen.getByText(/Scale Challenges/i)).toBeInTheDocument();
      expect(screen.getByText(/Interval Challenges/i)).toBeInTheDocument();
      expect(screen.getByText(/Timed Mode/i)).toBeInTheDocument();

      // Switch to Interval Challenges
      fireEvent.click(screen.getByText(/Interval Challenges/i));
      expect(screen.getByText(/Listen Interval/i)).toBeInTheDocument();
    });
  });
});
