import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

// Mock VexFlow Staff to avoid SVG/canvas issues in jsdom
vi.mock("@/components/music/Staff", () => ({
  Staff: ({ chords, timeSignature, label }: { chords: unknown[]; timeSignature?: string; label?: string }) => (
    <div data-testid="mock-staff" data-ts={timeSignature} aria-label={label}>
      Staff TS: {timeSignature ?? "none"} ({chords?.length ?? 0} items)
    </div>
  ),
}));

// Mock AudioContext in jsdom
const mockCreateOscillator = vi.fn(() => ({
  connect: vi.fn(),
  frequency: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  type: "sine",
  start: vi.fn(),
  stop: vi.fn(),
}));

const mockCreateGain = vi.fn(() => ({
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
}));

vi.stubGlobal("AudioContext", class {
  currentTime = 0;
  destination = {};
  state = "running";
  createOscillator = mockCreateOscillator;
  createGain = mockCreateGain;
  resume = vi.fn().mockResolvedValue(undefined);
});

describe("Rhythm Laboratory UI Components", () => {
  it("renders RhythmExplorer and allows filtering durations and audio auditioning", () => {
    render(<RhythmExplorer />);

    expect(screen.getByText(/Explore Note & Rest Durations/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Notes Only/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rests Only/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dotted Values/i })).toBeInTheDocument();

    // Filter to rests only
    fireEvent.click(screen.getByRole("button", { name: /Rests Only/i }));

    // Click on quarter rest card
    const quarterRestCard = screen.getByTestId("duration-card-qr");
    expect(quarterRestCard).toBeInTheDocument();
    fireEvent.click(quarterRestCard);

    // Verify inspector heading
    expect(screen.getAllByText(/Crotchet Rest/i).length).toBeGreaterThan(0);

    // Verify Hear Duration button works
    const hearBtn = screen.getByRole("button", { name: /Hear Duration/i });
    fireEvent.click(hearBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders TimeSignatureStudio and supports switching meters", () => {
    render(<TimeSignatureStudio />);

    expect(screen.getByText(/Select Time Signature/i)).toBeInTheDocument();
    expect(screen.getByText(/Numerator vs. Denominator/i)).toBeInTheDocument();

    // Select 6/8
    const sixEightBtn = screen.getByRole("button", { name: /^6\/8$/i });
    fireEvent.click(sixEightBtn);

    // Verify updated heading
    expect(screen.getByText(/Time Signature 6\/8/i)).toBeInTheDocument();
    expect(screen.getAllByText(/compound duple meter/i).length).toBeGreaterThan(0);

    // Audition pulse
    const auditionBtn = screen.getByRole("button", { name: /Audition Metric Pulse/i });
    fireEvent.click(auditionBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders BeatVisualizer and adjusts tempo and starts visualizer", () => {
    render(<BeatVisualizer />);

    expect(screen.getByText(/Metric Canvas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Visualizer/i })).toBeInTheDocument();

    // Increase tempo
    const incBtn = screen.getByRole("button", { name: /Increase tempo/i });
    fireEvent.click(incBtn);

    // Start visualizer
    const startBtn = screen.getByRole("button", { name: /Start Visualizer/i });
    fireEvent.click(startBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders RhythmPlaybackView and supports playing written patterns", () => {
    render(<RhythmPlaybackView />);

    expect(screen.getByText(/Select Classical Rhythmic Pattern:/i)).toBeInTheDocument();

    // Select Viennese Waltz
    const waltzCard = screen.getByText(/Viennese Waltz Rhythm/i);
    fireEvent.click(waltzCard);

    // Click play pattern
    const playBtn = screen.getByRole("button", { name: /Play Written Pattern/i });
    fireEvent.click(playBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders RhythmConstructor and allows adding/removing notes and checking capacity", () => {
    render(<RhythmConstructor />);

    expect(screen.getByText(/Measure Constructor/i)).toBeInTheDocument();
    expect(screen.getByText(/Construct a Measure in 4\/4/i)).toBeInTheDocument();

    // Add a quarter note
    const quarterNoteBtn = screen.getAllByRole("button").find(
      (btn) => btn.textContent?.includes("Quarter Note") && !btn.textContent?.includes("Rest"),
    );
    expect(quarterNoteBtn).toBeDefined();
    if (quarterNoteBtn) fireEvent.click(quarterNoteBtn);

    // Remove last note
    const removeBtn = screen.getByRole("button", { name: /Remove Last/i });
    fireEvent.click(removeBtn);

    // Play measure
    const playBtn = screen.getByRole("button", { name: /Play Measure/i });
    fireEvent.click(playBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders MetronomeStudio and allows tempo tapping and starting", () => {
    render(<MetronomeStudio />);

    expect(screen.getByText(/Precision Acoustic & Digital Metronome/i)).toBeInTheDocument();

    // Tap tempo button
    const tapTempoBtn = screen.getByRole("button", { name: /Tap Tempo/i });
    fireEvent.click(tapTempoBtn);
    fireEvent.click(tapTempoBtn);

    // Start metronome
    const startBtn = screen.getByRole("button", { name: /Start Metronome/i });
    fireEvent.click(startBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders RhythmPerformanceStudio and supports performance countdown and spacebar tapping", () => {
    render(<RhythmPerformanceStudio />);

    expect(screen.getByText(/Practical Tap \/ Clap Trainer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Exercise/i })).toBeInTheDocument();

    // Start exercise countdown
    const startBtn = screen.getByRole("button", { name: /Start Exercise/i });
    fireEvent.click(startBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it("renders RhythmDictationStudio and allows listening and placing notes", () => {
    render(<RhythmDictationStudio />);

    expect(screen.getByText(/Aural Rhythm Dictation/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Audition Hidden Rhythm/i })).toBeInTheDocument();

    // Audition hidden rhythm
    const auditionBtn = screen.getByRole("button", { name: /Audition Hidden Rhythm/i });
    fireEvent.click(auditionBtn);
    expect(mockCreateOscillator).toHaveBeenCalled();

    // Place a quarter note
    const qBtn = screen.getAllByRole("button").find(
      (btn) => btn.textContent?.includes("Quarter Note"),
    );
    expect(qBtn).toBeDefined();
    if (qBtn) fireEvent.click(qBtn);

    // Check dictation button
    const checkBtn = screen.getByRole("button", { name: /Check Dictation/i });
    expect(checkBtn).toBeInTheDocument();
    fireEvent.click(checkBtn);
  });

  it("renders RhythmPracticeCenter and answers a practice drill", () => {
    render(<RhythmPracticeCenter />);

    expect(screen.getByText(/Select Practice Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Session Score/i)).toBeInTheDocument();

    // Click an option button
    const options = screen.getAllByTestId("rhythm-practice-option");
    expect(options.length).toBeGreaterThan(0);
    fireEvent.click(options[0]!);

    // Next exercise button should appear
    expect(screen.getByRole("button", { name: /Next Exercise/i })).toBeInTheDocument();
  });

  it("renders RhythmTheoryGuide with comprehensive reference sections", () => {
    render(<RhythmTheoryGuide />);

    expect(screen.getByText(/Rhythm, Meter & Metric Organization Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Beat, Pulse, Tempo & Meter/i)).toBeInTheDocument();
    expect(screen.getByText(/Note & Rest Values \(UK & US Terminology\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Simple Time Signatures/i)).toBeInTheDocument();
    expect(screen.getByText(/Compound Time Signatures/i)).toBeInTheDocument();
    expect(screen.getByText(/Dotted Values, Ties & Syncopation/i)).toBeInTheDocument();
  });
});
