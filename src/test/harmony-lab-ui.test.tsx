import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChordExplorer } from "@/components/harmony-lab/ChordExplorer";
import { ChordInversionsView } from "@/components/harmony-lab/ChordInversionsView";
import { ChordProgressionsView } from "@/components/harmony-lab/ChordProgressionsView";
import { HarmonyPracticeCenter } from "@/components/harmony-lab/HarmonyPracticeCenter";
import { HarmonyTheoryGuide } from "@/components/harmony-lab/HarmonyTheoryGuide";
import { RomanNumeralAnalysisView } from "@/components/harmony-lab/RomanNumeralAnalysisView";
import { VoiceLeadingSATBView } from "@/components/harmony-lab/VoiceLeadingSATBView";

// Mock audio engine
const mockNoteOn = vi.fn();
const mockNoteOff = vi.fn();
const mockPlayPhrase = vi.fn();

vi.mock("@/lib/music/usePiano", () => ({
  usePiano: () => ({
    status: "ready",
    noteOn: mockNoteOn,
    noteOff: mockNoteOff,
    playPhrase: mockPlayPhrase,
  }),
}));

// Mock VexFlow Staff to avoid SVG/canvas issues in jsdom
vi.mock("@/components/music/Staff", () => ({
  Staff: ({ chords, clef, label }: { chords: unknown[]; clef: string; label?: string }) => (
    <div data-testid="mock-staff" data-clef={clef} aria-label={label}>
      Staff Clef: {clef} ({chords?.length ?? 0} chords)
    </div>
  ),
}));

// Mock VirtualPiano
vi.mock("@/components/keyboard-lab/VirtualPiano", () => ({
  VirtualPiano: ({ targetNotes }: { targetNotes?: Set<string> }) => (
    <div data-testid="mock-piano">
      Virtual Piano (Target Notes: {Array.from(targetNotes ?? []).join(", ")})
    </div>
  ),
}));

describe("Interactive Harmony Studio UI Components", () => {
  it("renders ChordExplorer and allows root and chord quality switching", () => {
    render(<ChordExplorer />);

    // Verify root selector toolbar
    expect(screen.getByText(/Select Chord Root:/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Chord Quality:/i)).toBeInTheDocument();

    // Verify chord details
    expect(screen.getByText(/Chord Construction & Formula/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Keyboard Fingerprint/i)).toBeInTheDocument();

    // Verify Play Block Chord button works
    const playBlockBtn = screen.getByRole("button", { name: /Block Chord/i });
    expect(playBlockBtn).toBeInTheDocument();
    fireEvent.click(playBlockBtn);
    expect(mockNoteOn).toHaveBeenCalled();

    // Verify Play Arpeggio button works
    const playArpBtn = screen.getByRole("button", { name: /Arpeggiate/i });
    expect(playArpBtn).toBeInTheDocument();
    fireEvent.click(playArpBtn);
    expect(mockPlayPhrase).toHaveBeenCalled();

    // Verify Staff and Piano are present
    expect(screen.getByTestId("mock-staff")).toBeInTheDocument();
    expect(screen.getByTestId("mock-piano")).toBeInTheDocument();
  });

  it("renders ChordInversionsView and updates figured bass when switching inversions", () => {
    render(<ChordInversionsView />);

    expect(screen.getByText(/^Root:$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Root Position/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/First Inversion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Second Inversion/i).length).toBeGreaterThan(0);

    // Check figured bass labels
    expect(screen.getAllByText(/Figured:/i).length).toBeGreaterThan(0);

    // Switch to first inversion
    const firstInvCard = screen.getAllByText(/First Inversion/i)[0]!;
    fireEvent.click(firstInvCard);
    expect(firstInvCard).toBeInTheDocument();
  });

  it("renders ChordProgressionsView and transposes progression keys", () => {
    render(<ChordProgressionsView />);

    expect(screen.getByText(/Select Classical Progression Preset:/i)).toBeInTheDocument();
    expect(screen.getByText(/Transpose Key:/i)).toBeInTheDocument();

    // Switch key to G
    const gKeyBtn = screen.getByRole("button", { name: /^G$/i });
    fireEvent.click(gKeyBtn);

    // Verify play progression
    const playProgBtn = screen.getByRole("button", { name: /Play Full Progression/i });
    fireEvent.click(playProgBtn);
    expect(mockPlayPhrase).toHaveBeenCalled();
  });

  it("renders RomanNumeralAnalysisView and supports mode switching", () => {
    render(<RomanNumeralAnalysisView />);

    expect(screen.getByText(/Tonic Key:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mode:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Major Key/i })).toBeInTheDocument();
    const minorBtn = screen.getByRole("button", { name: /Harmonic Minor/i });
    expect(minorBtn).toBeInTheDocument();

    // Click Harmonic Minor
    fireEvent.click(minorBtn);
    expect(screen.getAllByText(/Tonic/i).length).toBeGreaterThan(0);
  });

  it("renders VoiceLeadingSATBView and allows soloing vocal parts and checking rules", () => {
    render(<VoiceLeadingSATBView />);

    expect(screen.getByText(/Select SATB Chorale Case Study:/i)).toBeInTheDocument();
    expect(screen.getByText(/Audition Voice:/i)).toBeInTheDocument();

    // Check voice buttons
    expect(screen.getByRole("button", { name: /All 4 Voices/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Soprano$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Bass$/i })).toBeInTheDocument();

    // Solo soprano
    fireEvent.click(screen.getByRole("button", { name: /^Soprano$/i }));

    // Switch to parallel fifths example
    const parallelExampleBtn = screen.getByText(/Common Error: Parallel Fifths/i);
    fireEvent.click(parallelExampleBtn);

    // Should display error diagnostics
    expect(screen.getByText(/Automated Voice Leading Diagnostic:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Parallel fifths detected/i).length).toBeGreaterThan(0);
  });

  it("renders HarmonyPracticeCenter and handles answering a question", () => {
    render(<HarmonyPracticeCenter />);

    expect(screen.getByText(/Practice Area/i)).toBeInTheDocument();
    expect(screen.getByText(/Session Score/i)).toBeInTheDocument();

    // Get options and click the first one
    const options = screen.getAllByTestId("harmony-practice-option");
    expect(options.length).toBeGreaterThan(0);

    fireEvent.click(options[0]!);

    // Next Exercise button should appear
    expect(screen.getByRole("button", { name: /Next Exercise/i })).toBeInTheDocument();
  });

  it("renders HarmonyTheoryGuide with comprehensive reference sections", () => {
    render(<HarmonyTheoryGuide />);

    expect(screen.getByText(/Tertian Harmony & Voice Leading Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/The Nine Tertian Chord Qualities/i)).toBeInTheDocument();
    expect(screen.getByText(/Triad Inversions & Figured Bass/i)).toBeInTheDocument();
    expect(screen.getByText(/Diatonic Harmony & Roman Numeral Conventions/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadence Taxonomy & Phrase Endings/i)).toBeInTheDocument();
    expect(screen.getByText(/Four-Part \(SATB\) Voice Leading Principles/i)).toBeInTheDocument();
  });
});
